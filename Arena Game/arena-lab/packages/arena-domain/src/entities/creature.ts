/**
 * Creature Entity
 * 
 * Representa uma criatura no ArenaLab
 */

import { z } from 'zod'

export const CreatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  faction: z.enum(['embaixada', 'consorcio', 'libertos']).optional(),
  
  // Stats
  level: z.number().min(1),
  xp: z.number().min(0),
  elo: z.number().min(0).default(1000),
  trust: z.number().min(0).max(100).default(100),
  hp: z.number().min(0).max(100).default(100),
  
  // Evolution
  evolutionStage: z.number().min(0).max(2).default(0),
  abilities: z.array(z.string()).default([]),
  
  // Quality
  diamondSpans: z.number().min(0).default(0),
  
  // Status
  status: z.enum(['active', 'resting', 'training', 'evolving', 'ascended']).default('active'),
  
  // Metadata
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  
  // Dataset (para Trajectory Matching)
  dataset: z.array(z.string()).default([]), // IDs de spans no dataset
  
  // Buffs e Traits
  activeBuffs: z.array(z.object({
    id: z.string(),
    name: z.string(),
    expiresAt: z.string().optional()
  })).default([]),
  
  permanentTraits: z.array(z.string()).default([])
})

export type Creature = z.infer<typeof CreatureSchema>

/**
 * Create a new creature
 */
export function createCreature(data: {
  id: string
  name: string
  faction?: 'embaixada' | 'consorcio' | 'libertos'
}): Creature {
  return {
    id: data.id,
    name: data.name,
    faction: data.faction,
    level: 1,
    xp: 0,
    elo: 1000,
    trust: 100,
    hp: 100,
    evolutionStage: 0,
    abilities: [],
    diamondSpans: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    dataset: [],
    activeBuffs: [],
    permanentTraits: []
  }
}

