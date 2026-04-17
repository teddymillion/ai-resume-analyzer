import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromFile } from '@/lib/file-parser'
import { groqChat } from '@/lib/groq-client'
import { analyzeResume, type AnalysisResult } from '@/lib/analysis-engine'
import { parseResume, type ParsedResume, type ResumeSection } from '@/lib/resume-parser'

export const runtime = 'nodejs'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── 1. Validate env ──────────────────────────────────────────────────────
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 500 })
    }

    // ── 2. Validate file ─────────────────────────────────────────────────────
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No resume file provided.' }, { status: 400 })
    }

    const lower = file.name.toLowerCase()
    if (!ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File is too large (max 10 MB).' }, { status: 400 })
    }

    // ── 3. Extract text locally (no external API) ────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer())
    let resumeText: string

    try {
      resumeText = await extractTextFromFile(buffer, file.name)
    } catch (err) {
      console.error('[analyze] File extraction error:', err)
      return NextResponse.json(
        { error: 'Could not read the file. Make sure it is a valid PDF or DOCX.' },
        { status: 422 },
      )
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: 'The file appears to be empty or contains no readable text.' },
        { status: 422 },
      )
    }

    // Truncate to ~12 000 chars to stay within Groq context limits
    const truncatedText = resumeText.slice(0, 12000)

    // ── 4. Send text to Groq ─────────────────────────────────────────────────
    let rawJson: string
    try {
      rawJson = await groqChat({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze this resume:\n\n${truncatedText}` },
        ],
        maxTokens: 4096,
        temperature: 0.1,
        jsonMode: true,
      })
    } catch (err: unknown) {
      console.error('[analyze] Groq error:', err)
      const status = (err as { status?: number })?.status ?? 0
      const msg =
        status === 429
          ? 'AI service is rate-limited. Please wait a moment and try again.'
          : 'AI analysis failed. Please try again.'
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // ── 5. Parse Groq response ───────────────────────────────────────────────
    const payload = safeParseJson(rawJson)
    if (!payload) {
      console.error('[analyze] Could not parse Groq JSON:', rawJson?.slice(0, 300))
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.' },
        { status: 500 },
      )
    }

    // ── 6. Build structured result ───────────────────────────────────────────
    const normalized = normalizePayload(payload, resumeText)
    const parsedResume = buildParsedResume(normalized, resumeText)
    const analysis = finalizeAnalysis(payload.analysis ?? {}, parsedResume)

    return NextResponse.json({ parsedResume, analysis })
  } catch (err) {
    console.error('[analyze] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert resume analyst and career coach.
You will receive the plain text of a resume. Analyze it thoroughly and return a JSON object.

Return ONLY a valid JSON object with this exact structure:
{
  "sections": [
    {
      "type": "<summary | experience | skills | education | other>",
      "title": "<section heading as written>",
      "content": "<full section text>",
      "bullets": ["<bullet 1>", "<bullet 2>"]
    }
  ],
  "skills": ["<skill 1>", "<skill 2>"],
  "keywords": ["<keyword 1>", "<keyword 2>"],
  "analysis": {
    "overallScore": <integer 0-100>,
    "atsScore": <integer 0-100>,
    "strengths": ["<strength 1>"],
    "weaknesses": ["<weakness 1>"],
    "missingSkills": ["<missing skill 1>"],
    "atsIssues": ["<issue 1>"],
    "atsSuggestions": ["<suggestion 1>"],
    "formattingQuality": "<excellent | good | fair | poor>"
  }
}

Rules:
- sections: identify every section in the resume
- skills: every technical and soft skill mentioned (max 20)
- keywords: top 20 meaningful keywords excluding stop words
- overallScore: overall resume quality 0-100
- atsScore: ATS compatibility 0-100
- strengths: up to 5 specific things done well
- weaknesses: up to 5 specific areas to improve
- missingSkills: up to 8 skills commonly expected but absent
- atsIssues: specific formatting/content problems hurting ATS parsing
- atsSuggestions: one actionable fix per issue
- All arrays: max 10 items
- Do not include rawText in the response`

// ─── JSON Parsing ─────────────────────────────────────────────────────────────

type GroqPayload = {
  sections?: Array<{
    type?: string
    title?: string
    content?: string
    bullets?: string[]
  }>
  skills?: string[]
  keywords?: string[]
  analysis?: Partial<AnalysisResult>
}

function safeParseJson(raw: string): GroqPayload | null {
  if (!raw) return null

  // Groq json_object mode returns clean JSON, but be defensive anyway
  const candidates = [
    raw.trim(),
    raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1),
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object') return parsed as GroqPayload
    } catch {
      // try next
    }
  }
  return null
}

// ─── Normalisation ────────────────────────────────────────────────────────────

function normalizePayload(payload: GroqPayload, rawText: string) {
  return {
    rawText,
    sections: normalizeSections(payload.sections ?? []),
    skills: sanitizeArray(payload.skills ?? []),
    keywords: sanitizeArray(payload.keywords ?? []),
    analysis: payload.analysis ?? {},
  }
}

function normalizeSections(sections: GroqPayload['sections']): ResumeSection[] {
  if (!Array.isArray(sections)) return []
  return sections
    .map((s) => ({
      type: normalizeSectionType(s?.type),
      title: typeof s?.title === 'string' ? s.title : 'Section',
      content: typeof s?.content === 'string' ? s.content : '',
      bullets: sanitizeArray(s?.bullets ?? []),
    } satisfies ResumeSection))
    .filter((s) => s.content.length > 0 || s.bullets.length > 0)
}

function normalizeSectionType(value?: string): ResumeSection['type'] {
  switch ((value ?? '').toLowerCase()) {
    case 'summary': return 'summary'
    case 'experience': return 'experience'
    case 'skills': return 'skills'
    case 'education': return 'education'
    default: return 'other'
  }
}

function sanitizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return (value as unknown[])
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 10)
}

function buildParsedResume(
  normalized: ReturnType<typeof normalizePayload>,
  rawText: string,
): ParsedResume {
  const allText = rawText.trim()
  const fallback = parseResume(allText)
  return {
    rawText,
    sections: normalized.sections.length ? normalized.sections : fallback.sections,
    allText,
    skills: normalized.skills.length ? normalized.skills : fallback.skills,
    keywords: normalized.keywords.length ? normalized.keywords : fallback.keywords,
    wordCount: allText ? allText.split(/\s+/).length : 0,
    charCount: allText.length,
  }
}

function finalizeAnalysis(
  analysis: Partial<AnalysisResult>,
  parsedResume: ParsedResume,
): AnalysisResult {
  const fallback = analyzeResume(parsedResume)
  const wordCount = parsedResume.wordCount || 1
  const keywordDensity = Math.round((parsedResume.keywords.length / wordCount) * 100 * 10) / 10

  return {
    overallScore: clamp(analysis.overallScore ?? fallback.overallScore),
    atsScore: clamp(analysis.atsScore ?? fallback.atsScore),
    matchScore: null,
    strengths: sanitizeArray(analysis.strengths ?? fallback.strengths),
    weaknesses: sanitizeArray(analysis.weaknesses ?? fallback.weaknesses),
    missingSkills: sanitizeArray(analysis.missingSkills ?? fallback.missingSkills),
    atsIssues: sanitizeArray(analysis.atsIssues ?? fallback.atsIssues),
    atsSuggestions: sanitizeArray(analysis.atsSuggestions ?? fallback.atsSuggestions),
    keywordDensity,
    formattingQuality: normalizeQuality(analysis.formattingQuality ?? fallback.formattingQuality),
  }
}

function clamp(v: number): number {
  if (typeof v !== 'number' || Number.isNaN(v)) return 0
  return Math.min(Math.max(Math.round(v), 0), 100)
}

function normalizeQuality(v: string): AnalysisResult['formattingQuality'] {
  switch ((v ?? '').toLowerCase()) {
    case 'excellent': return 'excellent'
    case 'good': return 'good'
    case 'fair': return 'fair'
    default: return 'poor'
  }
}
