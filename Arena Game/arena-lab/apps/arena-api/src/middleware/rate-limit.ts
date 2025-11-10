/**
 * Rate Limiting Middleware
 * 
 * TODO: Implementar com Cloudflare Durable Objects ou KV
 */

import type { Context, Next } from 'hono'

interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerHour: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  requestsPerMinute: 60,
  requestsPerHour: 1000
}

/**
 * Rate limit middleware
 * 
 * TODO: Implementar com Durable Objects para persistência
 */
export async function rateLimitMiddleware(
  c: Context,
  next: Next,
  config: RateLimitConfig = DEFAULT_CONFIG
) {
  const userId = c.get('userId') || 'anonymous'
  const now = Date.now()
  
  // TODO: Implementar rate limiting real com Durable Objects
  // Por enquanto, apenas passa
  // const rateLimiter = c.env.RATE_LIMITER
  // const count = await rateLimiter.check(userId, now)
  // if (count > config.requestsPerMinute) {
  //   return c.json({ error: 'Rate limit exceeded' }, 429)
  // }
  
  await next()
}

