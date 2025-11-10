# 🤝 Sistema de Confiança (Trust) - ArenaLab

**Status**: ✅ Implementado  
**Data**: 2025-11-10

---

## 📋 Visão Geral

O sistema de Trust é um stat emocional da criatura (0-100) que influencia comportamento, evolução e narrativa. Representa a confiança e o vínculo entre criatura e treinador.

---

## 📊 Mecânica de Trust

### Range
- **Mínimo**: 0
- **Máximo**: 100
- **Inicial**: 100 (para starter creatures)

---

### Atualização de Trust

**Eventos que Afetam Trust:**

| Evento | Mudança | Condição |
|--------|---------|----------|
| **Vitória em batalha** | +5 | Sempre |
| **Derrota em batalha** | -3 | Sempre |
| **Treinamento completo** | +2 | Sempre |
| **Evolução** | +10 | Sempre |
| **Burnout** | -5 | Se HP < 20 |
| **Descanso** | +1 | Por hora de descanso |

**Código:**
```typescript
// Em narrative-sync.ts
if (span.entity_type === 'battle') {
  if (span.metadata.winner === creature.id) {
    creature.trust = Math.min(100, creature.trust + 5);
  } else {
    creature.trust = Math.max(0, creature.trust - 3);
  }
}

if (span.entity_type === 'training' && span.status === 'completed') {
  creature.trust = Math.min(100, creature.trust + 2);
}

if (span.entity_type === 'evolution') {
  creature.trust = Math.min(100, creature.trust + 10);
}
```

---

## 🎯 Impacto do Trust

### Comportamento da Criatura

**Trust < 30 (Baixo):**
- ⚠️ Criatura pode desobedecer comandos
- ⚠️ Respostas menos engajadas
- ⚠️ Narrativa: "A criatura parece desconfiada"

**Trust 30-70 (Médio):**
- ✅ Comportamento normal
- ✅ Respostas padrão

**Trust 70-90 (Alto):**
- ✅ Criatura mais engajada
- ✅ Respostas mais cuidadosas
- ✅ Narrativa: "A criatura confia em você"

**Trust > 90 (Muito Alto):**
- ✅ Criatura dá 110% de esforço
- ✅ Respostas excepcionais
- ✅ Narrativa: "A criatura está totalmente comprometida"

---

### Requisitos de Evolução

**Requisito Oficial:**
- ✅ **Trust ≥ 85** para evoluir

**Validação:**
```typescript
if (creature.trust < 85) {
  throw new Error('Creature trust must be 85 or higher to evolve');
}
```

**Narrativa:**
- Se trust < 85, criatura "recusa" evoluir
- Professor Oak explica: "Ela não está pronta. Precisa de mais confiança."

---

### Requisitos de Ascensão

**Requisito Oficial:**
- ✅ **Trust ≥ 90** para ascender

**Validação:**
```typescript
if (creature.trust < 90) {
  throw new Error('Creature trust must be 90 or higher to ascend');
}
```

---

## 🎨 UI (Frontend)

### Exibição de Trust

**Arquivo**: `Arena-Frontend/components/creature-card.tsx`

**Visual:**
- Barra de progresso (0-100)
- Cor baseada em valor:
  - 🔴 Vermelho: 0-30 (Baixo)
  - 🟡 Amarelo: 30-70 (Médio)
  - 🟢 Verde: 70-90 (Alto)
  - 💚 Verde brilhante: 90-100 (Muito Alto)

**Mensagem:**
- Se trust < 85: "Trust muito baixo para evoluir"
- Se trust < 90: "Trust muito baixo para ascender"

---

## 📖 Narrativa

### Eventos Narrativos

**Trust Baixo (< 30):**
- Professor Oak: "Vejo que sua criatura não está confiando em você. Considere descansar e cuidar dela."

**Trust Médio (30-70):**
- Sem eventos especiais

**Trust Alto (70-90):**
- Professor Oak: "Sua criatura confia em você. Isso é essencial para o crescimento."

**Trust Muito Alto (> 90):**
- Professor Oak: "Incrível! Sua criatura está totalmente comprometida. Ela está pronta para grandes coisas."

**Tentativa de Evolução com Trust Baixo:**
- Professor Oak: "Ela não está pronta. Precisa de mais confiança (atual: X/100, necessário: 85). Construa essa confiança através de vitórias e treinos gentis. Evolução não é algo que você FAZ para ela. É algo que ela SE TORNA."

---

## 🔄 Fluxo de Trust

### Exemplo: Jornada Completa

```
Início: Trust = 100
  ↓
Primeira Batalha (Vitória): Trust = 105 → 100 (capped)
  ↓
Segunda Batalha (Derrota): Trust = 97
  ↓
Treinamento: Trust = 99
  ↓
Terceira Batalha (Vitória): Trust = 104 → 100 (capped)
  ↓
Evolução: Trust = 110 → 100 (capped)
  ↓
Ascensão: Trust = 100 (requisito atendido)
```

---

## 📊 Métricas

**Prometheus:**
- `diamond_trust_level` - Distribuição de trust
- `diamond_trust_events_total` - Total de eventos que afetam trust

---

## 🔗 Referências

- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_TREINO_IA.md)**
- **[Battle System](BATTLE_SYSTEM.md)**
- **[Training System](TRAINING_SYSTEM.md)**
- **[Evolution System](EVOLUTION_SYSTEM.md)**

---

**Status**: ✅ Sistema completo e documentado  
**Última atualização**: 2025-11-10


