/**
 * Training Span Type
 * 
 * Representa uma sessão de treinamento
 */

import { z } from 'zod'
import type { Atomic } from '../../atomic-core/src/types'

export const TrainingSpanSchema = z.object({
  entity_type: z.literal('training'),
  trace_id: z.string().optional(),
  this: z.string(), // Program ID ou descrição
  did: z.object({
    actor: z.string(), // ID da criatura
    action: z.string(), // "training_started" ou "training_completed"
    reason: z.string().optional()
  }),
  input: z.object({
    programId: z.string(),
    duration: z.number().optional() // em segundos
  }).optional(),
  output: z.object({
    buffsApplied: z.number().optional(),
    traitsGained: z.number().optional(),
    spansAdded: z.number().optional()
  }).optional(),
  status: z.object({
    state: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
    result: z.enum(['ok', 'doubt', 'not', 'error']).optional(),
    message: z.string().optional()
  }).optional(),
  metadata: z.object({
    sessionId: z.string().optional(),
    programId: z.string().optional(),
    created_at: z.string()
  }).optional()
})

export type TrainingSpan = z.infer<typeof TrainingSpanSchema> & Atomic

/**
 * Create a TrainingSpan from data
 */
export function createTrainingSpan(data: {
  trace_id?: string
  creatureId: string
  programId: string
  action?: 'training_started' | 'training_completed'
}): TrainingSpan {
  return {
    entity_type: 'training',
    trace_id: data.trace_id,
    this: data.programId,
    did: {
      actor: data.creatureId,
      action: data.action || 'training_started'
    },
    input: {
      programId: data.programId
    },
    when: {
      started_at: new Date().toISOString()
    },
    status: {
      state: data.action === 'training_completed' ? 'completed' : 'pending'
    },
    metadata: {
      programId: data.programId,
      created_at: new Date().toISOString()
    }
  } as TrainingSpan
}

