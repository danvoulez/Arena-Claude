/**
 * Verify JSON✯Atomic spans
 * 
 * Wrapper functions para verificar hash e assinatura
 */

import { verifyHash, verifySignature } from '../crypto/verify.js'
import type { Atomic } from '../types.js'

/**
 * Verify a span (hash and signature if present)
 */
export function verifySpan<T extends Atomic>(
  span: T,
  publicKeyHex?: string
): boolean {
  // Verify hash
  if (!verifyHash(span)) {
    return false
  }
  
  // Verify signature if present
  if (span.signature) {
    return verifySignature(span, publicKeyHex)
  }
  
  // If no signature, hash verification is enough
  return true
}

