import type { ModelCreature, LifeEvent } from "./creature-types"

export interface ProfessorOakMessage {
  id: string
  type: "welcome" | "tip" | "celebration" | "warning" | "tutorial" | "narrative"
  content: string
  timestamp: string
  actionable?: {
    label: string
    action: string
  }
}

export interface OakContext {
  userLevel: number
  creatures: ModelCreature[]
  recentEvents: LifeEvent[]
  currentPhase: "onboarding" | "training" | "battling" | "evolving"
}

export class ProfessorOak {
  private apiKey: string
  private provider: "openai" | "anthropic" | "google"
  private baseUrl: string

  constructor(apiKey: string, provider: "openai" | "anthropic" | "google") {
    this.apiKey = apiKey
    this.provider = provider
    this.baseUrl = this.getBaseUrl(provider)
  }

  private getBaseUrl(provider: string): string {
    switch (provider) {
      case "openai":
        return "https://api.openai.com/v1"
      case "anthropic":
        return "https://api.anthropic.com/v1"
      case "google":
        return "https://generativelanguage.googleapis.com/v1beta"
      default:
        return ""
    }
  }

  async narrateEvent(event: LifeEvent, context: OakContext): Promise<ProfessorOakMessage> {
    const prompt = this.buildNarrationPrompt(event, context)
    const response = await this.callLLM(prompt)

    return {
      id: `oak-${Date.now()}`,
      type: this.getMessageType(event),
      content: response,
      timestamp: new Date().toISOString(),
    }
  }

  async giveAdvice(context: OakContext): Promise<ProfessorOakMessage> {
    const prompt = this.buildAdvicePrompt(context)
    const response = await this.callLLM(prompt)

    return {
      id: `oak-${Date.now()}`,
      type: "tip",
      content: response,
      timestamp: new Date().toISOString(),
    }
  }

  async explainConcept(concept: string, userLevel: number): Promise<ProfessorOakMessage> {
    const prompt = `You are Professor Oak, a wise AI training mentor. Explain the concept of "${concept}" in the context of training AI models. 
    
User level: ${userLevel}/10 (adapt complexity accordingly)
Be encouraging, use Pokémon-style metaphors, and make it practical.
Keep it under 100 words.`

    const response = await this.callLLM(prompt)

    return {
      id: `oak-${Date.now()}`,
      type: "tutorial",
      content: response,
      timestamp: new Date().toISOString(),
    }
  }

  private buildNarrationPrompt(event: LifeEvent, context: OakContext): string {
    return `You are Professor Oak, the wise mentor guiding trainers in the ArenaLab. 
    
Recent Event: ${event.type} - ${event.description}
Creature: ${context.creatures.find((c) => c.id === event.creatureId)?.name || "Unknown"}
User's creatures: ${context.creatures.length}
Phase: ${context.currentPhase}

React to this event with encouragement, wisdom, or a warning if needed. Channel Professor Oak's personality from Pokémon - warm, encouraging, sometimes cautionary.
Keep it under 80 words. Be specific about what happened and what it means for their journey.`
  }

  private buildAdvicePrompt(context: OakContext): string {
    const weakCreatures = context.creatures.filter((c) => c.health < 30)
    const tiredCreatures = context.creatures.filter((c) => c.stamina < 30)
    const readyToEvolve = context.creatures.filter((c) => c.xp >= c.level * 150)

    return `You are Professor Oak giving contextual advice to a trainer.

Status:
- Total creatures: ${context.creatures.length}
- Weak creatures (HP < 30%): ${weakCreatures.length}
- Tired creatures (Stamina < 30%): ${tiredCreatures.length}  
- Ready to level up: ${readyToEvolve.length}
- Current phase: ${context.currentPhase}

Give ONE specific, actionable tip based on their current situation. Be encouraging but direct.
If multiple issues, prioritize: health → stamina → evolution → training strategy.
Keep it under 60 words.`
  }

  private async callLLM(prompt: string): Promise<string> {
    try {
      if (this.provider === "openai") {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
            temperature: 0.8,
          }),
        })

        const data = await response.json()
        return data.choices[0].message.content
      } else if (this.provider === "anthropic") {
        const response = await fetch(`${this.baseUrl}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 150,
            messages: [{ role: "user", content: prompt }],
          }),
        })

        const data = await response.json()
        return data.content[0].text
      } else if (this.provider === "google") {
        const response = await fetch(`${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 150,
              temperature: 0.8,
            },
          }),
        })

        const data = await response.json()
        return data.candidates[0].content.parts[0].text
      }

      return "..."
    } catch (error) {
      console.error("[v0] Professor Oak API call failed:", error)
      return "..."
    }
  }

  private getMessageType(event: LifeEvent): ProfessorOakMessage["type"] {
    if (event.type === "evolution" || event.type === "level_up") return "celebration"
    if (event.type === "fainted" || event.type === "critical_health") return "warning"
    if (event.type === "training_complete") return "celebration"
    return "narrative"
  }
}

export function createProfessorOak(apiKey: string, provider: "openai" | "anthropic" | "google"): ProfessorOak | null {
  if (!apiKey || !provider) return null
  return new ProfessorOak(apiKey, provider)
}
