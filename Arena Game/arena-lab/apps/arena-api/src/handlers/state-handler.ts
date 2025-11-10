/**
 * State Handler
 * 
 * Retorna estado agregado de uma criatura
 */

import type { Context } from 'hono'
import { getCreatureState } from '../state/getCreatureState'
import type { Ledger } from '@arenalab/atomic-core'

/**
 * Handle state request
 */
export async function handleState(
  c: Context,
  ledger: Ledger
): Promise<Response> {
  try {
    const creatureId = c.req.param('id')
    
    if (!creatureId) {
      return c.json({ error: 'Missing creature ID' }, 400)
    }
    
    const state = await getCreatureState(creatureId, ledger)
    
    if (!state) {
      return c.json({ error: 'Creature not found' }, 404)
    }
    
    return c.json(state)
  } catch (error) {
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500)
  }
}

