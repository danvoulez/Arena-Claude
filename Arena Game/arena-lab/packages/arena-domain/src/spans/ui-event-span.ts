/**
 * UI Event Span Type
 * 
 * Representa eventos de UI (cliques, navegação, etc.)
 */

import { z } from 'zod'
import type { Atomic } from '../../atomic-core/src/types'

export const UIEventSpanSchema = z.object({
  entity_type: z.literal('ui_event'),
  trace_id: z.string().optional(),
  this: z.string(), // Descrição do evento
  did: z.object({
    actor: z.string(), // "user" ou user_id
    action: z.string(), // "click", "navigate", "submit", etc.
    reason: z.string().optional()
  }),
  input: z.object({
    eventType: z.string(), // "button_click", "page_navigation", etc.
    target: z.string().optional(), // ID do elemento ou rota
    data: z.record(z.unknown()).optional() // Dados adicionais
  }).optional(),
  output: z.object({
    result: z.string().optional()
  }).optional(),
  status: z.object({
    state: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
    result: z.enum(['ok', 'doubt', 'not', 'error']).optional(),
    message: z.string().optional()
  }).optional(),
  metadata: z.object({
    eventType: z.string().optional(),
    target: z.string().optional(),
    created_at: z.string()
  }).optional()
})

export type UIEventSpan = z.infer<typeof UIEventSpanSchema> & Atomic

/**
 * Create a UIEventSpan from data
 */
export function createUIEventSpan(data: {
  trace_id?: string
  userId: string
  eventType: string
  target?: string
  data?: Record<string, unknown>
}): UIEventSpan {
  return {
    entity_type: 'ui_event',
    trace_id: data.trace_id,
    this: `${data.eventType}${data.target ? ` on ${data.target}` : ''}`,
    did: {
      actor: data.userId,
      action: data.eventType
    },
    input: {
      eventType: data.eventType,
      target: data.target,
      data: data.data
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
      target: data.target,
      created_at: new Date().toISOString()
    }
  } as UIEventSpan
}

