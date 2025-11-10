/**
 * Curator: Filtra spans baseado em qualidade mínima
 */

import { calculateQuality, type QualityScore, type Atomic } from './quality-meter'

/**
 * Filtra spans com qualidade >= threshold
 * 
 * @param spans Spans para filtrar
 * @param minQuality Qualidade mínima (0-1)
 * @param ledger Ledger completo (para calcular uniqueness e coherence)
 * @returns Spans filtrados com seus scores
 */
export function curateSpans(
  spans: Atomic[],
  minQuality: number = 0.7,
  ledger: Atomic[] = []
): Array<{ span: Atomic; score: QualityScore }> {
  return spans
    .map(span => ({
      span,
      score: calculateQuality(span, ledger)
    }))
    .filter(({ score }) => score.overall >= minQuality)
    .sort((a, b) => b.score.overall - a.score.overall) // Ordena por qualidade
}

/**
 * Retorna apenas os spans (sem scores)
 */
export function curateSpansOnly(
  spans: Atomic[],
  minQuality: number = 0.7,
  ledger: Atomic[] = []
): Atomic[] {
  return curateSpans(spans, minQuality, ledger).map(({ span }) => span)
}

