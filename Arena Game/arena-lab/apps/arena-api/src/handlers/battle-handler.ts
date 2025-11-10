/**
 * Battle Handler
 * 
 * Processa batalhas entre duas criaturas
 */

import type { Context } from 'hono'
import { createBattleSpan, calculateELO, calculateELOWinner } from '@arenalab/arena-domain'
import { calculateQuality, generateNarrativeEvents } from '@arenalab/trajectory-engine'
import type { Ledger } from '@arenalab/atomic-core'
import { getCreature } from '../utils/getCreature'
import { createSpan } from '@arenalab/atomic-core'

interface BattleRequest {
  creatureAId: string
  creatureBId: string
  prompt: string
  allowUserVote?: boolean
}

/**
 * Handle battle request
 */
export async function handleBattle(
  c: Context,
  ledger: Ledger
): Promise<Response> {
  try {
    const body = await c.req.json() as BattleRequest
    
    // Validar input
    if (!body.creatureAId || !body.creatureBId || !body.prompt) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Buscar creatures do ledger
    const creatureA = await getCreature(ledger, body.creatureAId)
    const creatureB = await getCreature(ledger, body.creatureBId)
    
    if (!creatureA || !creatureB) {
      return c.json({ error: 'Creature not found' }, 404)
    }
    
    // TODO: Chamar LLM para ambas as creatures (BYOK)
    // Por enquanto, usar mock
    const responseA = `Mock response from ${creatureA.name}`
    const responseB = `Mock response from ${creatureB.name}`
    
    // Calcular Quality Meter 5D
    const qualityA = calculateQuality({
      entity_type: 'battle',
      this: body.prompt,
      output: { result: responseA }
    } as any)
    
    const qualityB = calculateQuality({
      entity_type: 'battle',
      this: body.prompt,
      output: { result: responseB }
    } as any)
    
    // Determinar winner
    const winner = qualityA.overall > qualityB.overall ? 'A' : 
                   qualityB.overall > qualityA.overall ? 'B' : 'tie'
    
    // Calcular ELO changes
    const eloResult = calculateELOWinner(creatureA.elo, creatureB.elo, winner === 'A' ? 'A' : winner === 'B' ? 'B' : 'draw')
    
    // Criar BattleSpan
    const battleSpanData = createBattleSpan({
      creatureAId: body.creatureAId,
      creatureBId: body.creatureBId,
      prompt: body.prompt,
      allowUserVote: body.allowUserVote
    })
    
    // Adicionar resultados ao span
    const battleSpan = {
      ...battleSpanData,
      output: {
        responseA,
        responseB,
        winner,
        qualityA: qualityA.overall,
        qualityB: qualityB.overall,
        elo_change_a: eloResult.changeA,
        elo_change_b: eloResult.changeB
      },
      status: {
        state: 'completed' as const,
        result: 'ok' as const
      }
    }
    
    // Criar span completo e append ao ledger
    const userId = c.get('userId') || 'unknown'
    const span = await createSpan({
      entity_type: 'battle',
      this: body.prompt,
      did: battleSpan.did,
      input: battleSpan.input,
      output: battleSpan.output,
      who: userId
    })
    
    await ledger.append(span)
    
    // Gerar narrative events
    const narrativeEvents = generateNarrativeEvents([span])
    
    // Atualizar creatures (mock - em produção, atualizar via state aggregation)
    const updatedCreatureA = {
      ...creatureA,
      elo: creatureA.elo + eloResult.changeA
    }
    
    const updatedCreatureB = {
      ...creatureB,
      elo: creatureB.elo + eloResult.changeB
    }
    
    return c.json({
      battleResult: {
        winner,
        qualityA: { overall: qualityA.overall },
        qualityB: { overall: qualityB.overall }
      },
      updatedCreatureA,
      updatedCreatureB,
      narrativeEvents
    })
  } catch (error) {
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500)
  }
}

