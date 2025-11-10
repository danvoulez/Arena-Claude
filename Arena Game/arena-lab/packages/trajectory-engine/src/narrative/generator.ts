/**
 * Narrative Generator: Gera eventos narrativos baseado em spans
 * 
 * Combina regras determinísticas com geração opcional via LLM
 * 
 * Baseado em: docs/02-SISTEMAS/NARRATIVE_SYSTEM.md
 */

import type { Atomic } from '../quality/quality-meter'
import { DeterministicNarrativeRules, type NarrativeEvent } from './deterministic'

export class NarrativeGenerator {
  private deterministic: DeterministicNarrativeRules

  constructor() {
    this.deterministic = new DeterministicNarrativeRules()
  }

  /**
   * Gerar eventos narrativos para spans
   */
  generateNarrativeEvents(spans: Atomic[]): NarrativeEvent[] {
    // Por enquanto, usar apenas regras determinísticas
    // TODO: Adicionar geração via LLM para diálogos mais ricos
    return this.deterministic.generateEvents(spans)
  }

  /**
   * Gerar evento narrativo para um span específico
   */
  generateEventForSpan(span: Atomic): NarrativeEvent | null {
    return this.deterministic.generateEvent(span)
  }

  /**
   * Gerar diálogo do Professor Oak (futuro, com LLM)
   */
  async generateProfessorOakDialogue(
    event: NarrativeEvent,
    creatureContext?: unknown
  ): Promise<string> {
    // TODO: Implementar quando LLM estiver disponível
    // Por enquanto, retornar mensagem padrão
    return event.message
  }
}

