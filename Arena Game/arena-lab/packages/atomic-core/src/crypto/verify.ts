/**
 * Verify operations for JSON✯Atomic
 * 
 * Browser-native implementation (sem Buffer)
 * 
 * Adaptado de Json-Atomic/core/crypto.ts
 */

import { ed25519 } from '@noble/curves/ed25519'
import { hashAtomic } from './hash.js'
import type { Atomic } from '../types.js'

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
 * Verify an atomic's signature with structured signature object
 */
export function verifySignature(
  atomic: Atomic,
  publicKeyHex?: string
): boolean {
  if (!atomic.hash || !atomic.signature) {
    return false
  }
  
  const signature = atomic.signature
  
  // Verify signature structure
  if (signature.alg !== 'Ed25519' || !signature.public_key || !signature.sig) {
    return false
  }
  
  // Verify hash matches
  const expectedHash = hashAtomic(atomic)
  if (atomic.hash !== expectedHash) {
    return false
  }
  
  // Use provided public key or the one from signature
  const keyToUse = publicKeyHex || signature.public_key
  const publicKey = hexToUint8Array(keyToUse)
  const signatureBytes = hexToUint8Array(signature.sig)
  
  try {
    return ed25519.verify(
      signatureBytes,
      new TextEncoder().encode(atomic.hash),
      publicKey
    )
  } catch {
    return false
  }
}

/**
 * Verify an atomic's hash (without signature)
 */
export function verifyHash(atomic: Atomic): boolean {
  if (!atomic.hash) {
    return false
  }
  
  const expectedHash = hashAtomic(atomic)
  return atomic.hash === expectedHash
}

