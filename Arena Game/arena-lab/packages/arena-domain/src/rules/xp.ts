/**
 * XP Calculation Rules
 * 
 * Baseado em: docs/07-REFERENCIA/FORMULAS.md
 */

import type { ArenaSpan } from '../spans/index'

/**
 * XP ganho por evento
 */
export const XP_GAINS = {
  battle_win: 100,
  battle_loss: 30,
  battle_draw: 50,
  training: 50,
  evolution: 1000,
  ascension: 5000
} as const

/**
 * Calculate XP gained from a span
 */
export function calculateXP(span: ArenaSpan): number {
  if (span.entity_type === 'battle') {
    const winner = span.metadata?.winner || span.output?.winner
    if (winner === 'A' || winner === 'B') {
      // Assumir que span.who é a criatura que ganhou/perdeu
      // Em produção, precisaríamos verificar qual criatura é
      return XP_GAINS.battle_win // ou battle_loss baseado no resultado
    }
    return XP_GAINS.battle_draw
  }
  
  if (span.entity_type === 'training' && span.status?.state === 'completed') {
    return XP_GAINS.training
  }
  
  if (span.entity_type === 'evolution') {
    return XP_GAINS.evolution
  }
  
  if (span.entity_type === 'ascension') {
    return XP_GAINS.ascension
  }
  
  return 0
}

/**
 * Calculate level from XP
 * 
 * Formula: level = floor(sqrt(xp / 100)) + 1
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

/**
 * Calculate XP required for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100
}

/**
 * Calculate XP progress to next level
 */
export function xpProgress(currentXP: number, currentLevel: number): {
  current: number
  required: number
  progress: number  // 0-1
} {
  const required = xpForNextLevel(currentLevel)
  const current = currentXP - xpForNextLevel(currentLevel - 1)
  const progress = Math.min(1, current / (required - xpForNextLevel(currentLevel - 1)))
  
  return {
    current,
    required,
    progress
  }
}

