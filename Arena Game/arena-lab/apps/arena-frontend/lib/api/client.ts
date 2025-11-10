/**
 * API Client
 * 
 * Cliente para Cloudflare Workers API
 */

import type {
  BattleRequest,
  BattleResponse,
  TrainingRequest,
  TrainingResponse,
  TrainingCompleteResponse,
  EvolutionRequest,
  EvolutionResponse,
  DNAResponse,
  LeaderboardResponse,
  LegendResponse,
  AscensionResponse,
  AgentInvokeRequest,
  AgentInvokeResponse,
  CreatureStateResponse
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

/**
 * Get authorization header
 */
function getAuthHeader(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  
  const token = localStorage.getItem('google_token')
  return token ? `Bearer ${token}` : ''
}

/**
 * Make API request
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': getAuthHeader(),
    ...options.headers
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}

/**
 * Battle API
 */
export const battleAPI = {
  /**
   * Start a battle
   */
  battle: async (data: BattleRequest): Promise<BattleResponse> => {
    return request<BattleResponse>('/api/arena/battle', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

/**
 * Training API
 */
export const trainingAPI = {
  /**
   * Start training
   */
  start: async (creatureId: string, data: TrainingRequest): Promise<TrainingResponse> => {
    return request<TrainingResponse>(`/api/arena/creatures/${creatureId}/train`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  
  /**
   * Complete training
   */
  complete: async (sessionId: string): Promise<TrainingCompleteResponse> => {
    return request<TrainingCompleteResponse>(`/api/arena/sessions/${sessionId}/complete`, {
      method: 'POST'
    })
  }
}

/**
 * Evolution API
 */
export const evolutionAPI = {
  /**
   * Evolve creature
   */
  evolve: async (creatureId: string, data?: EvolutionRequest): Promise<EvolutionResponse> => {
    return request<EvolutionResponse>(`/api/arena/creatures/${creatureId}/evolve`, {
      method: 'POST',
      body: JSON.stringify(data || {})
    })
  }
}

/**
 * Creatures API
 */
export const creaturesAPI = {
  /**
   * Get creature DNA (timeline)
   */
  getDNA: async (creatureId: string): Promise<DNAResponse> => {
    return request<DNAResponse>(`/api/arena/creatures/${creatureId}/dna`)
  },
  
  /**
   * Get leaderboard
   */
  getLeaderboard: async (options?: {
    sortBy?: string
    limit?: number
    offset?: number
  }): Promise<LeaderboardResponse> => {
    const params = new URLSearchParams()
    if (options?.sortBy) params.append('sortBy', options.sortBy)
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())
    
    const query = params.toString()
    return request<LeaderboardResponse>(`/api/arena/leaderboard${query ? `?${query}` : ''}`)
  },
  
  /**
   * Get creature legend
   */
  getLegend: async (creatureId: string): Promise<LegendResponse> => {
    return request<LegendResponse>(`/api/arena/creatures/${creatureId}/legend`)
  },
  
  /**
   * Get creature state
   */
  getState: async (creatureId: string): Promise<CreatureStateResponse> => {
    return request<CreatureStateResponse>(`/api/arena/creatures/${creatureId}/state`)
  }
}

/**
 * Ascension API
 */
export const ascensionAPI = {
  /**
   * Ascend creature
   */
  ascend: async (creatureId: string): Promise<AscensionResponse> => {
    return request<AscensionResponse>(`/api/arena/creatures/${creatureId}/ascend`, {
      method: 'POST'
    })
  },
  
  /**
   * Invoke agent
   */
  invoke: async (agentId: string, data: AgentInvokeRequest): Promise<AgentInvokeResponse> => {
    return request<AgentInvokeResponse>(`/api/arena/agents/${agentId}/invoke`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

/**
 * Unified API client
 */
export const api = {
  battle: battleAPI,
  training: trainingAPI,
  evolution: evolutionAPI,
  creatures: creaturesAPI,
  ascension: ascensionAPI
}

