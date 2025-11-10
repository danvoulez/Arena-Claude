/**
 * State Derivation
 * 
 * Função pura que deriva estado da UI a partir de spans
 */

import type { Atomic } from '@arenalab/atomic-core'
import type { ArenaSpan } from '@arenalab/arena-domain'
import type { Creature } from '@arenalab/arena-domain'

export interface UIState {
  creatures: Map<string, Creature>
  spans: Atomic[]
  loading: boolean
  error: string | null
}

/**
 * Derive UI state from spans
 * 
 * Esta função é pura e pode ser usada tanto no frontend quanto no backend
 */
export function deriveState(spans: Atomic[]): UIState {
  const creatures = new Map<string, Creature>()
  const arenaSpans = spans as ArenaSpan[]
  
  // Agrupar spans por criatura
  arenaSpans.forEach(span => {
    const creatureId = span.who || span.did?.actor
    
    if (!creatureId) {
      return
    }
    
    // Se criatura não existe, criar
    if (!creatures.has(creatureId)) {
      creatures.set(creatureId, {
        id: creatureId,
        name: `Creature ${creatureId}`,
        level: 1,
        xp: 0,
        elo: 1000,
        trust: 100,
        hp: 100,
        evolutionStage: 0,
        abilities: [],
        diamondSpans: 0,
        status: 'active',
        createdAt: span.when?.started_at || new Date().toISOString(),
        dataset: [],
        activeBuffs: [],
        permanentTraits: []
      })
    }
    
    // TODO: Aplicar regras de domínio para atualizar criatura
    // Por enquanto, apenas manter referência
  })
  
  return {
    creatures,
    spans,
    loading: false,
    error: null
  }
}

/**
 * Derive creature state from spans
 * 
 * Versão simplificada que retorna estado de uma criatura específica
 */
export function deriveCreatureState(
  creatureId: string,
  spans: Atomic[]
): Creature | null {
  const state = deriveState(spans)
  return state.creatures.get(creatureId) || null
}

