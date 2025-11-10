/**
 * Ledger Export/Import
 * 
 * Funções para exportar e importar ledger como JSON
 */

import { exportLedgerToJSON, importLedgerFromJSON } from './sync'

/**
 * Export ledger to JSON file (download)
 */
export async function exportLedger(): Promise<void> {
  try {
    const json = await exportLedgerToJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arenalab-ledger-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export ledger:', error)
    throw error
  }
}

/**
 * Import ledger from JSON file (upload)
 */
export async function importLedger(file: File): Promise<void> {
  try {
    const text = await file.text()
    await importLedgerFromJSON(text)
  } catch (error) {
    console.error('Failed to import ledger:', error)
    throw error
  }
}

/**
 * Import ledger from file input
 */
export function importLedgerFromInput(input: HTMLInputElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!input.files || input.files.length === 0) {
      reject(new Error('No file selected'))
      return
    }
    
    importLedger(input.files[0])
      .then(resolve)
      .catch(reject)
  })
}

