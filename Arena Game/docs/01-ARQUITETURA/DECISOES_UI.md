# 🎨 Decisões Arquiteturais - UI

**Status**: ✅ Oficial  
**Data**: 2025-11-10

---

## 📋 Stack Tecnológica Oficial

### Framework
- **Next.js** (App Router) - ✅ Oficial
- **React** 19 - ✅ Oficial
- **TypeScript** - ✅ Oficial

### UI Components
- **shadcn/ui** - ✅ Oficial (57 componentes)
- **Tailwind CSS** - ✅ Oficial
- **Framer Motion** - ✅ Para animações

### State Management
- **Zustand** - ✅ Oficial
- **Princípio**: Store stateless (cache do Ledger)

### Outros
- **React Flow** - Canvas de pipeline
- **date-fns** - Manipulação de datas
- **recharts** - Gráficos

---

## 🏗️ Arquitetura da UI

### Princípio: UI é Reativa ao Ledger

**Decisão Oficial:**
- ✅ UI não calcula estado
- ✅ UI espelha Ledger
- ✅ Store (Zustand) é cache stateless
- ✅ Backend (ou futuro IndexedDB) é fonte da verdade

**Implementação:**
```typescript
// Store é stateless (cache)
const updateCreature = (id: string, updates: Partial<Creature>) => {
  set((state) => ({
    creatures: state.creatures.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
  }));
};
```

---

## 🔌 Integração com Backend

### Padrão: REST API

**Decisão Oficial:**
- ✅ Frontend faz `fetch()` para endpoints REST
- ✅ Backend executa lógica, grava Ledger, retorna resultado
- ✅ Frontend atualiza store com resultado

**Ciclo:**
```
1. Ação na UI (clique, submit)
   ↓
2. fetch() para API
   ↓
3. Backend executa, grava Ledger
   ↓
4. Backend retorna resultado + narrative events
   ↓
5. UI atualiza store + mostra eventos
```

**Endpoints Oficiais:**
- `POST /api/arena/battle` - Batalhas
- `POST /api/arena/creatures/:id/train` - Treinamento
- `POST /api/arena/sessions/:id/complete` - Completar treino
- `POST /api/arena/evolve/:id` - Evolução
- `GET /api/arena/creatures/:id/dna` - DNA Timeline
- `GET /api/arena/leaderboard` - Leaderboard
- `GET /api/arena/creatures/:id/legend` - Legend
- `POST /api/arena/creatures/:id/ascend` - Ascensão
- `POST /api/arena/agents/:id/invoke` - Invocar agente

---

## 📱 Componentes Principais

### Arena View
- **Arquivo**: `components/arena-view.tsx`
- **Função**: Interface principal de batalhas
- **Integração**: Chama `POST /api/arena/battle`

### Training Center
- **Arquivo**: `components/training-center.tsx`
- **Função**: Gerenciar treinamento de criaturas
- **Integração**: Chama APIs de treinamento

### Evolution Ceremony
- **Arquivo**: `components/evolution-ceremony.tsx`
- **Função**: Visualização épica de evolução
- **Integração**: Reage a evento de evolução

### Professor Oak Panel
- **Arquivo**: `components/professor-oak-panel.tsx`
- **Função**: Diálogos reativos
- **Integração**: Processa `narrativeEvents` do backend

### DNA Timeline
- **Arquivo**: `components/evolution-timeline.tsx`
- **Função**: Visualizar histórico da criatura
- **Integração**: Chama `GET /api/arena/creatures/:id/dna`

### Leaderboard
- **Arquivo**: `components/leaderboard.tsx`
- **Função**: Ranking global
- **Integração**: Chama `GET /api/arena/leaderboard`

### Production Lab
- **Arquivo**: `components/production-lab.tsx`
- **Função**: Ascensão e agentes
- **Integração**: Chama APIs de ascensão e invocação

---

## 🎨 Design System

### Estética Oficial
- **Estilo**: "Postman encontra Figma com Cyberpunk"
- **Componentes**: shadcn/ui customizados
- **Cores**: Paleta definida em `globals.css`
- **Tipografia**: Fontes customizadas

### Componentes Base
- 57 componentes em `components/ui/`
- Todos baseados em shadcn/ui
- Customizados para ArenaLab

---

## ⚠️ Pendências de Implementação

### Sistema de Facções
- **Status**: 📋 Documentado, ⚠️ Pendente
- **O Que**: Tela de escolha inicial (3 facções)
- **Prioridade**: 🔴 Alta
- **Arquivo**: `docs/03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md`

### Sistema de Alinhamento
- **Status**: 📋 Documentado, ⚠️ Pendente
- **O Que**: Barra de alinhamento na UI
- **Prioridade**: 🟡 Média
- **Arquivo**: `docs/03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md`

### Narrativa Corrigida
- **Status**: 📋 Documentado, ⚠️ Pendente
- **O Que**: Atualizar diálogos para trajectory matching
- **Prioridade**: 🟡 Média
- **Arquivo**: `docs/03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md`

---

## 🔗 Referências

- **[Frontend Existente](../03-UI-UX/FRONTEND_EXISTENTE.md)**
- **[Atualização Narrativa Necessária](../03-UI-UX/ATUALIZACAO_NARRATIVA_NECESSARIA.md)**
- **[Decisões Arquiteturais Oficiais](DECISOES_ARQUITETURAIS_OFICIAIS.md)**

---

**Status**: ✅ Decisões UI oficiais  
**Última atualização**: 2025-11-10


