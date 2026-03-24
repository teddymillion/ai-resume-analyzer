import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume, AnalysisResult } from '@/lib/analysis-engine';
import { parseResume, ParsedResume, ResumeSection } from '@/lib/resume-parser';

export const runtime = 'nodejs';

type GeminiAnalysisPayload = {
  rawText?: string;
  sections?: Array<{
    type?: string;
    title?: string;
    content?: string;
    bullets?: string[];
  }>;
  skills?: string[];
  keywords?: string[];
  analysis?: Partial<AnalysisResult>;
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }

    const lowerName = file.name.toLowerCase();
    const isAllowedType =
      ALLOWED_TYPES.has(file.type) || ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (!isAllowedType) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File is too large (max 10MB).' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const prompt = [
      'You are an expert resume analyzer.',
      'You will receive a resume file (PDF or DOCX).',
      'Extract the resume text and analyze it.',
      'Return ONLY valid JSON with this exact shape:',
      '{',
      '  "rawText": "string",',
      '  "sections": [',
      '    {"type":"summary|experience|skills|education|other","title":"string","content":"string","bullets":["string"]}',
      '  ],',
      '  "skills": ["string"],',
      '  "keywords": ["string"],',
      '  "analysis": {',
      '    "overallScore": 0,',
      '    "atsScore": 0,',
      '    "strengths": ["string"],',
      '    "weaknesses": ["string"],',
      '    "missingSkills": ["string"],',
      '    "atsIssues": ["string"],',
      '    "atsSuggestions": ["string"],',
      '    "formattingQuality": "excellent|good|fair|poor"',
      '  }',
      '}',
      'Rules:',
      '- If a field is unknown, use empty string or empty array.',
      '- Limit arrays to 10 items.',
      '- Keep scores between 0 and 100.',
      '- Use English only.',
      '- No markdown, no commentary.',
    ].join('\n');

    const model = process.env.GEMINI_MODEL;
    if (!model) {
      return NextResponse.json(
        { error: 'Gemini model not configured. Set GEMINI_MODEL in .env.local.' },
        { status: 500 },
      );
    }
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return NextResponse.json(
        {
          error: 'Failed to analyze resume with Gemini',
          details: `Gemini API ${response.status}: ${error}`,
        },
        { status: 500 },
      );
    }

    const data = await response.json();
    const rawTextResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const parsedPayload = safeJsonParse(rawTextResponse);
    if (!parsedPayload) {
      return NextResponse.json(
        { error: 'Gemini response was not valid JSON' },
        { status: 500 },
      );
    }

    const normalized = normalizeGeminiPayload(parsedPayload);

    const parsedResume: ParsedResume =
      normalized.rawText.trim().length > 0
        ? buildParsedResume(normalized)
        : {
            rawText: '',
            sections: [],
            allText: '',
            skills: [],
            keywords: [],
            wordCount: 0,
            charCount: 0,
          };

    const analysis: AnalysisResult = finalizeAnalysis(
      normalized.analysis,
      parsedResume,
    );

    return NextResponse.json({ parsedResume, analysis });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function safeJsonParse(value: string): GeminiAnalysisPayload | null {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value) as GeminiAnalysisPayload;
  } catch {
    const start = value.indexOf('{');
    const end = value.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const slice = value.slice(start, end + 1);
      try {
        return JSON.parse(slice) as GeminiAnalysisPayload;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeGeminiPayload(payload: GeminiAnalysisPayload) {
  const rawText = typeof payload.rawText === 'string' ? payload.rawText : '';
  const sections = normalizeSections(payload.sections ?? []);
  const skills = sanitizeStringArray(payload.skills ?? []);
  const keywords = sanitizeStringArray(payload.keywords ?? []);

  return {
    rawText,
    sections,
    skills,
    keywords,
    analysis: payload.analysis ?? {},
  };
}

function normalizeSections(sections: GeminiAnalysisPayload['sections']): ResumeSection[] {
  if (!Array.isArray(sections)) return [];
  return sections
    .map((section) => {
      const type = normalizeSectionType(section?.type);
      const title = typeof section?.title === 'string' ? section.title : 'Section';
      const content = typeof section?.content === 'string' ? section.content : '';
      const bullets = sanitizeStringArray(section?.bullets ?? []);
      return {
        type,
        title,
        content,
        bullets,
      } satisfies ResumeSection;
    })
    .filter((section) => section.content.length > 0 || section.bullets.length > 0);
}

function normalizeSectionType(value?: string): ResumeSection['type'] {
  switch ((value ?? '').toLowerCase()) {
    case 'summary':
      return 'summary';
    case 'experience':
      return 'experience';
    case 'skills':
      return 'skills';
    case 'education':
      return 'education';
    default:
      return 'other';
  }
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function buildParsedResume(normalized: ReturnType<typeof normalizeGeminiPayload>): ParsedResume {
  const allText = normalized.rawText.trim();
  const wordCount = allText ? allText.split(/\s+/).length : 0;
  const charCount = allText.length;

  const sections = normalized.sections.length
    ? normalized.sections
    : parseResume(allText).sections;

  const skills = normalized.skills.length ? normalized.skills : parseResume(allText).skills;
  const keywords = normalized.keywords.length
    ? normalized.keywords
    : parseResume(allText).keywords;

  return {
    rawText: normalized.rawText,
    sections,
    allText,
    skills,
    keywords,
    wordCount,
    charCount,
  };
}

function finalizeAnalysis(
  analysis: Partial<AnalysisResult>,
  parsedResume: ParsedResume,
): AnalysisResult {
  const fallback = analyzeResume(parsedResume);
  const wordCount = parsedResume.wordCount || 1;
  const keywordDensity = Math.round((parsedResume.keywords.length / wordCount) * 100 * 10) / 10;

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
  };
}

function clampScore(value: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function normalizeFormattingQuality(
  value: AnalysisResult['formattingQuality'] | string,
): AnalysisResult['formattingQuality'] {
  switch ((value ?? '').toLowerCase()) {
    case 'excellent':
      return 'excellent';
    case 'good':
      return 'good';
    case 'fair':
      return 'fair';
    default:
      return 'poor';
  }
}
