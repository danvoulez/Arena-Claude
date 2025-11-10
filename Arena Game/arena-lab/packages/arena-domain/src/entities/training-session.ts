/**
 * Training Session Entity
 * 
 * Representa uma sessão de treinamento
 */

import { z } from 'zod'

export const TrainingSessionSchema = z.object({
  id: z.string(),
  creatureId: z.string(),
  programId: z.string(),
  
  // Status
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  
  // Timing
  startedAt: z.string(),
  completedAt: z.string().optional(),
  duration: z.number().optional(), // em segundos
  
  // Results
  buffsApplied: z.array(z.string()).default([]),
  traitsGained: z.array(z.string()).default([]),
  spansAdded: z.number().default(0),
  
  // Metadata
  createdAt: z.string()
})

export type TrainingSession = z.infer<typeof TrainingSessionSchema>

/**
 * Create a new training session
 */
export function createTrainingSession(data: {
  id: string
  creatureId: string
  programId: string
}): TrainingSession {
  return {
    id: data.id,
    creatureId: data.creatureId,
    programId: data.programId,
    status: 'pending',
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    buffsApplied: [],
    traitsGained: [],
    spansAdded: 0
  }
}

