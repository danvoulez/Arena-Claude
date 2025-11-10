/**
 * Ledger Sync Hook
 * 
 * Hook que escuta mudanças no ledger e atualiza o store
 */

import { useEffect, useRef } from 'react'
import { getAllFromLedger } from '../ledger'
import { useArenaStore } from './store'

/**
 * Hook para sincronizar ledger com store
 * 
 * Usa polling para verificar mudanças no ledger
 */
export function useLedgerSync(pollInterval: number = 5000) {
  const { syncLedger, setLoading, setError } = useArenaStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Função para sincronizar
    const sync = async () => {
      try {
        setLoading(true)
        const spans = await getAllFromLedger()
        syncLedger(spans)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to sync ledger')
      } finally {
        setLoading(false)
      }
    }
    
    // Sincronizar imediatamente
    sync()
    
    // Configurar polling
    intervalRef.current = setInterval(sync, pollInterval)
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [syncLedger, setLoading, setError, pollInterval])
}

/**
 * Hook para sincronizar uma vez (não usa polling)
 */
export function useLedgerSyncOnce() {
  const { syncLedger, setLoading, setError } = useArenaStore()
  
  useEffect(() => {
    const sync = async () => {
      try {
        setLoading(true)
        const spans = await getAllFromLedger()
        syncLedger(spans)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to sync ledger')
      } finally {
        setLoading(false)
      }
    }
    
    sync()
  }, [syncLedger, setLoading, setError])
}

/**
 * Manual sync function
 */
export async function syncLedgerManually() {
  const { syncLedger, setLoading, setError } = useArenaStore.getState()
  
  try {
    setLoading(true)
    const spans = await getAllFromLedger()
    syncLedger(spans)
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to sync ledger')
  } finally {
    setLoading(false)
  }
}

