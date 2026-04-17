/**
 * Groq client — wraps groq-sdk with:
 *   • automatic retry on 429 / 503 (exponential backoff)
 *   • automatic fallback to a smaller model if primary is overloaded
 *   • JSON-mode output for structured responses
 */

import Groq from 'groq-sdk'

const MAX_RETRIES = 3
const BASE_DELAY_MS = 800 // 0.8 s → 1.6 s → 3.2 s

let _client: Groq | null = null

function getClient(): Groq {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY is not set in environment variables.')
    _client = new Groq({ apiKey })
  }
  return _client
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

interface GroqChatOptions {
  model: string
  messages: Groq.Chat.ChatCompletionMessageParam[]
  maxTokens?: number
  temperature?: number
  jsonMode?: boolean
}

async function chatWithRetry(
  options: GroqChatOptions,
  attempt = 0,
): Promise<string> {
  const client = getClient()

  try {
    const completion = await client.chat.completions.create({
      model: options.model,
      messages: options.messages,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.1,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    })

    return completion.choices[0]?.message?.content ?? ''
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status ?? 0
    const isRetryable = status === 429 || status === 503

    if (isRetryable && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt)
      console.warn(
        `[groq] ${status} on model "${options.model}" — retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
      )
      await sleep(delay)
      return chatWithRetry(options, attempt + 1)
    }

    throw err
  }
}

/**
 * Runs a chat completion with the primary model.
 * If the primary model is rate-limited after all retries, automatically
 * falls back to the configured fallback model.
 */
export async function groqChat(options: Omit<GroqChatOptions, 'model'>): Promise<string> {
  const primary = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'
  const fallback = process.env.GROQ_FALLBACK_MODEL ?? 'llama3-8b-8192'

  try {
    return await chatWithRetry({ ...options, model: primary })
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status ?? 0
    if ((status === 429 || status === 503) && fallback !== primary) {
      console.warn(`[groq] Primary model "${primary}" exhausted — falling back to "${fallback}"`)
      return chatWithRetry({ ...options, model: fallback })
    }
    throw err
  }
}
