/**
 * Evolution Routes
 */

import { Hono } from 'hono'
import { handleEvolution } from '../handlers/evolution-handler'
import { authMiddleware, corsMiddleware, rateLimitMiddleware } from '../middleware'
import { MemoryLedger } from '@arenalab/atomic-core'

const evolution = new Hono()

// Inicializar ledger
const ledger = new MemoryLedger()

// Aplicar middlewares
evolution.use('*', corsMiddleware)
evolution.use('*', authMiddleware)
evolution.use('*', rateLimitMiddleware)

// Routes
evolution.post('/creatures/:id/evolve', async (c) => {
  return handleEvolution(c, ledger)
})

export default evolution

