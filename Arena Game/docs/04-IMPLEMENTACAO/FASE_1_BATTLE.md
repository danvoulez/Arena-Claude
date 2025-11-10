# Implementação Fase 1: Primeiro Duelo Vivo
## Unindo as Pontas: UI ↔ Backend ↔ Ledger ↔ Narrativa

**Objetivo:** Fazer um duelo funcionar de ponta a ponta, com UI refletindo o Ledger, narrativa automática e spans auditáveis.

**Mantra:** "UI reflete o Ledger. Narrativa é automática. Todo PR deixa rastro."

---

## 🎯 Definition of Done

- [ ] Batalha funciona end-to-end (UI → API → Ledger → UI)
- [ ] Span `battle` gravado com todos os metadados
- [ ] Estado final das criaturas retornado pela API
- [ ] `NarrativeEvent[]` gerado e renderizado
- [ ] Teste e2e passa
- [ ] Métricas expostas em `/metrics`
- [ ] P95 latency ≤ 2.5s (simulation)
- [ ] 100% das batalhas gravam span no Ledger

---

## 📋 Checklist de Implementação

### 1. Backend: Endpoint de Batalha Canônico

#### 1.1 Garantir `server.hardened.ts` é o único servidor

**Arquivo:** `src/server.hardened.ts`

**Ação:**
- [ ] Verificar que `server.hardened.ts` existe e está funcional
- [ ] Se `src/server/index.ts` existir, marcá-lo como `DEPRECATED` ou removê-lo
- [ ] Atualizar `package.json` scripts para usar `server.hardened.ts`
- [ ] Testar: `npm run server` inicia sem erros

**Código de Referência:**
```typescript
// src/server.hardened.ts deve ter:
import { mountHardening } from '@hardening-pack/server-plugin'
import express from 'express'

const app = express()
mountHardening(app, { base: '/api' })
// ... resto do servidor
```

---

#### 1.2 Fortalecer `POST /api/arena/battle`

**Arquivo:** `src/arena/api.ts`

**Ação:**
- [ ] Localizar função `handleBattle` (ou criar se não existir)
- [ ] Garantir que ela chama `BattleRunner.executeBattle()`
- [ ] Garantir que grava span `battle` no Ledger
- [ ] Garantir que chama `NarrativeSync.processSpan()` para ambas criaturas
- [ ] Retornar resposta completa conforme contrato

**Contrato Obrigatório:**
```typescript
POST /api/arena/battle
Request: {
  creatureAId: string
  creatureBId: string
  prompt: string
}

Response: {
  battleResult: {
    battleId: number        // Seq no Ledger
    winner: "A" | "B" | "draw"
    responseA: string
    responseB: string
    qualityA: QualityMetrics
    qualityB: QualityMetrics
    metrics: {
      latencyA: number
      latencyB: number
      tokensA: number
      tokensB: number
      costA: number
      costB: number
    }
    eloChanges: {
      creatureA: number
      creatureB: number
    }
  }
  updatedCreatureA: Creature  // Estado final completo
  updatedCreatureB: Creature
  narrativeEvents: {
    creatureA: NarrativeEvent[]
    creatureB: NarrativeEvent[]
  }
}
```

**Código de Implementação:**
```typescript
// src/arena/api.ts
async handleBattle(req: Request, res: Response) {
  try {
    const { creatureAId, creatureBId, prompt } = req.body
    
    // 1. Buscar criaturas
    const creatureA = this.getCreature(creatureAId)
    const creatureB = this.getCreature(creatureBId)
    
    if (!creatureA || !creatureB) {
      return res.status(404).json({ error: 'Creature not found' })
    }
    
    // 2. Executar batalha (grava span automaticamente)
    const result = await this.battleRunner.executeBattle({
      creatureA,
      creatureB,
      prompt
    })
    
    // 3. Processar narrativa para ambas criaturas
    const eventsA = await this.narrativeSync.processSpan(
      result.span,
      creatureA
    )
    const eventsB = await this.narrativeSync.processSpan(
      result.span,
      creatureB
    )
    
    // 4. Atualizar estado das criaturas
    this.updateCreature(creatureA)
    this.updateCreature(creatureB)
    
    // 5. Retornar resposta completa
    res.json({
      battleResult: {
        battleId: result.span.seq,
        winner: result.winner,
        responseA: result.responseA,
        responseB: result.responseB,
        qualityA: result.qualityA,
        qualityB: result.qualityB,
        metrics: result.metrics,
        eloChanges: result.eloChanges
      },
      updatedCreatureA: creatureA,
      updatedCreatureB: creatureB,
      narrativeEvents: {
        creatureA: eventsA,
        creatureB: eventsB
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

---

#### 1.3 Garantir `BattleRunner` grava span no Ledger

**Arquivo:** `src/arena/battle-runner.ts`

**Ação:**
- [ ] Verificar que `executeBattle()` grava span no Ledger
- [ ] Garantir que span tem `traceId` único
- [ ] Garantir que span tem todos os metadados necessários

**Span Obrigatório:**
```typescript
{
  type: "battle",
  who: "battle_runner",
  did: "EXECUTE_BATTLE",
  this: {
    creatureAId: string
    creatureBId: string
    prompt: string
    responseA: string
    responseB: string
    winner: "A" | "B" | "draw"
    qualityA: QualityMetrics
    qualityB: QualityMetrics
    eloChanges: { creatureA: number, creatureB: number }
  },
  when: string,  // ISO timestamp
  status: "completed",
  metadata: {
    traceId: string,  // ÚNICO para esta batalha
    latencyA: number
    latencyB: number
    tokensA: number
    tokensB: number
    costA: number
    costB: number
  },
  hash: string,  // BLAKE3
  signature?: string  // Ed25519 (quando DV25-Seal ativo)
}
```

**Código de Referência:**
```typescript
// src/arena/battle-runner.ts
async executeBattle({ creatureA, creatureB, prompt }) {
  // ... lógica de batalha ...
  
  // Gerar traceId único
  const traceId = `battle_${Date.now()}_${Math.random().toString(36)}`
  
  // Gravar span no Ledger
  const span = await this.ledger.append('battle', {
    type: 'battle',
    who: 'battle_runner',
    did: 'EXECUTE_BATTLE',
    this: {
      creatureAId: creatureA.id,
      creatureBId: creatureB.id,
      prompt,
      responseA,
      responseB,
      winner,
      qualityA,
      qualityB,
      eloChanges
    },
    when: new Date().toISOString(),
    status: 'completed',
    metadata: {
      traceId,
      latencyA,
      latencyB,
      tokensA,
      tokensB,
      costA,
      costB
    }
  })
  
  return {
    span,
    winner,
    responseA,
    responseB,
    qualityA,
    qualityB,
    metrics: { latencyA, latencyB, tokensA, tokensB, costA, costB },
    eloChanges
  }
}
```

---

#### 1.4 Garantir `NarrativeSync` gera eventos

**Arquivo:** `src/arena/narrative-sync.ts`

**Ação:**
- [ ] Verificar que `processSpan()` existe e funciona
- [ ] Garantir que calcula XP corretamente
- [ ] Garantir que detecta level_up
- [ ] Garantir que retorna `NarrativeEvent[]`

**Eventos Obrigatórios:**
```typescript
type NarrativeEvent = 
  | { type: 'xp_gained', data: { amount: number, source: string } }
  | { type: 'level_up', data: { newLevel: number, abilitiesUnlocked: string[] } }
  | { type: 'first_victory', data: {} }
  | { type: 'burnout', data: { stamina: number } }
  | { type: 'evolution_ready', data: { stage: number } }
```

**Código de Referência:**
```typescript
// src/arena/narrative-sync.ts
async processSpan(span: Span, creature: Creature): Promise<NarrativeEvent[]> {
  const events: NarrativeEvent[] = []
  
  // Calcular XP ganho
  if (span.type === 'battle') {
    const xpGained = this.calculateXP(span, creature)
    creature.xp += xpGained
    events.push({
      type: 'xp_gained',
      data: { amount: xpGained, source: 'battle' }
    })
    
    // Verificar level up
    const oldLevel = creature.level
    creature.level = this.calculateLevel(creature.xp)
    
    if (creature.level > oldLevel) {
      events.push({
        type: 'level_up',
        data: {
          newLevel: creature.level,
          abilitiesUnlocked: this.getUnlockedAbilities(creature.level)
        }
      })
    }
    
    // Verificar primeira vitória
    if (span.this.winner === creature.id && creature.wins === 0) {
      events.push({ type: 'first_victory', data: {} })
    }
    
    // Verificar burnout (stamina baixa)
    if (creature.stamina < 20) {
      events.push({ type: 'burnout', data: { stamina: creature.stamina } })
    }
    
    // Verificar elegibilidade para evolução
    if (this.canEvolve(creature)) {
      events.push({
        type: 'evolution_ready',
        data: { stage: this.getEvolutionStage(creature) }
      })
    }
  }
  
  return events
}
```

---

### 2. Frontend: UI Stateless (Reflete Ledger)

#### 2.1 Remover simulação do `battle-engine.ts`

**Arquivo:** `Arena-Frontend/lib/battle-engine.ts`

**Ação:**
- [ ] **DELETAR** toda lógica de `setTimeout` e `Math.random()`
- [ ] **DELETAR** função `executeBattle` local (se existir)
- [ ] Manter apenas tipos/interfaces se necessário
- [ ] Ou deletar arquivo completamente se não for mais usado

**Antes (DELETAR):**
```typescript
// ❌ DELETAR ISSO
export async function executeBattle(creatureA, creatureB, prompt) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const winner = Math.random() > 0.5 ? 'A' : 'B'
      resolve({ winner, ... })
    }, 2000)
  })
}
```

**Depois:**
```typescript
// ✅ Arquivo pode ser deletado ou vazio
// Toda lógica de batalha vem da API
```

---

#### 2.2 Conectar `arena-view.tsx` à API real

**Arquivo:** `Arena-Frontend/components/arena-view.tsx`

**Ação:**
- [ ] Localizar função `handleStartBattle` (ou criar)
- [ ] Substituir simulação por chamada real à API
- [ ] Atualizar estado das criaturas com resposta da API
- [ ] Renderizar eventos narrativos

**Código de Implementação:**
```typescript
// Arena-Frontend/components/arena-view.tsx
const handleStartBattle = async () => {
  if (!selectedCreatureA || !selectedCreatureB || !battlePrompt) {
    toast.error('Selecione duas criaturas e digite um prompt')
    return
  }
  
  setIsGenerating(true)
  
  try {
    // Chamada real à API
    const response = await fetch('/api/arena/battle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatureAId: selectedCreatureA.id,
        creatureBId: selectedCreatureB.id,
        prompt: battlePrompt
      })
    })
    
    if (!response.ok) {
      throw new Error('Battle failed')
    }
    
    const data = await response.json()
    
    // Atualizar estado APENAS com dados da API
    updateCreature(data.updatedCreatureA.id, data.updatedCreatureA)
    updateCreature(data.updatedCreatureB.id, data.updatedCreatureB)
    
    // Adicionar resultado da batalha
    addDuelRecord({
      battleId: data.battleResult.battleId,
      winner: data.battleResult.winner,
      creatureA: data.updatedCreatureA,
      creatureB: data.updatedCreatureB,
      prompt: battlePrompt
    })
    
    // Renderizar eventos narrativos
    data.narrativeEvents.creatureA.forEach(event => {
      handleNarrativeEvent(event, data.updatedCreatureA)
    })
    data.narrativeEvents.creatureB.forEach(event => {
      handleNarrativeEvent(event, data.updatedCreatureB)
    })
    
    // Limpar prompt
    setBattlePrompt('')
    
  } catch (error) {
    toast.error(`Batalha falhou: ${error.message}`)
  } finally {
    setIsGenerating(false)
  }
}

// Função auxiliar para eventos narrativos
const handleNarrativeEvent = (event: NarrativeEvent, creature: Creature) => {
  switch (event.type) {
    case 'level_up':
      addOakMessage({
        type: 'celebration',
        message: `Incrível! ${creature.name} subiu para o nível ${event.data.newLevel}!`,
        creature: creature
      })
      // Disparar animação de level up
      triggerLevelUpAnimation(creature.id)
      break
      
    case 'first_victory':
      addOakMessage({
        type: 'celebration',
        message: `Parabéns! ${creature.name} conquistou sua primeira vitória!`,
        creature: creature
      })
      break
      
    case 'xp_gained':
      // Animação sutil de XP ganho
      triggerXPGainAnimation(creature.id, event.data.amount)
      break
      
    case 'burnout':
      addOakMessage({
        type: 'warning',
        message: `${creature.name} está exausto! Considere descansar.`,
        creature: creature
      })
      break
      
    case 'evolution_ready':
      addOakMessage({
        type: 'info',
        message: `${creature.name} está pronto para evoluir!`,
        creature: creature
      })
      // Mostrar botão "Evolve" no CreatureCard
      setEvolutionReady(creature.id, true)
      break
  }
}
```

---

#### 2.3 Garantir `CreatureCard` reflete estado da API

**Arquivo:** `Arena-Frontend/components/creature-card.tsx`

**Ação:**
- [ ] Verificar que componente recebe `creature` como prop
- [ ] Garantir que renderiza HP, XP, Level do estado recebido
- [ ] Remover qualquer cálculo de estado interno
- [ ] Adicionar animações sutis para mudanças de estado

**Código de Referência:**
```typescript
// Arena-Frontend/components/creature-card.tsx
interface CreatureCardProps {
  creature: Creature  // Estado completo vindo da API
  onSelect?: () => void
}

export function CreatureCard({ creature, onSelect }: CreatureCardProps) {
  // ✅ NÃO calcular estado aqui
  // ✅ Apenas renderizar o que recebeu
  
  return (
    <div className="creature-card">
      <h3>{creature.name}</h3>
      <p>Nível {creature.level}</p>
      
      {/* Barras de progresso refletem estado real */}
      <HPBar current={creature.hp} max={creature.maxHp} />
      <XPBar current={creature.xp} max={creature.xpToNextLevel} />
      <StaminaBar current={creature.stamina} max={100} />
      
      {/* Status effects visuais */}
      {creature.statusEffects?.map(effect => (
        <StatusBadge key={effect.type} effect={effect} />
      ))}
      
      {/* Botão de evolução (se elegível) */}
      {creature.evolutionReady && (
        <button onClick={handleEvolve}>Evoluir</button>
      )}
    </div>
  )
}
```

---

#### 2.4 Garantir `useArenaStore` é apenas cache

**Arquivo:** `Arena-Frontend/lib/store.ts`

**Ação:**
- [ ] Verificar que store não calcula estado
- [ ] Garantir que `updateCreature` apenas atualiza cache
- [ ] Remover lógica de cálculo de XP/HP/Level
- [ ] Store deve ser reativo ao estado da API

**Código de Referência:**
```typescript
// Arena-Frontend/lib/store.ts
interface ArenaStore {
  creatures: Map<string, Creature>
  
  // ✅ Apenas atualiza cache, não calcula
  updateCreature: (id: string, creature: Creature) => void
  
  // ✅ Apenas busca do cache
  getCreature: (id: string) => Creature | undefined
}

export const useArenaStore = create<ArenaStore>((set) => ({
  creatures: new Map(),
  
  updateCreature: (id, creature) => {
    set((state) => {
      const newCreatures = new Map(state.creatures)
      newCreatures.set(id, creature)  // Substitui completamente
      return { creatures: newCreatures }
    })
  },
  
  getCreature: (id) => {
    return useArenaStore.getState().creatures.get(id)
  }
}))
```

---

### 3. Narrativa: Oak Panel Reativo

#### 3.1 Criar `professor-oak-panel.tsx` reativo

**Arquivo:** `Arena-Frontend/components/professor-oak-panel.tsx`

**Ação:**
- [ ] Criar componente que recebe `events: NarrativeEvent[]`
- [ ] Renderizar mensagens do Professor Carvalho baseado nos eventos
- [ ] Zero lógica condicional - apenas reage aos eventos

**Código de Implementação:**
```typescript
// Arena-Frontend/components/professor-oak-panel.tsx
interface ProfessorOakPanelProps {
  events: NarrativeEvent[]
  creature?: Creature
}

export function ProfessorOakPanel({ events, creature }: ProfessorOakPanelProps) {
  const messages = useMemo(() => {
    return events.map(event => {
      switch (event.type) {
        case 'level_up':
          return {
            type: 'celebration',
            text: `Fantástico! ${creature?.name || 'Sua criatura'} subiu para o nível ${event.data.newLevel}! Novas habilidades podem estar próximas.`
          }
        case 'first_victory':
          return {
            type: 'celebration',
            text: `Incrível, Treinador! Sua primeira vitória na arena! Este é um marco que ficará para sempre no Ledger.`
          }
        case 'xp_gained':
          return {
            type: 'info',
            text: `${creature?.name || 'Sua criatura'} ganhou ${event.data.amount} XP!`
          }
        case 'burnout':
          return {
            type: 'warning',
            text: `Vejo que ${creature?.name || 'sua criatura'} está exausta. Considere descansar antes da próxima batalha.`
          }
        case 'evolution_ready':
          return {
            type: 'info',
            text: `Sinto uma energia imensa em ${creature?.name || 'sua criatura'}! Ela está pronta para o próximo passo. Leve-a ao Jardim das Evoluções quando estiver preparado.`
          }
        default:
          return null
      }
    }).filter(Boolean)
  }, [events, creature])
  
  return (
    <div className="professor-oak-panel">
      <div className="oak-avatar">
        <img src="/professor-oak.png" alt="Professor Carvalho" />
      </div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

#### 3.2 Integrar Oak Panel no `arena-view.tsx`

**Ação:**
- [ ] Importar `ProfessorOakPanel`
- [ ] Passar `narrativeEvents` como prop
- [ ] Renderizar após cada batalha

**Código:**
```typescript
// Arena-Frontend/components/arena-view.tsx
const [narrativeEvents, setNarrativeEvents] = useState<NarrativeEvent[]>([])

// No handleStartBattle, após receber resposta:
setNarrativeEvents([
  ...data.narrativeEvents.creatureA,
  ...data.narrativeEvents.creatureB
])

// No render:
<ProfessorOakPanel 
  events={narrativeEvents} 
  creature={selectedCreatureA || selectedCreatureB}
/>
```

---

### 4. Testes e Validação

#### 4.1 Teste E2E: Batalha Completa

**Arquivo:** `tests/e2e/battle-flow.test.ts`

**Ação:**
- [ ] Criar teste que simula batalha completa
- [ ] Verificar que span é gravado no Ledger
- [ ] Verificar que UI reflete estado do Ledger
- [ ] Verificar que eventos narrativos são renderizados

**Código de Teste:**
```typescript
// tests/e2e/battle-flow.test.ts
describe('Battle Flow E2E', () => {
  it('should execute battle and update UI from Ledger', async () => {
    // 1. Criar duas criaturas
    const creatureA = await createCreature({ name: 'Lyria' })
    const creatureB = await createCreature({ name: 'Logikon' })
    
    // 2. Executar batalha via API
    const response = await fetch('/api/arena/battle', {
      method: 'POST',
      body: JSON.stringify({
        creatureAId: creatureA.id,
        creatureBId: creatureB.id,
        prompt: 'Explain quantum computing'
      })
    })
    
    const data = await response.json()
    
    // 3. Verificar que span foi gravado
    const span = await ledger.getSpan(data.battleResult.battleId)
    expect(span).toBeDefined()
    expect(span.type).toBe('battle')
    expect(span.metadata.traceId).toBeDefined()
    
    // 4. Verificar que estado das criaturas foi atualizado
    expect(data.updatedCreatureA.xp).toBeGreaterThan(creatureA.xp)
    expect(data.updatedCreatureB.xp).toBeGreaterThan(creatureB.xp)
    
    // 5. Verificar que eventos narrativos foram gerados
    expect(data.narrativeEvents.creatureA.length).toBeGreaterThan(0)
    expect(data.narrativeEvents.creatureB.length).toBeGreaterThan(0)
    
    // 6. Verificar que UI reflete o estado
    const uiCreatureA = await getCreatureFromUI(creatureA.id)
    expect(uiCreatureA.xp).toBe(data.updatedCreatureA.xp)
    expect(uiCreatureA.level).toBe(data.updatedCreatureA.level)
  })
})
```

---

#### 4.2 Teste de Propriedade: ELO Calculation

**Arquivo:** `tests/property/elo.test.ts`

**Ação:**
- [ ] Criar teste de propriedade para cálculo de ELO
- [ ] Verificar que ELO sempre aumenta para vencedor
- [ ] Verificar que ELO sempre diminui para perdedor
- [ ] Verificar que soma total de ELO permanece constante

**Código:**
```typescript
// tests/property/elo.test.ts
describe('ELO Calculation Properties', () => {
  it('should always increase ELO for winner', () => {
    const creatureA = { elo: 1200 }
    const creatureB = { elo: 1200 }
    
    const result = calculateELO(creatureA, creatureB, 'A')
    
    expect(result.creatureA).toBeGreaterThan(creatureA.elo)
    expect(result.creatureB).toBeLessThan(creatureB.elo)
    
    // Propriedade: soma total permanece constante
    const totalBefore = creatureA.elo + creatureB.elo
    const totalAfter = result.creatureA + result.creatureB
    expect(totalAfter).toBe(totalBefore)
  })
})
```

---

### 5. Observabilidade

#### 5.1 Expor Métricas em `/metrics`

**Arquivo:** `src/server.hardened.ts` ou `src/metrics.ts`

**Ação:**
- [ ] Garantir que `/metrics` expõe métricas de batalha
- [ ] P95 latency
- [ ] Error rate
- [ ] Custo por request

**Métricas Obrigatórias:**
```
arena_battle_duration_p95
arena_battle_duration_p99
arena_battle_error_rate
arena_battle_cost_per_request
arena_creature_count
ledger_spans_total
```

---

## 🚀 Ordem de Execução Recomendada

1. **Backend primeiro:**
   - [ ] 1.1 Garantir servidor hardened
   - [ ] 1.2 Fortalecer endpoint de batalha
   - [ ] 1.3 Garantir span no Ledger
   - [ ] 1.4 Garantir NarrativeSync

2. **Frontend depois:**
   - [ ] 2.1 Remover simulação
   - [ ] 2.2 Conectar à API real
   - [ ] 2.3 Garantir CreatureCard reativo
   - [ ] 2.4 Garantir store como cache

3. **Narrativa:**
   - [ ] 3.1 Criar Oak Panel reativo
   - [ ] 3.2 Integrar no arena-view

4. **Testes:**
   - [ ] 4.1 Teste E2E
   - [ ] 4.2 Teste de propriedade

5. **Observabilidade:**
   - [ ] 5.1 Expor métricas

---

## ✅ Critérios de Aceite Final

- [ ] Batalha funciona end-to-end sem erros
- [ ] Span `battle` gravado no Ledger com `traceId`
- [ ] UI reflete exatamente o estado do Ledger
- [ ] Eventos narrativos renderizados automaticamente
- [ ] P95 latency ≤ 2.5s (simulation)
- [ ] Error rate < 1%
- [ ] Teste E2E passa
- [ ] Métricas expostas em `/metrics`
- [ ] Swagger documentado em `/api/docs`

---

**"UI reflete o Ledger. Narrativa é automática. Todo PR deixa rastro."**

---

*Documento gerado em: 2025-11-09*  
*Versão: 1.0-implementation*  
*Status: Ready for Execution*

