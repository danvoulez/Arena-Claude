/**
 * State Routes
 */

import { Hono } from 'hono'
import { handleState } from '../handlers/state-handler'
import { authMiddleware, corsMiddleware, rateLimitMiddleware } from '../middleware'
import { MemoryLedger } from '@arenalab/atomic-core'

const state = new Hono()

// Inicializar ledger
const ledger = new MemoryLedger()

// Aplicar middlewares
state.use('*', corsMiddleware)
state.use('*', authMiddleware)
state.use('*', rateLimitMiddleware)

// Routes
state.get('/creatures/:id/state', async (c) => {
  return handleState(c, ledger)
})

export default state

