/**
 * Trust Calculation Rules
 * 
 * Baseado em: docs/02-SISTEMAS/TRUST_SYSTEM.md
 */

import type { ArenaSpan } from '../spans/index'

/**
 * Trust changes por evento
 */
export const TRUST_CHANGES = {
  victory: 5,
  defeat: -3,
  training: 2,
  evolution: 10,
  burnout: -5,
  rest: 1  // por hora
} as const

/**
 * Calculate trust change from a span
 */
export function calculateTrustChange(span: ArenaSpan): number {
  if (span.entity_type === 'battle') {
    const winner = span.metadata?.winner || span.output?.winner
    // Em produção, precisaríamos verificar qual criatura ganhou/perdeu
    // Por enquanto, assumir que se winner existe, a criatura ganhou
    if (winner) {
      return TRUST_CHANGES.victory
    }
    return TRUST_CHANGES.defeat
  }
  
  if (span.entity_type === 'training' && span.status?.state === 'completed') {
    return TRUST_CHANGES.training
  }
  
  if (span.entity_type === 'evolution') {
    return TRUST_CHANGES.evolution
  }
  
  return 0
}

/**
 * Apply trust change with clamping
 */
export function applyTrustChange(currentTrust: number, change: number): number {
  return Math.max(0, Math.min(100, currentTrust + change))
}

/**
 * Trust requirements
 */
export const TRUST_REQUIREMENTS = {
  evolution: 85,
  ascension: 90
} as const

