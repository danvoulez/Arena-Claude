# ⚔️ Sistema de Batalhas - ArenaLab

**Status**: ✅ Implementado  
**Data**: 2025-11-10

---

## 📋 Visão Geral

O sistema de batalhas é o coração do ArenaLab. Duas criaturas competem respondendo a um prompt, e o vencedor é determinado pela qualidade das respostas usando o **Quality Meter 5D**.

---

## 🔄 Fluxo de Batalha

### 1. Início da Batalha

**Trigger**: Usuário clica "Start Battle" na UI

**API**: `POST /api/arena/battle`

**Request:**
```json
{
  "creatureAId": "lyria_001",
  "creatureBId": "logikon_001",
  "prompt": "Explique o que é trajectory matching",
  "allowUserVote": true
}
```

---

### 2. Execução (Backend)

**Arquivo**: `src/arena/battle-runner.ts`

**Processo:**
1. **Carrega criaturas** do estado em memória
2. **Chama LLMs** (ou simula) para gerar respostas
3. **Avalia respostas** com Quality Meter 5D
4. **Calcula resultado** (vencedor, ELO, XP, dano)
5. **Grava span** no Ledger
6. **Gera eventos narrativos** via NarrativeSync

**Código:**
```typescript
async executeBattle(
  creatureA: Creature,
  creatureB: Creature,
  prompt: string,
  allowUserVote: boolean = true
): Promise<BattleResult> {
  // 1. Gera respostas
  const responseA = await this.llmCaller.call(prompt, creatureA);
  const responseB = await this.llmCaller.call(prompt, creatureB);
  
  // 2. Avalia qualidade
  const qualityA = this.qualityMeter.evaluate(responseA);
  const qualityB = this.qualityMeter.evaluate(responseB);
  
  // 3. Determina vencedor
  const winner = qualityA.total_score > qualityB.total_score ? 'A' : 'B';
  
  // 4. Calcula ELO
  const { newEloA, newEloB } = this.calculateELO(creatureA, creatureB, winner);
  
  // 5. Grava span
  const battleSpan = await this.ledger.append('battle', {
    who: creatureA.id,
    did: `battle_vs_${creatureB.id}`,
    this: prompt,
    when: new Date().toISOString(),
    status: 'completed',
    metadata: {
      traceId: `battle_${Date.now()}_${Math.random()}`,
      opponent: creatureB.id,
      winner,
      qualityA: qualityA.total_score,
      qualityB: qualityB.total_score,
      elo_change_a: newEloA - creatureA.elo,
      elo_change_b: newEloB - creatureB.elo
    }
  });
  
  // 6. Retorna resultado
  return {
    winner,
    creatureA: { ...creatureA, elo: newEloA },
    creatureB: { ...creatureB, elo: newEloB },
    qualityA,
    qualityB,
    span: battleSpan
  };
}
```

---

### 3. Quality Meter 5D

**Arquivo**: `src/quality_meter.ts`

**Dimensões:**
1. **Completeness** (0-100): Resposta completa?
2. **Provenance** (0-100): Fonte confiável?
3. **Impact** (0-100): Impacto significativo?
4. **Uniqueness** (0-100): Único ou repetitivo?
5. **Coherence** (0-100): Coerente e lógico?

**Cálculo:**
```typescript
total_score = (
  completeness * 0.25 +
  provenance * 0.20 +
  impact * 0.20 +
  uniqueness * 0.15 +
  coherence * 0.20
)
```

---

### 4. Cálculo de ELO

**Fórmula**: Sistema ELO padrão (como xadrez)

**Mudança de ELO:**
- **Vitória**: +15 a +30 (depende do ELO do oponente)
- **Derrota**: -15 a -30
- **Empate**: ±0 a ±5

---

### 5. XP e Dano

**XP Ganho:**
- **Vitória**: 100 XP
- **Derrota**: 30 XP
- **Empate**: 50 XP

**Dano (HP):**
- **Derrota**: -20 HP
- **Vitória**: -5 HP (custo mínimo)
- **Empate**: -10 HP

---

### 6. Span no Ledger

**Tipo**: `battle`

**Estrutura:**
```json
{
  "entity_type": "battle",
  "who": "lyria_001",
  "did": "battle_vs_logikon_001",
  "this": "Explique o que é trajectory matching",
  "when": "2025-11-10T12:00:00Z",
  "status": "completed",
  "confirmed_by": "lyria_001",
  "hash": "blake3:...",
  "signature": "ed25519:...",
  "metadata": {
    "traceId": "battle_1234567890_abc123",
    "opponent": "logikon_001",
    "winner": "A",
    "qualityA": 87.5,
    "qualityB": 82.3,
    "elo_change_a": 18,
    "elo_change_b": -18,
    "duration_ms": 2340
  }
}
```

---

### 7. Eventos Narrativos

**Arquivo**: `src/arena/narrative-sync.ts`

**Eventos Gerados:**
- `xp_gained` - XP ganho
- `level_up` - Subiu de nível (se aplicável)
- `first_victory` - Primeira vitória
- `burnout` - Criatura exausta (se HP < 20)

**Atualização de Trust:**
- **Vitória**: +5 trust
- **Derrota**: -3 trust

---

## 🎨 UI (Frontend)

### Componente Principal

**Arquivo**: `Arena-Frontend/components/arena-view.tsx`

**Fluxo:**
1. Usuário seleciona duas criaturas
2. Usuário insere prompt (ou usa padrão)
3. Clica "Start Battle"
4. Faz `fetch()` para `POST /api/arena/battle`
5. Mostra loading durante execução
6. Recebe resultado + narrative events
7. Atualiza store com criaturas atualizadas
8. Mostra animação de resultado
9. Processa narrative events (Professor Oak)

---

## 📊 Métricas

**Prometheus:**
- `diamond_battles_total` - Total de batalhas
- `diamond_battle_duration_seconds` - Duração média
- `diamond_elo_distribution` - Distribuição de ELO

---

## 🔗 Referências

- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_TREINO_IA.md)**
- **[Quality Meter](QUALITY_METER.md)**
- **[Trust System](TRUST_SYSTEM.md)**
- **[Narrative System](NARRATIVE_SYSTEM.md)**

---

**Status**: ✅ Sistema completo e documentado  
**Última atualização**: 2025-11-10


