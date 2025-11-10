/**
 * API Types
 * 
 * Tipos para responses da API
 */

import type { Creature } from '@arenalab/arena-domain'
import type { ArenaSpan } from '@arenalab/arena-domain'

export interface BattleRequest {
  creatureAId: string
  creatureBId: string
  prompt: string
  allowUserVote?: boolean
}

export interface BattleResponse {
  battleResult: {
    winner: 'A' | 'B' | 'tie'
    qualityA: number
    qualityB: number
  }
  updatedCreatureA: Creature
  updatedCreatureB: Creature
  narrativeEvents: any[]
}

export interface TrainingRequest {
  programId: string
}

export interface TrainingResponse {
  session: {
    id: string
    creatureId: string
    programId: string
    startedAt: string
    durationHours: number
    status: string
  }
  narrativeEvents: any[]
}

export interface TrainingCompleteResponse {
  creature: Creature
  narrativeEvents: any[]
}

export interface EvolutionRequest {
  evolutionType?: string
}

export interface EvolutionResponse {
  creature: Creature
  evolution: {
    stage: number
    newAbilities: string[]
  }
  narrativeEvents: any[]
}

export interface DNAResponse {
  creatureId: string
  timeline: Array<{
    timestamp: string
    type: string
    span: ArenaSpan
  }>
  stats: {
    totalBattles: number
    totalWins: number
    totalLosses: number
    totalTraining: number
    evolutions: number
  }
  milestones: any[]
  qualityProfile: Record<string, number>
}

export interface LeaderboardResponse {
  leaderboard: Array<{
    creature: Creature
    rank: number
  }>
  total: number
  limit: number
  offset: number
  sortBy: string
}

export interface LegendResponse {
  creatureId: string
  chapters: any[]
  merkleRoot: string
  totalSpans: number
  createdAt: string
  lastUpdated: string
}

export interface AscensionResponse {
  creature: Creature
  agent: {
    id: string
    endpoint: string
    apiKey: string
  }
  certification: any
  codeSnippets: {
    nodejs: string
    python: string
    curl: string
  }
  narrativeEvents: any[]
}

export interface AgentInvokeRequest {
  prompt: string
  maxTokens?: number
  temperature?: number
}

export interface AgentInvokeResponse {
  response: string
  tokensUsed: number
  cost: number
  royalties: number
}

export interface CreatureStateResponse {
  creature: Creature
  stats: any
  xp: any
  elo: any
  trust: any
  qualityProfile: any
  timeline: any[]
  activeBuffs: any[]
  permanentTraits: string[]
}

