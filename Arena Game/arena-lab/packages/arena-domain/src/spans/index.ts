/**
 * Arena Spans - Exporta todos os tipos de spans
 */

export type {
  BattleSpan,
  TrainingSpan,
  EvolutionSpan,
  NarrativeSpan,
  UIEventSpan
} from './battle-span'
export { BattleSpanSchema, createBattleSpan } from './battle-span'
export { TrainingSpanSchema, createTrainingSpan } from './training-span'
export { EvolutionSpanSchema, createEvolutionSpan } from './evolution-span'
export { NarrativeSpanSchema, createNarrativeSpan } from './narrative-span'
export { UIEventSpanSchema, createUIEventSpan } from './ui-event-span'

// Union type for all Arena spans
import type { BattleSpan } from './battle-span'
import type { TrainingSpan } from './training-span'
import type { EvolutionSpan } from './evolution-span'
import type { NarrativeSpan } from './narrative-span'
import type { UIEventSpan } from './ui-event-span'

export type ArenaSpan = 
  | BattleSpan
  | TrainingSpan
  | EvolutionSpan
  | NarrativeSpan
  | UIEventSpan

