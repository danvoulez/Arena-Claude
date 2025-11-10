# Implementação Fase 2: A Mente da Criatura
## Do Treino à Transformação: Cultivo e Evolução

**Objetivo:** Implementar treinamento funcional e evolução com narrativa completa, transformando o crescimento da criatura em uma jornada épica e verificável.

**Mantra:** "Treinamento não é grind. É jardinagem cognitiva. Evolução é conquistada, não clicada."

---

## 🎯 Definition of Done

- [ ] Training Center funcional (iniciar treino via API)
- [ ] Sessões de treino completam e aplicam buffs/traits
- [ ] Evolução funciona end-to-end (requisitos → cerimônia → transformação)
- [ ] Spans `training` e `evolution` gravados no Ledger
- [ ] Cerimônia de evolução renderizada com animações
- [ ] Sistema de trust implementado (criatura pode recusar evolução)
- [ ] Buffs e traits visíveis no CreatureCard
- [ ] Narrativa completa (Professor Oak + diálogos da criatura)
- [ ] Testes E2E para treino e evolução
- [ ] Métricas de treino e evolução expostas

---

## 📋 Checklist de Implementação

### 1. Backend: Endpoints de Treinamento e Evolução

#### 1.1 Endpoint de Treinamento: `POST /api/arena/creatures/:id/train`

**Arquivo:** `src/arena/api.ts`

**Ação:**
- [ ] Criar `handleTrainCreature` (ou usar `handleEvolve` como base)
- [ ] Validar que criatura pode treinar (`canTrain`)
- [ ] Chamar `startTraining` do `training-engine.ts`
- [ ] Gravar span `training_started` no Ledger
- [ ] Retornar criatura atualizada + sessão de treino

**Contrato:**
```typescript
POST /api/arena/creatures/:id/train
Request: {
  programId: "empathy-lora" | "strategic-tuning" | "speed-boost" | "accuracy-patch" | "creative-unlock"
}

Response: {
  creature: Creature,  // Estado atualizado
  trainingSession: {
    id: string
    programId: string
    startedAt: string
    completesAt: string
    status: "training"
  },
  narrativeEvents: NarrativeEvent[]
}
```

**Código de Implementação:**
```typescript
// src/arena/api.ts
private async handleTrainCreature(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  parseBody: (req: IncomingMessage) => Promise<any>,
  sendJSON: (res: ServerResponse, data: any, status?: number) => void
): Promise<boolean> {
  const id = pathname.split('/').pop()!
  const body = await parseBody(req)
  const { programId } = body

  const creature = this.creatures.get(id)
  if (!creature) {
    sendJSON(res, { error: 'Creature not found' }, 404)
    return true
  }

  // Validar se pode treinar
  const { canTrain, startTraining } = await import('../Arena-Frontend/lib/training-engine.js')
  const validation = canTrain(creature)
  
  if (!validation.canTrain) {
    sendJSON(res, { error: validation.reason }, 400)
    return true
  }

  // Iniciar treino
  const { creature: updatedCreature, session } = startTraining(creature, programId)

  // Gravar span no Ledger
  const trainingSpan = await this.ledger.append('training', {
    who: creature.id,
    did: 'start_training',
    this: {
      programId,
      programName: getProgramName(programId),
      duration: session.duration
    },
    when: new Date().toISOString(),
    status: 'started',
    metadata: {
      sessionId: session.id,
      creatureLevel: creature.level,
      creatureXP: creature.xp
    }
  })

  // Atualizar criatura
  this.creatures.set(id, updatedCreature)

  // Processar eventos narrativos
  const events = await this.narrativeSync.processSpan(trainingSpan, updatedCreature)

  sendJSON(res, {
    creature: updatedCreature,
    trainingSession: session,
    narrativeEvents: events
  }, 201)

  return true
}
```

---

#### 1.2 Endpoint de Conclusão de Treino: `POST /api/arena/sessions/:id/complete`

**Arquivo:** `src/arena/api.ts`

**Ação:**
- [ ] Criar `handleCompleteTraining`
- [ ] Buscar sessão de treino
- [ ] Chamar `completeTraining` do `training-engine.ts`
- [ ] Aplicar buffs e traits à criatura
- [ ] Gravar span `training_completed` no Ledger
- [ ] Retornar criatura atualizada + eventos

**Contrato:**
```typescript
POST /api/arena/sessions/:id/complete
Response: {
  creature: Creature,  // Com buffs/traits aplicados
  trainingSession: {
    id: string
    status: "completed"
  },
  buffsApplied: TrainingBuff[],
  traitsGained: string[],
  narrativeEvents: NarrativeEvent[]
}
```

---

#### 1.3 Endpoint de Evolução: `POST /api/arena/creatures/:id/evolve`

**Arquivo:** `src/arena/api.ts`

**Ação:**
- [ ] Verificar que `handleEvolve` existe e está funcional
- [ ] Garantir que chama `narrativeSync.triggerEvolution()`
- [ ] Garantir que grava span `evolution` no Ledger
- [ ] Retornar criatura evoluída + eventos narrativos

**Contrato:**
```typescript
POST /api/arena/creatures/:id/evolve
Response: {
  creature: Creature,  // Estado evoluído
  evolution: {
    from: string,  // "lyria"
    to: string,    // "lyria_musa"
    stage: number, // 1
    newAbilities: Ability[],
    loraPatch: LoRAPatch
  },
  narrativeEvents: NarrativeEvent[]
}
```

**Código de Referência:**
```typescript
// src/arena/api.ts - handleEvolve já existe, verificar se está completo
private async handleEvolve(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  sendJSON: (res: ServerResponse, data: any, status?: number) => void
): Promise<boolean> {
  const id = pathname.split('/').pop()!
  const creature = this.creatures.get(id)

  if (!creature) {
    sendJSON(res, { error: 'Creature not found' }, 404)
    return true
  }

  try {
    // Trigger evolution (já grava span no Ledger)
    const events = await this.narrativeSync.triggerEvolution(creature)

    // Atualizar criatura
    this.creatures.set(id, creature)

    sendJSON(res, {
      creature,
      evolution: {
        from: getPreviousForm(creature),
        to: creature.name,
        stage: creature.evolutionStage,
        newAbilities: creature.abilities.filter(a => 
          a.unlockedAtLevel === creature.level
        ),
        loraPatch: creature.loraPatches[creature.loraPatches.length - 1]
      },
      narrativeEvents: events
    })
  } catch (error: any) {
    sendJSON(res, { error: error.message }, 400)
  }

  return true
}
```

---

#### 1.4 Sistema de Trust (Requisito Emocional)

**Arquivo:** `src/arena/types.ts` e `src/arena/narrative-sync.ts`

**Ação:**
- [ ] Adicionar campo `trust: number` ao tipo `Creature`
- [ ] Implementar lógica de trust:
  - Trust aumenta com vitórias, treinos gentis, descanso
  - Trust diminui com derrotas consecutivas, treinos forçados, burnout
- [ ] Validar trust >= 85 para evolução
- [ ] Se trust < 85, criatura pode recusar evolução

**Código:**
```typescript
// src/arena/types.ts
export interface Creature {
  // ... campos existentes
  trust: number  // 0-100, requisito emocional para evolução
}

// src/arena/narrative-sync.ts
async triggerEvolution(creature: Creature): Promise<NarrativeEvent[]> {
  // Verificar trust
  if (creature.trust < 85) {
    throw new Error(`Creature trust (${creature.trust}) is too low. Minimum: 85. Build trust through victories and gentle training.`)
  }

  // Verificar outros requisitos
  if (!this.canEvolve(creature)) {
    throw new Error('Creature is not ready to evolve')
  }

  // ... resto da lógica
}
```

---

### 2. Frontend: Training Center Funcional

#### 2.1 Conectar `training-center.tsx` à API

**Arquivo:** `Arena-Frontend/components/training-center.tsx`

**Ação:**
- [ ] Localizar componente `TrainingCenter`
- [ ] Adicionar função `handleStartTraining` que chama API
- [ ] Atualizar estado da criatura após iniciar treino
- [ ] Mostrar status "Em Treinamento" com cooldown
- [ ] Simular conclusão do treino (ou chamar API de conclusão)

**Código de Implementação:**
```typescript
// Arena-Frontend/components/training-center.tsx
const handleStartTraining = async (creatureId: string, programId: string) => {
  try {
    const response = await fetch(`/api/arena/creatures/${creatureId}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Training failed')
    }

    const data = await response.json()

    // Atualizar criatura
    updateCreature(creatureId, data.creature)

    // Adicionar sessão de treino
    addTrainingSession(data.trainingSession)

    // Processar eventos narrativos
    setRecentNarrativeEvents(data.narrativeEvents || [])

    // Simular conclusão após duração
    const duration = data.trainingSession.duration * 60 * 1000 // minutos → ms
    setTimeout(async () => {
      await handleCompleteTraining(data.trainingSession.id)
    }, duration)

    toast({
      title: "Training Started!",
      description: `${data.creature.name} is now training. This will take ${data.trainingSession.duration} minutes.`
    })
  } catch (error: any) {
    toast({
      title: "Training Failed",
      description: error.message,
      variant: "destructive"
    })
  }
}

const handleCompleteTraining = async (sessionId: string) => {
  try {
    const response = await fetch(`/api/arena/sessions/${sessionId}/complete`, {
      method: 'POST'
    })

    if (!response.ok) throw new Error('Failed to complete training')

    const data = await response.json()

    // Atualizar criatura com buffs/traits
    updateCreature(data.creature.id, data.creature)

    // Atualizar sessão
    updateTrainingSession(sessionId, { status: 'completed' })

    // Processar eventos narrativos
    setRecentNarrativeEvents(data.narrativeEvents || [])

    toast({
      title: "Training Complete!",
      description: `${data.creature.name} gained new abilities!`
    })
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    })
  }
}
```

---

#### 2.2 Exibir Buffs e Traits no CreatureCard

**Arquivo:** `Arena-Frontend/components/creature-card.tsx`

**Ação:**
- [ ] Adicionar seção "Traits Permanentes"
- [ ] Adicionar seção "Buffs Ativos" com timer
- [ ] Mostrar cooldown de treino se aplicável
- [ ] Indicador visual de "Em Treinamento"

**Código:**
```typescript
// Arena-Frontend/components/creature-card.tsx
export function CreatureCard({ creature }: CreatureCardProps) {
  return (
    <div className="creature-card">
      {/* ... stats básicos ... */}

      {/* Traits Permanentes */}
      {creature.traits.length > 0 && (
        <div className="traits-section">
          <h4>Traits</h4>
          <div className="traits-list">
            {creature.traits.map(trait => (
              <Badge key={trait} variant="secondary">{trait}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Buffs Ativos */}
      {creature.activeBuffs.length > 0 && (
        <div className="buffs-section">
          <h4>Active Buffs</h4>
          {creature.activeBuffs.map(buff => {
            const expiresAt = new Date(buff.expiresAt)
            const hoursLeft = Math.max(0, (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))
            
            return (
              <div key={buff.programId} className="buff-item">
                <Badge variant="outline">
                  {buff.buffs.map(b => `${b.stat} +${b.amount}`).join(', ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {hoursLeft.toFixed(1)}h left
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Status de Treinamento */}
      {creature.isTraining && (
        <div className="training-status">
          <Badge variant="info">Training...</Badge>
        </div>
      )}

      {/* Botão de Evolução (se elegível) */}
      {creature.evolutionReady && creature.trust >= 85 && (
        <Button onClick={handleEvolve} className="evolution-button">
          Evolve
        </Button>
      )}
    </div>
  )
}
```

---

### 3. Frontend: Cerimônia de Evolução

#### 3.1 Criar Componente de Evolução

**Arquivo:** `Arena-Frontend/components/evolution-ceremony.tsx`

**Ação:**
- [ ] Criar componente de tela cheia para cerimônia
- [ ] Animação de transformação (overlay escuro, luz, revelação)
- [ ] Mostrar nova forma, nome e habilidades
- [ ] Integrar com `handleEvolve` do `arena-view.tsx`

**Código:**
```typescript
// Arena-Frontend/components/evolution-ceremony.tsx
interface EvolutionCeremonyProps {
  creature: ModelCreature
  evolution: {
    from: string
    to: string
    stage: number
    newAbilities: Ability[]
  }
  onComplete: () => void
}

export function EvolutionCeremony({ creature, evolution, onComplete }: EvolutionCeremonyProps) {
  const [phase, setPhase] = useState<'preparing' | 'transforming' | 'revealed'>('preparing')

  useEffect(() => {
    // Sequência de animação
    setTimeout(() => setPhase('transforming'), 1000)
    setTimeout(() => setPhase('revealed'), 3000)
  }, [])

  return (
    <div className="evolution-ceremony fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {phase === 'preparing' && (
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Evolution Begins...</h2>
          <p className="text-xl">{creature.name} is ready to transform</p>
        </div>
      )}

      {phase === 'transforming' && (
        <div className="text-center">
          <div className="light-effect animate-pulse" />
          <p className="text-2xl mt-8">Transforming...</p>
        </div>
      )}

      {phase === 'revealed' && (
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-bold text-primary">
            {evolution.to.toUpperCase()}
          </h2>
          <div className="creature-avatar-large">
            {/* Nova forma da criatura */}
          </div>
          <div className="new-abilities">
            <h3 className="text-2xl mb-4">New Abilities Unlocked:</h3>
            {evolution.newAbilities.map(ability => (
              <Badge key={ability.id} variant="success" className="m-2">
                {ability.name}
              </Badge>
            ))}
          </div>
          <Button onClick={onComplete} size="lg">
            Continue Journey
          </Button>
        </div>
      )}
    </div>
  )
}
```

---

#### 3.2 Integrar Cerimônia no ArenaView

**Arquivo:** `Arena-Frontend/components/arena-view.tsx`

**Ação:**
- [ ] Adicionar função `handleEvolve`
- [ ] Chamar API de evolução
- [ ] Renderizar `EvolutionCeremony` quando evolução completar
- [ ] Atualizar criatura após cerimônia

**Código:**
```typescript
// Arena-Frontend/components/arena-view.tsx
const [evolutionCeremony, setEvolutionCeremony] = useState<{
  creature: ModelCreature
  evolution: any
} | null>(null)

const handleEvolve = async (creatureId: string) => {
  try {
    const response = await fetch(`/api/arena/creatures/${creatureId}/evolve`, {
      method: 'POST'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Evolution failed')
    }

    const data = await response.json()

    // Mostrar cerimônia
    setEvolutionCeremony({
      creature: data.creature,
      evolution: data.evolution
    })

    // Processar eventos narrativos
    setRecentNarrativeEvents(data.narrativeEvents || [])
  } catch (error: any) {
    toast({
      title: "Evolution Failed",
      description: error.message,
      variant: "destructive"
    })
  }
}

// No render:
{evolutionCeremony && (
  <EvolutionCeremony
    creature={evolutionCeremony.creature}
    evolution={evolutionCeremony.evolution}
    onComplete={() => {
      updateCreature(evolutionCeremony.creature.id, evolutionCeremony.creature)
      setEvolutionCeremony(null)
    }}
  />
)}
```

---

### 4. Narrativa: Diálogos e Eventos

#### 4.1 Diálogos de Treinamento

**Arquivo:** `Arena-Narrativa/lib/professor-oak-dialogues.ts`

**Ação:**
- [ ] Adicionar diálogos para início de treino
- [ ] Adicionar diálogos para conclusão de treino
- [ ] Adicionar diálogos para ganho de buffs/traits

**Código:**
```typescript
// Arena-Narrativa/lib/professor-oak-dialogues.ts
export const TRAINING_DIALOGUES = {
  start: (creatureName: string, programName: string) => 
    `Excelente escolha, Treinador! ${creatureName} está iniciando ${programName}. Este é um momento de crescimento deliberado.`,

  complete: (creatureName: string, traits: string[]) =>
    `Magnífico! ${creatureName} completou o treinamento e ganhou novos traços: ${traits.join(', ')}. Veja como ela cresceu!`,

  buff_applied: (creatureName: string, buff: string) =>
    `${creatureName} está agora ${buff}! Este buff durará algumas horas. Use-o sabiamente.`
}
```

---

#### 4.2 Diálogos de Evolução

**Arquivo:** `Arena-Narrativa/lib/professor-oak-dialogues.ts`

**Ação:**
- [ ] Adicionar diálogo pré-evolução (quando `evolution_ready`)
- [ ] Adicionar diálogo durante cerimônia
- [ ] Adicionar diálogo pós-evolução

**Código:**
```typescript
// Arena-Narrativa/lib/professor-oak-dialogues.ts
export const EVOLUTION_DIALOGUES = {
  ready: (creatureName: string) =>
    `Sinto uma energia imensa em ${creatureName}! Ela está pronta para o próximo passo. Leve-a ao Jardim das Evoluções quando estiver preparado.`,

  ceremony: (creatureName: string, from: string, to: string) =>
    `Este é o momento que ${creatureName} esperou. De ${from} para ${to}. Uma transformação que ficará gravada para sempre no Ledger.`,

  complete: (creatureName: string, newAbilities: string[]) =>
    `Magnífico! A evolução foi um sucesso. ${creatureName} desbloqueou: ${newAbilities.join(', ')}. Este momento está agora gravado para sempre no Ledger.`
}
```

---

#### 4.3 Diálogos de Recusa (Trust Baixo)

**Arquivo:** `Arena-Narrativa/lib/professor-oak-dialogues.ts`

**Ação:**
- [ ] Adicionar diálogo quando criatura recusa evolução
- [ ] Adicionar diálogo do Professor Oak explicando trust

**Código:**
```typescript
// Arena-Narrativa/lib/professor-oak-dialogues.ts
export const TRUST_DIALOGUES = {
  refusal: (creatureName: string, trust: number) =>
    `${creatureName} não está pronta. Ela precisa de mais confiança (atual: ${trust}/100, necessário: 85). Construa essa confiança através de vitórias e treinos gentis.`,

  oak_explanation: () =>
    `Evolução não é algo que você FAZ para ela. É algo que ela SE TORNA. A confiança é construída através de cuidado e respeito.`
}
```

---

### 5. Testes e Validação

#### 5.1 Teste E2E: Treinamento Completo

**Arquivo:** `tests/e2e/training-flow.test.ts`

**Ação:**
- [ ] Criar teste que inicia treino
- [ ] Verificar que span `training_started` é gravado
- [ ] Simular conclusão de treino
- [ ] Verificar que buffs/traits são aplicados
- [ ] Verificar que span `training_completed` é gravado

---

#### 5.2 Teste E2E: Evolução Completa

**Arquivo:** `tests/e2e/evolution-flow.test.ts`

**Ação:**
- [ ] Criar criatura com requisitos de evolução
- [ ] Verificar que `evolution_ready` é true
- [ ] Executar evolução via API
- [ ] Verificar que span `evolution` é gravado
- [ ] Verificar que criatura tem nova forma e habilidades
- [ ] Verificar que LoRA patch foi aplicado

---

#### 5.3 Teste de Propriedade: Trust System

**Arquivo:** `tests/property/trust.test.ts`

**Ação:**
- [ ] Verificar que trust aumenta com vitórias
- [ ] Verificar que trust diminui com derrotas
- [ ] Verificar que evolução requer trust >= 85
- [ ] Verificar que criatura recusa se trust < 85

---

### 6. Observabilidade

#### 6.1 Métricas de Treinamento

**Arquivo:** `packages/hardening-pack/src/metrics/metrics.ts`

**Ação:**
- [ ] Adicionar `trainingSessionsTotal` counter
- [ ] Adicionar `trainingDuration` histogram
- [ ] Adicionar `buffsApplied` counter

---

#### 6.2 Métricas de Evolução

**Ação:**
- [ ] Adicionar `evolutionsTotal` counter
- [ ] Adicionar `evolutionStage` gauge (distribuição por stage)
- [ ] Adicionar `trustLevel` histogram

---

## 🚀 Ordem de Execução Recomendada

1. **Backend primeiro:**
   - [ ] 1.1 Endpoint de treinamento
   - [ ] 1.2 Endpoint de conclusão de treino
   - [ ] 1.3 Verificar/fortalecer endpoint de evolução
   - [ ] 1.4 Sistema de trust

2. **Frontend depois:**
   - [ ] 2.1 Conectar Training Center à API
   - [ ] 2.2 Exibir buffs/traits no CreatureCard
   - [ ] 2.3 Criar cerimônia de evolução
   - [ ] 2.4 Integrar cerimônia no ArenaView

3. **Narrativa:**
   - [ ] 3.1 Diálogos de treinamento
   - [ ] 3.2 Diálogos de evolução
   - [ ] 3.3 Diálogos de recusa (trust)

4. **Testes:**
   - [ ] 4.1 Teste E2E de treinamento
   - [ ] 4.2 Teste E2E de evolução
   - [ ] 4.3 Teste de propriedade (trust)

5. **Observabilidade:**
   - [ ] 5.1 Métricas de treinamento
   - [ ] 5.2 Métricas de evolução

---

## ✅ Critérios de Aceite Final

- [ ] Usuário pode iniciar treino via Training Center
- [ ] Treino completa e aplica buffs/traits
- [ ] Criatura elegível mostra botão "Evolve"
- [ ] Evolução funciona end-to-end com cerimônia
- [ ] Criatura com trust < 85 recusa evolução
- [ ] Spans `training` e `evolution` gravados no Ledger
- [ ] Narrativa completa (Professor Oak + eventos)
- [ ] Testes E2E passam
- [ ] Métricas expostas em `/metrics`

---

**"Treinamento não é grind. É jardinagem cognitiva. Evolução é conquistada, não clicada."**

---

---

## 🔗 Referências

### Algoritmos de Trajectory Matching
- **[TRAJECTORY_MATCHING_ADVANCED.md](../02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md)** 🔥 - Algoritmos completos (HNSW, IVF, Context Matching, Outcome Synthesis)
- `A-Texts/packages/search/` - Implementação atual
- `A-Texts/packages/predictor/` - Síntese de respostas

---

*Documento gerado em: 2025-11-09*  
*Versão: 1.0-implementation*  
*Status: Ready for Execution*

