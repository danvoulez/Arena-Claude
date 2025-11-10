/**
 * Atomic Ledger - Adaptado para usar @arenalab/atomic-core
 * 
 * Wrapper para compatibilidade com código existente
 */

import type { AtomicSpan, SpanLedger, ReplayResult } from "./atomic-types"
import { runAtomicSpan } from "./atomic-executor"
import { getLedger, appendToLedger, getAllFromLedger, getByWho } from "../ledger/indexeddb-ledger"
import type { Atomic } from '@arenalab/atomic-core'

// Save span to ledger (usando IndexedDBLedger do monorepo)
export async function saveSpan(span: AtomicSpan): Promise<void> {
  await appendToLedger(span as Atomic)
}

// Get all spans (usando IndexedDBLedger do monorepo)
export async function getAllSpans(): Promise<AtomicSpan[]> {
  return getAllFromLedger() as Promise<AtomicSpan[]>
}

// Get spans by creature ID
export async function getSpansByCreature(creatureId: string): Promise<AtomicSpan[]> {
  return getByWho(creatureId) as Promise<AtomicSpan[]>
}

// Export ledger as NDJSON
export function exportLedger(spans: AtomicSpan[]): Blob {
  const ndjson = spans.map((span) => JSON.stringify(span)).join("\n")
  return new Blob([ndjson], { type: "application/x-ndjson" })
}

// Import ledger from NDJSON
export async function importLedger(ndjson: string): Promise<AtomicSpan[]> {
  const lines = ndjson.split("\n").filter((line) => line.trim())
  const spans: AtomicSpan[] = []

  for (const line of lines) {
    try {
      const span = JSON.parse(line) as AtomicSpan
      await saveSpan(span)
      spans.push(span)
    } catch (error) {
      console.error("[ArenaLab] Failed to parse span:", error)
    }
  }

  return spans
}

// Replay span (re-execute and compare)
export async function replaySpan(span: AtomicSpan): Promise<ReplayResult> {
  const observations: string[] = []

  observations.push(`Replaying span ${span.hash || span.trace_id || 'unknown'}`)

  // Re-execute
  const result = await runAtomicSpan(span)

  // Compare outputs
  const match = JSON.stringify(result.output) === JSON.stringify(span.output)

  observations.push(`Execution ${match ? "matched" : "diverged"} from original`)
  observations.push(`Duration: ${result.duration.toFixed(2)}ms`)

  return {
    match,
    expected: span.output || {},
    actual: result.output,
    duration: result.duration,
    observations,
  }
}

// Export creature ledger (all spans + public key)
export async function exportCreatureLedger(creatureId: string, publicKey: string): Promise<SpanLedger> {
  const spans = await getSpansByCreature(creatureId)

  return {
    spans,
    creatureId,
    publicKey,
    version: "1.0.0",
  }
}

// Download ledger as file
export function downloadLedger(spans: AtomicSpan[], filename = "ledger.ndjson") {
  const blob = exportLedger(spans)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
