/**
 * Evolution Handler
 * 
 * Processa evoluções de criaturas
 */

import type { Context } from 'hono'
import { createEvolutionSpan, canEvolve } from '@arenalab/arena-domain'
import type { Ledger } from '@arenalab/atomic-core'
import { getCreature } from '../utils/getCreature'
import { createSpan } from '@arenalab/atomic-core'
import { generateNarrativeEvents } from '@arenalab/trajectory-engine'

interface EvolutionRequest {
  evolutionType?: string
}

/**
 * Handle evolution request
 */
export async function handleEvolution(
  c: Context,
  ledger: Ledger
): Promise<Response> {
  try {
    const creatureId = c.req.param('id')
    const body = (await c.req.json().catch(() => ({}))) as EvolutionRequest
    
    if (!creatureId) {
      return c.json({ error: 'Missing creature ID' }, 400)
    }
    
    // Buscar creature do ledger
    const creature = await getCreature(ledger, creatureId)
    
    if (!creature) {
      return c.json({ error: 'Creature not found' }, 404)
    }
    
    // Validar requisitos
    const evolutionCheck = canEvolve(creature)
    
    if (!evolutionCheck.canEvolve) {
      return c.json({ 
        error: 'Evolution requirements not met',
        reason: evolutionCheck.reason,
        requirements: evolutionCheck.requirements
      }, 400)
    }
    
    // Criar EvolutionSpan
    const evolutionSpanData = createEvolutionSpan({
      creatureId,
      evolutionStage: (creature.evolutionStage || 0) + 1,
      previousStage: creature.evolutionStage || 0,
      newAbilities: ['Advanced Reasoning', 'Context Awareness']
    })
    
    // Criar span completo e append ao ledger
    const userId = c.get('userId') || 'unknown'
    const span = await createSpan({
      entity_type: 'evolution',
      this: `Evolution to stage ${(creature.evolutionStage || 0) + 1}`,
      did: evolutionSpanData.did,
      input: evolutionSpanData.input,
      output: evolutionSpanData.output,
      who: userId
    })
    
    await ledger.append(span)
    
    // Gerar narrative events
    const narrativeEvents = generateNarrativeEvents([span])
    
    // Buscar creature atualizada
    const { getCreatureState } = await import('../state/getCreatureState')
    const state = await getCreatureState(creatureId, ledger)
    
    return c.json({
      creature: state?.creature || {
        ...creature,
        evolutionStage: (creature.evolutionStage || 0) + 1
      },
      evolution: {
        stage: (creature.evolutionStage || 0) + 1,
        newAbilities: ['Advanced Reasoning', 'Context Awareness']
      },
      narrativeEvents
    })
  } catch (error) {
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500)
  }
}

