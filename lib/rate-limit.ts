const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const DEFAULT_LIMIT = 10
const DEFAULT_WINDOW_MS = 60 * 1000

export interface RateLimitConfig {
  limit: number
  windowMs: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: DEFAULT_LIMIT, windowMs: DEFAULT_WINDOW_MS }
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const key = `ratelimit:${identifier}`

  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.limit - 1, resetIn: config.windowMs }
  }

  if (record.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: config.limit - record.count,
    resetIn: record.resetTime - now,
  }
}

export function clearExpiredRateLimits() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(clearExpiredRateLimits, 60 * 1000)
}