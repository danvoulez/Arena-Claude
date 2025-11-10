/**
 * State Aggregation
 * 
 * Agrega spans do ledger em estado completo da criatura para UI
 */

import type { Ledger } from '@arenalab/atomic-core'
import type { ArenaSpan, BattleSpan, TrainingSpan, EvolutionSpan } from '@arenalab/arena-domain'
import type { Creature } from '@arenalab/arena-domain'
import { calculateXP, calculateLevel, xpProgress } from '@arenalab/arena-domain'
import { calculateTrustChange, applyTrustChange } from '@arenalab/arena-domain'
import { calculateELO } from '@arenalab/arena-domain'

export interface CreatureState {
  // Base creature info
  creature: Creature
  
  // Calculated stats
  stats: {
    totalBattles: number
    wins: number
    losses: number
    draws: number
    winRate: number
    totalTraining: number
    evolutions: number
    totalSpans: number
    diamondSpans: number
  }
  
  // XP & Level
  xp: {
    current: number
    level: number
    progress: {
      current: number
      required: number
      progress: number
    }
  }
  
  // ELO
  elo: {
    current: number
    history: Array<{
      timestamp: string
      elo: number
      change: number
    }>
  }
  
  // Trust
  trust: {
    current: number
    history: Array<{
      timestamp: string
      trust: number
      change: number
    }>
  }
  
  // Quality profile
  qualityProfile: {
    average: number
    recent: number[]
    distribution: Record<string, number>
  }
  
  // Timeline
  timeline: Array<{
    timestamp: string
    type: string
    span: ArenaSpan
  }>
  
  // Active buffs & traits
  activeBuffs: Creature['activeBuffs']
  permanentTraits: Creature['permanentTraits']
}

/**
 * Get creature state by aggregating spans from ledger
 */
export async function getCreatureState(
  creatureId: string,
  ledger: Ledger
): Promise<CreatureState | null> {
  try {
    // Buscar todos os spans relacionados à criatura
    const allSpans = await ledger.query({
      entity_type: undefined, // Buscar todos os tipos
      owner_id: creatureId
    })
    
    // Filtrar spans relacionados à criatura
    const creatureSpans = allSpans.filter((atomic) => {
      const span = atomic as ArenaSpan
      
      // Verificar se o span pertence à criatura
      if (span.who === creatureId || span.did?.actor === creatureId) {
        return true
      }
      
      // Verificar spans de batalha
      if (span.entity_type === 'battle') {
        const battleSpan = span as BattleSpan
        return (
          battleSpan.input?.creatureAId === creatureId ||
          battleSpan.input?.creatureBId === creatureId ||
          battleSpan.did?.actor === creatureId
        )
      }
      
      return false
    }) as ArenaSpan[]
    
    if (creatureSpans.length === 0) {
      return null
    }
    
    // Ordenar por timestamp
    creatureSpans.sort((a, b) => {
      const timeA = a.when?.started_at || a.when?.completed_at || a.metadata?.created_at || ''
      const timeB = b.when?.started_at || b.when?.completed_at || b.metadata?.created_at || ''
      return new Date(timeA).getTime() - new Date(timeB).getTime()
    })
    
    // Calcular estatísticas
    const battles = creatureSpans.filter(s => s.entity_type === 'battle') as BattleSpan[]
    const trainings = creatureSpans.filter(s => s.entity_type === 'training') as TrainingSpan[]
    const evolutions = creatureSpans.filter(s => s.entity_type === 'evolution') as EvolutionSpan[]
    
    // Calcular wins/losses/draws
    let wins = 0
    let losses = 0
    let draws = 0
    
    battles.forEach(battle => {
      const winner = battle.output?.winner || battle.metadata?.winner
      const isCreatureA = battle.input?.creatureAId === creatureId
      
      if (winner === 'tie') {
        draws++
      } else if ((winner === 'A' && isCreatureA) || (winner === 'B' && !isCreatureA)) {
        wins++
      } else {
        losses++
      }
    })
    
    // Calcular XP
    let totalXP = 0
    battles.forEach(battle => {
      const winner = battle.output?.winner || battle.metadata?.winner
      const isCreatureA = battle.input?.creatureAId === creatureId
      
      if (winner === 'tie') {
        totalXP += 50 // draw
      } else if ((winner === 'A' && isCreatureA) || (winner === 'B' && !isCreatureA)) {
        totalXP += 100 // win
      } else {
        totalXP += 30 // loss
      }
    })
    
    trainings.forEach(training => {
      if (training.status?.state === 'completed') {
        totalXP += 50
      }
    })
    
    evolutions.forEach(() => {
      totalXP += 1000
    })
    
    const level = calculateLevel(totalXP)
    const xpProgressData = xpProgress(totalXP, level)
    
    // Calcular ELO
    let currentELO = 1000 // Default
    const eloHistory: CreatureState['elo']['history'] = []
    
    battles.forEach(battle => {
      const eloChangeA = battle.output?.elo_change_a || battle.metadata?.elo_change_a || 0
      const eloChangeB = battle.output?.elo_change_b || battle.metadata?.elo_change_b || 0
      const isCreatureA = battle.input?.creatureAId === creatureId
      const eloChange = isCreatureA ? eloChangeA : eloChangeB
      
      currentELO += eloChange
      
      eloHistory.push({
        timestamp: battle.when?.started_at || battle.metadata?.created_at || '',
        elo: currentELO,
        change: eloChange
      })
    })
    
    // Calcular Trust
    let currentTrust = 100 // Default
    const trustHistory: CreatureState['trust']['history'] = []
    
    creatureSpans.forEach(span => {
      const change = calculateTrustChange(span)
      if (change !== 0) {
        currentTrust = applyTrustChange(currentTrust, change)
        trustHistory.push({
          timestamp: span.when?.started_at || span.metadata?.created_at || '',
          trust: currentTrust,
          change
        })
      }
    })
    
    // Calcular Quality Profile
    const qualityScores: number[] = []
    battles.forEach(battle => {
      const qualityA = battle.output?.qualityA || battle.metadata?.qualityA
      const qualityB = battle.output?.qualityB || battle.metadata?.qualityB
      const isCreatureA = battle.input?.creatureAId === creatureId
      
      if (isCreatureA && qualityA) {
        qualityScores.push(qualityA)
      } else if (!isCreatureA && qualityB) {
        qualityScores.push(qualityB)
      }
    })
    
    const averageQuality = qualityScores.length > 0
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
      : 0
    
    const recentQuality = qualityScores.slice(-10) // Últimos 10
    
    // Contar diamond spans (quality >= 80)
    const diamondSpans = qualityScores.filter(q => q >= 80).length
    
    // Construir timeline
    const timeline = creatureSpans.map(span => ({
      timestamp: span.when?.started_at || span.metadata?.created_at || '',
      type: span.entity_type,
      span
    }))
    
    // Extrair buffs e traits (TODO: implementar quando spans tiverem essa info)
    const activeBuffs: Creature['activeBuffs'] = []
    const permanentTraits: Creature['permanentTraits'] = []
    
    // Criar creature base (TODO: buscar do ledger ou criar se não existir)
    const creature: Creature = {
      id: creatureId,
      name: `Creature ${creatureId}`, // TODO: buscar nome real
      level,
      xp: totalXP,
      elo: currentELO,
      trust: currentTrust,
      hp: 100,
      evolutionStage: evolutions.length,
      abilities: [],
      diamondSpans,
      status: 'active',
      createdAt: timeline[0]?.timestamp || new Date().toISOString(),
      dataset: [],
      activeBuffs,
      permanentTraits
    }
    
    return {
      creature,
      stats: {
        totalBattles: battles.length,
        wins,
        losses,
        draws,
        winRate: battles.length > 0 ? wins / battles.length : 0,
        totalTraining: trainings.length,
        evolutions: evolutions.length,
        totalSpans: creatureSpans.length,
        diamondSpans
      },
      xp: {
        current: totalXP,
        level,
        progress: xpProgressData
      },
      elo: {
        current: currentELO,
        history: eloHistory
      },
      trust: {
        current: currentTrust,
        history: trustHistory
      },
      qualityProfile: {
        average: averageQuality,
        recent: recentQuality,
        distribution: {} // TODO: implementar distribuição
      },
      timeline,
      activeBuffs,
      permanentTraits
    }
  } catch (error) {
    console.error('Error getting creature state:', error)
    return null
  }
}

