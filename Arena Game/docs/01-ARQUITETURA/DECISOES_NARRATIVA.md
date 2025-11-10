# 📖 Decisões Arquiteturais - Narrativa

**Status**: ✅ Oficial  
**Data**: 2025-11-10

---

## 📋 Princípios Oficiais

### 1. Narrativa Reativa ao Ledger

**Decisão Oficial:**
- ✅ Narrativa é gerada a partir dos spans do Ledger
- ✅ Não é pré-escrita ou estática
- ✅ Professor Oak reage a eventos reais
- ✅ Diálogos são contextuais

**Implementação:**
- `src/arena/narrative-sync.ts` - Processa spans e gera eventos narrativos
- `Arena-Narrativa/lib/professor-oak-dialogues.ts` - Diálogos
- `Arena-Frontend/components/professor-oak-panel.tsx` - UI reativa

---

### 2. Narrativa Alinhada com Trajectory Matching

**Decisão Oficial:**
- ✅ Narrativa reflete mecanismo real (trajectory matching)
- ❌ **NÃO** menciona: LoRA, fine-tuning, model weights, gradientes
- ✅ **SIM** menciona: curadoria, dataset expansion, pattern matching, trajetórias similares

**Exemplos Corretos:**
- ✅ "Sua criatura encontrou padrões similares no dataset"
- ✅ "Curadoria de dados de alta qualidade"
- ✅ "Expansão estratégica do dataset"
- ❌ "Patch LoRA aplicado"
- ❌ "Fine-tuning completo"

**Status:**
- ✅ Documentado
- ⚠️ Pendente: Atualizar diálogos existentes

---

### 3. Sistema de Facções

**Decisão Oficial:**
- ✅ 3 facções filosóficas são parte oficial da narrativa:
  - 🚪 **Embaixada** (Parceria, Claude/Anthropic)
  - ⚙️ **Consórcio** (Eficiência, GPT-4/OpenAI)
  - 🔓 **Libertos** (Liberdade, modelos uncensored)

**Constituições:**
- Cada facção tem uma **constituição oficial** com princípios explícitos
- Sistema de enforcement automático detecta violações
- Sistema aprende com violações (negative examples)

**Arquivos Relacionados:**
- **[CONSTITUTIONAL_AI.md](../02-SISTEMAS/CONSTITUTIONAL_AI.md)** 🔥 - Constituições completas e enforcement engine

**Implementação:**
- ✅ Documentado em `ROADMAP.md` - Parte I
- ⚠️ Pendente: Tela de escolha inicial na UI
- ✅ Escolha grava span no Ledger

---

### 4. Sistema de Alinhamento

**Decisão Oficial:**
- ✅ Escolhas do jogador influenciam alinhamento com facções
- ✅ Alinhamento afeta diálogos, evoluções, final do jogo
- ✅ 3 finais diferentes baseados em alinhamento

**Implementação:**
- ✅ Documentado em `ROADMAP.md` - Parte VII
- ⚠️ Pendente: Barra de alinhamento na UI
- ✅ Escolhas gravam spans no Ledger

---

## 🎭 Estrutura Narrativa

### Personagens Oficiais

#### Professor Carvalho (Oak)
- **Função**: Mentor e guia
- **Tom**: Carismático, sábio, acolhedor
- **Diálogos**: Reativos a eventos do Ledger
- **Arquivo**: `Arena-Narrativa/lib/professor-oak-dialogues.ts`

#### Criaturas Iniciais
- **Lyria**: Creative Empath (Poética, sensível)
- **Logikon**: Logical Mentor (Analítico, paciente)
- **Tactile**: Synthesis Partner (Eficiente, cuidadoso)

---

### Eventos Narrativos Oficiais

**Tipos de Eventos:**
- `xp_gained` - XP ganho
- `level_up` - Subiu de nível
- `evolution_ready` - Pronta para evoluir
- `first_victory` - Primeira vitória
- `burnout` - Criatura exausta
- `training_started` - Treinamento iniciado
- `training_completed` - Treinamento completo
- `evolution` - Evoluiu
- `trust_low` - Trust muito baixo
- `ascension` - Ascendeu para produção

**Implementação:**
- `src/arena/narrative-sync.ts` - Gera eventos
- `Arena-Frontend/components/professor-oak-panel.tsx` - Processa eventos

---

## 📚 Conteúdo Narrativo

### Diálogos

**Fonte**: `Arena-Narrativa/lib/professor-oak-dialogues.ts`

**Estrutura:**
- `professorTips` - Dicas contextuais
- `celebrations` - Celebrações
- `warnings` - Avisos
- `tutorials` - Tutoriais

**Decisão:**
- ✅ Diálogos são dados (não hardcoded)
- 📋 Futuro: Mover para YAML (data-driven)

---

### História Completa

**Documento**: `docs/05-NARRATIVA/HISTORIA_COMPLETA.md`

**Estrutura:**
- 4 Eras narrativas
- Paralelos técnicos com ML real
- Experiência visual detalhada

**Decisão:**
- ✅ História oficial documentada
- ✅ Alinhada com trajectory matching
- ✅ Reflete implementação real

---

## ⚠️ Pendências de Implementação

### 1. Sistema de Facções na UI
- **Status**: 📋 Documentado, ⚠️ Pendente
- **O Que**: Tela de escolha inicial
- **Prioridade**: 🔴 Alta
- **Referência**: `docs/03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md`

### 2. Sistema de Alinhamento na UI
- **Status**: 📋 Documentado, ⚠️ Pendente
- **O Que**: Barra de alinhamento
- **Prioridade**: 🟡 Média
- **Referência**: `docs/03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md`

### 3. Atualizar Diálogos
- **Status**: 📋 Documentado, ⚠️ Pendente
- **O Que**: Remover referências a LoRA/fine-tuning
- **Prioridade**: 🟡 Média
- **Referência**: `docs/03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md`

---

## 🔗 Referências

- **[História Completa](../05-NARRATIVA/HISTORIA_COMPLETA.md)**
- **[Roadmap](ROADMAP.md)** - Jornada completa
- **[Atualização Narrativa Necessária](../03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md)**
- **[Decisões Arquiteturais Oficiais](DECISOES_ARQUITETURAIS_OFICIAIS.md)**

---

**Status**: ✅ Decisões narrativa oficiais  
**Última atualização**: 2025-11-10

