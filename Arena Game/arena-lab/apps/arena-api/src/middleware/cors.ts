/**
 * CORS Middleware
 */

import type { Context, Next } from 'hono'

/**
 * CORS middleware
 */
export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('Origin')
  
  // Permitir origins específicos (configurar em produção)
  const allowedOrigins = [
    'http://localhost:3000',
    'https://arenalab.dev',
    'https://www.arenalab.dev'
  ]
  
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin)
  }
  
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Credentials', 'true')
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204)
  }
  
  await next()
}

