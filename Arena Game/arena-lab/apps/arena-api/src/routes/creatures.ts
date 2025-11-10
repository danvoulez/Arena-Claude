/**
 * Creatures Routes (DNA, Leaderboard, Legend)
 */

import { Hono } from 'hono'
import { handleDNA } from '../handlers/dna-handler'
import { handleLeaderboard } from '../handlers/leaderboard-handler'
import { handleLegend } from '../handlers/legend-handler'
import { authMiddleware, corsMiddleware, rateLimitMiddleware } from '../middleware'
import { MemoryLedger } from '@arenalab/atomic-core'

const creatures = new Hono()

// Inicializar ledger
const ledger = new MemoryLedger()

// Aplicar middlewares
creatures.use('*', corsMiddleware)
creatures.use('*', authMiddleware)
creatures.use('*', rateLimitMiddleware)

// Routes
creatures.get('/creatures/:id/dna', async (c) => {
  return handleDNA(c, ledger)
})

creatures.get('/leaderboard', async (c) => {
  return handleLeaderboard(c, ledger)
})

creatures.get('/creatures/:id/legend', async (c) => {
  return handleLegend(c, ledger)
})

export default creatures

