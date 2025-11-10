/**
 * Evolution Span Type
 * 
 * Representa uma evolução de criatura
 */

import { z } from 'zod'
import type { Atomic } from '../../atomic-core/src/types'

export const EvolutionSpanSchema = z.object({
  entity_type: z.literal('evolution'),
  trace_id: z.string().optional(),
  this: z.string(), // Descrição da evolução
  did: z.object({
    actor: z.string(), // ID da criatura
    action: z.string(), // "evolution_stage_{stage}"
    reason: z.string().optional()
  }),
  input: z.object({
    evolutionStage: z.number(),
    previousStage: z.number().optional()
  }).optional(),
  output: z.object({
    newAbilities: z.array(z.string()).optional(),
    spansAdded: z.number().optional()
  }).optional(),
  status: z.object({
    state: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
    result: z.enum(['ok', 'doubt', 'not', 'error']).optional(),
    message: z.string().optional()
  }).optional(),
  metadata: z.object({
    evolutionType: z.string().optional(), // "strategic_expansion", etc.
    previousStage: z.number().optional(),
    newLevel: z.number().optional(),
    created_at: z.string()
  }).optional()
})

export type EvolutionSpan = z.infer<typeof EvolutionSpanSchema> & Atomic

/**
 * Create an EvolutionSpan from data
 */
export function createEvolutionSpan(data: {
  trace_id?: string
  creatureId: string
  evolutionStage: number
  previousStage?: number
  newAbilities?: string[]
}): EvolutionSpan {
  return {
    entity_type: 'evolution',
    trace_id: data.trace_id,
    this: `Evolution to stage ${data.evolutionStage}`,
    did: {
      actor: data.creatureId,
      action: `evolution_stage_${data.evolutionStage}`
    },
    input: {
      evolutionStage: data.evolutionStage,
      previousStage: data.previousStage
    },
    output: {
      newAbilities: data.newAbilities,
      spansAdded: data.newAbilities?.length || 0
    },
    when: {
      started_at: new Date().toISOString()
    },
    status: {
      state: 'completed',
      result: 'ok'
    },
    metadata: {
      evolutionType: 'strategic_expansion',
      previousStage: data.previousStage,
      created_at: new Date().toISOString()
    }
  } as EvolutionSpan
}

