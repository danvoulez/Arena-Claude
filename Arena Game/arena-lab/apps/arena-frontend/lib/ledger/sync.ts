/**
 * Ledger Sync
 * 
 * Sync com Google Drive (opcional)
 */

import type { Atomic } from '@arenalab/atomic-core'
import { getAllFromLedger, appendToLedger } from './indexeddb-ledger'

/**
 * Export ledger to JSON
 */
export async function exportLedgerToJSON(): Promise<string> {
  const atomics = await getAllFromLedger()
  return JSON.stringify(atomics, null, 2)
}

/**
 * Import ledger from JSON
 */
export async function importLedgerFromJSON(json: string): Promise<void> {
  const atomics: Atomic[] = JSON.parse(json)
  
  // Append each atomic to ledger
  for (const atomic of atomics) {
    await appendToLedger(atomic)
  }
}

/**
 * Sync to Google Drive
 * 
 * TODO: Implementar sync real com Google Drive API
 */
export async function syncToDrive(): Promise<void> {
  try {
    const json = await exportLedgerToJSON()
    
    // TODO: Implementar upload para Google Drive
    // const token = localStorage.getItem('google_token')
    // await fetch('https://www.googleapis.com/upload/drive/v3/files', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     name: 'arenalab-ledger.json',
    //     parents: ['appDataFolder']
    //   })
    // })
    
    console.log('Sync to Drive (not implemented yet)')
  } catch (error) {
    console.error('Failed to sync to Drive:', error)
    throw error
  }
}

/**
 * Sync from Google Drive
 * 
 * TODO: Implementar sync real com Google Drive API
 */
export async function syncFromDrive(): Promise<void> {
  try {
    // TODO: Implementar download do Google Drive
    // const token = localStorage.getItem('google_token')
    // const response = await fetch('https://www.googleapis.com/drive/v3/files?q=name="arenalab-ledger.json"', {
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // })
    // const files = await response.json()
    // if (files.files && files.files.length > 0) {
    //   const fileId = files.files[0].id
    //   const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    //     headers: {
    //       'Authorization': `Bearer ${token}`
    //     }
    //   })
    //   const json = await fileResponse.text()
    //   await importLedgerFromJSON(json)
    // }
    
    console.log('Sync from Drive (not implemented yet)')
  } catch (error) {
    console.error('Failed to sync from Drive:', error)
    throw error
  }
}

