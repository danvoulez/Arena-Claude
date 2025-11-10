# ⚙️ Sistemas - ArenaLab

**Documentação técnica dos sistemas de jogo**

---

## 📚 Sistemas Principais

### Core Systems
- **[BATTLE_SYSTEM.md](BATTLE_SYSTEM.md)** - Sistema de batalhas
- **[TRAINING_SYSTEM.md](TRAINING_SYSTEM.md)** - Sistema de treinamento/curadoria
- **[EVOLUTION_SYSTEM.md](EVOLUTION_SYSTEM.md)** - Sistema de evolução
- **[TRUST_SYSTEM.md](TRUST_SYSTEM.md)** - Sistema de confiança

### Advanced Systems
- **[ASCENSION_SYSTEM.md](ASCENSION_SYSTEM.md)** - Sistema de ascensão
- **[QUALITY_METER.md](QUALITY_METER.md)** - Avaliação de qualidade 5D
- **[NARRATIVE_SYSTEM.md](NARRATIVE_SYSTEM.md)** - Sistema narrativo reativo
- **[TRAJECTORY_MATCHING_ADVANCED.md](TRAJECTORY_MATCHING_ADVANCED.md)** 🔥 - Algoritmos completos de trajectory matching
- **[CONSTITUTIONAL_AI.md](CONSTITUTIONAL_AI.md)** 🔥 - Sistema de princípios e ética das facções

### Data Systems
- **[LEDGER_SYSTEM.md](LEDGER_SYSTEM.md)** - Sistema de Ledger (JSON✯Atomic)
- **[DNA_TIMELINE.md](DNA_TIMELINE.md)** - Visualização de DNA (em breve)
- **[LEADERBOARD_SYSTEM.md](LEADERBOARD_SYSTEM.md)** - Sistema de ranking (em breve)

---

## 🎯 Fluxo de Sistemas

### Ciclo Principal
```
Battle → Training → Evolution → Ascension
  ↓        ↓           ↓            ↓
Ledger → Ledger → Ledger → Ledger
  ↓        ↓           ↓            ↓
Narrative → Narrative → Narrative → Narrative
```

### Sistemas de Suporte
- **Trust System**: Influencia evolução e comportamento
- **Quality Meter**: Avalia spans para "diamond" status
- **Narrative System**: Gera eventos reativos do Ledger

---

## 🔗 Referências

- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_ARQUITETURAIS_OFICIAIS.md)**
- **[Implementação](../04-IMPLEMENTACAO/)**
- **[Arquitetura](../01-ARQUITETURA/)**

---

**Status**: ✅ Documentação de sistemas  
**Última atualização**: 2025-11-10

