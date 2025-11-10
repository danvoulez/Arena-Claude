import type { ModelCreature, DuelRecord, LifeEvent, StatusEffect } from "./creature-types"
import {
  consumeStamina,
  calculateBattleXP,
  calculateBattleDamage,
  takeDamage,
  checkLevelUp,
  levelUp,
  triggerRandomEvent,
  applyStatusEffect,
} from "./creature-engine"
import { atomicAPI } from "./atomic-api"

interface BattleResult {
  creatureA: ModelCreature
  creatureB: ModelCreature
  duelRecord: DuelRecord
  events: LifeEvent[]
}

export async function executeBattle(
  creatureA: ModelCreature,
  creatureB: ModelCreature,
  prompt: string,
  winner: "A" | "B" | "draw",
): Promise<BattleResult> {
  const events: LifeEvent[] = []
  const traceId = `trace-${Date.now()}`

  // Simulate responses (in production, call real APIs)
  const responseA = `Response from ${creatureA.name}...`
  const responseB = `Response from ${creatureB.name}...`

  // Base stamina cost
  const staminaCostA = 15
  const staminaCostB = 15

  // Consume stamina
  let updatedA = consumeStamina(creatureA, staminaCostA)
  let updatedB = consumeStamina(creatureB, staminaCostB)

  // Calculate XP and damage
  let xpA = 0
  let xpB = 0
  let damageA = 0
  let damageB = 0
  const statusA: StatusEffect[] = []
  const statusB: StatusEffect[] = []

  if (winner === "A") {
    const { winnerXP, loserXP } = calculateBattleXP(updatedA, updatedB, false)
    xpA = winnerXP
    xpB = loserXP
    damageB = calculateBattleDamage(updatedB, updatedA)

    updatedA.xp += xpA
    updatedB.xp += xpB
    updatedA.winCount++
    updatedB.lossCount++
    updatedB = takeDamage(updatedB, damageB)

    // Winner gets energized
    if (Math.random() > 0.6) {
      updatedA = applyStatusEffect(updatedA, "energized")
      statusA.push("energized")
    }
  } else if (winner === "B") {
    const { winnerXP, loserXP } = calculateBattleXP(updatedB, updatedA, false)
    xpA = loserXP
    xpB = winnerXP
    damageA = calculateBattleDamage(updatedA, updatedB)

    updatedA.xp += xpA
    updatedB.xp += xpB
    updatedA.lossCount++
    updatedB.winCount++
    updatedA = takeDamage(updatedA, damageA)

    // Winner gets energized
    if (Math.random() > 0.6) {
      updatedB = applyStatusEffect(updatedB, "energized")
      statusB.push("energized")
    }
  } else {
    // Draw
    const { winnerXP } = calculateBattleXP(updatedA, updatedB, true)
    xpA = winnerXP
    xpB = winnerXP

    updatedA.xp += xpA
    updatedB.xp += xpB
    updatedA.drawCount++
    updatedB.drawCount++
  }

  updatedA.totalBattles++
  updatedB.totalBattles++

  // Check for level ups
  if (checkLevelUp(updatedA)) {
    const { creature, event } = levelUp(updatedA)
    updatedA = creature
    events.push(event)
  }

  if (checkLevelUp(updatedB)) {
    const { creature, event } = levelUp(updatedB)
    updatedB = creature
    events.push(event)
  }

  // Random events
  const { creature: finalA, event: eventA } = triggerRandomEvent(updatedA)
  if (eventA) events.push(eventA)
  updatedA = finalA

  const { creature: finalB, event: eventB } = triggerRandomEvent(updatedB)
  if (eventB) events.push(eventB)
  updatedB = finalB

  // Battle event
  const battleEvent: LifeEvent = {
    id: `event-${Date.now()}-battle`,
    creatureId: winner === "A" ? updatedA.id : winner === "B" ? updatedB.id : updatedA.id,
    type: "battle",
    description: `Battle ${winner === "draw" ? "draw" : "victory"}! Gained ${winner === "A" ? xpA : xpB} XP.`,
    timestamp: new Date().toISOString(),
    metadata: { winner, xpGained: winner === "A" ? xpA : xpB },
  }
  events.push(battleEvent)

  const duelRecord: DuelRecord = {
    id: `duel-${Date.now()}`,
    traceId,
    modelAId: creatureA.id,
    modelBId: creatureB.id,
    prompt,
    responseA,
    responseB,
    winner,
    xpGained: { A: xpA, B: xpB },
    damageDealt: { A: damageA, B: damageB },
    staminaCost: { A: staminaCostA, B: staminaCostB },
    statusApplied: { A: statusA, B: statusB },
    latencyA: Math.random() * 1000 + 500,
    latencyB: Math.random() * 1000 + 500,
    tokensA: Math.floor(Math.random() * 500 + 100),
    tokensB: Math.floor(Math.random() * 500 + 100),
    timestamp: new Date().toISOString(),
  }

  atomicAPI
    .submitSpan(
      {
        kind: "battle",
        input: {
          opponentId: creatureB.id,
          prompt,
          myLevel: creatureA.level,
          opponentLevel: creatureB.level,
        },
        output: {
          winner: winner === "A" ? "self" : winner === "B" ? "opponent" : "draw",
          xpGained: xpA,
          damageDealt: damageA,
          damageTaken: damageB,
          staminaCost: staminaCostA,
          statusEffectsGained: statusA,
        },
        trace: {
          bichinho_id: creatureA.id,
          session: traceId,
        },
        deterministic: false,
      },
      updatedA,
    )
    .catch((err) => console.error("[v0] Failed to record battle span for A:", err))

  atomicAPI
    .submitSpan(
      {
        kind: "battle",
        input: {
          opponentId: creatureA.id,
          prompt,
          myLevel: creatureB.level,
          opponentLevel: creatureA.level,
        },
        output: {
          winner: winner === "B" ? "self" : winner === "A" ? "opponent" : "draw",
          xpGained: xpB,
          damageDealt: damageB,
          damageTaken: damageA,
          staminaCost: staminaCostB,
          statusEffectsGained: statusB,
        },
        trace: {
          bichinho_id: creatureB.id,
          session: traceId,
        },
        deterministic: false,
      },
      updatedB,
    )
    .catch((err) => console.error("[v0] Failed to record battle span for B:", err))

  return {
    creatureA: updatedA,
    creatureB: updatedB,
    duelRecord,
    events,
  }
}
