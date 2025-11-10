/**
 * Create JSON✯Atomic spans
 * 
 * Wrapper functions para criar spans com hash e assinatura
 */

import { hashAtomic } from '../crypto/hash.js'
import { signAtomic } from '../crypto/sign.js'
import type { Atomic, SignedAtomic } from '../types.js'

export interface Signer {
  privateKey?: string
}

/**
 * Create a span with hash and optional signature
 */
export async function createSpan<T extends Atomic>(
  data: T,
  signer?: Signer
): Promise<T & { hash: string } & Partial<SignedAtomic>> {
  // Generate hash
  const hash = hashAtomic(data)
  
  // Sign if signer provided
  let signature
  if (signer?.privateKey) {
    const signed = await signAtomic(data, signer.privateKey)
    signature = signed.signature
  }
  
  return {
    ...data,
    hash,
    ...(signature && { signature })
  }
}

