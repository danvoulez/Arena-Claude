/**
 * Battle Span Type
 * 
 * Representa uma batalha entre duas criaturas
 */

import { z } from 'zod'
import type { Atomic } from '../../atomic-core/src/types'

export const BattleSpanSchema = z.object({
  entity_type: z.literal('battle'),
  trace_id: z.string().optional(),
  this: z.string(), // Prompt da batalha
  did: z.object({
    actor: z.string(), // ID da criatura A
    action: z.string(), // "battle_vs_{creatureBId}"
    reason: z.string().optional()
  }),
  input: z.object({
    creatureAId: z.string(),
    creatureBId: z.string(),
    prompt: z.string(),
    allowUserVote: z.boolean().optional()
  }).optional(),
  output: z.object({
    responseA: z.string().optional(),
    responseB: z.string().optional(),
    winner: z.enum(['A', 'B', 'tie']).optional(),
    qualityA: z.number().optional(),
    qualityB: z.number().optional(),
    elo_change_a: z.number().optional(),
    elo_change_b: z.number().optional(),
    duration_ms: z.number().optional()
  }).optional(),
  status: z.object({
    state: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
    result: z.enum(['ok', 'doubt', 'not', 'error']).optional(),
    message: z.string().optional()
  }).optional(),
  metadata: z.object({
    opponent: z.string().optional(), // ID da criatura oponente
    winner: z.enum(['A', 'B', 'tie']).optional(),
    qualityA: z.number().optional(),
    qualityB: z.number().optional(),
    elo_change_a: z.number().optional(),
    elo_change_b: z.number().optional(),
    created_at: z.string()
  }).optional()
})

export type BattleSpan = z.infer<typeof BattleSpanSchema> & Atomic

/**
 * Create a BattleSpan from data
 */
export function createBattleSpan(data: {
  trace_id?: string
  creatureAId: string
  creatureBId: string
  prompt: string
  allowUserVote?: boolean
}): BattleSpan {
  return {
    entity_type: 'battle',
    trace_id: data.trace_id,
    this: data.prompt,
    did: {
      actor: data.creatureAId,
      action: `battle_vs_${data.creatureBId}`
    },
    input: {
      creatureAId: data.creatureAId,
      creatureBId: data.creatureBId,
      prompt: data.prompt,
      allowUserVote: data.allowUserVote
    },
    when: {
      started_at: new Date().toISOString()
    },
    status: {
      state: 'pending'
    },
    metadata: {
      created_at: new Date().toISOString()
    }
  } as BattleSpan
}

