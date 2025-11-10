/**
 * Zustand Store
 * 
 * Store é cache do ledger, não fonte de verdade
 */

import { create } from 'zustand'
import type { Atomic } from '@arenalab/atomic-core'
import type { Creature } from '@arenalab/arena-domain'
import { deriveState, type UIState } from './derivation'

interface ArenaStore extends UIState {
  // Actions
  updateCreature: (creature: Creature) => void
  addSpan: (span: Atomic) => void
  setSpans: (spans: Atomic[]) => void
  syncLedger: (spans: Atomic[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: UIState = {
  creatures: new Map(),
  spans: [],
  loading: false,
  error: null
}

export const useArenaStore = create<ArenaStore>((set, get) => ({
  ...initialState,
  
  updateCreature: (creature) => {
    set((state) => {
      const newCreatures = new Map(state.creatures)
      newCreatures.set(creature.id, creature)
      return { creatures: newCreatures }
    })
  },
  
  addSpan: (span) => {
    set((state) => {
      const newSpans = [...state.spans, span]
      const derivedState = deriveState(newSpans)
      return {
        spans: newSpans,
        creatures: derivedState.creatures
      }
    })
  },
  
  setSpans: (spans) => {
    const derivedState = deriveState(spans)
    set({
      spans,
      creatures: derivedState.creatures
    })
  },
  
  syncLedger: (spans) => {
    const derivedState = deriveState(spans)
    set({
      spans,
      creatures: derivedState.creatures,
      loading: false,
      error: null
    })
  },
  
  setLoading: (loading) => {
    set({ loading })
  },
  
  setError: (error) => {
    set({ error })
  },
  
  reset: () => {
    set(initialState)
  }
}))

