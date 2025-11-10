/**
 * Agent Entity
 * 
 * Representa um agente em produção (após ascensão)
 */

import { z } from 'zod'

export const AgentSchema = z.object({
  id: z.string(),
  creatureId: z.string(),
  name: z.string(),
  
  // API
  apiKey: z.string(),
  endpoint: z.string(),
  
  // Stats
  totalInvocations: z.number().default(0),
  totalTokens: z.number().default(0),
  totalCost: z.number().default(0),
  totalEarnings: z.number().default(0), // Royalties para o treinador
  
  // Rate limiting
  rateLimit: z.object({
    requestsPerMinute: z.number().default(60),
    requestsPerDay: z.number().default(10000)
  }).optional(),
  
  // Status
  status: z.enum(['active', 'paused', 'suspended']).default('active'),
  
  // Metadata
  ascendedAt: z.string(),
  certification: z.record(z.unknown()).optional(),
  
  // Code snippets (para integração)
  codeSnippets: z.object({
    nodejs: z.string().optional(),
    python: z.string().optional(),
    curl: z.string().optional()
  }).optional()
})

export type Agent = z.infer<typeof AgentSchema>

/**
 * Create a new agent from an ascended creature
 */
export function createAgent(data: {
  id: string
  creatureId: string
  name: string
  apiKey: string
  endpoint: string
}): Agent {
  return {
    id: data.id,
    creatureId: data.creatureId,
    name: data.name,
    apiKey: data.apiKey,
    endpoint: data.endpoint,
    totalInvocations: 0,
    totalTokens: 0,
    totalCost: 0,
    totalEarnings: 0,
    status: 'active',
    ascendedAt: new Date().toISOString()
  }
}

