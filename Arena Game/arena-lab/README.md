# 🎮 ArenaLab

**Browser-native game with Trajectory Matching**

ArenaLab é um jogo de treinamento de criaturas de IA usando Trajectory Matching, uma abordagem sem gradientes que roda 100% no browser.

## 🏗️ Arquitetura

- **Browser-Native**: PWA com IndexedDB para ledger
- **Edge Functions**: Cloudflare Workers para API
- **Trajectory Matching**: Sistema de aprendizado sem ML tradicional
- **JSON✯Atomic**: Protocolo de spans auditáveis

## 📁 Estrutura

```
arena-lab/
├── apps/
│   ├── arena-frontend/    # Next.js PWA
│   ├── arena-api/         # Cloudflare Workers
│   └── arena-worker/       # Background jobs
├── packages/
│   ├── atomic-core/        # JSON✯Atomic Core
│   ├── arena-domain/       # Domain Types & Rules
│   ├── trajectory-engine/  # Trajectory Matching
│   ├── ui-kit/             # Shared UI Components
│   └── testing/            # Test Utilities
└── services/               # Background Services
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run dev mode
pnpm dev
```

## 📚 Documentação

Ver `docs/` para documentação completa:
- `00-START-HERE/` - Onboarding
- `01-ARQUITETURA/` - Decisões arquiteturais
- `02-SISTEMAS/` - Documentação técnica
- `04-IMPLEMENTACAO/` - Guias de implementação

## 🎯 Status

- ✅ FASE 1: Trajectory Engine (COMPLETA)
- 🟡 FASE 0: Preparação e Contratos (~80%)
- ⏳ FASE 2: Cloudflare Workers (Pendente)
- ⏳ FASE 3: Frontend (Pendente)

## 📝 Licença

MIT

