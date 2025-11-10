/**
 * IndexedDB Ledger Wrapper
 * 
 * Wrapper do IndexedDBLedger do atomic-core para uso no frontend
 */

import { IndexedDBLedger } from '@arenalab/atomic-core'
import type { Atomic, Ledger } from '@arenalab/atomic-core'

let ledgerInstance: IndexedDBLedger | null = null

/**
 * Get or create IndexedDB Ledger instance
 */
export async function getLedger(): Promise<Ledger> {
  if (!ledgerInstance) {
    ledgerInstance = new IndexedDBLedger()
    await ledgerInstance.init()
  }
  return ledgerInstance
}

/**
 * Initialize IndexedDB Ledger
 */
export async function initLedger(): Promise<void> {
  const ledger = await getLedger()
  // Ledger já está inicializado
}

/**
 * Append atomic to ledger
 */
export async function appendToLedger(atomic: Atomic): Promise<string> {
  const ledger = await getLedger()
  return ledger.append(atomic)
}

/**
 * Get all atomics from ledger
 */
export async function getAllFromLedger(): Promise<Atomic[]> {
  const ledger = await getLedger()
  const result = await ledger.scan()
  return result.atomics
}

/**
 * Get atomics by who (creature ID)
 */
export async function getByWho(who: string): Promise<Atomic[]> {
  const ledger = await getLedger()
  return ledger.query({ owner_id: who })
}

/**
 * Get atomics by entity type
 */
export async function getByEntityType(entityType: string): Promise<Atomic[]> {
  const ledger = await getLedger()
  return ledger.query({ entity_type: entityType })
}

/**
 * Get ledger stats
 */
export async function getLedgerStats() {
  const ledger = await getLedger()
  return ledger.getStats()
}

/**
 * Clear ledger (use with caution!)
 */
export async function clearLedger(): Promise<void> {
  // TODO: Implementar clear se necessário
  // Por enquanto, apenas resetar instância
  ledgerInstance = null
}

