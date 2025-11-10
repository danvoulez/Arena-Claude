/**
 * Sign operations for JSON✯Atomic
 * 
 * Browser-native implementation (sem Buffer)
 * 
 * Adaptado de Json-Atomic/core/crypto.ts
 */

import { ed25519 } from '@noble/curves/ed25519'
import { hashAtomic } from './hash.js'
import type { Atomic, Signature } from '../types.js'

/**
 * Convert hex string to Uint8Array (browser-native)
 */
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Convert Uint8Array to hex string (browser-native)
 */
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Sign an atomic with a private key, returning structured signature
 */
export async function signAtomic(
  atomic: Atomic,
  privateKeyHex?: string
): Promise<{ hash: string; signature?: Signature }> {
  const hash = hashAtomic(atomic)
  
  if (!privateKeyHex) {
    // Return unsigned if no key provided
    return { hash }
  }
  
  const privateKey = hexToUint8Array(privateKeyHex)
  const publicKey = ed25519.getPublicKey(privateKey)
  const signatureBytes = ed25519.sign(
    new TextEncoder().encode(hash),
    privateKey
  )
  
  const signature: Signature = {
    alg: 'Ed25519',
    public_key: uint8ArrayToHex(publicKey),
    sig: uint8ArrayToHex(signatureBytes),
    signed_at: new Date().toISOString()
  }
  
  return { hash, signature }
}

/**
 * Generate a new Ed25519 key pair
 */
export function generateKeyPair(): {
  privateKey: string
  publicKey: string
} {
  const privateKey = ed25519.utils.randomPrivateKey()
  const publicKey = ed25519.getPublicKey(privateKey)
  
  return {
    privateKey: uint8ArrayToHex(privateKey),
    publicKey: uint8ArrayToHex(publicKey)
  }
}

