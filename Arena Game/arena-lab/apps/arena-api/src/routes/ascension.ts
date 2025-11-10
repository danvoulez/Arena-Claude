/**
 * Ascension Routes
 */

import { Hono } from 'hono'
import { handleAscension } from '../handlers/ascension-handler'
import { handleAgentInvoke } from '../handlers/agent-invoke-handler'
import { authMiddleware, corsMiddleware, rateLimitMiddleware } from '../middleware'
import { MemoryLedger } from '@arenalab/atomic-core'

const ascension = new Hono()

// Inicializar ledger
const ledger = new MemoryLedger()

// Aplicar middlewares
ascension.use('*', corsMiddleware)
ascension.use('*', authMiddleware)
ascension.use('*', rateLimitMiddleware)

// Routes
ascension.post('/creatures/:id/ascend', async (c) => {
  return handleAscension(c, ledger)
})

ascension.post('/agents/:id/invoke', async (c) => {
  return handleAgentInvoke(c, ledger)
})

export default ascension

