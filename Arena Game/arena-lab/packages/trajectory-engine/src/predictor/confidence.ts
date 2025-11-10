/**
 * Confidence Calibration: Calibra confiança das predições
 * 
 * Ajusta confiança baseado em:
 * - Número de spans similares
 * - Qualidade dos spans similares
 * - Consistência dos resultados
 * 
 * Baseado em: docs/02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md
 */

import type { SimilarSpan } from './matcher'
import type { Outcome } from './synthesizer'

export class ConfidenceCalibrator {
  /**
   * Calibrar confiança de uma predição
   */
  calibrate(
    outcome: Outcome,
    similarSpans: SimilarSpan[]
  ): number {
    let calibrated = outcome.confidence
    
    // Fator 1: Número de spans similares
    // Mais spans = mais confiança (até certo ponto)
    const countFactor = Math.min(similarSpans.length / 10, 1.0)
    calibrated *= (0.5 + countFactor * 0.5)
    
    // Fator 2: Qualidade média dos spans similares
    const avgSimilarity = similarSpans.reduce((sum, s) => sum + s.similarity, 0) / similarSpans.length
    calibrated *= avgSimilarity
    
    // Fator 3: Consistência dos resultados
    const consistency = this.calculateConsistency(similarSpans)
    calibrated *= consistency
    
    // Fator 4: Penalizar se poucos spans
    if (similarSpans.length < 3) {
      calibrated *= 0.7  // Reduzir confiança se muito poucos spans
    }
    
    return Math.min(Math.max(calibrated, 0), 1)  // Clamp entre 0 e 1
  }

  /**
   * Calcular consistência dos resultados
   */
  private calculateConsistency(similarSpans: SimilarSpan[]): number {
    if (similarSpans.length === 0) return 0
    
    // Agrupar por resultado
    const results: Record<string, number> = {}
    let totalWeight = 0
    
    similarSpans.forEach(({ span, similarity }) => {
      const result = span.status?.result || 'doubt'
      results[result] = (results[result] || 0) + similarity
      totalWeight += similarity
    })
    
    // Calcular entropia (menor entropia = mais consistente)
    let entropy = 0
    Object.values(results).forEach(weight => {
      const prob = weight / totalWeight
      if (prob > 0) {
        entropy -= prob * Math.log2(prob)
      }
    })
    
    // Converter entropia para consistência (0-1)
    // Máxima entropia = log2(num_results), mínima = 0
    const maxEntropy = Math.log2(Object.keys(results).length || 1)
    const consistency = maxEntropy > 0 ? 1 - (entropy / maxEntropy) : 1
    
    return consistency
  }
}

