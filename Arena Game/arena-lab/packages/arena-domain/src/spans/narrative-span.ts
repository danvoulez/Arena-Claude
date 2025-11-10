/**
 * Narrative Span Type
 * 
 * Representa um evento narrativo gerado pelo sistema
 */

import { z } from 'zod'
import type { Atomic } from '../../atomic-core/src/types'

export const NarrativeSpanSchema = z.object({
  entity_type: z.literal('narrative'),
  trace_id: z.string().optional(),
  this: z.string(), // Mensagem narrativa
  did: z.object({
    actor: z.string(), // "narrative_system" ou "professor_oak"
    action: z.string(), // Tipo de evento narrativo
    reason: z.string().optional()
  }),
  input: z.object({
    eventType: z.string(), // "xp_gained", "level_up", "evolution_ready", etc.
    creatureId: z.string().optional(),
    spanId: z.string().optional() // ID do span que gerou o evento
  }).optional(),
  output: z.object({
    message: z.string().optional(),
    severity: z.enum(['info', 'success', 'warning', 'error']).optional()
  }).optional(),
  status: z.object({
    state: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
    result: z.enum(['ok', 'doubt', 'not', 'error']).optional(),
    message: z.string().optional()
  }).optional(),
  metadata: z.object({
    eventType: z.string().optional(),
    creatureId: z.string().optional(),
    spanId: z.string().optional(),
    created_at: z.string()
  }).optional()
})

export type NarrativeSpan = z.infer<typeof NarrativeSpanSchema> & Atomic

/**
 * Create a NarrativeSpan from data
 */
export function createNarrativeSpan(data: {
  trace_id?: string
  eventType: string
  message: string
  severity?: 'info' | 'success' | 'warning' | 'error'
  creatureId?: string
  spanId?: string
}): NarrativeSpan {
  return {
    entity_type: 'narrative',
    trace_id: data.trace_id,
    this: data.message,
    did: {
      actor: 'narrative_system',
      action: data.eventType
    },
    input: {
      eventType: data.eventType,
      creatureId: data.creatureId,
      spanId: data.spanId
    },
    output: {
      message: data.message,
      severity: data.severity || 'info'
    },
    when: {
      started_at: new Date().toISOString()
    },
    status: {
      state: 'completed',
      result: 'ok'
    },
    metadata: {
      eventType: data.eventType,
      creatureId: data.creatureId,
      spanId: data.spanId,
      created_at: new Date().toISOString()
    }
  } as NarrativeSpan
}

