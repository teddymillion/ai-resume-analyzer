import { NextRequest, NextResponse } from 'next/server'
import { analyzeResume, type AnalysisResult } from '@/lib/analysis-engine'
import { parseResume, type ParsedResume, type ResumeSection } from '@/lib/resume-parser'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const RATE_LIMIT = { limit: 5, windowMs: 60 * 1000 }

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown'
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1500

function resolveMimeType(file: File): string {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.docx'))
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  return file.type || 'application/pdf'
}

type GeminiAnalysisPayload = {
  rawText?: string
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

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp, RATE_LIMIT)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter: Math.ceil(rateLimit.resetIn / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) } },
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL

    if (!apiKey) return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    if (!model) return NextResponse.json({ error: 'Gemini model not configured. Set GEMINI_MODEL in .env.local.' }, { status: 500 })

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 })
    }

    const lowerName = file.name.toLowerCase()
    const isAllowed =
      ALLOWED_MIME_TYPES.has(file.type) ||
      ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File is too large (max 10 MB).' }, { status: 400 })
    }

    const mimeType = resolveMimeType(file)
    const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64')

    const geminiResponse = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: buildPrompt() },
              { inline_data: { mime_type: mimeType, data: base64Data } },
            ],
          }],
          generationConfig: {
            // Do NOT set responseMimeType — Gemini 2.5 Flash ignores it for
            // multimodal requests and returns an empty text field when it is set.
            // Instead we ask for JSON in the prompt and parse it ourselves.
            maxOutputTokens: 8192,
            temperature: 0.1,
          },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('[analyze] Gemini error:', geminiResponse.status, errorText.slice(0, 400))
      return NextResponse.json(
        { error: 'Failed to analyze resume with Gemini', details: `Gemini API ${geminiResponse.status}: ${errorText.slice(0, 200)}` },
        { status: 500 },
      )
    }

    const data = await geminiResponse.json()

    // Extract the text from wherever Gemini put it
    const rawTextResponse: string = extractGeminiText(data)

    console.log('[analyze] Gemini text length:', rawTextResponse.length)
    console.log('[analyze] Gemini text preview:', rawTextResponse.slice(0, 200))

    if (!rawTextResponse) {
      console.error('[analyze] Empty text from Gemini. Full response:', JSON.stringify(data).slice(0, 600))
      return NextResponse.json(
        { error: 'Gemini returned an empty response. The model may not support this file type. Try a PDF.' },
        { status: 500 },
      )
    }

    const parsedPayload = extractJson(rawTextResponse)

    if (!parsedPayload) {
      console.error('[analyze] Could not parse JSON. Raw text:', rawTextResponse.slice(0, 600))
      return NextResponse.json(
        { error: 'Gemini returned an unexpected response format. Please try again.' },
        { status: 500 },
      )
    }

    const normalized = normalizeGeminiPayload(parsedPayload)

    const parsedResume: ParsedResume =
      normalized.rawText.trim().length > 0
        ? buildParsedResume(normalized)
        : { rawText: '', sections: [], allText: '', skills: [], keywords: [], wordCount: 0, charCount: 0 }

    const analysis = finalizeAnalysis(normalized.analysis, parsedResume)

    return NextResponse.json({ parsedResume, analysis })
  } catch (err) {
    console.error('[analyze] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Extract text from any Gemini response shape ─────────────────────────────

// Gemini can return the content in different places depending on the model
// version and whether responseMimeType was set. Check all known locations.
function extractGeminiText(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const d = data as Record<string, unknown>

  // Shape 1: candidates[0].content.parts[0].text  (standard generateContent)
  const candidates = d.candidates
  if (Array.isArray(candidates) && candidates.length > 0) {
    const first = candidates[0] as Record<string, unknown>
    const content = first?.content as Record<string, unknown> | undefined
    const parts = content?.parts
    if (Array.isArray(parts) && parts.length > 0) {
      const part = parts[0] as Record<string, unknown>
      if (typeof part?.text === 'string' && part.text.trim()) {
        return part.text
      }
      // Sometimes all parts need to be joined
      const joined = parts
        .map((p) => (typeof (p as Record<string, unknown>).text === 'string' ? (p as Record<string, unknown>).text : ''))
        .join('')
      if (joined.trim()) return joined
    }
  }

  // Shape 2: direct text field at root (some streaming/preview APIs)
  if (typeof d.text === 'string' && d.text.trim()) return d.text

  // Shape 3: content.parts[0].text at root
  const rootContent = d.content as Record<string, unknown> | undefined
  if (rootContent) {
    const parts = rootContent.parts
    if (Array.isArray(parts) && parts.length > 0) {
      const part = parts[0] as Record<string, unknown>
      if (typeof part?.text === 'string') return part.text
    }
  }

  return ''
}

// ─── Retry Logic ──────────────────────────────────────────────────────────────

async function fetchWithRetry(url: string, init: RequestInit, attempt = 0): Promise<Response> {
  const response = await fetch(url, init)
  const isRetryable = response.status === 503 || response.status === 429

  if (isRetryable && attempt < MAX_RETRIES) {
    const delay = BASE_DELAY_MS * Math.pow(2, attempt)
    console.warn(`[analyze] Gemini ${response.status} — retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`)
    await new Promise((r) => setTimeout(r, delay))
    return fetchWithRetry(url, init, attempt + 1)
  }

  return response
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(): string {
  return `You are an expert resume analyzer. Analyze the provided resume file and return ONLY a valid JSON object with no markdown, no code fences, no explanation — just the raw JSON.

The JSON must follow this exact structure:
{
  "rawText": "<full extracted text of the resume>",
  "sections": [
    {
      "type": "<one of: summary, experience, skills, education, other>",
      "title": "<section heading as written in the resume>",
      "content": "<full text of this section>",
      "bullets": ["<bullet point 1>", "<bullet point 2>"]
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
    "formattingQuality": "<one of: excellent, good, fair, poor>"
  }
}

Rules:
- Return ONLY the JSON object. No text before or after it.
- Extract ALL text from the resume into rawText
- Identify every section and classify it correctly
- skills: list every technical and soft skill mentioned
- keywords: top 20 most meaningful words (exclude stop words)
- overallScore: rate overall resume quality 0-100
- atsScore: rate ATS compatibility 0-100
- strengths: up to 5 specific things done well
- weaknesses: up to 5 specific areas to improve
- missingSkills: up to 8 skills commonly expected but not present
- atsIssues: specific formatting or content problems that hurt ATS parsing
- atsSuggestions: specific actionable fixes for each issue
- All arrays: maximum 10 items
- All scores: integers between 0 and 100
- If a field cannot be determined use empty string or empty array`
}

// ─── JSON Extraction ──────────────────────────────────────────────────────────

function extractJson(raw: string): GeminiAnalysisPayload | null {
  if (!raw || typeof raw !== 'string') return null

  const candidates: string[] = []

  // 1. Raw trimmed
  candidates.push(raw.trim())

  // 2. Strip markdown fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenceMatch?.[1]) candidates.push(fenceMatch[1].trim())

  // 3. First { to last }
  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(raw.slice(firstBrace, lastBrace + 1))
  }

  for (const candidate of candidates) {
    if (!candidate) continue
    // Try raw parse
    try {
      const parsed = JSON.parse(candidate)
      if (isValidPayload(parsed)) return parsed as GeminiAnalysisPayload
    } catch { /* fall through */ }
    // Try sanitised parse
    try {
      const parsed = JSON.parse(sanitiseJsonString(candidate))
      if (isValidPayload(parsed)) return parsed as GeminiAnalysisPayload
    } catch { /* try next candidate */ }
  }

  return null
}

function isValidPayload(parsed: unknown): boolean {
  return (
    parsed !== null &&
    typeof parsed === 'object' &&
    ('rawText' in parsed || 'analysis' in parsed || 'sections' in parsed)
  )
}

function sanitiseJsonString(raw: string): string {
  let result = ''
  let inString = false
  let i = 0

  while (i < raw.length) {
    const ch = raw[i]

    if (inString) {
      if (ch === '\\') {
        result += ch + (raw[i + 1] ?? '')
        i += 2
        continue
      }
      if (ch === '"') {
        inString = false
        result += ch
      } else if (ch === '\n') {
        result += '\\n'
      } else if (ch === '\r') {
        result += '\\r'
      } else if (ch === '\t') {
        result += '\\t'
      } else {
        result += ch
      }
    } else {
      if (ch === '"') inString = true
      result += ch
    }

    i++
  }

  return result
}

// ─── Normalisation ────────────────────────────────────────────────────────────

function normalizeGeminiPayload(payload: GeminiAnalysisPayload) {
  return {
    rawText: typeof payload.rawText === 'string' ? payload.rawText : '',
    sections: normalizeSections(payload.sections ?? []),
    skills: sanitizeStringArray(payload.skills ?? []),
    keywords: sanitizeStringArray(payload.keywords ?? []),
    analysis: payload.analysis ?? {},
  }
}

function normalizeSections(sections: GeminiAnalysisPayload['sections']): ResumeSection[] {
  if (!Array.isArray(sections)) return []
  return sections
    .map((s) => ({
      type: normalizeSectionType(s?.type),
      title: typeof s?.title === 'string' ? s.title : 'Section',
      content: typeof s?.content === 'string' ? s.content : '',
      bullets: sanitizeStringArray(s?.bullets ?? []),
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

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return (value as unknown[])
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10)
}

function buildParsedResume(normalized: ReturnType<typeof normalizeGeminiPayload>): ParsedResume {
  const allText = normalized.rawText.trim()
  const fallback = parseResume(allText)
  return {
    rawText: normalized.rawText,
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
    overallScore: clampScore(analysis.overallScore ?? fallback.overallScore),
    atsScore: clampScore(analysis.atsScore ?? fallback.atsScore),
    matchScore: null,
    strengths: sanitizeStringArray(analysis.strengths ?? fallback.strengths),
    weaknesses: sanitizeStringArray(analysis.weaknesses ?? fallback.weaknesses),
    missingSkills: sanitizeStringArray(analysis.missingSkills ?? fallback.missingSkills),
    atsIssues: sanitizeStringArray(analysis.atsIssues ?? fallback.atsIssues),
    atsSuggestions: sanitizeStringArray(analysis.atsSuggestions ?? fallback.atsSuggestions),
    keywordDensity,
    formattingQuality: normalizeFormattingQuality(
      analysis.formattingQuality ?? fallback.formattingQuality,
    ),
  }
}

function clampScore(value: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.min(Math.max(Math.round(value), 0), 100)
}

function normalizeFormattingQuality(
  value: AnalysisResult['formattingQuality'] | string,
): AnalysisResult['formattingQuality'] {
  switch ((value ?? '').toLowerCase()) {
    case 'excellent': return 'excellent'
    case 'good': return 'good'
    case 'fair': return 'fair'
    default: return 'poor'
  }
}
