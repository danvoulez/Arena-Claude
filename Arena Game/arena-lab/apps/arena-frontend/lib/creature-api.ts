import type { ModelCreature } from "./creature-types"
import { getBuffedStats } from "./training-engine"

/**
 * Production API for exposing creatures as callable agents
 * Works with OpenAI, Anthropic, Mistral, Ollama, etc.
 */

export interface CreatureAPIConfig {
  provider: "openai" | "anthropic" | "mistral" | "groq" | "ollama" | "custom"
  apiKey?: string
  baseURL?: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface CreatureChatRequest {
  prompt: string
  systemPrompt?: string
  context?: string[]
  tools?: any[]
  stream?: boolean
}

export interface CreatureChatResponse {
  response: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  latency: number
  traceId: string
  metadata: {
    creature: string
    level: number
    health: number
    stamina: number
    buffedStats: Record<string, number>
  }
}

export class CreatureAPI {
  private creature: ModelCreature
  private config: CreatureAPIConfig

  constructor(creature: ModelCreature, config: CreatureAPIConfig) {
    this.creature = creature
    this.config = config
  }

  // Main chat interface
  async chat(request: CreatureChatRequest): Promise<CreatureChatResponse> {
    const startTime = Date.now()
    const traceId = `trace-${Date.now()}-${Math.random()}`

    // Get buffed stats
    const buffed = getBuffedStats(this.creature)

    // Build enhanced system prompt with creature personality
    const systemPrompt =
      request.systemPrompt ||
      `You are ${this.creature.name}, a Level ${this.creature.level} AI assistant.
Personality Traits: ${this.creature.traits.join(", ")}
Current Status: ${this.creature.statusEffects.map((s) => s.toUpperCase()).join(", ") || "Normal"}
Stats: Charisma ${buffed.charisma}, Accuracy ${buffed.accuracy}, Creativity ${buffed.creativity}, Reasoning ${buffed.reasoning}

Respond according to your personality and current status.`

    // Call LLM provider (mock for now, integrate real APIs)
    const response = await this.callProvider({
      system: systemPrompt,
      prompt: request.prompt,
      context: request.context,
      tools: request.tools,
      stream: request.stream,
    })

    const latency = Date.now() - startTime

    return {
      response: response.text,
      usage: response.usage,
      latency,
      traceId,
      metadata: {
        creature: this.creature.name,
        level: this.creature.level,
        health: this.creature.health,
        stamina: this.creature.stamina,
        buffedStats: {
          charisma: buffed.charisma,
          accuracy: buffed.accuracy,
          creativity: buffed.creativity,
          reasoning: buffed.reasoning,
        },
      },
    }
  }

  // Call underlying LLM provider
  private async callProvider(params: {
    system: string
    prompt: string
    context?: string[]
    tools?: any[]
    stream?: boolean
  }): Promise<{ text: string; usage: any }> {
    // Mock implementation - integrate real providers
    const mockResponse = `[${this.creature.name}]: This is a response based on my Level ${this.creature.level} capabilities. ${
      this.creature.traits.length > 0 ? `As someone who is ${this.creature.traits[0]}, ` : ""
    }I processed your prompt: "${params.prompt}"`

    return {
      text: mockResponse,
      usage: {
        promptTokens: Math.floor(Math.random() * 100 + 50),
        completionTokens: Math.floor(Math.random() * 200 + 100),
        totalTokens: Math.floor(Math.random() * 300 + 150),
      },
    }
  }

  // Export creature as OpenAI-compatible function
  toOpenAIFunction() {
    return {
      name: this.creature.id.replace(/-/g, "_"),
      description: `${this.creature.name} - Level ${this.creature.level} AI assistant with traits: ${this.creature.traits.join(", ")}`,
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "The user's request or question" },
          context: {
            type: "array",
            items: { type: "string" },
            description: "Optional conversation context",
          },
        },
        required: ["prompt"],
      },
    }
  }

  // Export as REST API spec
  toRESTSpec() {
    return {
      endpoint: `/api/creatures/${this.creature.id}/chat`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer <API_KEY>",
      },
      body: {
        prompt: "string (required)",
        systemPrompt: "string (optional)",
        context: "string[] (optional)",
        stream: "boolean (optional, default: false)",
      },
      response: {
        response: "string",
        usage: { promptTokens: "number", completionTokens: "number", totalTokens: "number" },
        latency: "number",
        traceId: "string",
        metadata: "object",
      },
    }
  }

  // Export as CLI command
  toCLI() {
    return `arenalab chat ${this.creature.id} --prompt "Your question here" --stream`
  }

  // Health check
  async healthCheck(): Promise<{
    healthy: boolean
    creature: string
    level: number
    health: number
    stamina: number
    canBattle: boolean
  }> {
    return {
      healthy: this.creature.health > 0 && this.creature.stamina > 20,
      creature: this.creature.name,
      level: this.creature.level,
      health: this.creature.health,
      stamina: this.creature.stamina,
      canBattle: this.creature.health > this.creature.maxHealth * 0.3,
    }
  }
}

// Factory to create API from creature
export function createCreatureAPI(creature: ModelCreature, config: CreatureAPIConfig): CreatureAPI {
  return new CreatureAPI(creature, config)
}
