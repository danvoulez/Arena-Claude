# 🧠 Conceitos Centrais - ArenaLab

**Glossário completo dos conceitos fundamentais**

---

## 🎯 Visão Geral

O ArenaLab é construído sobre 6 conceitos fundamentais que trabalham juntos:

1. **Trajectory Matching** - Motor de IA (sem gradientes)
2. **JSON✯Atomic** - Protocolo de spans auditáveis
3. **Ledger** - DNA imutável da criatura
4. **Event Bus** - Reatividade em tempo real
5. **ECS** - Separação de responsabilidades
6. **Data-Driven** - Conteúdo externo (YAML)

---

## 1. Trajectory Matching

### O Que É

**Trajectory Matching** é uma técnica de treinamento de IA que **não usa gradientes**. Em vez de backpropagation, ela busca padrões similares em um dataset de alta qualidade e sintetiza respostas baseadas nesses exemplos.

### Como Funciona

```
1. Prompt do usuário
   ↓
2. Embedding (TF-IDF determinístico)
   ↓
3. Busca vetorial (HNSW) no dataset
   ↓
4. Filtragem por contexto (similaridade)
   ↓
5. Síntese da resposta (majority vote ou LLM)
```

### Por Que É Importante

- ✅ **CPU-friendly**: Roda em laptops, não precisa de GPU
- ✅ **Interpretável**: Cada resposta tem exemplos de apoio
- ✅ **Auditável**: Você sabe exatamente quais exemplos foram usados
- ✅ **Rápido**: 2-48 horas vs 3-12 meses tradicional

### Referência

- **[TRAJECTORY_MATCHING_ADVANCED.md](../02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md)** 🔥 - Algoritmos completos (HNSW, IVF, Context Matching)
- `A-Texts/docs/formula.md` - Fórmula técnica

---

## 2. JSON✯Atomic

### O Que É

**JSON✯Atomic** é um protocolo de dados onde cada ação é um "span" auditável com:
- **Hash BLAKE3**: Garante integridade
- **Assinatura Ed25519**: Garante autenticidade
- **Estrutura canônica**: Determinística

### Estrutura de um Span

```json
{
  "entity_type": "battle",
  "who": "lyria_001",
  "did": "battle_vs_logikon_001",
  "this": {
    "prompt": "...",
    "responses": {...},
    "winner": "lyria_001"
  },
  "when": "2025-11-10T10:00:00Z",
  "status": "completed",
  "confirmed_by": "user_vote",
  "if_ok": "CREATURE_GAINS_XP",
  "if_not": "CREATURE_LOSES_HP",
  "metadata": {
    "traceId": "battle_123",
    "elo_change": 15
  },
  "hash": "blake3:abc123...",
  "signature": "ed25519:def456..."
}
```

### Por Que É Importante

- ✅ **Imutável**: Uma vez escrito, nunca muda
- ✅ **Verificável**: Qualquer um pode verificar hash e assinatura
- ✅ **Auditável**: Histórico completo de todas as ações
- ✅ **Portátil**: Funciona em Node.js e browser

### Referência

Ver: `01-ARQUITETURA/DECISOES_ARQUITETURAIS.md` (em breve)

---

## 3. Ledger

### O Que É

O **Ledger** é um arquivo append-only (JSONL) que armazena todos os spans de uma criatura. É o "DNA" computável - a sequência completa de todas as ações, treinos, batalhas e evoluções.

### Estrutura

```
data/ledger/
├── battle.jsonl      # Todas as batalhas
├── training.jsonl    # Todas as sessões de treino
├── evolution.jsonl   # Todas as evoluções
└── span.jsonl        # Spans genéricos
```

### Por Que É Importante

- ✅ **Fonte da verdade**: Estado real da criatura
- ✅ **Replay**: Pode reconstruir qualquer momento
- ✅ **Auditoria**: Histórico completo e verificável
- ✅ **DNA Atômico**: Timeline visual da criatura

### Visualização

Ver: `03-UI-UX/DNA_TIMELINE.md` (em breve)

---

## 4. Event Bus

### O Que É

O **Event Bus** é um sistema de eventos construído sobre o Ledger. Quando um span é escrito, ele emite eventos que outros sistemas podem escutar.

### Como Funciona

```typescript
// Emitir evento (escrever no Ledger)
await ledger.append('battle', data)
// → Evento 'battle_complete' é emitido

// Escutar evento
eventBus.on('battle_complete', (data) => {
  // Atualizar UI
  // Gerar narrativa
  // Atualizar métricas
})
```

### Por Que É Importante

- ✅ **Reatividade**: UI atualiza automaticamente
- ✅ **Desacoplamento**: Sistemas não se conhecem
- ✅ **Auditável**: Eventos vêm do Ledger
- ✅ **Real-time**: WebSocket para frontend

### Referência

Ver: `01-ARQUITETURA/EVENT_BUS.md` (em breve)

---

## 5. ECS (Entity Component System)

### O Que É

**ECS** é um padrão arquitetural que separa:
- **Entities**: IDs únicos (ex: `creature_001`)
- **Components**: Dados puros (ex: `CreatureComponent`, `VisualComponent`)
- **Systems**: Lógica (ex: `BattleSystem`, `VisualSystem`)

### Estrutura

```typescript
// Component (Dados)
interface CreatureComponent {
  id: string
  level: number
  elo: number
  trust: number
}

// System (Lógica)
class BattleSystem {
  update(entities: Entity[]) {
    // Processa apenas entidades com CreatureComponent
  }
}
```

### Por Que É Importante

- ✅ **Separação**: Visual, Lógica e Narrativa independentes
- ✅ **Performance**: Sistemas processam apenas o necessário
- ✅ **Flexibilidade**: Fácil adicionar novos componentes
- ✅ **Data-Driven**: Dados definem comportamento

### Referência

Ver: `01-ARQUITETURA/ECS.md` (em breve)

---

## 6. Data-Driven Design

### O Que É

**Data-Driven Design** significa que conteúdo do jogo (diálogos, programas de treino, configurações) está em arquivos externos (YAML/JSON), não no código.

### Estrutura

```
data/
├── narrative/
│   └── dialogues/
│       └── professor-oak.yaml
├── training/
│   └── programs/
│       └── empathy-socratic.yaml
└── creatures/
    └── starters.yaml
```

### Exemplo

```yaml
# data/narrative/dialogues/professor-oak.yaml
celebrations:
  first_victory:
    content: "Incrível, Treinador! Sua primeira vitória!"
    emotion: "excited"
```

### Por Que É Importante

- ✅ **Iteração rápida**: Designers mudam sem código
- ✅ **Localização**: Fácil traduzir
- ✅ **Versionamento**: Git rastreia mudanças
- ✅ **Testes**: Fácil criar cenários

### Referência

Ver: `01-ARQUITETURA/DATA_DRIVEN.md` (em breve)

---

## 🔗 Como Eles Se Conectam

```
┌─────────────────┐
│   UI Action     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Endpoint   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Battle System  │─────▶│  Trajectory  │
│     (ECS)       │      │   Matching   │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│  Write to       │
│  Ledger         │
│  (JSON✯Atomic)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Event Bus      │
│  Emits Event    │
└────────┬────────┘
         │
         ├──▶ UI Updates (React)
         ├──▶ Narrative (Professor Oak)
         └──▶ Metrics (Prometheus)
```

---

## 📚 Próximos Passos

1. **[Visão Geral](../01-ARQUITETURA/VISAO_GERAL.md)** - Entender o sistema completo
2. **[Sistemas](../02-SISTEMAS/)** - Ver cada sistema em detalhe
3. **[Implementação](../04-IMPLEMENTACAO/)** - Guias práticos

---

**Agora você entende os conceitos fundamentais! 🎓**

