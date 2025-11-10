# 📋 TASKLIST GIGANTE: Estado Atual → Produção

**Baseado em:** Roadmap de Alinhamento + Estrutura Final  
**Objetivo:** Levar ArenaLab do estado atual até produção completa  
**Arquitetura:** Browser-Native (PWA) + Cloudflare Workers (Edge)

---

## 🎯 FASE 0: PREPARAÇÃO E CONTRATOS

**STATUS:** ✅ **~90% COMPLETA**

### 0.1 Setup Monorepo
- [x] Criar estrutura `arena-lab/` conforme `ESTRUTURA_FINAL.md`
- [x] Configurar `pnpm-workspace.yaml`
- [x] Configurar `tsconfig.base.json` (base config compartilhado)
- [ ] Configurar `turbo.json` (opcional, para build caching - TODO)
- [x] Criar `package.json` root com scripts de build/test
- [x] Configurar `.gitignore` apropriado
- [x] Configurar `.prettierrc` (eslintrc opcional por enquanto)

### 0.2 Contracts First - Normalizar Atomic
- [x] Criar `packages/arena-domain/src/spans/battle-span.ts`
  - [x] Definir tipo `BattleSpan` (TypeScript)
  - [x] Adicionar validação Zod
  - [x] Exportar tipo e função `createBattleSpan()`
- [x] Criar `packages/arena-domain/src/spans/training-span.ts`
  - [x] Definir tipo `TrainingSpan`
  - [x] Adicionar validação Zod
  - [x] Exportar tipo e função `createTrainingSpan()`
- [x] Criar `packages/arena-domain/src/spans/evolution-span.ts`
  - [x] Definir tipo `EvolutionSpan`
  - [x] Adicionar validação Zod
  - [x] Exportar tipo e função `createEvolutionSpan()`
- [x] Criar `packages/arena-domain/src/spans/narrative-span.ts`
  - [x] Definir tipo `NarrativeSpan`
  - [x] Adicionar validação Zod
  - [x] Exportar tipo e função `createNarrativeSpan()`
- [x] Criar `packages/arena-domain/src/spans/ui-event-span.ts`
  - [x] Definir tipo `UIEventSpan`
  - [x] Adicionar validação Zod
  - [x] Exportar tipo e função `createUIEventSpan()`
- [x] Criar `packages/arena-domain/src/spans/index.ts`
  - [x] Exportar todos os tipos de span
  - [x] Exportar union type `ArenaSpan`
- [ ] Gerar JSON Schemas em `schemas/spans/` (TODO: opcional)
  - [ ] `schemas/spans/battle-span.json` (gerado de TypeScript)
  - [ ] `schemas/spans/training-span.json`
  - [ ] `schemas/spans/evolution-span.json`
  - [ ] `schemas/spans/narrative-span.json`
  - [ ] `schemas/spans/ui-event-span.json`
- [ ] Criar `tools/scripts/generate-schemas.ts` (TODO: opcional)
  - [ ] Script que gera JSON schemas a partir de tipos TypeScript
  - [ ] Integrar com CI
- [ ] Criar `tools/scripts/validate-spans.ts` (TODO: opcional)
  - [ ] Script que valida spans contra schemas (ajv ou zod)
  - [ ] Usar em CI e pre-commit hook

### 0.3 Atomic Core - Integrar JSON✯Atomic
- [x] Copiar/adaptar código de `Json-Atomic/` para `packages/atomic-core/`
  - [x] Copiar `core/crypto.ts` → `packages/atomic-core/src/crypto/hash.ts`, `sign.ts`, `verify.ts`
  - [x] Copiar `core/canonical.ts` → `packages/atomic-core/src/atomic/canonicalize.ts`
  - [x] Copiar `types.ts` → `packages/atomic-core/src/types.ts`
  - [x] Adaptar para browser-native (remover dependências Node.js, sem Buffer)
- [x] Criar `packages/atomic-core/src/atomic/create.ts`
  - [x] Função `createSpan<T>(data: T, signer: Signer): Span<T>`
  - [x] Usa `hashAtomic()`, `signAtomic()` do JSON✯Atomic
  - [x] Gera hash, assina, retorna span completo
- [x] Criar `packages/atomic-core/src/atomic/verify.ts`
  - [x] Função `verifySpan<T>(span: Span<T>): boolean`
  - [x] Usa `verifySignature()` do JSON✯Atomic
  - [x] Verifica hash e assinatura
- [x] Criar `packages/atomic-core/src/ledger/indexeddb-ledger.ts`
  - [x] Adaptar `core/ledger/ledger.ts` do JSON✯Atomic para IndexedDB
  - [x] Usar `idb` library para IndexedDB
  - [x] Métodos: `append(span)`, `scan(options)`, `query(options)`, `getStats()`
  - [x] Indexes: `entity_type`, `trace_id`, `when.started_at`
  - [x] Manter interface compatível com JSON✯Atomic
- [x] Criar `packages/atomic-core/src/ledger/memory-ledger.ts`
  - [x] Implementar Ledger em memória (para testes)
  - [x] Mesma interface que IndexedDB Ledger
- [x] Criar `packages/atomic-core/src/ledger/types.ts`
  - [x] Definir `Ledger` interface
  - [x] Reusar tipos do JSON✯Atomic
- [x] Criar `packages/atomic-core/src/execution/executor.ts`
  - [x] Adaptar `core/execution/executor.ts` do JSON✯Atomic
  - [x] Implementar `AtomicExecutor.processAtomic()` (já corrigido)
  - [x] Suportar execução derivada de spans
- [x] Criar `packages/atomic-core/src/index.ts`
  - [x] Exportar API pública: `createSpan`, `verifySpan`, `Ledger`, `AtomicExecutor`, etc.
  - [x] Re-exportar tipos do JSON✯Atomic
- [ ] Criar `packages/atomic-core/cli/logline-cli.ts` (TODO: opcional)
  - [ ] CLI para inspecionar ledger (browser ou Node.js)
  - [ ] Comandos: `verify`, `list`, `export`, `stats`
- [ ] Testes unitários para `atomic-core` (TODO: FASE 5)
  - [ ] Testar `createSpan()`, `verifySpan()`
  - [ ] Testar `Ledger.append()`, `Ledger.scan()`, `Ledger.query()`
  - [ ] Testar `AtomicExecutor.processAtomic()`

### 0.4 Domain Rules
- [x] Criar `packages/arena-domain/src/rules/xp.ts`
  - [x] Função `calculateXP(span: ArenaSpan): number`
  - [x] Função `calculateLevel(xp: number): number`
  - [x] Regras: battle win = 100, loss = 30, draw = 50, training = 50, evolution = 1000, ascension = 5000
- [x] Criar `packages/arena-domain/src/rules/elo.ts`
  - [x] Função `calculateELO(winnerElo, loserElo): { newWinnerElo, newLoserElo, winnerChange, loserChange }`
  - [x] Função `calculateELODraw(eloA, eloB)` para empates
  - [x] K-factor = 32
- [x] Criar `packages/arena-domain/src/rules/trust.ts`
  - [x] Função `calculateTrustChange(span: ArenaSpan): number`
  - [x] Função `applyTrustChange(currentTrust, change): number` (com clamping)
  - [x] Regras: win = +5, loss = -3, training = +2, evolution = +10
- [x] Criar `packages/arena-domain/src/rules/evolution.ts`
  - [x] Função `canEvolve(creature: Creature): { canEvolve, reason?, requirements }`
  - [x] Requisitos: level >= 15 (primeira), >= 25 (segunda), trust >= 85, diamondSpans >= 50 (primeira), >= 100 (segunda)
- [x] Criar `packages/arena-domain/src/rules/ascension.ts`
  - [x] Função `canAscend(creature: Creature): { canAscend, reason?, requirements }`
  - [x] Requisitos: level >= 30, evolutionStage >= 2, trust >= 90, diamondSpans >= 100
- [x] Criar `packages/arena-domain/src/entities/creature.ts`
  - [x] Definir tipo `Creature` completo
  - [x] Validação Zod
  - [x] Função `createCreature()`
- [x] Criar `packages/arena-domain/src/entities/training-session.ts`
  - [x] Definir tipo `TrainingSession`
  - [x] Função `createTrainingSession()`
- [x] Criar `packages/arena-domain/src/entities/agent.ts`
  - [x] Definir tipo `Agent`
  - [x] Função `createAgent()`
- [x] Criar `packages/arena-domain/src/index.ts`
  - [x] Exportar todos os tipos e regras

---

## 🔧 FASE 1: TRAJECTORY ENGINE

**STATUS:** ✅ **100% COMPLETA**

### 1.1 Search (HNSW + TF-IDF)
- [x] Criar `packages/trajectory-engine/search/tfidf-embedding.ts`
  - [x] Implementar TF-IDF embedding (determinístico, sem ML)
  - [x] Função `embed(text: string, corpus: string[]): number[]`
  - [x] Função `normalize(vector: number[]): number[]`
- [x] Criar `packages/trajectory-engine/search/index.ts`
  - [x] Exportar API pública
- [x] Criar `packages/trajectory-engine/search/hnsw-index.ts`
  - [x] Implementar HNSW index (implementação própria)
  - [x] Métodos: `insert(id, vector)`, `search(query, k)`, `getNode(id)`, `size()`, `clear()`
- [x] Criar `packages/trajectory-engine/search/hybrid-index.ts`
  - [x] Implementar hybrid index (HNSW + placeholder para IVF)
  - [x] Usar HNSW para busca rápida, preparado para IVF quando necessário

### 1.2 Quality Meter
- [x] Criar `packages/trajectory-engine/quality/quality-meter.ts`
  - [x] Implementar Quality Meter 5D
  - [x] Dimensões: completeness, provenance, impact, uniqueness, coherence
  - [x] Função `calculateQuality(span: Atomic, ledger: Atomic[]): QualityScore`
- [x] Criar `packages/trajectory-engine/quality/curator.ts`
  - [x] Implementar lógica de curadoria
  - [x] Função `curateSpans(spans: Span[], minQuality: number, ledger: Atomic[]): Array<{span, score}>`
  - [x] Função `curateSpansOnly()` - versão simplificada
  - [x] Filtra spans com quality >= threshold
- [x] Criar `packages/trajectory-engine/quality/index.ts`
  - [x] Exportar API pública

### 1.3 Predictor
- [x] Criar `packages/trajectory-engine/predictor/matcher.ts`
  - [x] Implementar context matching
  - [x] Função `matchContext(context: Context, spans: Span[]): SimilarSpan[]`
  - [x] Usa weighted factors: domain, emotional state, stakes, action sequence
- [x] Criar `packages/trajectory-engine/predictor/synthesizer.ts`
  - [x] Implementar outcome synthesis
  - [x] Função `synthesizeByMajorityVote(similarSpans: SimilarSpan[]): Outcome`
  - [x] Métodos: majority vote (implementado), LLM-based (placeholder), template-based (placeholder)
- [x] Criar `packages/trajectory-engine/predictor/confidence.ts`
  - [x] Implementar confidence calibration
  - [x] Função `calibrate(outcome: Outcome, similarSpans: SimilarSpan[]): number`
- [x] Criar `packages/trajectory-engine/predictor/index.ts`
  - [x] Exportar API pública

### 1.4 Narrative Generator
- [x] Criar `packages/trajectory-engine/narrative/deterministic.ts`
  - [x] Definir regras determinísticas de narrativa
  - [x] Exemplo: `if span.type === 'training_completed' → generate 'training_completed' event`
- [x] Criar `packages/trajectory-engine/narrative/generator.ts`
  - [x] Implementar gerador de eventos narrativos
  - [x] Função `generateNarrativeEvents(spans: Span[]): NarrativeEvent[]`
  - [x] Usa regras determinísticas (LLM placeholder para futuro)
- [x] Criar `packages/trajectory-engine/narrative/index.ts`
  - [x] Exportar API pública

### 1.5 Integration
- [x] Criar `packages/trajectory-engine/src/index.ts`
  - [x] Exportar API unificada
- [ ] Testes unitários para cada módulo (TODO: FASE 5)
- [x] Documentar em `docs/02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md` (já existe)

**STATUS FASE 1:** ✅ **100% COMPLETA** (testes em FASE 5)

---

## 🌐 FASE 2: CLOUDFLARE WORKERS (API)

**STATUS:** ✅ **~95% COMPLETA** (testes e LLM real em FASE 5)

### 2.1 Setup Cloudflare Workers
- [x] Criar `apps/arena-api/wrangler.toml`
  - [x] Configurar estrutura básica (account_id/zone_id configurar em produção)
- [x] Criar `apps/arena-api/package.json`
  - [x] Dependências: `@cloudflare/workers-types`, `hono`
- [x] Criar `apps/arena-api/src/index.ts`
  - [x] Entry point do Worker
  - [x] Setup routing básico
- [x] Criar `apps/arena-api/tsconfig.json`
  - [x] Configuração TypeScript para Workers

### 2.2 Auth Middleware
- [x] Criar `apps/arena-api/src/middleware/auth.ts`
  - [x] Verificar Google OAuth token (mock implementado, TODO: verificação real)
  - [x] Extrair user_id do token
  - [x] Adicionar `user_id` ao request context
- [x] Criar `apps/arena-api/src/middleware/cors.ts`
  - [x] CORS headers apropriados
- [x] Criar `apps/arena-api/src/middleware/rate-limit.ts`
  - [x] Estrutura básica (TODO: implementar com Durable Objects)

### 2.3 Battle Handler
- [x] Criar `apps/arena-api/src/handlers/battle-handler.ts`
  - [x] Receber `POST /api/arena/battle`
  - [x] Validar input (creatureA_id, creatureB_id, prompt)
  - [x] Buscar creatures do ledger
  - [ ] Chamar LLM para ambas as creatures (BYOK) (TODO: implementar real, mock funcionando)
  - [x] Calcular Quality Meter 5D
  - [x] Determinar winner
  - [x] Calcular ELO changes
  - [x] Criar `BattleSpan`
  - [x] Append ao ledger
  - [x] Gerar `NarrativeEvent[]` via trajectory-engine
  - [x] Retornar estrutura completa
- [x] Criar `apps/arena-api/src/routes/battle.ts`
  - [x] Rota que chama `battle-handler`

### 2.4 Training Handler
- [x] Criar `apps/arena-api/src/handlers/training-handler.ts`
  - [x] Receber `POST /api/arena/creatures/:id/train`
  - [x] Validar input (program_id)
  - [x] Criar `TrainingSession`
  - [x] Criar `TrainingSpan` (training_started)
  - [x] Append ao ledger
  - [x] Gerar narrative events
  - [x] Retornar estrutura completa
- [x] Criar `apps/arena-api/src/handlers/training-complete-handler.ts` (integrado em training-handler.ts)
  - [x] Receber `POST /api/arena/sessions/:id/complete`
  - [x] Buscar session do ledger
  - [ ] Aplicar buffs/traits (TODO: implementar completo)
  - [x] Criar `TrainingSpan` (training_completed)
  - [x] Append ao ledger
  - [x] Gerar `NarrativeEvent[]`
- [x] Criar `apps/arena-api/src/routes/training.ts`
  - [x] Rotas que chamam handlers

### 2.5 Evolution Handler
- [x] Criar `apps/arena-api/src/handlers/evolution-handler.ts`
  - [x] Receber `POST /api/arena/creatures/:id/evolve`
  - [x] Validar requisitos (level, trust, diamondSpans)
  - [x] Buscar creature do ledger
  - [x] Criar `EvolutionSpan`
  - [x] Append ao ledger
  - [x] Gerar `NarrativeEvent[]`
  - [x] Retornar estrutura completa
- [x] Criar `apps/arena-api/src/routes/evolution.ts`

### 2.6 DNA/Leaderboard/Legend Handlers
- [x] Criar `apps/arena-api/src/handlers/dna-handler.ts`
  - [x] Receber `GET /api/arena/creatures/:id/dna`
  - [x] Buscar todos os spans da creature do ledger (via getCreatureState)
  - [x] Agregar estatísticas
  - [x] Identificar milestones
  - [x] Calcular quality profile
  - [x] Retornar estrutura completa
- [x] Criar `apps/arena-api/src/handlers/leaderboard-handler.ts`
  - [x] Receber `GET /api/arena/leaderboard`
  - [x] Buscar todas as creatures do ledger
  - [x] Filtrar/ordenar por critérios
  - [x] Retornar estrutura completa
- [x] Criar `apps/arena-api/src/handlers/legend-handler.ts`
  - [x] Receber `GET /api/arena/creatures/:id/legend`
  - [x] Buscar spans da creature (via getCreatureState)
  - [x] Gerar capítulos narrativos
  - [x] Calcular Merkle root (simplificado)
  - [x] Retornar estrutura completa
- [x] Criar rotas correspondentes (`apps/arena-api/src/routes/creatures.ts`)

### 2.7 Ascension Handler
- [x] Criar `apps/arena-api/src/handlers/ascension-handler.ts`
  - [x] Receber `POST /api/arena/creatures/:id/ascend`
  - [x] Validar requisitos
  - [x] Gerar API key
  - [x] Criar `Agent`
  - [ ] Criar `AscensionSpan` e append ao ledger (TODO: implementar)
  - [ ] Gerar certificação (TODO: implementar)
  - [ ] Gerar code snippets (TODO: implementar)
  - [x] Retornar estrutura básica
- [x] Criar `apps/arena-api/src/handlers/agent-invoke-handler.ts`
  - [x] Receber `POST /api/arena/agents/:id/invoke`
  - [ ] Verificar API key (TODO: implementar)
  - [ ] Rate limiting (TODO: implementar)
  - [ ] Chamar LLM (BYOK) (TODO: implementar)
  - [ ] Calcular custos/royalties (TODO: implementar)
  - [ ] Criar `InferenceSpan` e append ao ledger (TODO: implementar)
  - [x] Retornar estrutura básica
- [x] Criar rotas correspondentes (`apps/arena-api/src/routes/ascension.ts`)

### 2.8 State Aggregation
- [x] Criar `apps/arena-api/src/state/getCreatureState.ts`
  - [x] Função que agrega spans → estado da UI
  - [x] Busca spans do ledger
  - [x] Aplica regras de domínio (XP, ELO, trust)
  - [x] Retorna estado completo
- [x] Criar `apps/arena-api/src/handlers/state-handler.ts`
  - [x] Handler para estado agregado
- [x] Criar `apps/arena-api/src/routes/state.ts`
  - [x] Rota `GET /api/arena/creatures/:id/state`
  - [x] Retorna estado agregado
- [x] Criar `apps/arena-api/src/utils/getCreature.ts`
  - [x] Helper para buscar creatures do ledger
  - [x] Função `getCreature()` e `getAllCreatures()`

### 2.9 Testing
- [ ] Criar `apps/arena-api/tests/e2e/battle.test.ts` (TODO: FASE 5)
- [ ] Criar `apps/arena-api/tests/e2e/training.test.ts` (TODO: FASE 5)
- [ ] Criar `apps/arena-api/tests/e2e/evolution.test.ts` (TODO: FASE 5)
- [ ] Criar `apps/arena-api/tests/e2e/dna.test.ts` (TODO: FASE 5)
- [ ] Criar `apps/arena-api/tests/e2e/leaderboard.test.ts` (TODO: FASE 5)
- [ ] Criar `apps/arena-api/tests/e2e/legend.test.ts` (TODO: FASE 5)
- [ ] Criar `apps/arena-api/tests/e2e/ascension.test.ts` (TODO: FASE 5)
- [ ] Configurar `wrangler dev` para testes locais (TODO: FASE 5)

**STATUS FASE 2:** ✅ **~95% COMPLETA** (testes e LLM real em FASE 5)

---

## 🎨 FASE 3: FRONTEND (NEXT.JS PWA)

**STATUS:** ✅ **~80% COMPLETA** (componentes principais migrados e funcionando, testes em FASE 5)

### 3.1 Setup Next.js
- [x] Criar `apps/arena-frontend/package.json`
  - [x] Dependências: `next`, `react`, `react-dom`, `zustand`, `@react-oauth/google`
- [x] Criar `apps/arena-frontend/next.config.js`
  - [x] Configurar PWA (usar `next-pwa`)
- [x] Criar `apps/arena-frontend/app/layout.tsx`
  - [x] Root layout com Google OAuth provider
- [x] Criar `apps/arena-frontend/app/page.tsx`
  - [x] Landing page ou redirect para login
- [x] Criar `apps/arena-frontend/tsconfig.json`
- [x] Criar `apps/arena-frontend/public/manifest.json`

### 3.2 Google OAuth
- [x] Criar `apps/arena-frontend/lib/auth/google-oauth.ts`
  - [x] Integrar `@react-oauth/google` (estrutura básica)
  - [x] Função `loginWithGoogle()` (mock)
  - [x] Função `getUserFromToken()` (mock)
- [x] Criar `apps/arena-frontend/app/(auth)/login/page.tsx`
  - [x] Tela de login com Google OAuth button
  - [x] Redirect após login bem-sucedido

### 3.3 IndexedDB Ledger
- [x] Criar `apps/arena-frontend/lib/ledger/indexeddb-ledger.ts`
  - [x] Wrapper do `packages/atomic-core/src/ledger/indexeddb-ledger.ts`
  - [x] Inicializar IndexedDB no browser
  - [x] Métodos: `append`, `getAll`, `getByWho`, etc.
- [x] Criar `apps/arena-frontend/lib/ledger/sync.ts`
  - [x] Sync com Google Drive (estrutura, TODO: implementar)
  - [x] Função `syncToDrive()` e `syncFromDrive()`
- [x] Criar `apps/arena-frontend/lib/ledger/export.ts`
  - [x] Função `exportLedger()` (JSON download)
  - [x] Função `importLedger()` (JSON upload)

### 3.4 State Management
- [x] Criar `apps/arena-frontend/lib/state/derivation.ts`
  - [x] Função pura `deriveState(spans: Span[]): UIState`
  - [x] Agrega spans → estado da UI
  - [x] Aplica regras de domínio (básico)
- [x] Criar `apps/arena-frontend/lib/state/store.ts`
  - [x] Zustand store
  - [x] Ações: `updateCreature`, `addSpan`, `syncLedger`
  - [x] Store é cache do ledger, não fonte de verdade
- [x] Criar `apps/arena-frontend/lib/state/sync.ts`
  - [x] Hook `useLedgerSync()` que escuta mudanças no ledger
  - [x] Atualiza store quando ledger muda
  - [x] Usa polling

### 3.5 API Client
- [x] Criar `apps/arena-frontend/lib/api/client.ts`
  - [x] Cliente para Cloudflare Workers API
  - [x] Métodos: `battle()`, `train()`, `evolve()`, etc.
  - [x] Inclui autenticação (Google OAuth token)
- [x] Criar `apps/arena-frontend/lib/api/types.ts`
  - [x] Tipos de API responses

### 3.6 Prompt Templates
- [ ] Criar `apps/arena-frontend/lib/prompts/battle.ts` (TODO: opcional)
  - [ ] Template de prompt para batalhas
  - [ ] Inclui contexto da creature, prompt do usuário
- [ ] Criar `apps/arena-frontend/lib/prompts/training.ts` (TODO: opcional)
  - [ ] Template de prompt para treinamento
- [ ] Criar `apps/arena-frontend/lib/prompts/narrative.ts` (TODO: opcional)
  - [ ] Template de prompt para geração narrativa

### 3.7 UI Components - Battle
- [x] Criar `apps/arena-frontend/components/arena-view.tsx` (MIGRADO)
  - [x] Interface de batalha completa
  - [x] Mostra duas creatures, prompt, respostas
  - [x] Botão "Start Battle" que chama API
  - [x] Processa `narrativeEvents` e atualiza UI
- [x] Criar `apps/arena-frontend/components/creature-card.tsx` (MIGRADO)
  - [x] Card de creature com stats, trust, level
  - [x] Mostra buffs ativos, traits permanentes
  - [x] Botão "Evolve" (se elegível)

### 3.8 UI Components - Training
- [x] Criar `apps/arena-frontend/components/training-center.tsx` (MIGRADO)
  - [x] Lista de programas de treinamento
  - [x] Botão "Start Training" que chama API
  - [x] Mostra progresso (timer)
  - [x] Botão "Complete Training" após duração
  - [x] Processa `narrativeEvents`

### 3.9 UI Components - Evolution
- [x] Criar `apps/arena-frontend/components/evolution-ceremony.tsx` (MIGRADO)
  - [x] Animação de 3 fases (Preparing, Transforming, Revealed)
  - [x] Mostra novas abilities após evolução
  - [x] Processa `narrativeEvents`

### 3.10 UI Components - Ecosystem
- [x] Criar `apps/arena-frontend/components/evolution-timeline.tsx` (MIGRADO - DNA Timeline)
  - [x] Timeline vertical com eventos
  - [x] Cards clicáveis (battles, training, evolution)
  - [x] Estatísticas agregadas
- [x] Criar `apps/arena-frontend/components/leaderboard.tsx` (MIGRADO)
  - [x] Tabela de ranking global
  - [x] Filtros e ordenação
  - [x] Badges dinâmicos
- [x] Criar `apps/arena-frontend/components/creature-legend.tsx` (MIGRADO)
  - [x] Livro digital com capítulos
  - [x] Botão de compartilhar
  - [x] QR code (estrutura)

### 3.11 UI Components - Production
- [x] Criar `apps/arena-frontend/components/production-lab.tsx` (MIGRADO)
  - [x] Lista de creatures elegíveis para ascensão
  - [x] Botão "Ascend" que chama API
  - [x] Mostra agentes criados
  - [x] Mini playground para testar agentes
  - [ ] Code snippets (Node.js, Python, cURL) (TODO: implementar completo)

### 3.12 UI Components - Narrative
- [x] Criar `apps/arena-frontend/components/professor-oak-panel.tsx` (MIGRADO)
  - [x] Painel lateral com mensagens do Professor Oak
  - [x] Reage a `narrativeEvents`
  - [x] Tipos: tip, celebration, tutorial, warning
- [ ] Criar `apps/arena-frontend/components/narrative/faction-choice.tsx` (TODO: futuro)
  - [ ] Tela inicial de escolha de facção
  - [ ] 3 opções: Embaixada, Consórcio, Libertos
  - [ ] Grava span no ledger
- [ ] Criar `apps/arena-frontend/components/narrative/alignment-indicator.tsx` (TODO: futuro)
  - [ ] Indicador visual de alinhamento
  - [ ] Mostra progresso para cada facção

### 3.13 Routes
- [x] UI principal em `apps/arena-frontend/app/page.tsx` (MIGRADO)
  - [x] Pipeline Canvas com views (arena, training, production, ledger)
- [ ] Criar `apps/arena-frontend/app/(arena)/battle/page.tsx` (TODO: opcional - já funciona no canvas)
- [ ] Criar `apps/arena-frontend/app/(arena)/training/page.tsx` (TODO: opcional - já funciona no canvas)
- [ ] Criar `apps/arena-frontend/app/(arena)/creatures/page.tsx` (TODO: opcional)
- [ ] Criar `apps/arena-frontend/app/(arena)/production/page.tsx` (TODO: opcional - já funciona no canvas)

### 3.14 Service Worker (PWA)
- [x] Configurar `next-pwa` no `next.config.js` (já configurado)
- [x] Criar `apps/arena-frontend/public/manifest.json` (já existe)
  - [x] PWA manifest
- [ ] Criar `apps/arena-frontend/service-worker.ts` (TODO: opcional - next-pwa gera automaticamente)

### 3.15 Testing
- [ ] Testes E2E com Playwright (TODO: FASE 5)
- [ ] Testes de componentes com React Testing Library (TODO: FASE 5)

**STATUS FASE 3:** ✅ **~80% COMPLETA** (componentes principais migrados e funcionando, testes em FASE 5)

---

## 🔄 FASE 4: OBSERVER BOT & EVENT BUS

### 4.1 Observer Bot
- [ ] Criar `services/observer-bot/src/watcher.ts`
  - [ ] Observa ledger para novos spans
  - [ ] Usa IndexedDB events ou polling
  - [ ] Emite eventos para handlers
- [ ] Criar `services/observer-bot/src/handlers/training-handler.ts`
  - [ ] Handler para `training_started` e `training_completed`
  - [ ] Dispara trajectory-engine para curadoria
- [ ] Criar `services/observer-bot/src/handlers/battle-handler.ts`
  - [ ] Handler para `battle` spans
  - [ ] Atualiza ELO, trust
- [ ] Criar `services/observer-bot/src/handlers/narrative-handler.ts`
  - [ ] Handler para spans narrativos
  - [ ] Gera `NarrativeEvent[]` via trajectory-engine
- [ ] Criar `services/observer-bot/src/index.ts`
  - [ ] Inicializa watcher e handlers

### 4.2 Event Bus (Alternativa Simples)
- [ ] OU: Criar `packages/arena-domain/src/events/event-bus.ts`
  - [ ] EventEmitter simples (em-memory)
  - [ ] Métodos: `on(event, handler)`, `emit(event, data)`
- [ ] Integrar com observer-bot

---

## 🧪 FASE 5: TESTING & QUALITY

### 5.1 Test Fixtures
- [ ] Criar `packages/testing/fixtures/spans.ts`
  - [ ] Helpers para criar spans válidos
  - [ ] `createBattleSpan()`, `createTrainingSpan()`, etc.
- [ ] Criar `packages/testing/fixtures/creatures.ts`
  - [ ] Helpers para criar creatures de teste
- [ ] Criar `packages/testing/fixtures/ledger.ts`
  - [ ] Helpers para criar ledgers de teste

### 5.2 Test Harness
- [ ] Criar `packages/testing/harness/e2e-harness.ts`
  - [ ] Setup completo para testes E2E
  - [ ] Inicializa ledger, cria creatures, etc.
- [ ] Criar `packages/testing/harness/ledger-harness.ts`
  - [ ] Utilitários para testar ledger
- [ ] Criar `packages/testing/harness/api-harness.ts`
  - [ ] Utilitários para testar API

### 5.3 Unit Tests
- [ ] Testes para `packages/atomic-core`
- [ ] Testes para `packages/arena-domain`
- [ ] Testes para `packages/trajectory-engine`
- [ ] Testes para `apps/arena-api` handlers

### 5.4 Integration Tests
- [ ] Testes de integração: Ledger → API → Frontend
- [ ] Testes de integração: Training → Trajectory Engine → Narrative

### 5.5 E2E Tests
- [ ] Teste completo: Login → Escolher Faction → Criar Creature → Battle → Training → Evolution
- [ ] Teste completo: Ascension → Agent Invocation
- [ ] Teste completo: DNA → Leaderboard → Legend

---

## 📊 FASE 6: OBSERVABILIDADE

### 6.1 Metrics
- [ ] Instrumentar `apps/arena-api` com Prometheus metrics
  - [ ] `training_sessions_total`
  - [ ] `narrative_events_total`
  - [ ] `ui_state_push_latency`
  - [ ] `battle_duration_seconds`
  - [ ] `trust_level_distribution`
- [ ] Expor endpoint `/metrics` no Worker

### 6.2 Logging
- [ ] Configurar logging estruturado
- [ ] Logs de spans criados
- [ ] Logs de erros

### 6.3 Dashboards
- [ ] Criar dashboard Grafana
  - [ ] Painel "Training→Narrative→UI loop"
  - [ ] Métricas de performance
  - [ ] Métricas de qualidade

---

## 📚 FASE 7: DOCUMENTAÇÃO & GOVERNANÇA

### 7.1 ADRs
- [ ] Criar `docs/01-ARQUITETURA/ADR-001-Contracts-First.md`
- [ ] Criar `docs/01-ARQUITETURA/ADR-002-Browser-Native.md`
- [ ] Criar `docs/01-ARQUITETURA/ADR-003-Trajectory-Matching.md`
- [ ] Criar `docs/01-ARQUITETURA/ADR-004-BYOK.md`

### 7.2 API Documentation
- [ ] Criar `schemas/api/openapi.yaml`
  - [ ] OpenAPI spec completo
- [ ] Gerar documentação Swagger
- [ ] Criar `docs/07-REFERENCIA/API_ENDPOINTS.md` (atualizar)

### 7.3 Implementation Guides
- [ ] Atualizar `docs/04-IMPLEMENTACAO/FASE_1_BATTLE.md`
- [ ] Atualizar `docs/04-IMPLEMENTACAO/FASE_2_TRAINING.md`
- [ ] Atualizar `docs/04-IMPLEMENTACAO/FASE_3_ECOSYSTEM.md`
- [ ] Atualizar `docs/04-IMPLEMENTACAO/FASE_4_ASCENSION.md`

### 7.4 Migration Guide
- [ ] Criar `docs/04-IMPLEMENTACAO/MIGRACAO.md`
  - [ ] Guia de migração de `diamond-applied/` para `arena-lab/`
  - [ ] Checklist de migração

---

## 🚀 FASE 8: DEPLOYMENT & PRODUÇÃO

### 8.1 Cloudflare Workers Deployment
- [ ] Configurar `wrangler.toml` para produção
- [ ] Configurar secrets (Google OAuth client_id, etc.)
- [ ] Deploy `apps/arena-api` para Cloudflare Workers
- [ ] Deploy `apps/arena-worker` para Cloudflare Workers
- [ ] Configurar custom domain

### 8.2 Frontend Deployment
- [ ] Build Next.js para produção
- [ ] Deploy para Cloudflare Pages (ou Vercel)
- [ ] Configurar PWA manifest
- [ ] Testar offline functionality

### 8.3 CI/CD
- [ ] Criar `.github/workflows/ci.yml`
  - [ ] Lint
  - [ ] Type check
  - [ ] Unit tests
  - [ ] E2E tests
  - [ ] Validate spans
- [ ] Criar `.github/workflows/deploy.yml`
  - [ ] Deploy automático após merge em main

### 8.4 Monitoring
- [ ] Configurar alertas (Prometheus alerts)
- [ ] Configurar uptime monitoring
- [ ] Configurar error tracking (Sentry ou similar)

### 8.5 Smoke Tests
- [ ] Teste manual: Login → Battle → Training → Evolution
- [ ] Teste manual: Ascension → Agent Invocation
- [ ] Verificar ledger com `logline-cli verify`
- [ ] Verificar métricas no dashboard

### 8.6 Rollout
- [ ] Comunicar no changelog
- [ ] Preparar plano de rollback
- [ ] Deploy gradual (canary, se possível)

---

## ✅ CHECKLIST FINAL

### Contratos
- [ ] Todos os span types definidos e validados
- [ ] JSON schemas gerados e versionados
- [ ] Validação de spans em CI

### Motor
- [ ] Trajectory engine completo (HNSW + TF-IDF)
- [ ] Quality meter funcionando
- [ ] Narrative generator funcionando

### API
- [ ] Todos os endpoints implementados
- [ ] Autenticação funcionando
- [ ] Rate limiting funcionando
- [ ] E2E tests passando

### Frontend
- [ ] Todas as telas implementadas
- [ ] Google OAuth funcionando
- [ ] IndexedDB Ledger funcionando
- [ ] PWA funcionando (offline)
- [ ] Narrative events sendo processados

### Observabilidade
- [ ] Métricas expostas
- [ ] Dashboards configurados
- [ ] Alertas configurados

### Documentação
- [ ] ADRs criados
- [ ] API documentada
- [ ] Guias de implementação atualizados

### Produção
- [ ] Deploy em produção
- [ ] Smoke tests passando
- [ ] Monitoramento ativo

---

## 📝 NOTAS

### Priorização
1. **FASE 0** (Contratos) é crítica - sem isso, tudo desalinha
2. **FASE 1** (Trajectory Engine) pode ser desenvolvida em paralelo com FASE 2
3. **FASE 2** (API) e **FASE 3** (Frontend) podem ser desenvolvidas em paralelo após FASE 0
4. **FASE 4** (Observer Bot) pode ser simples (EventEmitter) inicialmente

### Dependências Externas
- **A-Texts**: Copiar/adaptar código para `packages/trajectory-engine/`
- **Google OAuth**: Usar `@react-oauth/google`
- **IndexedDB**: Usar `idb` library
- **Cloudflare Workers**: Usar `wrangler` CLI

### Riscos
- **IndexedDB limits**: Pode precisar de compressão ou exportação periódica
- **Cloudflare Workers limits**: Verificar limites de CPU time e memory
- **BYOK security**: Validar API keys no Worker antes de usar

---

**Status Atual:** ✅ Documentação completa, ⚠️ Código precisa migração  
**Próximo Passo:** Começar FASE 0 (Contratos First)


