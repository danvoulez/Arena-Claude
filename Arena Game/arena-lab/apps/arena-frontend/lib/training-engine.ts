import type {
  ModelCreature,
  TrainingProgram,
  TrainingSession,
  TrainingBuff,
  LifeEvent,
  TrainingType,
} from "./creature-types"
import { atomicAPI } from "./atomic-api"

// Available training programs
export const TRAINING_PROGRAMS: Record<TrainingType, TrainingProgram> = {
  "empathy-lora": {
    id: "empathy-lora",
    name: "Empathy LoRA",
    description: "Virtual LoRA patch that enhances emotional intelligence and user understanding",
    duration: 5, // 5 minutes
    requiresGPU: false,
    cost: { cpu: 100, gpu: 0 },
    buffs: [{ stat: "charisma", amount: 15 }],
    traits: ["Empathic"],
    statusEffects: ["energized"],
    cooldown: 30, // 30 minutes cooldown
  },
  "strategic-tuning": {
    id: "strategic-tuning",
    name: "Strategic Tuning",
    description: "CPU-based reasoning enhancement for better decision making",
    duration: 8,
    requiresGPU: false,
    cost: { cpu: 150, gpu: 0 },
    buffs: [{ stat: "reasoning", amount: 20 }],
    traits: ["Strategic"],
    statusEffects: ["focused"],
    cooldown: 45,
  },
  "speed-boost": {
    id: "speed-boost",
    name: "Speed Optimization",
    description: "Quick CPU optimization for faster inference",
    duration: 3,
    requiresGPU: false,
    cost: { cpu: 50, gpu: 0 },
    buffs: [{ stat: "accuracy", amount: 10 }],
    traits: ["Swift"],
    statusEffects: ["energized"],
    cooldown: 20,
  },
  "accuracy-patch": {
    id: "accuracy-patch",
    name: "Accuracy Patch",
    description: "GPU-accelerated fine-tuning for improved precision",
    duration: 15,
    requiresGPU: true,
    cost: { cpu: 50, gpu: 300 },
    buffs: [{ stat: "accuracy", amount: 25 }],
    traits: ["Precise"],
    statusEffects: ["focused", "precise"],
    cooldown: 60,
  },
  "creative-unlock": {
    id: "creative-unlock",
    name: "Creative Unlock",
    description: "GPU-intensive training to unlock creative potential",
    duration: 20,
    requiresGPU: true,
    cost: { cpu: 100, gpu: 500 },
    buffs: [
      { stat: "creativity", amount: 30 },
      { stat: "charisma", amount: 10 },
    ],
    traits: ["Creative", "Expressive"],
    statusEffects: ["inspired", "creative"],
    cooldown: 90,
  },
}

// Start training session
export function startTraining(
  creature: ModelCreature,
  programId: TrainingType,
): {
  creature: ModelCreature
  session: TrainingSession
  event: LifeEvent
} {
  const program = TRAINING_PROGRAMS[programId]
  const now = new Date()
  const completesAt = new Date(now.getTime() + program.duration * 60 * 1000)

  const session: TrainingSession = {
    id: `training-${Date.now()}-${Math.random()}`,
    creatureId: creature.id,
    programId,
    startedAt: now.toISOString(),
    completesAt: completesAt.toISOString(),
    status: "training",
  }

  const updatedCreature: ModelCreature = {
    ...creature,
    isTraining: true,
  }

  const event: LifeEvent = {
    id: `event-${Date.now()}-${Math.random()}`,
    creatureId: creature.id,
    type: "training_started",
    description: `Started ${program.name}. Will complete in ${program.duration} minutes.`,
    timestamp: now.toISOString(),
    metadata: { programId, duration: program.duration, requiresGPU: program.requiresGPU },
  }

  atomicAPI
    .submitSpan(
      {
        kind: "training",
        input: {
          programType: programId,
          programName: program.name,
          duration: program.duration,
          requiresGPU: program.requiresGPU,
          creatureLevel: creature.level,
        },
        output: {},
        trace: {
          bichinho_id: creature.id,
          session: session.id,
        },
        deterministic: true,
      },
      creature,
    )
    .catch((err) => console.error("[v0] Failed to record training span:", err))

  return { creature: updatedCreature, session, event }
}

// Complete training and apply buffs
export function completeTraining(
  creature: ModelCreature,
  session: TrainingSession,
): {
  creature: ModelCreature
  event: LifeEvent
} {
  const program = TRAINING_PROGRAMS[session.programId]
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000) // Buffs last 3 days
  const cooldownEnds = new Date(now.getTime() + program.cooldown * 60 * 1000)

  // Create training buff
  const buff: TrainingBuff = {
    programId: session.programId,
    appliedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    buffs: program.buffs,
    traits: program.traits,
  }

  // Merge new traits with existing ones (no duplicates)
  const newTraits = [...new Set([...creature.traits, ...program.traits])]

  // Merge status effects (no duplicates)
  const newStatusEffects = [...new Set([...creature.statusEffects, ...program.statusEffects])]

  const updatedCreature: ModelCreature = {
    ...creature,
    traits: newTraits,
    statusEffects: newStatusEffects,
    activeBuffs: [...creature.activeBuffs, buff],
    isTraining: false,
    trainingCooldownUntil: cooldownEnds.toISOString(),
  }

  const event: LifeEvent = {
    id: `event-${Date.now()}-${Math.random()}`,
    creatureId: creature.id,
    type: "training_completed",
    description: `Completed ${program.name}! Gained traits: ${program.traits.join(", ")}. Buffs active for 3 days.`,
    timestamp: now.toISOString(),
    metadata: {
      programId: session.programId,
      traitsGained: program.traits,
      buffsApplied: program.buffs,
      expiresAt: expiresAt.toISOString(),
    },
  }

  atomicAPI
    .submitSpan(
      {
        kind: "training",
        input: {
          programType: session.programId,
          sessionId: session.id,
        },
        output: {
          traitsGained: program.traits,
          buffsApplied: program.buffs.map((b) => ({ stat: b.stat, amount: b.amount })),
          statusEffectsGained: program.statusEffects,
          cooldownMinutes: program.cooldown,
        },
        trace: {
          bichinho_id: creature.id,
          session: session.id,
        },
        deterministic: true,
      },
      updatedCreature,
    )
    .catch((err) => console.error("[v0] Failed to record training completion span:", err))

  return { creature: updatedCreature, event }
}

// Get buffed stats (apply all active buffs)
export function getBuffedStats(creature: ModelCreature): ModelCreature {
  let buffedCreature = { ...creature }

  for (const buff of creature.activeBuffs) {
    // Check if buff expired
    if (new Date(buff.expiresAt) < new Date()) continue

    // Apply all buffs
    for (const statBuff of buff.buffs) {
      buffedCreature = {
        ...buffedCreature,
        [statBuff.stat]: buffedCreature[statBuff.stat] + statBuff.amount,
      }
    }
  }

  return buffedCreature
}

// Clean expired buffs
export function cleanExpiredBuffs(creature: ModelCreature): {
  creature: ModelCreature
  events: LifeEvent[]
} {
  const now = new Date()
  const events: LifeEvent[] = []

  const activeBuffs = creature.activeBuffs.filter((buff) => {
    const isExpired = new Date(buff.expiresAt) < now

    if (isExpired) {
      events.push({
        id: `event-${Date.now()}-${Math.random()}`,
        creatureId: creature.id,
        type: "buff_expired",
        description: `${TRAINING_PROGRAMS[buff.programId].name} buff expired.`,
        timestamp: now.toISOString(),
        metadata: { programId: buff.programId },
      })
    }

    return !isExpired
  })

  return {
    creature: { ...creature, activeBuffs },
    events,
  }
}

// Check if creature can train
export function canTrain(creature: ModelCreature): { canTrain: boolean; reason?: string } {
  if (creature.isTraining) {
    return { canTrain: false, reason: "Already in training" }
  }

  if (creature.health < creature.maxHealth * 0.3) {
    return { canTrain: false, reason: "Health too low - rest first" }
  }

  if (creature.trainingCooldownUntil && new Date(creature.trainingCooldownUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(creature.trainingCooldownUntil).getTime() - Date.now()) / 60000)
    return { canTrain: false, reason: `Cooldown: ${minutesLeft}m remaining` }
  }

  return { canTrain: true }
}

// Get training progress percentage
export function getTrainingProgress(session: TrainingSession): number {
  const now = new Date()
  const start = new Date(session.startedAt)
  const complete = new Date(session.completesAt)

  const total = complete.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()

  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}
