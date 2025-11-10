# 🎮 ArenaLab - Estrutura do Projeto

Este repositório contém o projeto ArenaLab, organizado em código principal e biblioteca de documentação.

## 📁 Estrutura Principal

```
Arena Game/
├── docs/                          # 📚 Biblioteca de Documentação
│   ├── research/                  # Pesquisas e análises
│   ├── architecture/              # Arquitetura e visão
│   ├── implementation/            # Histórico de implementação
│   └── narrative/                 # Narrativa e storytelling
│
├── A-Texts/                       # 🔬 Repositório de Trajectory Matching
│   └── (Implementação técnica do motor de IA)
│
└── README.md                       # Este arquivo

diamond-applied/                    # 💎 Código Principal (separado)
├── apps/
│   └── logline-diamond-training.integrated/
│       └── (Aplicação principal com frontend e backend)
├── packages/
│   └── hardening-pack/
│       └── (Pack de produção)
└── docs/
    └── (Documentação técnica do código)
```

## 🎯 Onde Está Cada Coisa

### 📚 Documentação e Pesquisa
**Localização**: `Arena Game/docs/`

- **00-START-HERE**: Onboarding, quick start, conceitos centrais
- **01-ARQUITETURA**: Decisões oficiais, roadmap, visão geral
- **02-SISTEMAS**: Documentação técnica de sistemas
- **03-UI-UX**: Interface e experiência do usuário
- **04-IMPLEMENTACAO**: Guias práticos por fase
- **05-NARRATIVA**: História completa e storytelling
- **06-PESQUISA**: Análises, conversas com IAs, pesquisas externas
- **07-REFERENCIA**: APIs, tipos, fórmulas, configurações

### 💻 Código Principal
**Localização**: `diamond-applied/`

- **Aplicação**: Frontend (Next.js) + Backend (Node.js)
- **Packages**: Bibliotecas compartilhadas
- **Documentação Técnica**: READMEs, APIs, arquitetura do código

### 🔬 Motor de IA (Trajectory Matching)
**Localização**: `Arena Game/A-Texts/`

- **Implementação técnica**: Trajectory Matcher, HNSW, Embedding
- **API Worker**: Cloudflare Worker com `/v1/chat/completions`
- **Packages**: Search, Predictor, Ledger, etc.

## 🚀 Como Navegar

### Para Entender o Projeto
1. Comece por `docs/00-START-HERE/QUICK_START.md` - Guia rápido
2. Veja `docs/01-ARQUITETURA/VISAO_GERAL.md` - Visão completa
3. Explore `docs/01-ARQUITETURA/DECISOES_ARQUITETURAIS_OFICIAIS.md` - Decisões oficiais

### Para Implementar
1. Veja `docs/04-IMPLEMENTACAO/` - Guias por fase
2. Consulte `diamond-applied/` para código atual
3. Veja `A-Texts/` para motor de trajectory matching

### Para Pesquisar
1. `docs/06-PESQUISA/` tem todas as análises e conversas
2. `docs/01-ARQUITETURA/` tem decisões arquiteturais
3. `docs/04-IMPLEMENTACAO/HISTORICO/` tem lições aprendidas

## 📖 Documentos Principais

### Visão Geral
- **`docs/01-ARQUITETURA/VISAO_GERAL.md`**: Documento central consolidado

### Narrativa
- **`docs/05-NARRATIVA/HISTORIA_COMPLETA.md`**: História completa em 4 Eras

### Roadmap
- **`docs/01-ARQUITETURA/ROADMAP.md`**: Roadmap consolidado

### Decisões Oficiais
- **`docs/01-ARQUITETURA/DECISOES_ARQUITETURAIS_OFICIAIS.md`**: Todas as decisões oficiais

## 🎯 Próximos Passos

### Implementação Pendente
1. Sistema de Facções na UI (documentado, falta implementar)
2. Sistema de Alinhamento na UI (documentado, falta implementar)
3. Atualizar diálogos para trajectory matching (documentado, falta atualizar)

### Melhorias Futuras
1. Event Bus sobre Ledger
2. ECS básico
3. PostgreSQL para queries
4. Data-Driven content (YAML)

---

**Última atualização**: 2025-11-10  
**Status**: ✅ Biblioteca organizada e completa

