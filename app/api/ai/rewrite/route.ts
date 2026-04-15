import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

const schema = z.object({
  bullet: z.string().min(5, 'Bullet must be at least 5 characters').max(500, 'Bullet too long'),
})

const RATE_LIMIT = { limit: 10, windowMs: 60 * 1000 }

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`rewrite:${clientIp}`, RATE_LIMIT)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const { bullet } = parsed.data
    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL

    if (!apiKey) return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    if (!model) return NextResponse.json({ error: 'Gemini model not configured' }, { status: 500 })

    const prompt = [
      'You are a professional resume writer specializing in ATS-optimized resumes.',
      'Rewrite the following resume bullet point to be more impactful.',
      'Rules:',
      '- Start with a strong past-tense action verb',
      '- Include quantifiable results if possible (%, numbers, $)',
      '- Keep it to 1–2 lines maximum',
      '- Do NOT add fictional data — only improve what is given',
      '- Return ONLY the rewritten bullet point, no explanation, no quotes',
      '',
      `Original: ${bullet}`,
    ].join('\n')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.4 },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[rewrite] Gemini error:', errorText)
      return NextResponse.json({ error: 'Failed to generate rewrite' }, { status: 500 })
    }

    const data = await response.json()
    const rewritten = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim()

    if (!rewritten) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 })
    }

    return NextResponse.json({ rewritten })
  } catch (err) {
    console.error('[rewrite] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
