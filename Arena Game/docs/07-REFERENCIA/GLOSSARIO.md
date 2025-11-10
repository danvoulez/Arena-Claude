# 📖 Glossário - ArenaLab

**Termos e conceitos do jogo**

---

## A

### Agente (Agent)
Criatura ascendida que se tornou um agente de produção funcional, com endpoint de API próprio.

### Ascensão (Ascension)
Processo final onde uma criatura transcende a arena e se torna um agente de produção.

### Arena
Sistema de batalhas onde criaturas competem respondendo a prompts.

---

## B

### Battle Runner
Motor de execução de batalhas, avalia respostas com Quality Meter e calcula resultados.

### Buff
Efeito temporário aplicado após treinamento (ex: +15 charisma por 24h).

---

## C

### Criatura (Creature)
Entidade de IA treinável no ArenaLab. Cada criatura tem stats, habilidades e um dataset.

### Curadoria (Curation)
Processo de seleção de spans de alta qualidade para expandir o dataset da criatura.

---

## D

### Dataset
Coleção de spans de alta qualidade usados para trajectory matching.

### Diamond Span
Span de alta qualidade (Quality Meter 5D > 80) usado para treinamento.

### DNA Atômico
Timeline visual do histórico completo da criatura, derivado do Ledger.

---

## E

### ELO
Sistema de ranking baseado em xadrez. Aumenta com vitórias, diminui com derrotas.

### Evolução (Evolution)
Expansão estratégica do dataset da criatura, desbloqueando novas habilidades.

### Evolution Stage
Estágio de evolução da criatura (0, 1 ou 2). Máximo 2 evoluções.

---

## L

### Ledger
Sistema de armazenamento append-only de spans (JSON✯Atomic). Fonte única da verdade.

### Legend
Narrativa verificável da jornada da criatura, gerada a partir do Ledger.

---

## N

### Narrative Event
Evento narrativo gerado pelo NarrativeSync a partir de spans do Ledger.

### NarrativeSync
Sistema que processa spans do Ledger e gera eventos narrativos.

---

## Q

### Quality Meter 5D
Sistema de avaliação de qualidade em 5 dimensões:
- Completeness
- Provenance
- Impact
- Uniqueness
- Coherence

---

## S

### Span
Registro auditável de uma ação no Ledger (JSON✯Atomic). Cada span tem hash e assinatura.

### Starter Creature
Criatura inicial escolhida pelo jogador (Lyria, Logikon, Tactile).

---

## T

### Trait
Habilidade permanente da criatura, ganha após treinamento ou evolução.

### Trajectory Matching
Mecanismo de treinamento sem gradientes. Busca padrões similares no dataset e sintetiza respostas.

### Training Program
Programa de treinamento com buffs, traits, duração e cooldown.

### Trust
Stat emocional da criatura (0-100). Influencia comportamento e requisitos de evolução/ascensão.

---

## 🔗 Referências

- **[Conceitos Centrais](../00-START-HERE/CONCEITOS_CENTRAIS.md)**
- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_ARQUITETURAIS_OFICIAIS.md)**

---

**Status**: ✅ Glossário completo  
**Última atualização**: 2025-11-10


