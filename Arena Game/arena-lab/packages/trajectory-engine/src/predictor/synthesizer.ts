/**
 * Outcome Synthesizer: Sintetiza resultados baseado em spans similares
 * 
 * Métodos:
 * - Majority Vote: Vota no resultado mais comum
 * - LLM-based: Usa LLM para sintetizar (opcional)
 * - Template-based: Usa templates para gerar resultado
 * 
 * Baseado em: docs/02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md
 */

import type { SimilarSpan } from './matcher'
import type { Atomic } from '../quality/quality-meter'

export interface Outcome {
  result: 'ok' | 'error' | 'doubt'
  confidence: number  // 0-1
  reasoning: string   // Explicação do resultado
  similarSpans: string[]  // IDs dos spans usados
}

export class OutcomeSynthesizer {
  /**
   * Sintetizar resultado usando majority vote
   */
  synthesizeByMajorityVote(similarSpans: SimilarSpan[]): Outcome {
    if (similarSpans.length === 0) {
      return {
        result: 'doubt',
        confidence: 0,
        reasoning: 'Nenhum span similar encontrado',
        similarSpans: []
      }
    }
    
    // Contar resultados
    const results: Record<string, number> = {}
    let totalWeight = 0
    
    similarSpans.forEach(({ span, similarity }) => {
      const result = span.status?.result || 'doubt'
      results[result] = (results[result] || 0) + similarity
      totalWeight += similarity
    })
    
    // Encontrar resultado mais comum (ponderado por similaridade)
    let bestResult: 'ok' | 'error' | 'doubt' = 'doubt'
    let bestScore = 0
    
    Object.entries(results).forEach(([result, score]) => {
      if (score > bestScore) {
        bestScore = score
        bestResult = result as 'ok' | 'error' | 'doubt'
      }
    })
    
    // Calcular confiança (proporção do resultado vencedor)
    const confidence = totalWeight > 0 ? bestScore / totalWeight : 0
    
    // Gerar reasoning
    const reasoning = this.generateReasoning(similarSpans, bestResult, confidence)
    
    return {
      result: bestResult,
      confidence,
      reasoning,
      similarSpans: similarSpans.map(({ span }) => span.trace_id || '').filter(Boolean)
    }
  }

  /**
   * Sintetizar resultado usando LLM (opcional, futuro)
   */
  async synthesizeByLLM(
    similarSpans: SimilarSpan[],
    context: string
  ): Promise<Outcome> {
    // TODO: Implementar quando LLM estiver disponível
    // Por enquanto, fallback para majority vote
    return this.synthesizeByMajorityVote(similarSpans)
  }

  /**
   * Sintetizar resultado usando template
   */
  synthesizeByTemplate(
    similarSpans: SimilarSpan[],
    template: (spans: SimilarSpan[]) => Outcome
  ): Outcome {
    return template(similarSpans)
  }

  /**
   * Gerar reasoning explicativo
   */
  private generateReasoning(
    similarSpans: SimilarSpan[],
    result: 'ok' | 'error' | 'doubt',
    confidence: number
  ): string {
    const count = similarSpans.length
    const confidencePercent = (confidence * 100).toFixed(1)
    
    if (result === 'ok') {
      return `Baseado em ${count} trajetórias similares, predição de sucesso com ${confidencePercent}% de confiança.`
    } else if (result === 'error') {
      return `Baseado em ${count} trajetórias similares, predição de falha com ${confidencePercent}% de confiança.`
    } else {
      return `Baseado em ${count} trajetórias similares, resultado incerto (${confidencePercent}% de confiança).`
    }
  }
}

