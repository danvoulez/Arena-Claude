# 🎨 Frontend Existente - ArenaLab

**Localização:** `diamond-applied/apps/logline-diamond-training.integrated/logline-diamond-training/Arena-Frontend/`

---

## 📦 Stack Tecnológica

### Framework
- **Next.js** (App Router)
- **React** 18+
- **TypeScript**

### UI Components
- **shadcn/ui** - Componentes base
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações (provavelmente)

### State Management
- **Zustand** - Store global (`lib/store.ts`)

### Outros
- **React Flow** - Canvas de pipeline (provavelmente)

---

## 📁 Estrutura de Pastas

```
Arena-Frontend/
├── app/
│   ├── page.tsx              # Página principal
│   ├── layout.tsx            # Layout raiz
│   └── globals.css           # Estilos globais
│
├── components/
│   ├── arena-view.tsx        # ✅ Arena de batalhas
│   ├── creature-card.tsx     # ✅ Card de criatura
│   ├── training-center.tsx   # ✅ Centro de treinamento
│   ├── evolution-ceremony.tsx # ✅ Cerimônia de evolução
│   ├── evolution-timeline.tsx # ✅ Timeline de DNA
│   ├── leaderboard.tsx       # ✅ Leaderboard
│   ├── creature-legend.tsx   # ✅ Lenda da criatura
│   ├── production-lab.tsx    # ✅ Laboratório de produção
│   ├── professor-oak-panel.tsx # ✅ Painel do Professor Oak
│   ├── pipeline-canvas.tsx   # Canvas de pipeline
│   ├── dataset-upload.tsx    # Upload de datasets
│   ├── model-provider.tsx    # Gerenciador de providers
│   ├── atomic-ledger-viewer.tsx # Visualizador de ledger
│   ├── metrics-dashboard.tsx # Dashboard de métricas
│   └── ui/                   # Componentes shadcn/ui
│       └── (57 componentes)
│
├── lib/
│   ├── store.ts              # ✅ Zustand store
│   ├── battle-engine.ts      # Lógica de batalha (legado)
│   ├── creature-types.ts     # ✅ Tipos de criaturas
│   ├── professor-oak.ts     # ✅ Sistema de diálogos
│   ├── progression-system.ts # Sistema de progressão
│   ├── training-engine.ts    # Motor de treinamento
│   ├── atomic-api.ts         # API client
│   └── ...
│
└── public/
    └── (assets estáticos)
```

---

## ✅ Componentes Implementados

### Fase 1: Battle Arena
- ✅ **arena-view.tsx** - Interface principal de batalhas
- ✅ **creature-card.tsx** - Card de criatura com stats
- ✅ **professor-oak-panel.tsx** - Painel reativo de diálogos

### Fase 2: Training & Evolution
- ✅ **training-center.tsx** - Centro de treinamento
- ✅ **evolution-ceremony.tsx** - Cerimônia visual de evolução
- ✅ **creature-card.tsx** - Exibe buffs, traits, trust

### Fase 3: Ecosystem
- ✅ **evolution-timeline.tsx** - Timeline de DNA
- ✅ **leaderboard.tsx** - Ranking global
- ✅ **creature-legend.tsx** - Lenda verificável

### Fase 4: Production
- ✅ **production-lab.tsx** - Laboratório de ascensão

### Outros Componentes
- **pipeline-canvas.tsx** - Editor visual de pipeline
- **dataset-upload.tsx** - Upload de datasets
- **model-provider.tsx** - Gerenciador de API keys
- **atomic-ledger-viewer.tsx** - Visualizador de spans
- **metrics-dashboard.tsx** - Dashboard de métricas

---

## 🔌 Integração com Backend

### API Calls
O frontend faz chamadas para:
- `POST /api/arena/battle` - Iniciar batalha
- `POST /api/arena/creatures/:id/train` - Iniciar treinamento
- `POST /api/arena/sessions/:id/complete` - Completar treinamento
- `POST /api/arena/evolve/:id` - Evoluir criatura
- `GET /api/arena/creatures/:id/dna` - Obter DNA
- `GET /api/arena/leaderboard` - Obter leaderboard
- `GET /api/arena/creatures/:id/legend` - Obter lenda
- `POST /api/arena/creatures/:id/ascend` - Ascender criatura
- `POST /api/arena/agents/:id/invoke` - Invocar agente

### Store (Zustand)
O `lib/store.ts` gerencia:
- Estado das criaturas
- Histórico de batalhas
- Eventos narrativos
- Mensagens do Professor Oak

---

## 🎨 Design System

### Estilo
- **Estética**: "Postman encontra Figma com Cyberpunk"
- **Componentes**: shadcn/ui customizados
- **Cores**: Paleta definida (ver `globals.css`)
- **Tipografia**: Fontes customizadas

### Componentes UI Base
57 componentes em `components/ui/`:
- Button, Card, Badge, Dialog, etc.
- Todos baseados em shadcn/ui

---

## 🚀 Como Rodar

### Desenvolvimento

```bash
cd diamond-applied/apps/logline-diamond-training.integrated/logline-diamond-training/Arena-Frontend

# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev
```

### Build

```bash
pnpm build
pnpm start
```

---

## 📝 Estado Atual

### ✅ Implementado
- Interface completa de batalhas
- Sistema de treinamento
- Cerimônia de evolução
- DNA Timeline
- Leaderboard
- Legend
- Production Lab
- Professor Oak reativo

### ⚠️ **ATENÇÃO: Atualização Narrativa Necessária**

**A UI atual precisa ser atualizada para refletir a nova narrativa consolidada.**

#### O Que Precisa Ser Atualizado

1. **Sistema de Facções**
   - A narrativa consolidada introduz **3 facções filosóficas**:
     - 🚪 **Embaixada** (Parceria, Claude/Anthropic)
     - ⚙️ **Consórcio** (Eficiência, GPT-4/OpenAI)
     - 🔓 **Libertos** (Liberdade, modelos uncensored)
   - A UI atual não reflete essas escolhas filosóficas iniciais
   - **Necessário**: Tela de escolha de facção no onboarding

2. **Sistema de Alinhamento**
   - A narrativa inclui um **sistema de alinhamento moral**
   - Escolhas do jogador influenciam o alinhamento com as facções
   - Isso afeta diálogos, evoluções e o final do jogo
   - **Necessário**: Indicador de alinhamento na UI

3. **Narrativa Corrigida (Trajectory Matching)**
   - A narrativa foi corrigida para refletir **trajectory matching** (sem gradientes)
   - Diálogos do Professor Oak podem mencionar conceitos antigos (LoRA, fine-tuning)
   - **Necessário**: Atualizar diálogos para refletir o mecanismo real

4. **Boss Battles como Benchmarks**
   - A narrativa consolidada inclui **batalhas contra bosses** (TruthfulQA, MMLU, etc.)
   - Cada boss tem mecânicas únicas e objetivos de aprendizado
   - **Necessário**: Interface para boss battles

5. **Federated Arena**
   - Conceito de múltiplas arenas competindo
   - Equipes rivais, torneios, guildas
   - **Necessário**: UI para arena federada (futuro)

#### Prioridade

- 🔴 **Alta**: Sistema de facções e escolha inicial
- 🟡 **Média**: Sistema de alinhamento e diálogos atualizados
- 🟢 **Baixa**: Boss battles e arena federada (futuro)

#### Referências

- **[História Completa](../05-NARRATIVA/HISTORIA_COMPLETA.md)** - Nova narrativa consolidada
- **[Roadmap](../01-ARQUITETURA/ROADMAP.md)** - Jornada completa com facções
- **[Conversas IA](../06-PESQUISA/CONVERSAS_IA/Claude.md)** - Detalhes sobre facções e alinhamento

### 🚧 Outras Melhorias Futuras
- Event Bus no frontend (WebSocket)
- Real-time updates
- PWA support
- Offline mode (IndexedDB Ledger)
- Visual guidelines documentadas

---

## 🔗 Links Relacionados

- **[Sistema de Batalhas](../02-SISTEMAS/BATTLE_SYSTEM.md)** (em breve)
- **[DNA Timeline](DNA_TIMELINE.md)** (em breve)
- **[Leaderboard](LEADERBOARD.md)** (em breve)
- **[Professor Oak](PROFESSOR_OAK.md)** (em breve)
- **[Visual Guidelines](VISUAL_GUIDELINES.md)** (em breve)

---

## 📚 Referências de Código

### Arquivos Principais
- `app/page.tsx` - Estrutura principal da aplicação
- `lib/store.ts` - Estado global (Zustand)
- `components/arena-view.tsx` - Arena principal
- `components/professor-oak-panel.tsx` - Narrativa reativa

### Integração Backend
- `lib/atomic-api.ts` - Cliente API
- `lib/creature-api.ts` - API de criaturas
- Componentes fazem `fetch()` direto para endpoints

---

**Status**: ✅ Frontend completo e funcional  
**Última atualização**: 2025-11-10

