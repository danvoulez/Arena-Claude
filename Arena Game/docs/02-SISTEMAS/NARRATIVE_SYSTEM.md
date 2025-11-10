# 📖 Sistema Narrativo - ArenaLab

**Status**: ✅ Implementado  
**Data**: 2025-11-10

---

## 📋 Visão Geral

O sistema narrativo é **reativo ao Ledger**. Não é pré-escrito ou estático. Ele gera eventos narrativos a partir dos spans do Ledger, criando uma experiência dinâmica e contextual.

---

## 🔄 Fluxo Narrativo

### 1. Span é Escrito no Ledger

**Quando**: Após qualquer ação (batalha, treinamento, evolução, etc.)

**Onde**: `src/arena/api.ts` - Após gravar span

**Exemplo**:
```typescript
const battleSpan = await this.ledger.append('battle', { ... })
```

---

### 2. NarrativeSync Processa o Span

**Onde**: `src/arena/narrative-sync.ts` - `processSpan()`

**Processo**:
1. Lê o span do Ledger
2. Identifica o tipo de evento
3. Calcula mudanças (XP, level, trust)
4. Gera eventos narrativos
5. Retorna array de `NarrativeEvent[]`

**Código**:
```typescript
const events = await this.narrativeSync.processSpan(battleSpan, creature)
```

---

### 3. Eventos Narrativos Gerados

**Tipos de Eventos**:

| Tipo | Quando | Dados |
|------|-------|-------|
| `xp_gained` | XP ganho | `{ amount, newTotal }` |
| `level_up` | Subiu de nível | `{ newLevel, newAbilities }` |
| `evolution_ready` | Pronta para evoluir | `{ trust, level, spans }` |
| `first_victory` | Primeira vitória | `{ opponent, quality }` |
| `burnout` | Criatura exausta | `{ hp, trust }` |
| `training_started` | Treinamento iniciado | `{ programId, duration }` |
| `training_completed` | Treinamento completo | `{ programId, buffs, traits }` |
| `evolution` | Evoluiu | `{ stage, newAbilities }` |
| `trust_low` | Trust muito baixo | `{ trust, required }` |
| `ascension` | Ascendeu | `{ agentId, certification }` |

---

### 4. UI Processa Eventos

**Onde**: `Arena-Frontend/components/professor-oak-panel.tsx`

**Processo**:
1. Recebe `narrativeEvents` do backend
2. Mapeia cada evento para diálogo do Professor Oak
3. Adiciona mensagem ao store
4. UI renderiza mensagem

**Código**:
```typescript
events.forEach((event) => {
  switch (event.type) {
    case 'level_up':
      addOakMessage({
        type: 'celebration',
        content: `Fantástico! ${creature.name} subiu para o nível ${event.data.newLevel}!`
      })
      break
    // ...
  }
})
```

---

## 🎭 Personagens

### Professor Carvalho (Oak)

**Função**: Mentor e guia

**Tom**: Carismático, sábio, acolhedor

**Arquivo**: `Arena-Narrativa/lib/professor-oak-dialogues.ts`

**Estrutura**:
- `professorTips` - Dicas contextuais
- `celebrations` - Celebrações
- `warnings` - Avisos
- `tutorials` - Tutoriais

---

## 📚 Conteúdo Narrativo

### Diálogos

**Fonte**: `Arena-Narrativa/lib/professor-oak-dialogues.ts`

**Estrutura**:
```typescript
export const professorTips = {
  first_battle: "Sua primeira batalha! Lembre-se: qualidade importa mais que velocidade.",
  trust_low: "Vejo que sua criatura não está confiando em você. Considere descansar e cuidar dela.",
  // ...
}

export const celebrations = {
  level_up: "Fantástico! Sua criatura subiu de nível! Novas habilidades podem estar próximas.",
  evolution: "✨ Que momento extraordinário! Sua criatura evoluiu!",
  // ...
}
```

---

### Eventos Narrativos

**Interface**:
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

## 🔄 Integração com Sistemas

### Battle System

**Quando**: Após batalha

**Eventos Gerados**:
- `xp_gained` - XP ganho
- `level_up` - Se subiu de nível
- `first_victory` - Se primeira vitória
- `burnout` - Se HP < 20

**Atualização de Trust**:
- Vitória: +5 trust
- Derrota: -3 trust

---

### Training System

**Quando**: Após completar treinamento

**Eventos Gerados**:
- `training_completed` - Treinamento completo
- `xp_gained` - XP do treinamento

**Atualização de Trust**:
- Treinamento: +2 trust

---

### Evolution System

**Quando**: Após evolução

**Eventos Gerados**:
- `evolution` - Evolução completa
- `ability_unlocked` - Para cada habilidade nova
- `level_up` - Se subiu de nível

**Atualização de Trust**:
- Evolução: +10 trust

---

### Ascension System

**Quando**: Após ascensão

**Eventos Gerados**:
- `ascension` - Ascensão completa

**XP Ganho**:
- Ascensão: 5000 XP

---

## 🎨 Visualização

### Professor Oak Panel

**Componente**: `Arena-Frontend/components/professor-oak-panel.tsx`

**Tipos de Mensagem**:
- `tip` - Dica (ícone: Lightbulb)
- `celebration` - Celebração (ícone: Sparkles)
- `tutorial` - Tutorial (ícone: GraduationCap)
- `warning` - Aviso (ícone: AlertTriangle)

**Visual**:
- Card com avatar do Professor Oak
- Badge com tipo de mensagem
- ScrollArea para histórico
- Animações sutis

---

## 📊 Métricas

**Prometheus**:
- `diamond_narrative_events_total` - Total de eventos narrativos
- `diamond_professor_oak_messages_total` - Total de mensagens do Professor Oak

---

## 🔗 Referências

- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_NARRATIVA.md)**
- **[Battle System](BATTLE_SYSTEM.md)**
- **[Training System](TRAINING_SYSTEM.md)**
- **[Evolution System](EVOLUTION_SYSTEM.md)**

---

**Status**: ✅ Sistema completo e documentado  
**Última atualização**: 2025-11-10


