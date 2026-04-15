import { NextRequest, NextResponse } from 'next/server'
import { analyzeResume, type AnalysisResult } from '@/lib/analysis-engine'
import { parseResume, type ParsedResume, type ResumeSection } from '@/lib/resume-parser'

export const runtime = 'nodejs'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1500

// ─── MIME helpers ─────────────────────────────────────────────────────────────

/**
 * Browsers sometimes send an empty or wrong MIME type for DOCX files.
 * Always derive the MIME from the file extension so Gemini gets the right value.
 */
function resolveMimeType(file: File): string {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  // Fall back to whatever the browser reported
  return file.type || 'application/pdf'
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
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
            // Forces Gemini to output raw JSON — no markdown fences, no preamble
            responseMimeType: 'application/json',
            maxOutputTokens: 8192,
            temperature: 0.1,
          },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('[analyze] Gemini error after retries:', errorText)
      return NextResponse.json(
        {
          error: 'Failed to analyze resume with Gemini',
          details: `Gemini API ${geminiResponse.status}: ${errorText}`,
        },
        { status: 500 },
      )
    }

    const data = await geminiResponse.json()
    const rawTextResponse: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    console.log('[analyze] Gemini raw response (first 300 chars):', rawTextResponse.slice(0, 300))

    const parsedPayload = extractJson(rawTextResponse)

    if (!parsedPayload) {
      console.error('[analyze] Could not extract JSON from response:', rawTextResponse.slice(0, 500))
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
  return `You are an expert resume analyzer. Analyze the provided resume file and return a JSON object.

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

/**
 * Robustly extracts a JSON object from Gemini's response.
 * Handles: raw JSON, markdown fences, preamble text, truncated responses,
 * and large payloads with special characters inside string values.
 */
function extractJson(raw: string): GeminiAnalysisPayload | null {
  if (!raw || typeof raw !== 'string') return null

  // Build a list of candidate strings to try parsing, from most to least clean
  const candidates: string[] = []

  // 1. Raw trimmed (best case — responseMimeType gave us pure JSON)
  candidates.push(raw.trim())

  // 2. Strip markdown fences anywhere in the string
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenceMatch?.[1]) candidates.push(fenceMatch[1].trim())

  // 3. Extract from first { to last } — handles any leading/trailing prose
  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(raw.slice(firstBrace, lastBrace + 1))
  }

  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object' && ('rawText' in parsed || 'analysis' in parsed || 'sections' in parsed)) {
        return parsed as GeminiAnalysisPayload
      }
    } catch {
      // JSON.parse failed — the string likely has unescaped control characters
      // inside a value (common when Gemini embeds raw resume text with newlines).
      // Sanitise the string values and retry.
      try {
        const sanitised = sanitiseJsonString(candidate)
        const parsed = JSON.parse(sanitised)
        if (parsed && typeof parsed === 'object' && ('rawText' in parsed || 'analysis' in parsed || 'sections' in parsed)) {
          return parsed as GeminiAnalysisPayload
        }
      } catch {
        // try next candidate
      }
    }
  }

  return null
}

/**
 * Fixes the most common reason JSON.parse fails on Gemini output:
 * literal newlines, tabs, and carriage returns inside JSON string values.
 * JSON strings must use \n, \t, \r — not the actual control characters.
 */
function sanitiseJsonString(raw: string): string {
  // Replace literal control characters inside JSON string values only.
  // We walk char-by-char tracking whether we are inside a string.
  let result = ''
  let inString = false
  let i = 0

  while (i < raw.length) {
    const ch = raw[i]

    if (inString) {
      if (ch === '\\') {
        // Already-escaped sequence — copy both chars verbatim
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
