# 📘 Tipos TypeScript - ArenaLab

**Referência rápida de interfaces e tipos**

---

## 🎮 Core Types

### Creature

```typescript
interface Creature {
  id: string
  name: string
  type: 'lyria' | 'logikon' | 'tactile'
  level: number
  xp: number
  elo: number
  trust: number
  hp: number
  maxHp: number
  evolutionStage: number
  diamondSpans: number
  totalSpans: number
  wins: number
  losses: number
  draws: number
  abilities: Ability[]
  traits: Trait[]
  activeBuffs: Buff[]
  statusEffects: StatusEffect[]
  trainingCooldownUntil?: string
  status?: 'active' | 'production_agent' | 'retired'
  agentId?: string
  ascendedAt?: string
  provider: 'anthropic' | 'openai' | 'google' | 'groq'
  baseModel: string
  dataset?: any[]
  createdAt: string
  updatedAt: string
}
```

---

### BattleResult

```typescript
interface BattleResult {
  winner: 'A' | 'B' | 'draw'
  creatureA: Creature
  creatureB: Creature
  qualityA: QualityScore
  qualityB: QualityScore
  span: LedgerEntry
}
```

---

### QualityScore

```typescript
interface QualityScore {
  completeness: number      // 0-100
  provenance: number        // 0-100
  impact: number            // 0-100
  uniqueness: number        // 0-100
  coherence: number         // 0-100
  total_score: number       // Calculado (ponderado)
}
```

---

### TrainingSession

```typescript
interface TrainingSession {
  id: string
  creatureId: string
  programId: string
  startedAt: string
  completesAt: string
  durationHours: number
  status: 'in_progress' | 'completed' | 'failed'
}
```

---

### Agent

```typescript
interface Agent {
  id: string
  creatureId: string
  name: string
  apiKey: string
  endpoint: string
  createdAt: string
  capabilities: string[]
  rateLimit: {
    requestsPerMinute: number
    requestsPerDay: number
  }
  costModel: {
    perRequest: number
    trainerRoyalty: number
  }
  stats: {
    totalRequests: number
    totalRevenue: number
    trainerEarnings: number
  }
  lastRequest?: number
  requestsInMinute?: number
}
```

---

## 📜 Ledger Types

### LedgerEntry

```typescript
interface LedgerEntry {
  entity_type: 'battle' | 'training' | 'evolution' | 'ascension' | 'inference'
  seq: number
  hash: string                    // BLAKE3 hash
  signature: string               // Ed25519 signature
  created_at: string              // ISO timestamp
  data: {
    who: string
    did: string
    this: any
    when: string
    status: 'completed' | 'pending' | 'failed'
    confirmed_by?: string
    if_ok?: string
    if_not?: string
    metadata?: any
  }
}
```

---

## 📖 Narrative Types

### NarrativeEvent

```typescript
interface NarrativeEvent {
  type: 'xp_gained' | 'level_up' | 'evolution_ready' | 'first_victory' | 
        'burnout' | 'training_started' | 'training_completed' | 
        'evolution' | 'trust_low' | 'ascension'
  timestamp?: string
  data: Record<string, any>
}
```

---

### ProfessorOakMessage

```typescript
interface ProfessorOakMessage {
  id: string
  type: 'tip' | 'celebration' | 'tutorial' | 'warning'
  content: string
  timestamp: string
}
```

---

## 🎨 UI Types

### ModelCreature

```typescript
interface ModelCreature {
  id: string
  name: string
  type: string
  level: number
  xp: number
  elo: number
  trust: number
  hp: number
  maxHp: number
  evolutionStage: number
  abilities: Ability[]
  traits: Trait[]
  activeBuffs: Buff[]
  statusEffects: StatusEffect[]
}
```

---

### TrainingProgram

```typescript
interface TrainingProgram {
  id: string
  name: string
  description: string
  duration: number              // minutos
  requiresGPU: boolean
  cost: { cpu: number; gpu: number }
  buffs: TrainingBuff[]
  traits: string[]
  statusEffects: string[]
  cooldown: number              // minutos
}
```

---

## 🔧 API Response Types

### BattleResponse

```typescript
interface BattleResponse {
  battleResult: BattleResult
  updatedCreatureA: Creature
  updatedCreatureB: Creature
  narrativeEvents: NarrativeEvent[]
}
```

---

### TrainingResponse

```typescript
interface TrainingResponse {
  session: TrainingSession
  narrativeEvents: NarrativeEvent[]
}
```

---

### EvolutionResponse

```typescript
interface EvolutionResponse {
  creature: Creature
  evolution: {
    stage: number
    newAbilities: Ability[]
    spansAdded: number
  }
  narrativeEvents: NarrativeEvent[]
}
```

---

### AscensionResponse

```typescript
interface AscensionResponse {
  creature: Creature
  agent: Agent
  certification: Certification
  codeSnippets: {
    nodejs: string
    python: string
    curl: string
    javascript: string
  }
  narrativeEvents: NarrativeEvent[]
}
```

---

## 📊 DNA Timeline Types

### DNAEvent

```typescript
interface DNAEvent {
  type: 'battle' | 'training' | 'evolution' | 'ascension'
  timestamp: string
  title: string
  description: string
  quality?: number
  metadata?: any
}
```

---

### DNAStats

```typescript
interface DNAStats {
  totalBattles: number
  totalTraining: number
  totalEvolutions: number
  totalAscensions: number
  winRate: number
  avgQuality: number
  diamondSpans: number
}
```

---

## 🔗 Referências

- **[API Endpoints](API_ENDPOINTS.md)**
- **[Sistemas](../02-SISTEMAS/)**

---

**Status**: ✅ Tipos documentados  
**Última atualização**: 2025-11-10


