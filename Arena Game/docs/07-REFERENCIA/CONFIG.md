# ⚙️ Configurações - ArenaLab

**Variáveis de ambiente e configurações**

---

## 🔑 Variáveis de Ambiente

### API Keys (BYOK - Bring Your Own Key)

```bash
# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (GPT-4)
OPENAI_API_KEY=sk-...

# Google (Gemini)
GOOGLE_API_KEY=...

# Groq
GROQ_API_KEY=gsk_...
```

**Nota**: Usuário fornece suas próprias chaves (BYOK). Não são armazenadas no servidor.

---

### Server Configuration

```bash
# Porta do servidor
PORT=3000

# Diretório do Ledger
LEDGER_DIR=./data/ledger

# Ambiente
NODE_ENV=production  # ou development
```

---

## 📁 Estrutura de Diretórios

### Ledger

```
data/ledger/
├── battle.jsonl
├── training.jsonl
├── evolution.jsonl
├── ascension.jsonl
└── inference.jsonl
```

---

### Frontend

```
Arena-Frontend/
├── components/
├── lib/
├── app/
└── public/
```

---

## 🔧 Configurações do Sistema

### Quality Meter

**Thresholds** (hardcoded em `src/quality_meter.ts`):

```typescript
const DIAMOND_THRESHOLD = 80
const EXCELLENT_THRESHOLD = 85
const EXCEPTIONAL_THRESHOLD = 90
```

**Pesos** (hardcoded):

```typescript
const WEIGHTS = {
  completeness: 0.25,
  provenance: 0.20,
  impact: 0.20,
  uniqueness: 0.15,
  coherence: 0.20
}
```

---

### ELO System

**K Factor** (hardcoded em `src/arena/battle-runner.ts`):

```typescript
const K_FACTOR = 32
```

---

### XP Gains

**Valores** (hardcoded em `src/arena/narrative-sync.ts`):

```typescript
const XP_GAINS = {
  battle_win: 100,
  battle_loss: 30,
  battle_draw: 50,
  training: 50,
  evolution: 1000,
  ascension: 5000
}
```

---

### Trust System

**Mudanças** (hardcoded em `src/arena/narrative-sync.ts`):

```typescript
const TRUST_CHANGES = {
  victory: 5,
  defeat: -3,
  training: 2,
  evolution: 10,
  burnout: -5,
  rest: 1  // por hora
}
```

**Requisitos** (hardcoded):

```typescript
const TRUST_REQUIREMENTS = {
  evolution: 85,
  ascension: 90
}
```

---

### Rate Limiting

**Agents** (hardcoded em `src/arena/api.ts`):

```typescript
const DEFAULT_RATE_LIMIT = {
  requestsPerMinute: 60,
  requestsPerDay: 10000
}
```

---

### Cost Model

**Agents** (hardcoded em `src/arena/api.ts`):

```typescript
const DEFAULT_COST_MODEL = {
  perRequest: 0.001,
  trainerRoyalty: 0.15  // 15%
}
```

---

## 🎮 Training Programs

**Localização**: `Arena-Frontend/lib/training-engine.ts`

**Estrutura**:
```typescript
export const TRAINING_PROGRAMS: Record<TrainingType, TrainingProgram> = {
  "empathy-lora": {
    id: "empathy-lora",
    name: "Empathy LoRA",
    duration: 5,  // minutos
    buffs: [{ stat: "charisma", amount: 15 }],
    traits: ["Empathic"],
    cooldown: 30  // minutos
  },
  // ...
}
```

**Futuro**: Mover para YAML (data-driven)

---

## 🔐 Crypto Configuration

### Key Generation

**Algoritmo**: Ed25519

**Biblioteca**: `@noble/curves/ed25519`

**Hash**: BLAKE3

**Biblioteca**: `@noble/hashes/blake3`

---

## 📊 Prometheus Metrics

**Endpoint**: `/metrics`

**Porta**: Mesma do servidor (default: 3000)

**Formato**: Prometheus text format

---

## 🔗 Referências

- **[API Endpoints](API_ENDPOINTS.md)**
- **[Sistemas](../02-SISTEMAS/)**

---

**Status**: ✅ Configurações documentadas  
**Última atualização**: 2025-11-10


