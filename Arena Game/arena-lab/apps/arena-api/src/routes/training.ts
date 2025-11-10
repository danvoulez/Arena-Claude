/**
 * Training Routes
 */

import { Hono } from 'hono'
import { handleTrainingStart, handleTrainingComplete } from '../handlers/training-handler'
import { authMiddleware, corsMiddleware, rateLimitMiddleware } from '../middleware'
import { MemoryLedger } from '@arenalab/atomic-core'

const training = new Hono()

// Inicializar ledger
const ledger = new MemoryLedger()

// Aplicar middlewares
training.use('*', corsMiddleware)
training.use('*', authMiddleware)
training.use('*', rateLimitMiddleware)

// Routes
training.post('/creatures/:id/train', async (c) => {
  return handleTrainingStart(c, ledger)
})

training.post('/sessions/:id/complete', async (c) => {
  return handleTrainingComplete(c, ledger)
})

export default training

