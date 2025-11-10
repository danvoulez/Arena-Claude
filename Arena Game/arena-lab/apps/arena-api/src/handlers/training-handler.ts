/**
 * Training Handler
 * 
 * Processa treinamentos de criaturas
 */

import type { Context } from 'hono'
import { createTrainingSpan, createTrainingSession } from '@arenalab/arena-domain'
import type { Ledger } from '@arenalab/atomic-core'
import { createSpan } from '@arenalab/atomic-core'
import { generateNarrativeEvents } from '@arenalab/trajectory-engine'

interface TrainingRequest {
  programId: string
}

/**
 * Handle training start request
 */
export async function handleTrainingStart(
  c: Context,
  ledger: Ledger
): Promise<Response> {
  try {
    const creatureId = c.req.param('id')
    const body = await c.req.json() as TrainingRequest
    
    if (!creatureId || !body.programId) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Criar training session
    const session = createTrainingSession({
      id: `session_${Date.now()}_${Math.random().toString(36)}`,
      creatureId,
      programId: body.programId
    })
    
    // Criar TrainingSpan
    const trainingSpanData = createTrainingSpan({
      creatureId,
      programId: body.programId,
      action: 'training_started'
    })
    
    // Criar span completo e append ao ledger
    const userId = c.get('userId') || 'unknown'
    const span = await createSpan({
      entity_type: 'training',
      this: body.programId,
      did: trainingSpanData.did,
      input: trainingSpanData.input,
      who: userId
    })
    
    await ledger.append(span)
    
    // Gerar narrative events
    const narrativeEvents = generateNarrativeEvents([span])
    
    return c.json({
      session,
      narrativeEvents
    })
  } catch (error) {
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500)
  }
}

/**
 * Handle training complete request
 */
export async function handleTrainingComplete(
  c: Context,
  ledger: Ledger
): Promise<Response> {
  try {
    const sessionId = c.req.param('id')
    
    if (!sessionId) {
      return c.json({ error: 'Missing session ID' }, 400)
    }
    
    // Buscar session do ledger (buscar span de training_started)
    const result = await ledger.scan()
    const spans = result.atomics
    const sessionSpan = spans.find((s: any) => 
      s.entity_type === 'training' && 
      s.metadata?.sessionId === sessionId
    )
    
    if (!sessionSpan) {
      return c.json({ error: 'Session not found' }, 404)
    }
    
    const creatureId = sessionSpan.did?.actor || sessionSpan.who
    
    // Criar TrainingSpan (training_completed)
    const trainingSpanData = createTrainingSpan({
      creatureId,
      programId: sessionSpan.input?.programId || '',
      action: 'training_completed'
    })
    
    // Criar span completo e append ao ledger
    const userId = c.get('userId') || 'unknown'
    const span = await createSpan({
      entity_type: 'training',
      this: trainingSpanData.this,
      did: trainingSpanData.did,
      input: trainingSpanData.input,
      output: {
        buffsApplied: 0,
        traitsGained: 0,
        spansAdded: 0
      },
      status: {
        state: 'completed',
        result: 'ok'
      },
      who: userId
    })
    
    await ledger.append(span)
    
    // Gerar narrative events
    const narrativeEvents = generateNarrativeEvents([span])
    
    // Buscar creature atualizada
    const { getCreatureState } = await import('../state/getCreatureState')
    const state = await getCreatureState(creatureId, ledger)
    
    return c.json({
      creature: state?.creature || {},
      narrativeEvents
    })
  } catch (error) {
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, 500)
  }
}

