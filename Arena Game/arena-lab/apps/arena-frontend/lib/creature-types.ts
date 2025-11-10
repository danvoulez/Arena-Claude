export type StatusEffect =
  | "energized"
  | "burnout"
  | "focused"
  | "confused"
  | "inspired"
  | "tired"
  | "overfit"
  | "creative"
  | "precise"
  | "hallucinating"

export type TrainingType = "empathy-lora" | "strategic-tuning" | "speed-boost" | "accuracy-patch" | "creative-unlock"

export interface TrainingProgram {
  id: TrainingType
  name: string
  description: string
  duration: number // minutes
  requiresGPU: boolean
  cost: { cpu: number; gpu: number }
  buffs: {
    stat: keyof Pick<ModelCreature, "charisma" | "accuracy" | "creativity" | "reasoning">
    amount: number
  }[]
  traits: string[]
  statusEffects: StatusEffect[]
  cooldown: number // minutes
}

export interface TrainingSession {
  id: string
  creatureId: string
  programId: TrainingType
  startedAt: string
  completesAt: string
  status: "queued" | "training" | "completed" | "failed"
}

export interface TrainingBuff {
  programId: TrainingType
  appliedAt: string
  expiresAt: string
  buffs: TrainingProgram["buffs"]
  traits: string[]
}

export interface ModelCreature {
  id: string
  name: string
  provider: "openai" | "anthropic" | "google" | "ollama" | string
  version: string

  // Core stats
  xp: number
  level: number
  health: number
  maxHealth: number
  stamina: number
  maxStamina: number

  // Battle stats
  charisma: number
  accuracy: number
  creativity: number
  reasoning: number

  // Record
  winCount: number
  lossCount: number
  drawCount: number

  // Status
  statusEffects: StatusEffect[]

  traits: string[] // Permanent traits gained from training
  activeBuffs: TrainingBuff[] // Temporary buffs from training
  trainingCooldownUntil?: string // When creature can train again
  isTraining?: boolean // Currently in training

  publicKey?: string // Ed25519 public key (base64)

  // Lifecycle
  createdAt: string
  lastUsed: string
  lastRested: string
  totalBattles: number

  // Visual
  color?: string
  avatar?: string
}

export interface DuelRecord {
  id: string
  traceId: string
  modelAId: string
  modelBId: string
  prompt: string
  responseA: string
  responseB: string
  winner: "A" | "B" | "draw" | null

  // Damage/XP dealt
  xpGained: { A: number; B: number }
  damageDealt: { A: number; B: number }
  staminaCost: { A: number; B: number }

  // Status changes
  statusApplied: { A: StatusEffect[]; B: StatusEffect[] }

  // Metrics
  latencyA: number
  latencyB: number
  tokensA: number
  tokensB: number

  timestamp: string
}

export interface LifeEvent {
  id: string
  creatureId: string
  type:
    | "levelup"
    | "battle"
    | "rest"
    | "status_gained"
    | "status_lost"
    | "evolved"
    | "injured"
    | "training_started" // Added training events
    | "training_completed"
    | "buff_applied"
    | "buff_expired"
  description: string
  timestamp: string
  metadata?: Record<string, any>
}
