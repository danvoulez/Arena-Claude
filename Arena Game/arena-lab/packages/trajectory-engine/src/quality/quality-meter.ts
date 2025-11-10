/**
 * Quality Meter 5D: Avalia qualidade de spans em 5 dimensões
 * 
 * Dimensões:
 * 1. Completeness: Span tem todos os campos necessários?
 * 2. Provenance: Span tem hash e assinatura válidos?
 * 3. Impact: Span teve impacto significativo (battle win, evolution, etc)?
 * 4. Uniqueness: Span é único ou duplicado?
 * 5. Coherence: Span faz sentido no contexto do ledger?
 */

// TODO: Importar tipo Atomic de arena-domain quando disponível
// Por enquanto, usando tipo genérico
export interface Atomic {
  entity_type?: string
  this?: string
  trace_id?: string
  hash?: string
  signature?: {
    sig?: string
    public_key?: string
  }
  did?: {
    actor?: string
    action?: string
  }
  when?: {
    started_at?: string
    completed_at?: string
  }
  status?: {
    state?: string
    result?: string
  }
  input?: unknown
  output?: unknown
  prev?: string
}

export interface QualityScore {
  completeness: number  // 0-1
  provenance: number    // 0-1
  impact: number        // 0-1
  uniqueness: number    // 0-1
  coherence: number     // 0-1
  overall: number       // Média ponderada
}

/**
 * Calcula qualidade de um span
 * 
 * @param span Span para avaliar
 * @param ledger Ledger completo (para verificar uniqueness e coherence)
 * @returns Score de qualidade
 */
export function calculateQuality(
  span: Atomic,
  ledger: Atomic[] = []
): QualityScore {
  const completeness = calculateCompleteness(span)
  const provenance = calculateProvenance(span)
  const impact = calculateImpact(span)
  const uniqueness = calculateUniqueness(span, ledger)
  const coherence = calculateCoherence(span, ledger)
  
  // Média ponderada (impact e provenance têm peso maior)
  const overall = (
    completeness * 0.15 +
    provenance * 0.25 +
    impact * 0.30 +
    uniqueness * 0.15 +
    coherence * 0.15
  )
  
  return {
    completeness,
    provenance,
    impact,
    uniqueness,
    coherence,
    overall
  }
}

/**
 * Completeness: Verifica se span tem todos os campos necessários
 */
function calculateCompleteness(span: Atomic): number {
  let score = 0
  let maxScore = 0
  
  // Campos obrigatórios
  maxScore += 1
  if (span.entity_type) score += 0.2
  
  maxScore += 1
  if (span.this) score += 0.2
  
  maxScore += 1
  if (span.trace_id) score += 0.2
  
  maxScore += 1
  if (span.did?.actor && span.did?.action) score += 0.2
  
  maxScore += 1
  if (span.when?.started_at) score += 0.2
  
  // Campos opcionais mas importantes
  if (span.input) score += 0.1
  if (span.output) score += 0.1
  if (span.status) score += 0.1
  
  return Math.min(score / maxScore, 1)
}

/**
 * Provenance: Verifica hash e assinatura
 */
function calculateProvenance(span: Atomic): number {
  let score = 0
  
  // Hash presente e válido
  if (span.hash && span.hash.length > 0) {
    score += 0.5
  }
  
  // Assinatura presente e válida
  if (span.signature?.sig && span.signature?.public_key) {
    score += 0.5
  }
  
  return score
}

/**
 * Impact: Avalia impacto do span (battle win, evolution, etc)
 */
function calculateImpact(span: Atomic): number {
  // Battle wins têm alto impacto
  if (span.entity_type === 'battle' && span.status?.result === 'ok') {
    return 1.0
  }
  
  // Evolution tem alto impacto
  if (span.entity_type === 'evolution') {
    return 0.9
  }
  
  // Training completed tem impacto médio
  if (span.entity_type === 'training' && span.status?.state === 'completed') {
    return 0.6
  }
  
  // Battle loss tem impacto baixo
  if (span.entity_type === 'battle' && span.status?.result === 'error') {
    return 0.3
  }
  
  // Outros spans têm impacto baixo
  return 0.2
}

/**
 * Uniqueness: Verifica se span é único no ledger
 */
function calculateUniqueness(span: Atomic, ledger: Atomic[]): number {
  if (ledger.length === 0) return 1.0
  
  // Conta quantos spans têm o mesmo hash
  const sameHash = ledger.filter(s => s.hash === span.hash).length
  
  if (sameHash === 0) return 1.0
  if (sameHash === 1) return 0.8
  return 0.2 // Duplicado
}

/**
 * Coherence: Verifica se span faz sentido no contexto do ledger
 */
function calculateCoherence(span: Atomic, ledger: Atomic[]): number {
  if (ledger.length === 0) return 1.0
  
  // Verifica se span tem prev válido
  if (span.prev) {
    const prevExists = ledger.some(s => s.hash === span.prev)
    if (!prevExists) return 0.5 // Prev não encontrado
  }
  
  // Verifica se trace_id é consistente
  if (span.trace_id) {
    const sameTrace = ledger.filter(s => s.trace_id === span.trace_id)
    if (sameTrace.length > 0) {
      // Verifica ordem temporal
      const lastInTrace = sameTrace[sameTrace.length - 1]
      if (lastInTrace.when?.started_at && span.when?.started_at) {
        const lastTime = new Date(lastInTrace.when.started_at).getTime()
        const currentTime = new Date(span.when.started_at).getTime()
        if (currentTime < lastTime) {
          return 0.3 // Ordem temporal inconsistente
        }
      }
    }
  }
  
  return 1.0
}

