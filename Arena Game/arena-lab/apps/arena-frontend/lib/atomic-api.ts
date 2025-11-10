/**
 * Atomic API - Adaptado para usar @arenalab/atomic-core
 * 
 * Wrapper para compatibilidade com código existente
 */

import type { AtomicSpan, ExecutionResult, ReplayResult } from "./atomic-types"
import type { ModelCreature } from "./creature-types"
import { runAtomicSpan } from "./atomic-executor"
import { saveSpan, getAllSpans, getSpansByCreature, replaySpan, downloadLedger } from "./atomic-ledger"
import { verifySpan, generateKeypair, exportPublicKey } from "./atomic-verifier"
import type { Atomic } from '@arenalab/atomic-core'

export interface AtomicAPI {
  submitSpan: (
    span: Omit<AtomicSpan, "hash" | "when" | "status">,
    creature?: ModelCreature,
  ) => Promise<ExecutionResult>
  getLedger: () => Promise<AtomicSpan[]>
  getCreatureLedger: (creatureId: string) => Promise<AtomicSpan[]>
  replayAll: (creatureId?: string) => Promise<ReplayResult[]>
  exportNDJSON: (creatureId?: string, filename?: string) => Promise<void>
  generateIdentity: () => Promise<{ publicKey: string; privateKey: Uint8Array }>
  verifyIntegrity: (span: AtomicSpan, publicKey: Uint8Array) => Promise<boolean>
}

// Main API for interacting with JSON✯Atomic backend
export const atomicAPI: AtomicAPI = {
  // Submit a span for execution
  async submitSpan(spanData, creature) {
    // Adaptar spanData para formato Atomic
    const atomicData = spanData as Partial<Atomic>
    
    // Criar span usando createSpan do atomic-core (se possível)
    // Por enquanto, manter compatibilidade com formato antigo
    const span: AtomicSpan = {
      ...atomicData,
      entity_type: atomicData.entity_type || 'arena',
      this: atomicData.this || '',
      did: atomicData.did || { actor: creature?.id || 'unknown', action: 'unknown' },
      when: { started_at: new Date().toISOString() },
      status: { state: 'pending' }
    } as AtomicSpan

    // Execute
    if (span.status) {
      span.status.state = 'running'
    }
    const result = await runAtomicSpan(span, creature)

    // Update status and output
    if (span.status) {
      span.status.state = result.success ? 'completed' : 'failed'
    }
    span.output = result.output

    // Save to ledger
    await saveSpan(span)

    return result
  },

  // Get all spans
  async getLedger() {
    return getAllSpans()
  },

  // Get spans for specific creature
  async getCreatureLedger(creatureId) {
    return getSpansByCreature(creatureId)
  },

  // Replay all spans (or for specific creature)
  async replayAll(creatureId) {
    const spans = creatureId ? await getSpansByCreature(creatureId) : await getAllSpans()

    const results: ReplayResult[] = []

    for (const span of spans) {
      if (span.status === "completed") {
        const result = await replaySpan(span)
        results.push(result)
      }
    }

    return results
  },

  // Export ledger as NDJSON
  async exportNDJSON(creatureId, filename) {
    const spans = creatureId ? await getSpansByCreature(creatureId) : await getAllSpans()
    downloadLedger(spans, filename || `ledger-${Date.now()}.ndjson`)
  },

  // Generate Ed25519 identity for creature
  async generateIdentity() {
    const { publicKey, privateKey } = await generateKeypair()

    return {
      publicKey: exportPublicKey(publicKey),
      privateKey,
    }
  },

  // Verify span integrity
  async verifyIntegrity(span, publicKey) {
    return verifySpan(span, publicKey)
  },
}
