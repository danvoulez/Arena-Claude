/**
 * Ascension Rules
 * 
 * Baseado em: docs/02-SISTEMAS/ASCENSION_SYSTEM.md
 */

import type { Creature } from '../entities/index'

/**
 * Ascension requirements
 */
export interface AscensionRequirements {
  level: number
  evolutionStage: number
  trust: number
  diamondSpans: number
  status: string
}

/**
 * Check if creature can ascend
 * 
 * Requirements:
 * - Level >= 30
 * - Evolution Stage >= 2
 * - Trust >= 90
 * - Diamond Spans >= 100
 * - Status === 'active'
 */
export function canAscend(creature: Creature): {
  canAscend: boolean
  reason?: string
  requirements: AscensionRequirements
} {
  const requirements: AscensionRequirements = {
    level: creature.level,
    evolutionStage: creature.evolutionStage || 0,
    trust: creature.trust,
    diamondSpans: creature.diamondSpans || 0,
    status: creature.status || 'active'
  }
  
  if (creature.level < 30) {
    return {
      canAscend: false,
      reason: `Creature must be level 30 or higher (current: ${creature.level})`,
      requirements
    }
  }
  
  if ((creature.evolutionStage || 0) < 2) {
    return {
      canAscend: false,
      reason: `Creature must have evolution stage 2 or higher (current: ${creature.evolutionStage || 0})`,
      requirements
    }
  }
  
  if (creature.trust < 90) {
    return {
      canAscend: false,
      reason: `Creature trust must be 90 or higher (current: ${creature.trust})`,
      requirements
    }
  }
  
  if ((creature.diamondSpans || 0) < 100) {
    return {
      canAscend: false,
      reason: `Creature must have at least 100 diamond spans (current: ${creature.diamondSpans || 0})`,
      requirements
    }
  }
  
  if (creature.status !== 'active') {
    return {
      canAscend: false,
      reason: `Creature must be active (current: ${creature.status})`,
      requirements
    }
  }
  
  return {
    canAscend: true,
    requirements
  }
}

