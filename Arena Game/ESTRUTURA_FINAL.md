# 🏗️ ESTRUTURA FINAL: ArenaLab Monorepo

**Arquitetura:** Browser-Native (PWA) + Cloudflare Workers (Edge)  
**Autenticação:** Google OAuth  
**LLM:** BYOK (Bring Your Own Key)  
**Motor:** Trajectory Matching (sem gradientes, sem LoRA, sem fine-tuning tradicional)

---

## 📁 Estrutura Completa

```
arena-lab/
├─ apps/
│  ├─ arena-frontend/              # Next.js PWA (browser-native)
│  │  ├─ app/                      # Next.js App Router
│  │  │  ├─ (auth)/
│  │  │  │  └─ login/
│  │  │  │     └─ page.tsx        # TODO: Google OAuth login
│  │  │  ├─ (arena)/
│  │  │  │  ├─ battle/
│  │  │  │  │  └─ page.tsx        # TODO: Battle Arena UI
│  │  │  │  ├─ training/
│  │  │  │  │  └─ page.tsx        # TODO: Training Center UI
│  │  │  │  ├─ creatures/
│  │  │  │  │  └─ page.tsx        # TODO: My Creatures UI
│  │  │  │  └─ production/
│  │  │  │     └─ page.tsx        # TODO: Production Lab UI
│  │  │  ├─ layout.tsx            # TODO: Root layout with Google OAuth
│  │  │  └─ page.tsx              # TODO: Landing page / faction choice
│  │  ├─ components/              # UI Components
│  │  │  ├─ arena/
│  │  │  │  ├─ battle-arena.tsx  # TODO: Battle interface
│  │  │  │  ├─ creature-card.tsx # TODO: Creature display
│  │  │  │  ├─ training-center.tsx # TODO: Training UI
│  │  │  │  ├─ evolution-ceremony.tsx # TODO: Evolution animation
│  │  │  │  ├─ dna-timeline.tsx   # TODO: DNA visualization
│  │  │  │  ├─ leaderboard.tsx    # TODO: Leaderboard UI
│  │  │  │  ├─ creature-legend.tsx # TODO: Legend book UI
│  │  │  │  └─ production-lab.tsx # TODO: Production deployment UI
│  │  │  ├─ narrative/
│  │  │  │  ├─ professor-oak-panel.tsx # TODO: Professor Oak messages
│  │  │  │  ├─ faction-choice.tsx  # TODO: Initial faction selection
│  │  │  │  └─ alignment-indicator.tsx # TODO: Alignment meter
│  │  │  └─ shared/               # Shared components
│  │  │     ├─ button.tsx
│  │  │     ├─ card.tsx
│  │  │     └─ ...
│  │  ├─ lib/
│  │  │  ├─ ledger/
│  │  │  │  ├─ indexeddb-ledger.ts # TODO: IndexedDB Ledger implementation
│  │  │  │  ├─ sync.ts             # TODO: Ledger sync with Google Drive
│  │  │  │  └─ export.ts           # TODO: Export/import ledger
│  │  │  ├─ state/
│  │  │  │  ├─ store.ts            # TODO: Zustand store (cache of ledger)
│  │  │  │  ├─ derivation.ts      # TODO: Pure function: spans → UI state
│  │  │  │  └─ sync.ts             # TODO: Sync ledger → store
│  │  │  ├─ auth/
│  │  │  │  ├─ google-oauth.ts    # TODO: Google OAuth integration
│  │  │  │  └─ session.ts         # TODO: Session management
│  │  │  ├─ api/
│  │  │  │  ├─ client.ts          # TODO: API client (Cloudflare Workers)
│  │  │  │  └─ types.ts           # TODO: API types
│  │  │  ├─ prompts/
│  │  │  │  ├─ battle.ts          # TODO: Battle prompt templates
│  │  │  │  ├─ training.ts        # TODO: Training prompt templates
│  │  │  │  └─ narrative.ts       # TODO: Narrative prompt templates
│  │  │  └─ utils/
│  │  │     └─ ...
│  │  ├─ public/                  # Static assets
│  │  │  ├─ icons/
│  │  │  └─ images/
│  │  ├─ service-worker.ts        # TODO: Service Worker for offline
│  │  ├─ manifest.json            # TODO: PWA manifest
│  │  └─ package.json
│  │
│  ├─ arena-api/                  # Cloudflare Workers (Edge Functions)
│  │  ├─ src/
│  │  │  ├─ routes/
│  │  │  │  ├─ battle.ts          # TODO: POST /api/arena/battle
│  │  │  │  ├─ training.ts        # TODO: POST /api/arena/creatures/:id/train
│  │  │  │  ├─ evolution.ts       # TODO: POST /api/arena/creatures/:id/evolve
│  │  │  │  ├─ dna.ts             # TODO: GET /api/arena/creatures/:id/dna
│  │  │  │  ├─ leaderboard.ts     # TODO: GET /api/arena/leaderboard
│  │  │  │  ├─ legend.ts          # TODO: GET /api/arena/creatures/:id/legend
│  │  │  │  ├─ ascension.ts       # TODO: POST /api/arena/creatures/:id/ascend
│  │  │  │  └─ agents.ts          # TODO: POST /api/arena/agents/:id/invoke
│  │  │  ├─ handlers/
│  │  │  │  ├─ battle-handler.ts  # TODO: Battle logic
│  │  │  │  ├─ training-handler.ts # TODO: Training logic
│  │  │  │  └─ ...
│  │  │  ├─ middleware/
│  │  │  │  ├─ auth.ts            # TODO: Google OAuth verification
│  │  │  │  ├─ cors.ts            # TODO: CORS headers
│  │  │  │  └─ rate-limit.ts      # TODO: Rate limiting
│  │  │  └─ index.ts              # TODO: Worker entry point
│  │  ├─ tests/
│  │  │  └─ e2e/
│  │  │     ├─ battle.test.ts     # TODO: E2E battle tests
│  │  │     ├─ training.test.ts   # TODO: E2E training tests
│  │  │     └─ ...
│  │  ├─ wrangler.toml            # TODO: Cloudflare Workers config
│  │  └─ package.json
│  │
│  └─ arena-worker/               # Cloudflare Workers (Background Jobs)
│     ├─ jobs/
│     │  ├─ trajectory-matching.ts # TODO: Batch trajectory matching
│     │  ├─ narrative-generation.ts # TODO: Narrative event generation
│     │  └─ quality-curation.ts   # TODO: Quality-based span curation
│     ├─ queues/
│     │  ├─ training-queue.ts    # TODO: Training job queue
│     │  └─ embedding-queue.ts    # TODO: Embedding generation queue
│     ├─ runners/
│     │  ├─ batch-runner.ts       # TODO: Batch job runner
│     │  └─ scheduled-runner.ts   # TODO: Scheduled job runner
│     └─ package.json
│
├─ packages/
│  ├─ atomic-core/                # JSON✯Atomic Core (Ledger + Crypto)
│  │  ├─ src/
│  │  │  ├─ ledger/
│  │  │  │  ├─ indexeddb-ledger.ts # TODO: IndexedDB Ledger (browser) - adaptar de Json-Atomic/core/ledger/ledger.ts
│  │  │  │  ├─ memory-ledger.ts   # TODO: In-memory Ledger (tests)
│  │  │  │  └─ types.ts           # TODO: LedgerEntry, Ledger types - reusar de Json-Atomic/types.ts
│  │  │  ├─ crypto/
│  │  │  │  ├─ hash.ts             # TODO: BLAKE3 hashing - adaptar de Json-Atomic/core/crypto.ts
│  │  │  │  ├─ sign.ts             # TODO: Ed25519 signing - adaptar de Json-Atomic/core/crypto.ts
│  │  │  │  └─ verify.ts           # TODO: Signature verification - adaptar de Json-Atomic/core/crypto.ts
│  │  │  ├─ atomic/
│  │  │  │  ├─ canonicalize.ts    # TODO: JSON canonicalization - adaptar de Json-Atomic/core/canonical.ts
│  │  │  │  ├─ create.ts          # TODO: Create JSON✯Atomic span
│  │  │  │  └─ verify.ts          # TODO: Verify span integrity
│  │  │  ├─ execution/
│  │  │  │  └─ executor.ts       # TODO: AtomicExecutor - adaptar de Json-Atomic/core/execution/executor.ts
│  │  │  └─ index.ts              # TODO: Public API
│  │  ├─ cli/
│  │  │  └─ logline-cli.ts        # TODO: CLI for ledger inspection
│  │  └─ package.json
│  │
│  ├─ arena-domain/               # Domain Types & Rules
│  │  ├─ src/
│  │  │  ├─ spans/                # Span Type Definitions
│  │  │  │  ├─ battle-span.ts     # TODO: BattleSpan type + schema
│  │  │  │  ├─ training-span.ts   # TODO: TrainingSpan type + schema
│  │  │  │  ├─ evolution-span.ts  # TODO: EvolutionSpan type + schema
│  │  │  │  ├─ narrative-span.ts  # TODO: NarrativeSpan type + schema
│  │  │  │  ├─ ui-event-span.ts   # TODO: UIEventSpan type + schema
│  │  │  │  └─ index.ts           # TODO: Export all span types
│  │  │  ├─ entities/
│  │  │  │  ├─ creature.ts        # TODO: Creature type + validation
│  │  │  │  ├─ training-session.ts # TODO: TrainingSession type
│  │  │  │  ├─ agent.ts           # TODO: Agent type
│  │  │  │  └─ index.ts
│  │  │  ├─ rules/
│  │  │  │  ├─ xp.ts              # TODO: XP calculation rules
│  │  │  │  ├─ elo.ts             # TODO: ELO calculation rules
│  │  │  │  ├─ trust.ts           # TODO: Trust calculation rules
│  │  │  │  ├─ evolution.ts       # TODO: Evolution requirements
│  │  │  │  └─ ascension.ts       # TODO: Ascension requirements
│  │  │  ├─ policies/             # .lll Policy Files
│  │  │  │  ├─ training.lll       # TODO: Training policy
│  │  │  │  ├─ evolution.lll     # TODO: Evolution policy
│  │  │  │  └─ narrative.lll     # TODO: Narrative policy
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ trajectory-engine/          # Trajectory Matching Engine
│  │  ├─ search/                  # Vector Search (HNSW + TF-IDF)
│  │  │  ├─ hnsw-index.ts        # TODO: HNSW index implementation
│  │  │  ├─ tfidf-embedding.ts   # TODO: TF-IDF embedding
│  │  │  ├─ hybrid-index.ts      # TODO: Hybrid HNSW + IVF
│  │  │  └─ index.ts
│  │  ├─ quality/                # Quality Meter & Curation
│  │  │  ├─ quality-meter.ts     # TODO: 5D Quality Meter
│  │  │  ├─ curator.ts            # TODO: Span curation logic
│  │  │  └─ index.ts
│  │  ├─ narrative/              # Narrative Generation
│  │  │  ├─ generator.ts          # TODO: Narrative event generator
│  │  │  ├─ deterministic.ts     # TODO: Deterministic narrative rules
│  │  │  └─ index.ts
│  │  ├─ predictor/              # Outcome Prediction
│  │  │  ├─ matcher.ts            # TODO: Context matching
│  │  │  ├─ synthesizer.ts        # TODO: Outcome synthesis
│  │  │  ├─ confidence.ts         # TODO: Confidence calibration
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ ui-kit/                    # Shared UI Components
│  │  ├─ components/
│  │  │  ├─ cards/
│  │  │  │  └─ creature-card.tsx  # TODO: Shared creature card
│  │  │  ├─ timeline/
│  │  │  │  └─ dna-timeline.tsx   # TODO: Shared DNA timeline
│  │  │  ├─ charts/
│  │  │  │  └─ stats-chart.tsx    # TODO: Stats visualization
│  │  │  └─ factions/
│  │  │     ├─ embaixada-badge.tsx # TODO: Embaixada faction badge
│  │  │     ├─ consorcio-badge.tsx # TODO: Consórcio faction badge
│  │  │     └─ libertos-badge.tsx # TODO: Libertos faction badge
│  │  ├─ tokens/                  # Design Tokens
│  │  │  ├─ colors.ts             # TODO: Color palette
│  │  │  ├─ typography.ts         # TODO: Typography scale
│  │  │  └─ spacing.ts            # TODO: Spacing scale
│  │  └─ package.json
│  │
│  └─ testing/                    # Test Utilities
│     ├─ fixtures/
│     │  ├─ spans.ts              # TODO: Span fixtures
│     │  ├─ creatures.ts          # TODO: Creature fixtures
│     │  └─ ledger.ts             # TODO: Ledger fixtures
│     ├─ harness/
│     │  ├─ e2e-harness.ts        # TODO: E2E test harness
│     │  ├─ ledger-harness.ts     # TODO: Ledger test utilities
│     │  └─ api-harness.ts        # TODO: API test utilities
│     └─ package.json
│
├─ services/                      # Background Services (Optional)
│  ├─ observer-bot/              # Ledger Observer (Event Bus)
│  │  ├─ src/
│  │  │  ├─ watcher.ts           # TODO: Watch ledger for new spans
│  │  │  ├─ handlers/
│  │  │  │  ├─ training-handler.ts # TODO: Training span handler
│  │  │  │  ├─ battle-handler.ts  # TODO: Battle span handler
│  │  │  │  └─ narrative-handler.ts # TODO: Narrative span handler
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ policy-agent/               # Policy Enforcement Agent
│  │  ├─ src/
│  │  │  ├─ processor.ts         # TODO: Process .lll policies
│  │  │  ├─ enforcer.ts           # TODO: Enforce policy rules
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  └─ exporter/                   # Data Export Service
│     ├─ src/
│     │  ├─ google-drive.ts       # TODO: Google Drive export
│     │  ├─ json-export.ts        # TODO: JSON export
│     │  └─ index.ts
│     └─ package.json
│
├─ docs/                          # Documentation (existing structure)
│  ├─ 00-START-HERE/
│  ├─ 01-ARQUITETURA/
│  ├─ 02-SISTEMAS/
│  ├─ 03-UI-UX/
│  ├─ 04-IMPLEMENTACAO/
│  ├─ 05-NARRATIVA/
│  ├─ 06-PESQUISA/
│  └─ 07-REFERENCIA/
│
├─ schemas/                       # JSON Schemas & Manifests
│  ├─ spans/
│  │  ├─ battle-span.json         # TODO: BattleSpan JSON Schema
│  │  ├─ training-span.json       # TODO: TrainingSpan JSON Schema
│  │  ├─ evolution-span.json      # TODO: EvolutionSpan JSON Schema
│  │  └─ ...
│  ├─ api/
│  │  ├─ openapi.yaml             # TODO: OpenAPI spec
│  │  └─ types.ts                 # TODO: Generated API types
│  └─ manifests/
│     ├─ training.lll             # TODO: Training manifest
│     └─ evolution.lll             # TODO: Evolution manifest
│
├─ infrastructure/                # Infrastructure as Code
│  ├─ cloudflare/
│  │  ├─ workers.tf               # TODO: Terraform for Workers
│  │  └─ routes.tf                # TODO: Route configuration
│  ├─ docker/
│  │  └─ Dockerfile               # TODO: Docker for local dev
│  └─ observability/
│     ├─ prometheus.yml            # TODO: Prometheus config
│     └─ grafana-dashboard.json    # TODO: Grafana dashboard
│
├─ data/                          # Data & Seeds
│  ├─ ledger/
│  │  └─ seed.jsonl               # TODO: Seed ledger data
│  ├─ seeds/
│  │  ├─ creatures.json           # TODO: Starter creatures
│  │  ├─ training-programs.json   # TODO: Training programs
│  │  └─ dialogues.json           # TODO: Professor Oak dialogues
│  └─ embeddings/
│     └─ .gitkeep                 # TODO: Pre-computed embeddings (gitignored)
│
├─ tools/                         # Development Tools
│  ├─ scripts/
│  │  ├─ validate-spans.ts        # TODO: Validate spans against schemas
│  │  ├─ generate-schemas.ts      # TODO: Generate JSON schemas from types
│  │  └─ migrate-ledger.ts        # TODO: Ledger migration script
│  ├─ codegen/
│  │  ├─ api-types.ts             # TODO: Generate API types from OpenAPI
│  │  └─ span-types.ts           # TODO: Generate span types from schemas
│  └─ migrations/
│     └─ .gitkeep                 # TODO: Ledger migration files
│
├─ .github/
│  └─ workflows/
│     ├─ ci.yml                   # TODO: CI pipeline
│     └─ deploy.yml                # TODO: Deployment pipeline
│
├─ package.json                   # Root package.json (monorepo)
├─ pnpm-workspace.yaml            # TODO: pnpm workspace config
├─ tsconfig.base.json             # TODO: Base TypeScript config
├─ turbo.json                      # TODO: Turborepo config (optional)
└─ README.md                       # TODO: Project README
```

---

## 🔑 Princípios da Estrutura

### 1. **Browser-Native First**
- Frontend roda 100% no browser (PWA)
- Ledger em IndexedDB
- Service Worker para offline
- Google Drive para backup (opcional)

### 2. **Edge Functions (Cloudflare Workers)**
- API roda em Cloudflare Workers (sem servidor próprio)
- Background jobs também em Workers
- Zero infraestrutura própria

### 3. **BYOK (Bring Your Own Key)**
- Usuário fornece suas próprias API keys
- Google OAuth apenas para autenticação/login
- LLM calls direto do browser (ou via Worker proxy)

### 4. **Prompt Engineering como "Esqueleto"**
- Conteúdo gerado via prompts + LLM
- Templates de prompt em `apps/arena-frontend/lib/prompts/`
- Sistema "Prompt-First Game Engine"

### 5. **Trajectory Matching (NÃO LoRA/Fine-tuning)**
- `packages/trajectory-engine/` contém HNSW + TF-IDF
- Curadoria de dados = treinamento
- Dataset expansion = evolução
- Zero gradientes, zero LoRA, zero fine-tuning tradicional

---

## 📝 Notas de Implementação

### Migração do Código Atual
- Código atual está em `diamond-applied/`
- Migrar gradualmente para `arena-lab/`
- Manter compatibilidade durante transição

### Integração com JSON✯Atomic
- `Json-Atomic/` é repositório separado (corrigido e funcional)
- Código base já existe e foi corrigido (CORRECOES_CONTRATO.md)
- Copiar/adaptar código necessário para `packages/atomic-core/`
- Adaptar para browser-native (IndexedDB ao invés de filesystem)
- Manter compatibilidade com contratos do JSON✯Atomic

### Integração com Trajectory Engine
- Algoritmos de trajectory matching documentados em `docs/02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md`
- Implementar do zero em `packages/trajectory-engine/`
- Usar HNSW + TF-IDF (sem ML, determinístico)

### Google OAuth
- Usar `@react-oauth/google` no frontend
- Verificar token no Cloudflare Worker
- Armazenar sessão em IndexedDB (local) ou cookie (httpOnly)

### IndexedDB Ledger
- Usar `idb` library para IndexedDB
- Estrutura: `ObjectStore: spans` (indexed por `entity_type`, `who`, `when`)
- Sync com Google Drive via Google Drive API (opcional)

---

## ✅ Status Atual

- ✅ Documentação completa em `docs/`
- ✅ Decisões arquiteturais documentadas
- ✅ Roadmap consolidado
- ⚠️ Código atual em `diamond-applied/` (precisa migração)
- ⚠️ Estrutura nova ainda não criada
- ⚠️ Placeholders precisam ser implementados

---

**Próximo Passo:** Ver `TASKLIST_PRODUCAO.md` para tasklist completa até produção.

