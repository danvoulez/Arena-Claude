# 🏛️ Decisões Arquiteturais Oficiais - ArenaLab

**Data**: 2025-11-10  
**Status**: ✅ Oficial  
**Versão**: 1.0

---

## 📋 Índice

1. [Motor (Core Engine)](#1-motor-core-engine)
2. [Treino IA (AI Training)](#2-treino-ia-ai-training)
3. [Narrativa (Storytelling)](#3-narrativa-storytelling)
4. [UI (Interface)](#4-ui-interface)
5. [Arquitetura Geral](#5-arquitetura-geral)

---

## 1. Motor (Core Engine)

### Decisão: JSON✯Atomic como Protocolo Base

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- Protocolo de spans auditáveis com hash (BLAKE3) e assinatura (Ed25519)
- Formato determinístico (canonical JSON)
- Ledger append-only (imutável)

**Implementação Atual:**
- **Runtime**: Node.js (Express, fs/promises)
- **Protocolo**: JSON✯Atomic
- **Crypto**: JavaScript puro (@noble/ed25519, @noble/hashes)
- **Storage**: JSONL files via Node.js fs

**Decisão Futura:**
- **Migração para**: Browser-Native (IndexedDB)
- **Justificativa**: PWA, offline, zero custo
- **Status**: 📋 Proposta documentada (ver `NOVA_ARQUITETURA_BROWSER_NATIVE.md`)

**Arquivos Relacionados:**
- `src/ledger.ts` - Implementação atual
- `src/crypto.ts` - Crypto portável
- `NOVA_ARQUITETURA_BROWSER_NATIVE.md` - Proposta browser-native

---

### Decisão: Trajectory Matching (Sem Gradientes)

**Status**: ✅ **OFICIAL - Implementado em A-Texts**

**O Que É:**
- Treinamento de IA sem backpropagation
- Busca padrões similares no dataset (HNSW, TF-IDF)
- Síntese de respostas baseada em exemplos

**Implementação:**
- **Localização**: `A-Texts/packages/`
- **Algoritmos**: HNSW (busca vetorial), TF-IDF (embedding)
- **Pipeline**: Embed → Search → Filter → Synthesize

**Decisão:**
- ✅ **Trajectory Matching** é o mecanismo oficial
- ❌ **NÃO** usa LoRA, fine-tuning tradicional, ou gradientes
- ✅ Dataset expansion = evolução
- ✅ Curadoria de dados = treinamento

**Arquivos Relacionados:**
- **[TRAJECTORY_MATCHING_ADVANCED.md](../02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md)** 🔥 - Algoritmos completos (HNSW, IVF, Context Matching)
- `A-Texts/docs/formula.md` - Fórmula técnica
- `A-Texts/packages/search/` - Busca vetorial
- `A-Texts/packages/predictor/` - Síntese de respostas

---

### Decisão: Ledger como Fonte Única da Verdade

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- Estado das criaturas é derivado do Ledger
- UI é um cache/mirror do Ledger
- Toda ação gera um span

**Implementação:**
- **Backend**: Grava spans no Ledger após cada ação
- **Frontend**: Lê Ledger para reconstruir estado
- **Store**: Zustand atua como cache (stateless)

**Decisão:**
- ✅ Ledger é a fonte da verdade
- ✅ UI é reativa ao Ledger
- ✅ Store não calcula, apenas espelha

**Arquivos Relacionados:**
- `src/ledger.ts` - Ledger implementation
- `Arena-Frontend/lib/store.ts` - Store stateless
- `src/arena/narrative-sync.ts` - Processa spans

---

## 2. Treino IA (AI Training)

### Decisão: Curadoria de Dados = Treinamento

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- "Treinamento" não é backpropagation
- É **curadoria de spans de alta qualidade** para o dataset
- Dataset expansion = evolução da criatura

**Implementação:**
- **Training Programs**: YAML com buffs, traits, duração
- **Completar treino**: Adiciona spans ao dataset da criatura
- **Evolução**: Expande dataset estrategicamente

**Decisão:**
- ✅ Treinamento = curadoria de dados
- ✅ Buffs/Traits = novos exemplos no dataset
- ✅ Evolução = estratégia de dataset expansion
- ❌ NÃO usa gradientes ou backpropagation

**Arquivos Relacionados:**
- `src/arena/api.ts` - `handleTrainCreature`, `handleCompleteTraining`
- `Arena-Frontend/components/training-center.tsx` - UI de treinamento
- `Arena-Narrativa/lib/training-engine.ts` - Programas de treino

---

### Decisão: Quality Meter 5D

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- Avaliação de qualidade em 5 dimensões:
  1. Completeness
  2. Provenance
  3. Impact
  4. Uniqueness
  5. Coherence

**Implementação:**
- `src/quality_meter.ts` - Implementação
- Usado em batalhas para avaliar respostas
- Determina "diamond spans" (alta qualidade)

**Decisão:**
- ✅ Quality Meter 5D é o padrão oficial
- ✅ Spans com qualidade alta = "diamond spans"
- ✅ Diamond spans = melhor treinamento

**Arquivos Relacionados:**
- `src/quality_meter.ts` - Implementação
- `src/arena/battle-runner.ts` - Usa Quality Meter

---

### Decisão: Trust System

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- Stat emocional da criatura (0-100)
- Influencia comportamento e evolução
- Atualizado baseado em vitórias, derrotas, treinos

**Implementação:**
- **Vitória**: +5 trust
- **Derrota**: -3 trust
- **Treino**: +2 trust
- **Evolução requer**: Trust ≥ 85

**Decisão:**
- ✅ Trust é stat oficial
- ✅ Evolução bloqueada se trust < 85
- ✅ Narrativa reage a trust baixo

**Arquivos Relacionados:**
- `src/arena/types.ts` - `Creature.trust`
- `src/arena/narrative-sync.ts` - Atualiza trust
- `Arena-Frontend/components/creature-card.tsx` - Exibe trust

---

## 3. Narrativa (Storytelling)

### Decisão: Narrativa Reativa ao Ledger

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- Narrativa é gerada a partir dos spans do Ledger
- Professor Oak reage a eventos reais
- Diálogos contextuais baseados em estado da criatura

**Implementação:**
- `src/arena/narrative-sync.ts` - Processa spans e gera eventos narrativos
- `Arena-Narrativa/lib/professor-oak-dialogues.ts` - Diálogos
- `Arena-Frontend/components/professor-oak-panel.tsx` - UI reativa

**Decisão:**
- ✅ Narrativa é reativa (não pré-escrita)
- ✅ Eventos narrativos vêm do Ledger
- ✅ Professor Oak reage automaticamente

**Arquivos Relacionados:**
- `src/arena/narrative-sync.ts` - Motor narrativo
- `Arena-Narrativa/lib/professor-oak-dialogues.ts` - Conteúdo
- `Arena-Frontend/components/professor-oak-panel.tsx` - UI

---

### Decisão: Narrativa Corrigida (Trajectory Matching)

**Status**: ✅ **OFICIAL - Documentado**

**O Que É:**
- Narrativa reflete o mecanismo real (trajectory matching)
- **NÃO** menciona LoRA, fine-tuning, model weights
- **SIM** menciona curadoria, dataset expansion, pattern matching

**Implementação:**
- Diálogos atualizados para refletir trajectory matching
- Visualizações mostram "trajetórias similares encontradas"
- Training Center mostra "curadoria de dados"

**Decisão:**
- ✅ Narrativa alinhada com implementação real
- ❌ Remover referências a conceitos antigos (LoRA, etc)
- ✅ Enfatizar curadoria, dataset, pattern matching

**Arquivos Relacionados:**
- `Arena-Narrativa/lib/professor-oak-dialogues.ts` - Diálogos
- `docs/05-NARRATIVA/HISTORIA_COMPLETA.md` - História corrigida
- `docs/03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md` - Pendências

---

### Decisão: Sistema de Facções (Pendente na UI)

**Status**: 📋 **OFICIAL - Documentado, Pendente Implementação**

**O Que É:**
- 3 facções filosóficas:
  - 🚪 **Embaixada** (Parceria, Claude/Anthropic)
  - ⚙️ **Consórcio** (Eficiência, GPT-4/OpenAI)
  - 🔓 **Libertos** (Liberdade, modelos uncensored)

**Decisão:**
- ✅ Facções são parte oficial da narrativa
- ⚠️ **Pendente**: Implementar na UI (tela de escolha inicial)
- ✅ Escolha grava span no Ledger

**Arquivos Relacionados:**
- `docs/01-ARQUITETURA/ROADMAP.md` - Parte I: O Despertar
- `docs/03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md` - Pendências

---

### Decisão: Sistema de Alinhamento (Pendente na UI)

**Status**: 📋 **OFICIAL - Documentado, Pendente Implementação**

**O Que É:**
- Escolhas do jogador influenciam alinhamento com facções
- Alinhamento afeta diálogos, evoluções, final do jogo
- 3 finais diferentes baseados em alinhamento

**Decisão:**
- ✅ Sistema de alinhamento é oficial
- ⚠️ **Pendente**: Implementar na UI (barra de alinhamento)
- ✅ Escolhas gravam spans no Ledger

**Arquivos Relacionados:**
- `docs/01-ARQUITETURA/ROADMAP.md` - Parte VII: Sistema de Alinhamento

---

## 4. UI (Interface)

### Decisão: Frontend React/Next.js

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- Next.js App Router
- React 19
- TypeScript
- shadcn/ui (57 componentes)

**Implementação:**
- `Arena-Frontend/` - Frontend completo
- Componentes: arena-view, training-center, evolution-ceremony, etc.
- Store: Zustand (stateless, cache do Ledger)

**Decisão:**
- ✅ Next.js é o framework oficial
- ✅ shadcn/ui é o design system
- ✅ Zustand para state management

**Arquivos Relacionados:**
- `Arena-Frontend/` - Código completo
- `docs/03-UI-UX/FRONTEND_EXISTENTE.md` - Documentação

---

### Decisão: Store Stateless (Cache do Ledger)

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- Zustand store não calcula, apenas espelha Ledger
- `updateCreature` faz shallow merge (cache)
- Estado real vem do Ledger

**Implementação:**
- `Arena-Frontend/lib/store.ts` - Store
- `updateCreature` - Shallow merge
- UI reage a mudanças do Ledger

**Decisão:**
- ✅ Store é stateless (cache)
- ✅ Ledger é fonte da verdade
- ✅ UI é reativa

**Arquivos Relacionados:**
- `Arena-Frontend/lib/store.ts` - Implementação
- `docs/04-IMPLEMENTACAO/FASE_1_BATTLE.md` - Verificação

---

### Decisão: Integração Backend via REST API

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- Frontend faz `fetch()` para endpoints REST
- Backend executa lógica, grava Ledger, retorna resultado
- Ciclo: Ação → API → Ledger → UI

**Implementação:**
- `POST /api/arena/battle` - Batalhas
- `POST /api/arena/creatures/:id/train` - Treinamento
- `POST /api/arena/evolve/:id` - Evolução
- etc.

**Decisão:**
- ✅ REST API é o padrão oficial
- ✅ Frontend não executa lógica (apenas UI)
- ✅ Backend é fonte da verdade (até migrar para browser-native)

**Arquivos Relacionados:**
- `src/arena/api.ts` - Endpoints
- `Arena-Frontend/components/arena-view.tsx` - Chamadas API

---

### Decisão: Atualização Narrativa Pendente

**Status**: ⚠️ **OFICIAL - Documentado, Pendente**

**O Que É:**
- UI precisa ser atualizada para nova narrativa consolidada
- Facções, alinhamento, narrativa corrigida

**Decisão:**
- ⚠️ **Pendente**: Implementar sistema de facções na UI
- ⚠️ **Pendente**: Implementar sistema de alinhamento na UI
- ⚠️ **Pendente**: Atualizar diálogos para trajectory matching

**Prioridade:**
- 🔴 Alta: Sistema de facções
- 🟡 Média: Sistema de alinhamento
- 🟡 Média: Diálogos atualizados

**Arquivos Relacionados:**
- `docs/03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md` - Detalhes

---

## 5. Arquitetura Geral

### Decisão: Híbrido Atual (Node.js + JSON✯Atomic)

**Status**: ✅ **OFICIAL - Implementado**

**O Que É:**
- Runtime: Node.js (Express, fs)
- Protocolo: JSON✯Atomic
- Crypto: JavaScript puro (portável)

**Decisão:**
- ✅ Arquitetura atual é híbrida
- ✅ Funciona bem para produção atual
- 📋 Migração para browser-native é proposta (não urgente)

**Arquivos Relacionados:**
- `server.hardened.ts` - Servidor atual
- `docs/06-PESQUISA/ANALISES_TECNICAS/ARQUITETURA_MOTOR.md` - Análise

---

### Decisão: Migração Browser-Native (Proposta)

**Status**: 📋 **OFICIAL - Proposta Documentada**

**O Que É:**
- Migração completa para browser-native
- IndexedDB em vez de fs
- PWA para iPhone
- Zero custo de infra

**Decisão:**
- 📋 **Proposta**: Migrar para browser-native
- ⚠️ **Não urgente**: Funciona bem como está
- ✅ **Quando**: Quando priorizar PWA/iPhone/zero custo

**Arquivos Relacionados:**
- `docs/01-ARQUITETURA/NOVA_ARQUITETURA_BROWSER_NATIVE.md` - Proposta
- `docs/01-ARQUITETURA/COMPARACAO_ARQUITETURAS.md` - Comparação
- `docs/01-ARQUITETURA/TRADE_OFFS_DECISOES.md` - Trade-offs

---

### Decisão: Event Bus sobre Ledger (Futuro)

**Status**: 📋 **OFICIAL - Planejado**

**O Que É:**
- Event Bus construído sobre Ledger
- Quando span é escrito, emite evento
- Sistemas escutam eventos (UI, narrativa, métricas)

**Decisão:**
- 📋 **Planejado**: Implementar Event Bus
- ✅ **Base**: Ledger já funciona como event log
- ⚠️ **Futuro**: Adicionar subscriptions real-time

**Arquivos Relacionados:**
- `docs/01-ARQUITETURA/VISAO_GERAL.md` - Mencionado
- `docs/06-PESQUISA/PESQUISAS_EXTERNAS/ESTRUTURA_GAMES.md` - Recomendado

---

### Decisão: ECS (Entity Component System) (Futuro)

**Status**: 📋 **OFICIAL - Planejado**

**O Que É:**
- Separar dados (components) de lógica (systems)
- Visual, Storytelling, Lógica independentes
- Data-driven design

**Decisão:**
- 📋 **Planejado**: Refatorar para ECS básico
- ✅ **Benefício**: Separação de responsabilidades
- ⚠️ **Futuro**: Quando arquitetura atual limitar

**Arquivos Relacionados:**
- `docs/06-PESQUISA/PESQUISAS_EXTERNAS/ESTRUTURA_GAMES.md` - Recomendado

---

### Decisão: Data-Driven Design (Futuro)

**Status**: 📋 **OFICIAL - Planejado**

**O Que É:**
- Conteúdo (diálogos, programas, configs) em YAML/JSON
- Não hardcoded no código
- Designers editam sem código

**Decisão:**
- 📋 **Planejado**: Mover conteúdo para YAML
- ✅ **Compatível**: JSON✯Atomic é domain-driven, não conflita
- ⚠️ **Futuro**: Quando conteúdo crescer

**Arquivos Relacionados:**
- `docs/06-PESQUISA/ANALISES_TECNICAS/PARADIGMAS.md` - Explicação

---

### Decisão: PostgreSQL + JSONL (Futuro)

**Status**: 📋 **OFICIAL - Planejado**

**O Que É:**
- PostgreSQL para queries relacionais
- JSONL Ledger para spans auditáveis
- CQRS pattern

**Decisão:**
- 📋 **Planejado**: Adicionar PostgreSQL
- ✅ **Benefício**: Queries complexas, leaderboard global
- ⚠️ **Futuro**: Quando precisar de queries avançadas

**Arquivos Relacionados:**
- `docs/06-PESQUISA/PESQUISAS_EXTERNAS/ESTRUTURA_GAMES.md` - Recomendado

---

## 📊 Resumo por Status

### ✅ Implementado e Oficial

1. **Motor**: JSON✯Atomic (Node.js + protocolo)
2. **Treino IA**: Trajectory Matching (A-Texts)
3. **Narrativa**: Reativa ao Ledger
4. **UI**: React/Next.js, Store stateless, REST API
5. **Ledger**: Fonte única da verdade

### 📋 Documentado e Planejado

1. **Migração Browser-Native**: Proposta completa
2. **Event Bus**: Planejado
3. **ECS**: Planejado
4. **Data-Driven**: Planejado
5. **PostgreSQL**: Planejado

### ⚠️ Pendente Implementação

1. **Sistema de Facções**: Documentado, falta UI
2. **Sistema de Alinhamento**: Documentado, falta UI
3. **Narrativa Corrigida**: Documentado, falta atualizar diálogos

---

## 🎯 Princípios Arquiteturais Oficiais

### 1. Ledger é o DNA
- Fonte única da verdade
- Imutável e auditável
- UI espelha Ledger

### 2. Trajectory Matching
- Sem gradientes
- Curadoria de dados
- Dataset expansion

### 3. Narrativa Reativa
- Gerada do Ledger
- Contextual e dinâmica
- Professor Oak reativo

### 4. UI Stateless
- Cache do Ledger
- Não calcula, apenas espelha
- Reativa a mudanças

### 5. BYOK (Bring Your Own Key)
- Usuário controla custos
- Privacidade máxima
- LLM como motor de conteúdo (futuro)

---

## 🔗 Referências

- **[Visão Geral](VISAO_GERAL.md)** - Documento central
- **[Roadmap](ROADMAP.md)** - Jornada completa
- **[Nova Arquitetura](NOVA_ARQUITETURA_BROWSER_NATIVE.md)** - Proposta
- **[Comparação](COMPARACAO_ARQUITETURAS.md)** - Atual vs Nova
- **[Trade-offs](TRADE_OFFS_DECISOES.md)** - Decisões detalhadas

---

**Status**: ✅ Decisões oficiais documentadas  
**Última atualização**: 2025-11-10

