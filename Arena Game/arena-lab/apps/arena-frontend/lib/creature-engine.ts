import type { ModelCreature, StatusEffect, LifeEvent } from "./creature-types"
import { atomicAPI } from "./atomic-api"

// XP required for each level (exponential growth)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Calculate level from XP
export function calculateLevel(xp: number): number {
  let level = 1
  let requiredXP = getXPForLevel(level)

  while (xp >= requiredXP) {
    level++
    requiredXP = getXPForLevel(level)
  }

  return level - 1
}

// Level up a creature and boost stats
export function levelUp(creature: ModelCreature): { creature: ModelCreature; event: LifeEvent } {
  const newLevel = creature.level + 1

  // Stat increases per level
  const healthBoost = Math.floor(10 + newLevel * 2)
  const staminaBoost = Math.floor(5 + newLevel)
  const statBoost = Math.floor(newLevel * 0.5)

  const updatedCreature: ModelCreature = {
    ...creature,
    level: newLevel,
    maxHealth: creature.maxHealth + healthBoost,
    health: Math.min(creature.health + healthBoost, creature.maxHealth + healthBoost),
    maxStamina: creature.maxStamina + staminaBoost,
    stamina: Math.min(creature.stamina + staminaBoost, creature.maxStamina + staminaBoost),
    charisma: creature.charisma + statBoost,
    accuracy: Math.min(100, creature.accuracy + statBoost),
    creativity: creature.creativity + statBoost,
    reasoning: creature.reasoning + statBoost,
  }

  const event: LifeEvent = {
    id: `event-${Date.now()}-${Math.random()}`,
    creatureId: creature.id,
    type: "levelup",
    description: `Evolved to Level ${newLevel}! Gained +${healthBoost} HP, +${staminaBoost} stamina, and +${statBoost} to all stats.`,
    timestamp: new Date().toISOString(),
    metadata: { newLevel, healthBoost, staminaBoost, statBoost },
  }

  return { creature: updatedCreature, event }
}

// Apply damage to creature
export function takeDamage(creature: ModelCreature, amount: number): ModelCreature {
  return {
    ...creature,
    health: Math.max(0, creature.health - amount),
  }
}

// Rest and recover
export function rest(creature: ModelCreature): { creature: ModelCreature; event: LifeEvent } {
  const healthRecovered = Math.floor(creature.maxHealth * 0.3)
  const staminaRecovered = Math.floor(creature.maxStamina * 0.5)

  const updatedCreature: ModelCreature = {
    ...creature,
    health: Math.min(creature.health + healthRecovered, creature.maxHealth),
    stamina: Math.min(creature.stamina + staminaRecovered, creature.maxStamina),
    lastRested: new Date().toISOString(),
    statusEffects: creature.statusEffects.filter((s) => s !== "burnout" && s !== "tired"),
  }

  const event: LifeEvent = {
    id: `event-${Date.now()}-${Math.random()}`,
    creatureId: creature.id,
    type: "rest",
    description: `Rested and recovered ${healthRecovered} HP and ${staminaRecovered} stamina. Feeling refreshed!`,
    timestamp: new Date().toISOString(),
    metadata: { healthRecovered, staminaRecovered },
  }

  atomicAPI
    .submitSpan(
      {
        kind: "rest",
        input: {
          healthBefore: creature.health,
          staminaBefore: creature.stamina,
        },
        output: {
          healthRecovered,
          staminaRecovered,
          statusEffectsRemoved: ["burnout", "tired"].filter((s) => creature.statusEffects.includes(s as StatusEffect)),
        },
        trace: {
          bichinho_id: creature.id,
          session: `rest-${Date.now()}`,
        },
        deterministic: true,
      },
      updatedCreature,
    )
    .catch((err) => console.error("[v0] Failed to record rest span:", err))

  return { creature: updatedCreature, event }
}

// Consume stamina for battle
export function consumeStamina(creature: ModelCreature, amount: number): ModelCreature {
  const newStamina = Math.max(0, creature.stamina - amount)
  const effects = [...creature.statusEffects]

  // Apply burnout if stamina depleted
  if (newStamina === 0 && !effects.includes("burnout")) {
    effects.push("burnout")
  }

  // Apply tired if low stamina
  if (newStamina < creature.maxStamina * 0.3 && !effects.includes("tired")) {
    effects.push("tired")
  }

  return {
    ...creature,
    stamina: newStamina,
    statusEffects: effects,
    lastUsed: new Date().toISOString(),
  }
}

// Calculate battle XP reward based on opponent level
export function calculateBattleXP(
  winner: ModelCreature,
  loser: ModelCreature,
  isDraw: boolean,
): { winnerXP: number; loserXP: number } {
  const baseXP = 50
  const levelDiff = loser.level - winner.level
  const diffMultiplier = 1 + levelDiff * 0.1 // More XP for beating higher level

  const winnerXP = isDraw ? Math.floor(baseXP * 0.5) : Math.floor(baseXP * diffMultiplier)
  const loserXP = Math.floor(baseXP * 0.3)

  return { winnerXP, loserXP }
}

// Calculate damage dealt in battle
export function calculateBattleDamage(loser: ModelCreature, winner: ModelCreature): number {
  const baseDamage = 10
  const levelFactor = winner.level * 2
  const randomFactor = Math.random() * 5

  // Less damage if loser has status effects
  const defenseMultiplier = loser.statusEffects.includes("burnout") ? 1.5 : 1.0

  return Math.floor((baseDamage + levelFactor + randomFactor) * defenseMultiplier)
}

// Apply status effect
export function applyStatusEffect(creature: ModelCreature, effect: StatusEffect): ModelCreature {
  if (creature.statusEffects.includes(effect)) return creature

  return {
    ...creature,
    statusEffects: [...creature.statusEffects, effect],
  }
}

// Remove status effect
export function removeStatusEffect(creature: ModelCreature, effect: StatusEffect): ModelCreature {
  return {
    ...creature,
    statusEffects: creature.statusEffects.filter((e) => e !== effect),
  }
}

// Check if creature needs auto-level up
export function checkLevelUp(creature: ModelCreature): boolean {
  const requiredXP = getXPForLevel(creature.level + 1)
  return creature.xp >= requiredXP
}

// Get status effect display info
export function getStatusEffectInfo(effect: StatusEffect): { icon: string; color: string; description: string } {
  const effects: Record<StatusEffect, { icon: string; color: string; description: string }> = {
    energized: { icon: "⚡", color: "text-yellow-400", description: "+20% creativity" },
    burnout: { icon: "🔥", color: "text-red-500", description: "-30% all stats, needs rest" },
    focused: { icon: "🎯", color: "text-blue-400", description: "+25% accuracy" },
    confused: { icon: "😵", color: "text-purple-400", description: "-20% reasoning" },
    inspired: { icon: "✨", color: "text-pink-400", description: "+30% creativity" },
    tired: { icon: "😴", color: "text-gray-400", description: "-15% stamina regen" },
    overfit: { icon: "📊", color: "text-orange-400", description: "+20% accuracy, -20% creativity" },
    creative: { icon: "🎨", color: "text-indigo-400", description: "+25% creativity" },
    precise: { icon: "🔬", color: "text-green-400", description: "+20% accuracy" },
    hallucinating: { icon: "🌀", color: "text-red-400", description: "-40% accuracy, unpredictable" },
  }

  return effects[effect]
}

// Random event trigger (10% chance after battle)
export function triggerRandomEvent(creature: ModelCreature): { creature: ModelCreature; event: LifeEvent | null } {
  if (Math.random() > 0.1) return { creature, event: null }

  const events = [
    {
      type: "inspired" as const,
      effect: "inspired" as StatusEffect,
      description: "Had a breakthrough insight! Feeling inspired.",
    },
    {
      type: "confused" as const,
      effect: "confused" as StatusEffect,
      description: "Encountered paradoxical data. Feeling confused.",
    },
    {
      type: "creative" as const,
      effect: "creative" as StatusEffect,
      description: "Discovered new patterns! Creativity boosted.",
    },
  ]

  const randomEvent = events[Math.floor(Math.random() * events.length)]

  const updatedCreature = applyStatusEffect(creature, randomEvent.effect)

  const event: LifeEvent = {
    id: `event-${Date.now()}-${Math.random()}`,
    creatureId: creature.id,
    type: "status_gained",
    description: randomEvent.description,
    timestamp: new Date().toISOString(),
    metadata: { effect: randomEvent.effect },
  }

  return { creature: updatedCreature, event }
}
