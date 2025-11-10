/**
 * Memory Ledger implementation
 * 
 * In-memory Ledger para testes
 * 
 * Adaptado de Json-Atomic/core/ledger/ledger.ts
 */

import { hashAtomic } from '../crypto/hash.js'
import type { Atomic, LedgerScanOptions, LedgerQueryOptions } from '../types.js'
import type { Ledger } from './types.js'

export class MemoryLedger implements Ledger {
  private atomics: Atomic[] = []
  private cursor: number = 0

  /**
   * Append an atomic to the ledger
   */
  async append(atomic: Atomic): Promise<string> {
    // Validate atomic has required fields
    if (!atomic.entity_type || !atomic.this || !atomic.trace_id) {
      throw new Error('Invalid atomic: missing required fields')
    }
    
    // Add hash if not present
    if (!atomic.hash) {
      atomic.hash = hashAtomic(atomic)
    }
    
    // Check for duplicates
    const existing = await this.query({ trace_id: atomic.trace_id })
    if (existing.length > 0 && existing.some(a => a.hash === atomic.hash)) {
      throw new Error('Duplicate atomic detected')
    }
    
    // Append to array
    this.atomics.push(atomic)
    this.cursor++
    
    return String(this.cursor)
  }

  /**
   * Scan ledger with pagination
   */
  async scan(options: LedgerScanOptions = {}): Promise<{
    atomics: Atomic[]
    next_cursor?: string
  }> {
    const limit = options.limit || 10
    const startIdx = options.cursor ? parseInt(options.cursor) : 0
    
    let atomics: Atomic[] = []
    
    for (let i = startIdx; i < this.atomics.length && atomics.length < limit; i++) {
      const atomic = this.atomics[i]
      
      // Apply filters
      if (options.status && atomic.status?.state !== options.status) {
        continue
      }
      
      if (options.trace_id && atomic.trace_id !== options.trace_id) {
        continue
      }
      
      atomics.push(atomic)
    }
    
    const nextIdx = startIdx + atomics.length
    const hasMore = nextIdx < this.atomics.length
    
    return {
      atomics,
      next_cursor: hasMore ? String(nextIdx) : undefined
    }
  }

  /**
   * Query ledger by filters
   */
  async query(options: LedgerQueryOptions): Promise<Atomic[]> {
    const results: Atomic[] = []
    
    for (const atomic of this.atomics) {
      let matches = true
      
      if (options.trace_id && atomic.trace_id !== options.trace_id) {
        matches = false
      }
      
      if (options.entity_type && atomic.entity_type !== options.entity_type) {
        matches = false
      }
      
      if (options.owner_id && atomic.metadata?.owner_id !== options.owner_id) {
        matches = false
      }
      
      if (options.tenant_id && atomic.metadata?.tenant_id !== options.tenant_id) {
        matches = false
      }
      
      if (matches) {
        results.push(atomic)
      }
    }
    
    return results
  }

  /**
   * Get ledger statistics
   */
  async getStats(): Promise<{
    total: number
    by_type: Record<string, number>
    by_status: Record<string, number>
  }> {
    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    
    for (const atomic of this.atomics) {
      byType[atomic.entity_type] = (byType[atomic.entity_type] || 0) + 1
      
      if (atomic.status?.state) {
        byStatus[atomic.status.state] = (byStatus[atomic.status.state] || 0) + 1
      }
    }
    
    return {
      total: this.atomics.length,
      by_type: byType,
      by_status: byStatus
    }
  }

  /**
   * Clear ledger (for testing)
   */
  async clear(): Promise<void> {
    this.atomics = []
    this.cursor = 0
  }
}

