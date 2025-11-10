/**
 * Leaderboard Handler
 * 
 * Retorna ranking global de criaturas
 */

import type { Context } from 'hono'
import type { Ledger } from '@arenalab/atomic-core'
import { getAllCreatures } from '../utils/getCreature'

interface LeaderboardOptions {
  sortBy?: 'elo' | 'level' | 'trust' | 'wins'
  limit?: number
  offset?: number
}

/**
 * Handle leaderboard request
 */
export async function handleLeaderboard(
  c: Context,
  ledger: Ledger
): Promise<Response> {
  try {
    const sortBy = (c.req.query('sortBy') || 'elo') as 'elo' | 'level' | 'trust' | 'wins'
    const limit = parseInt(c.req.query('limit') || '100')
    const offset = parseInt(c.req.query('offset') || '0')
    
    // Buscar todas as creatures do ledger
    const creatures = await getAllCreatures(ledger)
    
    // Filtrar/ordenar por critérios
    const sorted = [...creatures].sort((a, b) => {
      if (sortBy === 'elo') return b.elo - a.elo
      if (sortBy === 'level') return b.level - a.level
      if (sortBy === 'trust') return b.trust - a.trust
      if (sortBy === 'wins') {
        // Calcular wins baseado em stats (simplificado)
        const winsA = (a as any).wins || 0
        const winsB = (b as any).wins || 0
        return winsB - winsA
      }
      return 0
    })
    
    // Aplicar paginação
    const paginated = sorted.slice(offset, offset + limit)
    
    // Construir leaderboard com rank
    const leaderboard = paginated.map((creature, index) => ({
      rank: offset + index + 1,
      creature
    }))
    
    return c.json({
      leaderboard,
      total: sorted.length,
      limit,
      offset,
      sortBy
    })
  } catch (error) {
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500)
  }
}

