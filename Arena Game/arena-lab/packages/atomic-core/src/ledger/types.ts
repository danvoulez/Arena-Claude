/**
 * Ledger Types
 * 
 * Tipos para Ledger (IndexedDB e Memory)
 */

import type { Atomic, LedgerScanOptions, LedgerQueryOptions } from '../types.js'

export interface Ledger {
  append(atomic: Atomic): Promise<string>
  scan(options?: LedgerScanOptions): Promise<{
    atomics: Atomic[]
    next_cursor?: string
  }>
  query(options: LedgerQueryOptions): Promise<Atomic[]>
  getStats(): Promise<{
    total: number
    by_type: Record<string, number>
    by_status: Record<string, number>
  }>
}

