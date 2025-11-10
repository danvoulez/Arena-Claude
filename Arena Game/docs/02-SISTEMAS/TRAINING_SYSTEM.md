# 🏋️ Sistema de Treinamento - ArenaLab

**Status**: ✅ Implementado  
**Data**: 2025-11-10

---

## 📋 Visão Geral

O sistema de treinamento é baseado em **curadoria de dados**. Não é backpropagation ou fine-tuning tradicional. É a seleção estratégica de spans de alta qualidade para expandir o dataset da criatura.

---

## 🔄 Fluxo de Treinamento

### 1. Início do Treinamento

**Trigger**: Usuário clica "Start Training" no Training Center

**API**: `POST /api/arena/creatures/:id/train`

**Request:**
```json
{
  "programId": "empathy_socratic"
}
```

**Programas Disponíveis:**
- `empathy_socratic` - Sessão de Empatia Socrática (8h)
- `logical_rigor` - Rigor Lógico (6h)
- `creative_expression` - Expressão Criativa (10h)
- `analytical_depth` - Profundidade Analítica (12h)

---

### 2. Criação da Sessão (Backend)

**Arquivo**: `src/arena/api.ts` - `handleTrainCreature`

**Processo:**
1. **Valida criatura** (existe, não está em cooldown)
2. **Carrega programa** de treinamento
3. **Cria sessão** com duração e buffs
4. **Grava span** `training_started`
5. **Retorna sessão** com ID e duração

**Código:**
```typescript
async handleTrainCreature(
  creatureId: string,
  programId: string
): Promise<TrainingSession> {
  const creature = this.creatures.get(creatureId);
  if (!creature) throw new Error('Creature not found');
  
  // Verifica cooldown
  if (creature.trainingCooldownUntil && 
      new Date(creature.trainingCooldownUntil) > new Date()) {
    throw new Error('Creature is on cooldown');
  }
  
  // Carrega programa
  const program = getTrainingProgramInfo(programId);
  
  // Cria sessão
  const sessionId = `session_${Date.now()}`;
  const session: TrainingSession = {
    id: sessionId,
    creatureId,
    programId,
    startedAt: new Date().toISOString(),
    durationHours: program.duration_hours,
    status: 'in_progress'
  };
  
  // Grava span
  await this.ledger.append('training', {
    who: creatureId,
    did: `training_started_${programId}`,
    this: { programId, durationHours: program.duration_hours },
    when: new Date().toISOString(),
    status: 'in_progress',
    metadata: { sessionId }
  });
  
  // Armazena sessão
  this.trainingSessions.set(sessionId, session);
  
  return session;
}
```

---

### 3. Completar Treinamento

**Trigger**: Após duração simulada (ou real)

**API**: `POST /api/arena/sessions/:id/complete`

**Processo:**
1. **Valida sessão** (existe, está em progresso)
2. **Carrega programa** de treinamento
3. **Aplica buffs** temporários
4. **Aplica traits** permanentes
5. **Adiciona spans ao dataset** da criatura
6. **Atualiza trust** (+2)
7. **Define cooldown** (24h)
8. **Grava span** `training_completed`
9. **Gera eventos narrativos**

**Código:**
```typescript
async handleCompleteTraining(
  sessionId: string
): Promise<{ creature: Creature; narrativeEvents: NarrativeEvent[] }> {
  const session = this.trainingSessions.get(sessionId);
  if (!session || session.status !== 'in_progress') {
    throw new Error('Invalid session');
  }
  
  const creature = this.creatures.get(session.creatureId);
  const program = getTrainingProgramInfo(session.programId);
  
  // Aplica buffs
  const activeBuffs = program.buffs.map(buff => ({
    ...buff,
    expiresAt: new Date(Date.now() + buff.duration_hours * 3600000).toISOString()
  }));
  
  // Aplica traits
  const newTraits = [...(creature.traits || []), ...program.traits];
  
  // Adiciona spans ao dataset (curadoria)
  // Em produção, isso seria spans de alta qualidade relacionados ao programa
  const curatedSpans = await this.curateSpansForProgram(creature, program);
  creature.dataset = [...(creature.dataset || []), ...curatedSpans];
  
  // Atualiza trust
  creature.trust = Math.min(100, creature.trust + 2);
  
  // Define cooldown
  creature.trainingCooldownUntil = new Date(Date.now() + 24 * 3600000).toISOString();
  
  // Atualiza criatura
  creature.activeBuffs = activeBuffs;
  creature.traits = newTraits;
  creature.updatedAt = new Date().toISOString();
  this.creatures.set(creature.id, creature);
  
  // Grava span
  await this.ledger.append('training', {
    who: creature.id,
    did: `training_completed_${session.programId}`,
    this: {
      programId: session.programId,
      buffsApplied: program.buffs.length,
      traitsGained: program.traits.length,
      spansAdded: curatedSpans.length
    },
    when: new Date().toISOString(),
    status: 'completed',
    metadata: { sessionId }
  });
  
  // Gera eventos narrativos
  const events = await this.narrativeSync.processSpan(trainingSpan, creature);
  
  return { creature, narrativeEvents: events };
}
```

---

### 4. Programas de Treinamento

**Estrutura YAML** (futuro: data-driven):
```yaml
name: "Sessão de Empatia Socrática"
duration_hours: 8
buffs:
  - stat: "charisma"
    value: 15
    duration_hours: 24
traits:
  - name: "Empathic Listener"
    permanent: true
    description: "Melhora respostas empáticas em 20%"
status_effects:
  - name: "energized"
    duration_hours: 12
cooldown_hours: 24
```

---

### 5. Curadoria de Dados

**O Que É:**
- Seleção de spans de alta qualidade relacionados ao programa
- Adicionados ao dataset da criatura
- Usados para trajectory matching futuro

**Como Funciona:**
1. Busca spans no Ledger relacionados ao tema do programa
2. Filtra por qualidade (Quality Meter 5D > 80)
3. Seleciona os melhores exemplos
4. Adiciona ao dataset da criatura

---

### 6. Buffs e Traits

**Buffs** (Temporários):
- Aumentam stats por duração limitada
- Exemplos: +15 charisma por 24h, +10 intelligence por 12h
- Expiração automática

**Traits** (Permanentes):
- Habilidades permanentes da criatura
- Exemplos: "Empathic Listener", "Logical Rigor", "Creative Spark"
- Afetam comportamento e respostas

---

### 7. Trust System

**Atualização:**
- **Treinamento completo**: +2 trust
- **Trust máximo**: 100
- **Trust mínimo**: 0

**Impacto:**
- Trust < 30: Criatura pode desobedecer
- Trust > 90: Criatura dá 110% de esforço
- Trust ≥ 85: Requisito para evolução

---

## 🎨 UI (Frontend)

### Componente Principal

**Arquivo**: `Arena-Frontend/components/training-center.tsx`

**Fluxo:**
1. Usuário seleciona criatura
2. Vê programas disponíveis
3. Seleciona programa
4. Clica "Start Training"
5. Faz `fetch()` para `POST /api/arena/creatures/:id/train`
6. Mostra progresso (simulado ou real)
7. Após duração, chama `POST /api/arena/sessions/:id/complete`
8. Mostra buffs/traits ganhos
9. Processa narrative events

---

## 📊 Métricas

**Prometheus:**
- `diamond_training_sessions_total` - Total de sessões
- `diamond_training_duration_seconds` - Duração média
- `diamond_buffs_applied_total` - Total de buffs aplicados

---

## 🔗 Referências

- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_TREINO_IA.md)**
- **[Trust System](TRUST_SYSTEM.md)**
- **[Evolution System](EVOLUTION_SYSTEM.md)**
- **[Narrative System](NARRATIVE_SYSTEM.md)**

---

**Status**: ✅ Sistema completo e documentado  
**Última atualização**: 2025-11-10


