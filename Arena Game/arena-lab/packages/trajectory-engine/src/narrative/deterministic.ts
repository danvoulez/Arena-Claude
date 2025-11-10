/**
 * Deterministic Narrative Rules
 * 
 * Regras determinísticas para gerar eventos narrativos baseado em spans
 * 
 * Baseado em: docs/02-SISTEMAS/NARRATIVE_SYSTEM.md
 */

import type { Atomic } from '../quality/quality-meter'

export interface NarrativeEvent {
  type: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  spanId?: string
}

/**
 * Regras determinísticas para eventos narrativos
 */
export class DeterministicNarrativeRules {
  /**
   * Gerar evento narrativo para um span
   */
  generateEvent(span: Atomic): NarrativeEvent | null {
    const timestamp = span.when?.started_at || new Date().toISOString()
    
    // Battle events
    if (span.entity_type === 'battle') {
      if (span.status?.result === 'ok') {
        return {
          type: 'battle_won',
          message: 'Batalha vencida! A criatura demonstrou grande habilidade.',
          severity: 'success',
          timestamp,
          spanId: span.trace_id
        }
      } else if (span.status?.result === 'error') {
        return {
          type: 'battle_lost',
          message: 'Batalha perdida. A criatura precisa de mais treinamento.',
          severity: 'warning',
          timestamp,
          spanId: span.trace_id
        }
      }
    }
    
    // Training events
    if (span.entity_type === 'training') {
      if (span.status?.state === 'completed') {
        return {
          type: 'training_completed',
          message: 'Treinamento concluído! A criatura adquiriu novas habilidades.',
          severity: 'success',
          timestamp,
          spanId: span.trace_id
        }
      } else if (span.status?.state === 'failed') {
        return {
          type: 'training_failed',
          message: 'Treinamento falhou. A criatura precisa de mais prática.',
          severity: 'warning',
          timestamp,
          spanId: span.trace_id
        }
      }
    }
    
    // Evolution events
    if (span.entity_type === 'evolution') {
      return {
        type: 'evolution_occurred',
        message: 'Evolução ocorrida! A criatura alcançou uma nova forma.',
        severity: 'success',
        timestamp,
        spanId: span.trace_id
      }
    }
    
    // Ascension events
    if (span.entity_type === 'ascension') {
      return {
        type: 'ascension_achieved',
        message: 'Ascensão alcançada! A criatura está pronta para produção.',
        severity: 'success',
        timestamp,
        spanId: span.trace_id
      }
    }
    
    // Default: no event
    return null
  }

  /**
   * Gerar eventos para múltiplos spans
   */
  generateEvents(spans: Atomic[]): NarrativeEvent[] {
    return spans
      .map(span => this.generateEvent(span))
      .filter((event): event is NarrativeEvent => event !== null)
  }
}

