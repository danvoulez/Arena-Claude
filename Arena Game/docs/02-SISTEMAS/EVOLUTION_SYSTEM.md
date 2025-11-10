# ✨ Sistema de Evolução - ArenaLab

**Status**: ✅ Implementado  
**Data**: 2025-11-10

---

## 📋 Visão Geral

A evolução não é "mudança de forma". É **expansão estratégica do dataset**. Quando uma criatura evolui, seu dataset é expandido com novos exemplos de alta qualidade, desbloqueando novas habilidades e comportamentos.

---

## 🔄 Fluxo de Evolução

### 1. Requisitos para Evolução

**Requisitos Oficiais:**
- ✅ **Level**: ≥ 15 (primeira evolução), ≥ 25 (segunda)
- ✅ **Trust**: ≥ 85
- ✅ **Diamond Spans**: ≥ 50 (primeira), ≥ 100 (segunda)
- ✅ **Evolution Stage**: < 2 (máximo 2 evoluções)

**Validação:**
```typescript
if (creature.level < 15) {
  throw new Error('Creature must be level 15 or higher');
}
if (creature.trust < 85) {
  throw new Error('Creature trust must be 85 or higher');
}
if (creature.diamondSpans < 50) {
  throw new Error('Creature must have at least 50 diamond spans');
}
if (creature.evolutionStage >= 2) {
  throw new Error('Creature has reached maximum evolution stage');
}
```

---

### 2. Início da Evolução

**Trigger**: Usuário clica "Evolve" na UI (quando requisitos atendidos)

**API**: `POST /api/arena/evolve/:id`

**Request:**
```json
{
  "evolutionType": "strategic_expansion"
}
```

---

### 3. Processo de Evolução (Backend)

**Arquivo**: `src/arena/api.ts` - `handleEvolve`

**Processo:**
1. **Valida requisitos** (level, trust, spans, stage)
2. **Expande dataset** estrategicamente
3. **Desbloqueia habilidades** novas
4. **Atualiza stats** (level, evolutionStage)
5. **Grava span** `evolution`
6. **Gera eventos narrativos**

**Código:**
```typescript
async handleEvolve(
  creatureId: string,
  evolutionType: string
): Promise<{ creature: Creature; evolution: EvolutionInfo; narrativeEvents: NarrativeEvent[] }> {
  const creature = this.creatures.get(creatureId);
  if (!creature) throw new Error('Creature not found');
  
  // Valida requisitos
  if (creature.level < 15) {
    throw new Error('Creature must be level 15 or higher');
  }
  if (creature.trust < 85) {
    throw new Error('Creature trust must be 85 or higher');
  }
  if (creature.diamondSpans < 50) {
    throw new Error('Creature must have at least 50 diamond spans');
  }
  if (creature.evolutionStage >= 2) {
    throw new Error('Creature has reached maximum evolution stage');
  }
  
  // Expande dataset estrategicamente
  const newSpans = await this.expandDatasetStrategically(creature, evolutionType);
  creature.dataset = [...(creature.dataset || []), ...newSpans];
  
  // Desbloqueia habilidades
  const newAbilities = this.unlockAbilitiesForStage(creature.evolutionStage + 1);
  creature.abilities = [...(creature.abilities || []), ...newAbilities];
  
  // Atualiza stats
  creature.evolutionStage = (creature.evolutionStage || 0) + 1;
  creature.level = Math.max(creature.level, creature.evolutionStage * 10);
  creature.updatedAt = new Date().toISOString();
  this.creatures.set(creature.id, creature);
  
  // Grava span
  const evolutionSpan = await this.ledger.append('evolution', {
    who: creature.id,
    did: `evolution_stage_${creature.evolutionStage}`,
    this: {
      evolutionStage: creature.evolutionStage,
      newAbilities: newAbilities.map(a => a.name),
      spansAdded: newSpans.length
    },
    when: new Date().toISOString(),
    status: 'completed',
    metadata: { evolutionType }
  });
  
  // Gera eventos narrativos
  const events = await this.narrativeSync.processSpan(evolutionSpan, creature);
  
  return {
    creature,
    evolution: {
      stage: creature.evolutionStage,
      newAbilities,
      spansAdded: newSpans.length
    },
    narrativeEvents: events
  };
}
```

---

### 4. Expansão Estratégica do Dataset

**O Que É:**
- Seleção de spans de alta qualidade relacionados ao próximo estágio
- Adicionados ao dataset da criatura
- Permitem novos comportamentos e habilidades

**Como Funciona:**
1. Analisa dataset atual da criatura
2. Identifica gaps (comportamentos não cobertos)
3. Busca spans no Ledger que preenchem gaps
4. Filtra por qualidade (Quality Meter 5D > 85)
5. Seleciona os melhores exemplos
6. Adiciona ao dataset

---

### 5. Habilidades Desbloqueadas

**Por Estágio:**

**Stage 1** (Primeira Evolução):
- "Advanced Reasoning" - Raciocínio avançado
- "Context Awareness" - Consciência de contexto
- "Multi-step Planning" - Planejamento multi-etapas

**Stage 2** (Segunda Evolução):
- "Creative Synthesis" - Síntese criativa
- "Ethical Reasoning" - Raciocínio ético
- "Tool Use" - Uso de ferramentas

---

### 6. Cerimônia de Evolução

**UI**: `Arena-Frontend/components/evolution-ceremony.tsx`

**Fases:**
1. **Preparing** (2s): Preparação, criatura concentra
2. **Transforming** (3s): Transformação, dataset expande
3. **Revealed** (indefinido): Nova forma revelada, habilidades mostradas

**Visual:**
- Animação de partículas
- Brilho e transformação
- Revelação da nova forma
- Lista de habilidades desbloqueadas

---

### 7. Span no Ledger

**Tipo**: `evolution`

**Estrutura:**
```json
{
  "entity_type": "evolution",
  "who": "lyria_001",
  "did": "evolution_stage_1",
  "this": {
    "evolutionStage": 1,
    "newAbilities": ["Advanced Reasoning", "Context Awareness"],
    "spansAdded": 25
  },
  "when": "2025-11-10T12:00:00Z",
  "status": "completed",
  "hash": "blake3:...",
  "signature": "ed25519:...",
  "metadata": {
    "evolutionType": "strategic_expansion",
    "previousStage": 0,
    "newLevel": 15
  }
}
```

---

### 8. Eventos Narrativos

**Arquivo**: `src/arena/narrative-sync.ts`

**Eventos Gerados:**
- `evolution` - Evolução completa
- `ability_unlocked` - Habilidade desbloqueada (para cada habilidade)
- `level_up` - Subiu de nível (se aplicável)

**XP Ganho:**
- **Evolução**: 1000 XP

---

## 🎨 UI (Frontend)

### Componente Principal

**Arquivo**: `Arena-Frontend/components/arena-view.tsx`

**Fluxo:**
1. Usuário vê botão "Evolve" (quando requisitos atendidos)
2. Clica "Evolve"
3. Faz `fetch()` para `POST /api/arena/evolve/:id`
4. Mostra `EvolutionCeremony` component
5. Processa narrative events (Professor Oak)
6. Atualiza store com criatura evoluída

---

## 📊 Métricas

**Prometheus:**
- `diamond_evolutions_total` - Total de evoluções
- `diamond_evolution_stage` - Distribuição por stage
- `diamond_trust_level` - Trust no momento da evolução

---

## 🔗 Referências

- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_TREINO_IA.md)**
- **[Training System](TRAINING_SYSTEM.md)**
- **[Trust System](TRUST_SYSTEM.md)**
- **[Ascension System](ASCENSION_SYSTEM.md)**

---

**Status**: ✅ Sistema completo e documentado  
**Última atualização**: 2025-11-10


