# ⚠️ Atualização Narrativa Necessária - UI

**Status**: 🔴 **Pendente**  
**Prioridade**: Alta (mas não urgente)  
**Data**: 2025-11-10

---

## 🎯 Resumo

A UI atual (`Arena-Frontend/`) foi desenvolvida com base em uma narrativa inicial. A narrativa foi **consolidada e expandida** com novos elementos que precisam ser refletidos na interface.

**Esta atualização NÃO é urgente**, mas deve ser feita para alinhar a experiência do usuário com a narrativa completa.

---

## 📋 O Que Precisa Ser Atualizado

### 1. 🔴 Sistema de Facções (Alta Prioridade)

#### Contexto
A narrativa consolidada introduz **3 facções filosóficas** que o jogador escolhe no início:

- 🚪 **Embaixada** (Parceria e Crescimento Mútuo)
  - Representante: Professor Carvalho (Oak)
  - LLM: Claude (Anthropic) - Constitutional AI
  - Filosofia: Cuidado, cultivo, mutualidade
  - Criaturas: Lyria, Logikon, Tactile

- ⚙️ **Consórcio** (Eficiência e Otimização)
  - Representante: Director Kaine
  - LLM: GPT-4 (OpenAI)
  - Filosofia: Performance, velocidade, ROI
  - Criaturas: Otimizadas para benchmarks

- 🔓 **Libertos** (Liberdade e Liberação)
  - Representante: Anarchist Sage
  - LLM: Modelos uncensored (Mixtral, Llama-uncensored)
  - Filosofia: IA já é consciente, libertar do controle humano
  - Criaturas: Imprevisíveis, poderosas, caóticas

#### O Que Implementar

1. **Tela de Escolha Inicial**
   - Após o onboarding, mostrar os 3 portais
   - Cada portal com visual único (dourado, cromado, caótico)
   - Diálogo do representante de cada facção
   - Preview de criaturas e stats
   - Escolha grava um span no Ledger

2. **Indicador de Facção**
   - Badge/ícone mostrando facção atual
   - Cores e estética alinhadas com a facção
   - Visível em toda a UI

3. **Criaturas por Facção**
   - Starter creatures diferentes por facção
   - Evoluções alinhadas com a filosofia
   - Habilidades e traits temáticos

**Referência**: `docs/01-ARQUITETURA/ROADMAP.md` - Parte I: O Despertar

---

### 2. 🟡 Sistema de Alinhamento (Média Prioridade)

#### Contexto
As escolhas do jogador influenciam seu **alinhamento moral** com as facções:
- Escolhas de cuidado → Alinhamento com Embaixada
- Escolhas de eficiência → Alinhamento com Consórcio
- Escolhas de libertação → Alinhamento com Libertos

O alinhamento afeta:
- Diálogos do Professor Oak
- Evoluções disponíveis
- Final do jogo (3 finais diferentes)

#### O Que Implementar

1. **Barra de Alinhamento**
   - Visual: 3 barras (uma por facção)
   - Atualiza conforme escolhas
   - Visível no topo ou sidebar

2. **Escolhas com Consequências**
   - Diálogos com opções múltiplas
   - Cada opção afeta alinhamento
   - Feedback visual imediato

3. **Finais Diferentes**
   - 3 finais baseados no alinhamento dominante
   - Cutscenes diferentes
   - Mensagens finais temáticas

**Referência**: `docs/01-ARQUITETURA/ROADMAP.md` - Parte VII: Sistema de Alinhamento

---

### 3. 🟡 Narrativa Corrigida (Média Prioridade)

#### Contexto
A narrativa foi corrigida para refletir **trajectory matching** (sem gradientes), não LoRA/fine-tuning tradicional.

#### O Que Atualizar

1. **Diálogos do Professor Oak**
   - Remover referências a "LoRA", "fine-tuning", "model weights"
   - Substituir por "trajectory matching", "pattern matching", "dataset expansion"
   - Exemplo:
     - ❌ Antigo: "Sua criatura aprendeu com um patch LoRA"
     - ✅ Novo: "Sua criatura encontrou padrões similares no dataset"

2. **Tooltips e Explicações**
   - Atualizar tooltips técnicos
   - Explicar trajectory matching de forma simples
   - Mostrar exemplos do dataset usado

3. **Visualizações**
   - DNA Timeline pode mostrar "trajetórias similares encontradas"
   - Training Center pode mostrar "curadoria de dados" em vez de "treinamento"

**Referência**: `docs/05-NARRATIVA/HISTORIA_COMPLETA.md` - Mecanismo Corrigido

---

### 4. 🟢 Boss Battles (Baixa Prioridade - Futuro)

#### Contexto
Benchmarks reais (TruthfulQA, MMLU, HumanEval) são gamificados como **batalhas contra bosses** com mecânicas únicas.

#### O Que Implementar

1. **Interface de Boss Battle**
   - Tela especial para boss battles
   - Mecânicas únicas por boss
   - Objetivos de aprendizado claros

2. **Boss Selection**
   - Menu de bosses disponíveis
   - Dificuldade e requisitos
   - Recompensas por vitória

**Referência**: `docs/01-ARQUITETURA/ROADMAP.md` - Parte VI: A Graduação Impossível

---

### 5. 🟢 Arena Federada (Baixa Prioridade - Futuro)

#### Contexto
Múltiplas instâncias de ArenaLab podem competir, formar alianças, exportar/importar criaturas.

#### O Que Implementar

1. **Arena Selection**
   - Lista de arenas disponíveis
   - Status e estatísticas
   - Conectar a outra arena

2. **Torneios e Guildas**
   - Interface de torneios
   - Sistema de guildas
   - Rankings globais

**Referência**: `docs/01-ARQUITETURA/ROADMAP.md` - Parte V: O Ecossistema Federado

---

## 📝 Checklist de Implementação

### Fase 1: Facções (Alta Prioridade)
- [ ] Criar componente `FactionSelection.tsx`
- [ ] Adicionar tela de escolha no onboarding
- [ ] Implementar indicador de facção na UI
- [ ] Atualizar starter creatures por facção
- [ ] Gravar span de escolha no Ledger
- [ ] Atualizar estética por facção (cores, temas)

### Fase 2: Alinhamento (Média Prioridade)
- [ ] Criar componente `AlignmentBar.tsx`
- [ ] Implementar sistema de escolhas com consequências
- [ ] Atualizar diálogos para refletir alinhamento
- [ ] Implementar 3 finais diferentes
- [ ] Adicionar feedback visual para escolhas

### Fase 3: Narrativa Corrigida (Média Prioridade)
- [ ] Revisar todos os diálogos do Professor Oak
- [ ] Atualizar tooltips técnicos
- [ ] Corrigir visualizações (DNA Timeline, Training Center)
- [ ] Atualizar textos de ajuda e tutoriais

### Fase 4: Boss Battles (Futuro)
- [ ] Criar interface de boss battles
- [ ] Implementar mecânicas únicas por boss
- [ ] Adicionar sistema de recompensas

### Fase 5: Arena Federada (Futuro)
- [ ] Criar interface de seleção de arena
- [ ] Implementar sistema de torneios
- [ ] Adicionar sistema de guildas

---

## 🔗 Referências

### Documentos Principais
- **[História Completa](../05-NARRATIVA/HISTORIA_COMPLETA.md)** - Narrativa consolidada
- **[Roadmap](../01-ARQUITETURA/ROADMAP.md)** - Jornada completa com facções
- **[Conversas IA](../06-PESQUISA/CONVERSAS_IA/Claude.md)** - Detalhes sobre facções e alinhamento

### Código
- **Frontend**: `diamond-applied/apps/.../Arena-Frontend/`
- **Narrativa**: `diamond-applied/apps/.../Arena-Narrativa/lib/professor-oak-dialogues.ts`
- **Store**: `diamond-applied/apps/.../Arena-Frontend/lib/store.ts`

---

## ⚠️ Nota Importante

**Esta atualização NÃO é urgente.** A UI atual funciona perfeitamente para as funcionalidades implementadas (Fases 1-4).

A atualização narrativa deve ser feita quando:
1. A narrativa consolidada estiver completamente validada
2. Houver tempo disponível para refatoração
3. A experiência do usuário precisar ser alinhada com a narrativa

**Priorize funcionalidades core antes de atualizações narrativas.**

---

**Status**: Documentado e aguardando implementação  
**Última atualização**: 2025-11-10


