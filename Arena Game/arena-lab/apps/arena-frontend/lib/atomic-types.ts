/**
 * Atomic Types - Re-export from monorepo packages
 * 
 * Mantido para compatibilidade com código existente
 * Em produção, usar diretamente de @arenalab/atomic-core e @arenalab/arena-domain
 */

import type { Atomic } from '@arenalab/atomic-core'
import type { ArenaSpan } from '@arenalab/arena-domain'

// Re-export Atomic como AtomicSpan para compatibilidade
export type AtomicSpan = Atomic

// Re-export ArenaSpan
export type { ArenaSpan }

export interface ExecutionResult {
  success: boolean
  output: Record<string, any>
  duration: number
  logs: string[]
  error?: string
}

export interface ReplayResult {
  match: boolean
  expected: Record<string, any>
  actual: Record<string, any>
  duration: number
  observations: string[]
}

export interface SpanLedger {
  spans: AtomicSpan[]
  creatureId: string
  publicKey: string
  version: string
}
