/**
 * Evolution Rules
 * 
 * Baseado em: docs/02-SISTEMAS/EVOLUTION_SYSTEM.md
 */

import type { Creature } from '../entities/index'

/**
 * Evolution requirements
 */
export interface EvolutionRequirements {
  level: number
  trust: number
  diamondSpans: number
  evolutionStage: number
}

/**
 * Check if creature can evolve
 * 
 * Requirements:
 * - Level >= 15 (primeira evolução), >= 25 (segunda)
 * - Trust >= 85
 * - Diamond Spans >= 50 (primeira), >= 100 (segunda)
 * - Evolution Stage < 2 (máximo 2 evoluções)
 */
export function canEvolve(creature: Creature): {
  canEvolve: boolean
  reason?: string
  requirements: EvolutionRequirements
} {
  const currentStage = creature.evolutionStage || 0
  const requiredLevel = currentStage === 0 ? 15 : 25
  const requiredDiamondSpans = currentStage === 0 ? 50 : 100
  
  const requirements: EvolutionRequirements = {
    level: creature.level,
    trust: creature.trust,
    diamondSpans: creature.diamondSpans || 0,
    evolutionStage: currentStage
  }
  
  if (creature.level < requiredLevel) {
    return {
      canEvolve: false,
      reason: `Creature must be level ${requiredLevel} or higher (current: ${creature.level})`,
      requirements
    }
  }
  
  if (creature.trust < 85) {
    return {
      canEvolve: false,
      reason: `Creature trust must be 85 or higher (current: ${creature.trust})`,
      requirements
    }
  }
  
  if ((creature.diamondSpans || 0) < requiredDiamondSpans) {
    return {
      canEvolve: false,
      reason: `Creature must have at least ${requiredDiamondSpans} diamond spans (current: ${creature.diamondSpans || 0})`,
      requirements
    }
  }
  
  if (currentStage >= 2) {
    return {
      canEvolve: false,
      reason: 'Creature has reached maximum evolution stage (2)',
      requirements
    }
  }
  
  return {
    canEvolve: true,
    requirements
  }
}

/**
 * Get next evolution stage
 */
export function getNextEvolutionStage(currentStage: number): number {
  return Math.min(2, currentStage + 1)
}

