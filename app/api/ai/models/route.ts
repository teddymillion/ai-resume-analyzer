import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/** Returns the current AI provider configuration. Useful for debugging. */
export async function GET() {
  return NextResponse.json({
    analyzeProvider: 'groq',
    rewriteProvider: 'huggingface (groq fallback)',
    groqModel: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
    groqFallbackModel: process.env.GROQ_FALLBACK_MODEL ?? 'llama3-8b-8192',
    huggingFaceModel: 'mistralai/Mistral-7B-Instruct-v0.3',
    groqConfigured: !!process.env.GROQ_API_KEY,
    huggingFaceConfigured: !!process.env.HUGGINGFACE_API_KEY,
  })
}
