/**
 * IndexedDB Ledger implementation
 * 
 * Browser-native Ledger usando IndexedDB
 * 
 * Adaptado de Json-Atomic/core/ledger/ledger.ts
 */

import { openDB, type IDBPDatabase } from 'idb'
import { hashAtomic } from '../crypto/hash.js'
import type { Atomic, LedgerScanOptions, LedgerQueryOptions } from '../types.js'
import type { Ledger } from './types.js'

const DB_NAME = 'arenalab-ledger'
const STORE_NAME = 'spans'
const VERSION = 1

interface LedgerDB {
  spans: {
    key: string  // Auto-increment ID
    value: Atomic
    indexes: {
      'by-entity-type': string
      'by-trace-id': string
      'by-started-at': string
    }
  }
}

export class IndexedDBLedger implements Ledger {
  private db: IDBPDatabase<LedgerDB> | null = null
  private dbName: string

  constructor(dbName: string = DB_NAME) {
    this.dbName = dbName
  }

  /**
   * Initialize database
   */
  private async init(): Promise<IDBPDatabase<LedgerDB>> {
    if (this.db) {
      return this.db
    }

    this.db = await openDB<LedgerDB>(this.dbName, VERSION, {
      upgrade(db) {
        // Create object store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          })
          
          // Create indexes
          store.createIndex('by-entity-type', 'entity_type')
          store.createIndex('by-trace-id', 'trace_id')
          store.createIndex('by-started-at', 'when.started_at')
        }
      }
    })

    return this.db
  }

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
    
    // Append to IndexedDB
    const db = await this.init()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    
    // Add to IndexedDB (let IndexedDB auto-increment id)
    const id = await store.add(atomic as any)
    await tx.done
    
    return String(id)
  }

  /**
   * Scan ledger with pagination
   */
  async scan(options: LedgerScanOptions = {}): Promise<{
    atomics: Atomic[]
    next_cursor?: string
  }> {
    const db = await this.init()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    
    const limit = options.limit || 10
    const startIdx = options.cursor ? parseInt(options.cursor) : 0
    
    let atomics: Atomic[] = []
    let count = 0
    
    // Use cursor to iterate
    let cursor = await store.openCursor()
    let currentIdx = 0
    
    while (cursor && count < limit) {
      if (currentIdx >= startIdx) {
        const atomic = cursor.value as Atomic
        
        // Apply filters
        if (options.status && atomic.status?.state !== options.status) {
          cursor = await cursor.continue()
          currentIdx++
          continue
        }
        
        if (options.trace_id && atomic.trace_id !== options.trace_id) {
          cursor = await cursor.continue()
          currentIdx++
          continue
        }
        
        atomics.push(atomic)
        count++
      }
      
      cursor = await cursor.continue()
      currentIdx++
    }
    
    const nextIdx = startIdx + count
    const hasMore = cursor !== null
    
    await tx.done
    
    return {
      atomics,
      next_cursor: hasMore ? String(nextIdx) : undefined
    }
  }

  /**
   * Query ledger by filters
   */
  async query(options: LedgerQueryOptions): Promise<Atomic[]> {
    const db = await this.init()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    
    const results: Atomic[] = []
    
    // Use appropriate index
    if (options.entity_type) {
      const index = store.index('by-entity-type')
      let cursor = await index.openCursor(IDBKeyRange.only(options.entity_type))
      
      while (cursor) {
        const atomic = cursor.value as Atomic
        
        // Apply additional filters
        let matches = true
        
        if (options.trace_id && atomic.trace_id !== options.trace_id) {
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
        
        cursor = await cursor.continue()
      }
    } else if (options.trace_id) {
      const index = store.index('by-trace-id')
      let cursor = await index.openCursor(IDBKeyRange.only(options.trace_id))
      
      while (cursor) {
        const atomic = cursor.value as Atomic
        
        // Apply additional filters
        let matches = true
        
        if (options.owner_id && atomic.metadata?.owner_id !== options.owner_id) {
          matches = false
        }
        
        if (options.tenant_id && atomic.metadata?.tenant_id !== options.tenant_id) {
          matches = false
        }
        
        if (matches) {
          results.push(atomic)
        }
        
        cursor = await cursor.continue()
      }
    } else {
      // No index, scan all
      let cursor = await store.openCursor()
      
      while (cursor) {
        const atomic = cursor.value as Atomic
        
        let matches = true
        
        if (options.owner_id && atomic.metadata?.owner_id !== options.owner_id) {
          matches = false
        }
        
        if (options.tenant_id && atomic.metadata?.tenant_id !== options.tenant_id) {
          matches = false
        }
        
        if (matches) {
          results.push(atomic)
        }
        
        cursor = await cursor.continue()
      }
    }
    
    await tx.done
    
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
    const db = await this.init()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    
    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    let total = 0
    
    let cursor = await store.openCursor()
    
    while (cursor) {
      const atomic = cursor.value as Atomic
      total++
      
      byType[atomic.entity_type] = (byType[atomic.entity_type] || 0) + 1
      
      if (atomic.status?.state) {
        byStatus[atomic.status.state] = (byStatus[atomic.status.state] || 0) + 1
      }
      
      cursor = await cursor.continue()
    }
    
    await tx.done
    
    return {
      total,
      by_type: byType,
      by_status: byStatus
    }
  }

  /**
   * Clear ledger (for testing)
   */
  async clear(): Promise<void> {
    const db = await this.init()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    await store.clear()
    await tx.done
  }
}

