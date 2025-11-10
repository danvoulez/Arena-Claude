/**
 * Atomic Verifier - Adaptado para usar @arenalab/atomic-core
 * 
 * Wrapper para compatibilidade com código existente
 */

import type { AtomicSpan } from "./atomic-types"
import { verifySignature } from '@arenalab/atomic-core'
import type { Atomic } from '@arenalab/atomic-core'

// Ed25519 signature using Web Crypto API
export async function signSpan(span: AtomicSpan, privateKey: Uint8Array): Promise<string> {
  // TODO: Usar signAtomic do @arenalab/atomic-core quando disponível
  // Por enquanto, manter implementação antiga para compatibilidade
  
  // Remove signature field if exists
  const { signature, ...spanToSign } = span

  // Canonical JSON (sorted keys, no whitespace)
  const canonical = canonicalJSON(spanToSign)

  // Import private key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    privateKey,
    {
      name: "Ed25519",
      namedCurve: "Ed25519",
    } as any,
    false,
    ["sign"],
  )

  // Sign
  const signature_bytes = await crypto.subtle.sign("Ed25519", cryptoKey, new TextEncoder().encode(canonical))

  // Return base64
  return btoa(String.fromCharCode(...new Uint8Array(signature_bytes)))
}

// Verify span signature
export async function verifySpan(span: AtomicSpan, publicKey: Uint8Array): Promise<boolean> {
  // Tentar usar verifySignature do monorepo se span tiver estrutura Atomic
  if (span.signature && typeof span.signature === 'object' && 'sig' in span.signature) {
    try {
      return verifySignature(span as Atomic, {
        alg: 'Ed25519',
        public_key: btoa(String.fromCharCode(...publicKey)),
        sig: (span.signature as any).sig
      })
    } catch {
      // Fallback para implementação antiga
    }
  }

  // Implementação antiga (compatibilidade)
  if (!span.signature || typeof span.signature !== 'string') return false

  // Remove signature field
  const { signature, ...spanToVerify } = span

  // Canonical JSON
  const canonical = canonicalJSON(spanToVerify)

  // Import public key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    publicKey,
    {
      name: "Ed25519",
      namedCurve: "Ed25519",
    } as any,
    false,
    ["verify"],
  )

  // Decode signature from base64
  const signatureBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0))

  // Verify
  try {
    return await crypto.subtle.verify("Ed25519", cryptoKey, signatureBytes, new TextEncoder().encode(canonical))
  } catch {
    return false
  }
}

// Generate Ed25519 keypair
export async function generateKeypair(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }> {
  const keypair = await crypto.subtle.generateKey(
    {
      name: "Ed25519",
      namedCurve: "Ed25519",
    } as any,
    true,
    ["sign", "verify"],
  )

  const publicKey = await crypto.subtle.exportKey("raw", keypair.publicKey)
  const privateKey = await crypto.subtle.exportKey("raw", keypair.privateKey)

  return {
    publicKey: new Uint8Array(publicKey),
    privateKey: new Uint8Array(privateKey),
  }
}

// Canonical JSON (deterministic serialization)
function canonicalJSON(obj: any): string {
  if (obj === null) return "null"
  if (typeof obj !== "object") return JSON.stringify(obj)

  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalJSON).join(",")}]`
  }

  // Sort keys and stringify
  const keys = Object.keys(obj).sort()
  const pairs = keys.map((key) => `${JSON.stringify(key)}:${canonicalJSON(obj[key])}`)

  return `{${pairs.join(",")}}`
}

// Export public key as base64 (for sharing)
export function exportPublicKey(publicKey: Uint8Array): string {
  return btoa(String.fromCharCode(...publicKey))
}

// Import public key from base64
export function importPublicKey(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}
