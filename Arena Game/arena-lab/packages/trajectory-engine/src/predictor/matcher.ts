/**
 * Context Matcher: Encontra spans similares baseado em contexto
 * 
 * Compara contextos em múltiplas dimensões para garantir relevância
 * 
 * Baseado em: docs/02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md
 */

import type { Atomic } from '../quality/quality-meter'

export interface Context {
  // Contexto básico
  environment?: string          // Domain (battle, training, evolution)
  emotional_state?: 'positive' | 'neutral' | 'negative'
  stakes?: 'low' | 'medium' | 'high'
  
  // Histórico
  previous_actions?: string[]   // Ações anteriores
  previous_outcomes?: string[]  // Resultados anteriores
  previous_spans?: string[]     // IDs de spans anteriores
  
  // Metadados
  user_expertise?: 'beginner' | 'intermediate' | 'expert'
  time_of_day?: string
  session_length?: number
  
  // Contexto específico do span
  entity_type?: string
  intent?: string
  input?: unknown
}

export interface SimilarSpan {
  span: Atomic
  similarity: number  // 0-1
  contextMatch: number  // 0-1
  vectorMatch: number  // 0-1
}

export class ContextMatcher {
  /**
   * Comparar dois contextos (retorna 0-1)
   */
  compareContexts(context1: Context, context2: Context): number {
    let score = 0
    let maxScore = 0
    
    // Environment match (peso: 0.3)
    if (context1.environment && context2.environment) {
      maxScore += 0.3
      if (context1.environment === context2.environment) {
        score += 0.3
      }
    }
    
    // Emotional state match (peso: 0.2)
    if (context1.emotional_state && context2.emotional_state) {
      maxScore += 0.2
      if (context1.emotional_state === context2.emotional_state) {
        score += 0.2
      }
    }
    
    // Stakes match (peso: 0.2)
    if (context1.stakes && context2.stakes) {
      maxScore += 0.2
      if (context1.stakes === context2.stakes) {
        score += 0.2
      }
    }
    
    // Entity type match (peso: 0.3)
    if (context1.entity_type && context2.entity_type) {
      maxScore += 0.3
      if (context1.entity_type === context2.entity_type) {
        score += 0.3
      }
    }
    
    // Intent match (peso: 0.2)
    if (context1.intent && context2.intent) {
      maxScore += 0.2
      if (context1.intent === context2.intent) {
        score += 0.2
      }
    }
    
    // Previous actions overlap (peso: 0.1)
    if (context1.previous_actions && context2.previous_actions) {
      maxScore += 0.1
      const overlap = this.calculateOverlap(
        context1.previous_actions,
        context2.previous_actions
      )
      score += 0.1 * overlap
    }
    
    return maxScore > 0 ? score / maxScore : 0
  }

  /**
   * Encontrar spans similares baseado em contexto
   */
  matchContext(
    context: Context,
    spans: Atomic[],
    vectorSimilarities?: Map<string, number>  // Similaridades vetoriais pré-calculadas
  ): SimilarSpan[] {
    return spans
      .map(span => {
        const spanContext = this.extractContext(span)
        const contextMatch = this.compareContexts(context, spanContext)
        
        // Vector similarity (se disponível)
        const vectorMatch = vectorSimilarities?.get(span.trace_id || '') || 0
        
        // Combinar context match e vector match (peso: 60% context, 40% vector)
        const similarity = contextMatch * 0.6 + vectorMatch * 0.4
        
        return {
          span,
          similarity,
          contextMatch,
          vectorMatch
        }
      })
      .filter(result => result.similarity > 0.3)  // Filtrar muito diferentes
      .sort((a, b) => b.similarity - a.similarity)  // Ordenar por similaridade
  }

  /**
   * Extrair contexto de um span
   */
  private extractContext(span: Atomic): Context {
    return {
      entity_type: span.entity_type,
      intent: span.intent as string | undefined,
      input: span.input,
      emotional_state: this.inferEmotionalState(span),
      stakes: this.inferStakes(span)
    }
  }

  /**
   * Inferir estado emocional do span
   */
  private inferEmotionalState(span: Atomic): 'positive' | 'neutral' | 'negative' {
    if (span.status?.result === 'ok') {
      return 'positive'
    } else if (span.status?.result === 'error') {
      return 'negative'
    }
    return 'neutral'
  }

  /**
   * Inferir stakes do span
   */
  private inferStakes(span: Atomic): 'low' | 'medium' | 'high' {
    if (span.entity_type === 'evolution' || span.entity_type === 'ascension') {
      return 'high'
    } else if (span.entity_type === 'battle') {
      return 'medium'
    }
    return 'low'
  }

  /**
   * Calcular overlap entre dois arrays
   */
  private calculateOverlap(arr1: string[], arr2: string[]): number {
    const set1 = new Set(arr1)
    const set2 = new Set(arr2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }
}

