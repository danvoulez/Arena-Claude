/**
 * DNA Handler
 * 
 * Retorna timeline completa de uma criatura
 */

import type { Context } from 'hono'
import type { Ledger } from '@arenalab/atomic-core'
import { getCreatureState } from '../state/getCreatureState'

/**
 * Handle DNA request
 */
export async function handleDNA(
  c: Context,
  ledger: Ledger
): Promise<Response> {
  try {
    const creatureId = c.req.param('id')
    
    if (!creatureId) {
      return c.json({ error: 'Missing creature ID' }, 400)
    }
    
    // Buscar estado completo da criatura
    const state = await getCreatureState(creatureId, ledger)
    
    if (!state) {
      return c.json({ error: 'Creature not found' }, 404)
    }
    
    // Construir timeline
    const timeline = state.timeline.map(item => ({
      timestamp: item.timestamp,
      type: item.type,
      span: item.span
    }))
    
    // Identificar milestones (simplificado)
    const milestones = state.timeline
      .filter(item => 
        item.type === 'evolution' || 
        (item.type === 'battle' && (item.span as any).output?.winner)
      )
      .map(item => ({
        type: item.type,
        timestamp: item.timestamp,
        description: `${item.type} event`
      }))
    
    return c.json({
      creatureId,
      timeline,
      stats: state.stats,
      milestones,
      qualityProfile: state.qualityProfile
    })
  } catch (error) {
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500)
  }
}

