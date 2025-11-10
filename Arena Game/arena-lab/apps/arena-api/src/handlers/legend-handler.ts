/**
 * Legend Handler
 * 
 * Retorna legend completa de uma criatura (história narrativa)
 */

import type { Context } from 'hono'
import type { Ledger } from '@arenalab/atomic-core'
import { getCreatureState } from '../state/getCreatureState'
import { generateNarrativeEvents } from '@arenalab/trajectory-engine'

/**
 * Handle legend request
 */
export async function handleLegend(
  c: Context,
  ledger: Ledger
): Promise<Response> {
  try {
    const creatureId = c.req.param('id')
    
    if (!creatureId) {
      return c.json({ error: 'Missing creature ID' }, 400)
    }
    
    // Buscar spans da creature
    const state = await getCreatureState(creatureId, ledger)
    
    if (!state) {
      return c.json({ error: 'Creature not found' }, 404)
    }
    
    // Gerar capítulos narrativos baseados em timeline
    const chapters = state.timeline
      .filter(item => item.type === 'battle' || item.type === 'evolution' || item.type === 'training')
      .map((item, index) => {
        const narrativeEvents = generateNarrativeEvents([item.span])
        return {
          chapter: index + 1,
          title: `${item.type} event`,
          timestamp: item.timestamp,
          events: narrativeEvents,
          span: item.span
        }
      })
    
    // Calcular Merkle root (simplificado - hash de todos os spans)
    const allHashes = state.timeline.map(item => item.span.hash || '').filter(Boolean)
    const merkleRoot = allHashes.length > 0 
      ? allHashes.join('') // Simplificado - em produção usar árvore Merkle real
      : ''
    
    return c.json({
      creatureId,
      chapters,
      merkleRoot,
      totalSpans: state.timeline.length,
      createdAt: state.creature.createdAt,
      lastUpdated: state.timeline[state.timeline.length - 1]?.timestamp || state.creature.createdAt
    })
  } catch (error) {
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500)
  }
}

