/**
 * Auth Middleware
 * 
 * Verifica Google OAuth token e extrai user_id
 */

import type { Context, Next } from 'hono'

export interface AuthContext {
  userId?: string
  email?: string
}

/**
 * Verify Google OAuth token
 * 
 * TODO: Implementar verificação real com Google OAuth
 */
async function verifyGoogleToken(token: string): Promise<AuthContext | null> {
  // TODO: Implementar verificação real
  // Por enquanto, retorna mock
  try {
    // Em produção, verificar token com Google OAuth API
    // const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
    // const data = await response.json()
    // return { userId: data.sub, email: data.email }
    
    // Mock para desenvolvimento
    return { userId: 'user_mock', email: 'user@example.com' }
  } catch (error) {
    return null
  }
}

/**
 * Auth middleware
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.substring(7)
  const authContext = await verifyGoogleToken(token)
  
  if (!authContext) {
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  // Adicionar ao context
  c.set('userId', authContext.userId)
  c.set('email', authContext.email)
  
  await next()
}

