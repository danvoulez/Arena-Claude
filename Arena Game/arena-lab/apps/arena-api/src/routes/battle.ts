/**
 * Battle Routes
 */

import { Hono } from 'hono'
import { handleBattle } from '../handlers/battle-handler'
import { authMiddleware, corsMiddleware, rateLimitMiddleware } from '../middleware'
import { MemoryLedger } from '@arenalab/atomic-core'

const battle = new Hono()

// Inicializar ledger (em produção, usar Worker KV ou Durable Objects)
// Por enquanto, usar MemoryLedger (IndexedDB não funciona em Workers)
const ledger = new MemoryLedger()

// Aplicar middlewares
battle.use('*', corsMiddleware)
battle.use('*', authMiddleware)
battle.use('*', rateLimitMiddleware)

// Routes
battle.post('/', async (c) => {
  return handleBattle(c, ledger)
})

export default battle

