import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { groqChat } from '@/lib/groq-client'

export const runtime = 'nodejs'

const schema = z.object({
  bullet: z
    .string()
    .min(5, 'Bullet must be at least 5 characters')
    .max(500, 'Bullet is too long'),
})

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const { bullet } = parsed.data

    // Try HuggingFace first, fall back to Groq
    const rewritten = await rewriteWithHuggingFace(bullet)
      .catch((err) => {
        console.warn('[rewrite] HuggingFace failed, falling back to Groq:', err?.message)
        return rewriteWithGroq(bullet)
      })

    if (!rewritten) {
      return NextResponse.json({ error: 'No content generated.' }, { status: 500 })
    }

    return NextResponse.json({ rewritten: rewritten.trim() })
  } catch (err) {
    console.error('[rewrite] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── HuggingFace ──────────────────────────────────────────────────────────────

const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3'
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`

async function rewriteWithHuggingFace(bullet: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY not set')

  const prompt = buildRewritePrompt(bullet)

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 120,
        temperature: 0.4,
        return_full_text: false,
        stop: ['\n\n', 'Original:'],
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HuggingFace ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = await response.json()

  // HF returns an array of generated_text objects
  const generated: string =
    Array.isArray(data)
      ? (data[0]?.generated_text ?? '')
      : (data?.generated_text ?? '')

  return cleanRewriteOutput(generated)
}

// ─── Groq fallback ────────────────────────────────────────────────────────────

async function rewriteWithGroq(bullet: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const result = await groqChat({
    messages: [
      {
        role: 'system',
        content:
          'You are a professional resume writer. Rewrite resume bullet points to be more impactful. Return ONLY the rewritten bullet — no explanation, no quotes, no extra text.',
      },
      { role: 'user', content: buildRewritePrompt(bullet) },
    ],
    maxTokens: 120,
    temperature: 0.4,
  })

  return cleanRewriteOutput(result)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildRewritePrompt(bullet: string): string {
  return `Rewrite this resume bullet point to be more impactful.
Rules:
- Start with a strong past-tense action verb
- Add quantifiable results if possible (%, numbers, $)
- Keep it to 1 line maximum
- Do NOT invent data — only improve what is given
- Return ONLY the rewritten bullet, nothing else

Original: ${bullet}
Rewritten:`
}

function cleanRewriteOutput(raw: string): string {
  return raw
    .trim()
    // Remove any "Rewritten:" prefix the model echoes back
    .replace(/^rewritten:\s*/i, '')
    // Remove surrounding quotes
    .replace(/^["']|["']$/g, '')
    .trim()
}
