# 📜 Sistema de Ledger - ArenaLab

**Status**: ✅ Implementado  
**Data**: 2025-11-10

---

## 📋 Visão Geral

O Ledger é o **sistema de armazenamento append-only** que implementa o protocolo JSON✯Atomic. É a **fonte única da verdade** para todo o estado do ArenaLab.

---

## 🎯 Princípios

### 1. Append-Only (Imutável)

**Decisão Oficial:**
- ✅ Ledger é append-only (não pode ser modificado)
- ✅ Cada span é único e verificável
- ✅ Histórico completo e auditável

**Implementação:**
- **Atual**: JSONL files (Node.js fs)
- **Futuro**: IndexedDB (browser-native)

---

### 2. JSON✯Atomic Protocol

**O Que É:**
- Formato determinístico (canonical JSON)
- Hash BLAKE3 para integridade
- Assinatura Ed25519 para autenticidade
- Estrutura padronizada

**Estrutura de Span**:
```typescript
interface LedgerEntry {
  entity_type: "battle" | "training" | "evolution" | "ascension" | "inference"
  seq: number                    // Sequência única
  hash: string                   // BLAKE3 hash
  signature: string              // Ed25519 signature
  created_at: string             // ISO timestamp
  data: {
    who: string                  // ID da criatura/jogador
    did: string                  // Ação realizada
    this: any                    // Payload da ação
    when: string                 // ISO timestamp
    status: string               // completed | pending | failed
    confirmed_by?: string        // Quem confirmou
    if_ok?: string               // Estado se OK
    if_not?: string              // Estado se não OK
    metadata?: any               // Dados extras
  }
}
```

---

### 3. Fonte Única da Verdade

**Decisão Oficial:**
- ✅ Estado das criaturas é derivado do Ledger
- ✅ UI é um cache/mirror do Ledger
- ✅ Toda ação gera um span

**Implementação:**
- Backend grava spans no Ledger após cada ação
- Frontend lê Ledger para reconstruir estado
- Store (Zustand) atua como cache (stateless)

---

## 🔧 Implementação

### Arquivo

**Localização**: `src/ledger.ts`

### Interface

```typescript
class Ledger {
  constructor(ledgerPath: string)
  
  async append(entityType: LedgerEntityType, data: any): Promise<LedgerEntry>
  async getAll(entityType?: LedgerEntityType): Promise<LedgerEntry[]>
  async getByHash(hash: string): Promise<LedgerEntry | null>
  async verify(entry: LedgerEntry): Promise<boolean>
}
```

---

### Métodos Principais

#### `append()`

**Função**: Adiciona um novo span ao Ledger

**Processo**:
1. Cria estrutura de span
2. Calcula hash BLAKE3
3. Assina com Ed25519
4. Escreve no arquivo JSONL
5. Retorna `LedgerEntry`

**Código**:
```typescript
const span = await ledger.append('battle', {
  who: creatureA.id,
  did: `battle_vs_${creatureB.id}`,
  this: prompt,
  when: new Date().toISOString(),
  status: 'completed',
  metadata: { winner, qualityA, qualityB }
})
```

---

#### `getAll()`

**Função**: Retorna todos os spans (ou filtrados por tipo)

**Uso**:
```typescript
const allSpans = await ledger.getAll()
const battleSpans = await ledger.getAll('battle')
```

---

#### `getByHash()`

**Função**: Retorna span específico por hash

**Uso**:
```typescript
const span = await ledger.getByHash('blake3:abc123...')
```

---

#### `verify()`

**Função**: Verifica integridade e autenticidade de um span

**Processo**:
1. Verifica hash BLAKE3
2. Verifica assinatura Ed25519
3. Retorna `true` se válido

**Uso**:
```typescript
const isValid = await ledger.verify(span)
```

---

## 🔐 Criptografia

### Hash (BLAKE3)

**Biblioteca**: `@noble/hashes/blake3`

**Função**: Garantir integridade

**Processo**:
1. Canonicaliza JSON (ordem determinística)
2. Calcula hash BLAKE3
3. Armazena no span

**Código**:
```typescript
import { blake3 } from '@noble/hashes/blake3'

const canonical = canonicalizeJSON(data)
const hash = blake3(canonical)
```

---

### Assinatura (Ed25519)

**Biblioteca**: `@noble/curves/ed25519`

**Função**: Garantir autenticidade

**Processo**:
1. Gera par de chaves (público/privado)
2. Assina hash com chave privada
3. Armazena assinatura no span
4. Verifica com chave pública

**Código**:
```typescript
import { ed25519 } from '@noble/curves/ed25519'

const signature = ed25519.sign(hash, privateKey)
const isValid = ed25519.verify(signature, hash, publicKey)
```

---

## 📁 Estrutura de Arquivos

### Atual (Node.js fs)

```
data/ledger/
├── battle.jsonl          # Spans de batalhas
├── training.jsonl        # Spans de treinamento
├── evolution.jsonl       # Spans de evolução
├── ascension.jsonl       # Spans de ascensão
└── inference.jsonl       # Spans de invocação de agentes
```

**Formato JSONL**:
```
{"entity_type":"battle","seq":1,"hash":"blake3:...","signature":"ed25519:...","created_at":"2025-11-10T12:00:00Z","data":{...}}
{"entity_type":"battle","seq":2,"hash":"blake3:...","signature":"ed25519:...","created_at":"2025-11-10T12:01:00Z","data":{...}}
```

---

### Futuro (IndexedDB)

**Biblioteca**: Dexie.js

**Estrutura**:
```typescript
interface LedgerDB {
  spans: {
    id: string
    entity_type: string
    seq: number
    hash: string
    signature: string
    created_at: string
    data: any
  }
}
```

---

## 🔄 Fluxo de Uso

### 1. Ação Ocorre

**Exemplo**: Batalha

```typescript
const battleResult = await battleRunner.executeBattle(...)
```

---

### 2. Span é Escrito

**Onde**: `src/arena/battle-runner.ts`

```typescript
const battleSpan = await this.ledger.append('battle', {
  who: creatureA.id,
  did: `battle_vs_${creatureB.id}`,
  this: prompt,
  when: new Date().toISOString(),
  status: 'completed',
  metadata: { winner, qualityA, qualityB }
})
```

---

### 3. Span é Processado

**Onde**: `src/arena/narrative-sync.ts`

```typescript
const events = await this.narrativeSync.processSpan(battleSpan, creature)
```

---

### 4. UI Reage

**Onde**: `Arena-Frontend/components/arena-view.tsx`

```typescript
// Recebe resultado com span
const response = await fetch('/api/arena/battle', { ... })
const { battleResult, narrativeEvents } = await response.json()

// Atualiza store (cache do Ledger)
updateCreature(creatureA.id, battleResult.updatedCreatureA)
```

---

## 📊 Tipos de Spans

### Battle

**Tipo**: `battle`

**Payload**:
```json
{
  "who": "lyria_001",
  "did": "battle_vs_logikon_001",
  "this": "Explique o que é trajectory matching",
  "when": "2025-11-10T12:00:00Z",
  "status": "completed",
  "confirmed_by": "lyria_001",
  "metadata": {
    "traceId": "battle_1234567890_abc123",
    "opponent": "logikon_001",
    "winner": "A",
    "qualityA": 87.5,
    "qualityB": 82.3,
    "elo_change_a": 18,
    "elo_change_b": -18
  }
}
```

---

### Training

**Tipo**: `training`

**Payload**:
```json
{
  "who": "lyria_001",
  "did": "training_completed_empathy_socratic",
  "this": {
    "programId": "empathy_socratic",
    "buffsApplied": 1,
    "traitsGained": 1,
    "spansAdded": 5
  },
  "when": "2025-11-10T12:00:00Z",
  "status": "completed",
  "metadata": {
    "sessionId": "session_1234567890"
  }
}
```

---

### Evolution

**Tipo**: `evolution`

**Payload**:
```json
{
  "who": "lyria_001",
  "did": "evolution_stage_1",
  "this": {
    "evolutionStage": 1,
    "newAbilities": ["Advanced Reasoning", "Context Awareness"],
    "spansAdded": 25
  },
  "when": "2025-11-10T12:00:00Z",
  "status": "completed",
  "metadata": {
    "evolutionType": "strategic_expansion"
  }
}
```

---

### Ascension

**Tipo**: `ascension`

**Payload**:
```json
{
  "who": "lyria_001",
  "did": "ascend_to_production",
  "this": {
    "agentId": "agent_lyria_001_1234567890",
    "endpoint": "/api/arena/agents/agent_lyria_001_1234567890",
    "certification": { ... }
  },
  "when": "2025-11-10T12:00:00Z",
  "status": "completed",
  "confirmed_by": "trainer_and_system",
  "metadata": {
    "creatureLevel": 30,
    "creatureTrust": 95,
    "creatureDiamondSpans": 150
  }
}
```

---

## 🔗 Referências

- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_MOTOR.md)**
- **[Narrative System](NARRATIVE_SYSTEM.md)**
- **[DNA Timeline](DNA_TIMELINE.md)**

---

**Status**: ✅ Sistema completo e documentado  
**Última atualização**: 2025-11-10


