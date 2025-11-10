/**
 * Get Creature from Ledger
 * 
 * Busca criatura do ledger baseado em spans
 */

import type { Ledger } from '@arenalab/atomic-core'
import type { ArenaSpan } from '@arenalab/arena-domain'
import type { Creature } from '@arenalab/arena-domain'
import { getCreatureState } from '../state/getCreatureState'

/**
 * Get creature by ID from ledger
 */
export async function getCreature(
  ledger: Ledger,
  creatureId: string
): Promise<Creature | null> {
  const state = await getCreatureState(creatureId, ledger)
  return state?.creature || null
}

/**
 * Get all creatures from ledger
 */
export async function getAllCreatures(ledger: Ledger): Promise<Creature[]> {
  // Buscar todos os spans
  const result = await ledger.scan()
  const spans = result.atomics as ArenaSpan[]
  
  // Extrair IDs únicos de criaturas
  const creatureIds = new Set<string>()
  spans.forEach(span => {
    if (span.who) creatureIds.add(span.who)
    if (span.did?.actor) creatureIds.add(span.did.actor)
    if (span.entity_type === 'battle') {
      const battleSpan = span as any
      if (battleSpan.input?.creatureAId) creatureIds.add(battleSpan.input.creatureAId)
      if (battleSpan.input?.creatureBId) creatureIds.add(battleSpan.input.creatureBId)
    }
  })
  
  // Buscar estado de cada criatura
  const creatures: Creature[] = []
  for (const id of creatureIds) {
    const creature = await getCreature(ledger, id)
    if (creature) {
      creatures.push(creature)
    }
  }
  
  return creatures
}

