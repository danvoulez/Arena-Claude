/**
 * Hash operations for JSON✯Atomic
 * 
 * Browser-native implementation (sem Buffer)
 * 
 * Adaptado de Json-Atomic/core/crypto.ts
 */

import { blake3 } from '@noble/hashes/blake3'
import { canonicalize } from '../atomic/canonicalize.js'
import type { Atomic } from '../types.js'

/**
 * Domain separation context for BLAKE3 hashing
 */
const HASH_CONTEXT = 'JsonAtomic/v1'

/**
 * Convert Uint8Array to hex string (browser-native)
 */
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generate a deterministic hash for an atomic with domain separation
 */
export function hashAtomic(atomic: Atomic): string {
  const atomicForHash = { ...atomic }
  delete (atomicForHash as any).hash
  delete (atomicForHash as any).signature
  
  const canonical = canonicalize(atomicForHash)
  // Use BLAKE3 with domain separation context
  const hashBytes = blake3(new TextEncoder().encode(canonical), { context: HASH_CONTEXT })
  return uint8ArrayToHex(hashBytes)
}

