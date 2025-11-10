# 🔄 Comparação: Arquitetura Atual vs Nova Proposta

**Data**: 2025-11-10  
**Objetivo**: Comparar arquitetura atual (Node.js + Express) com proposta browser-native (PWA)

---

## 📊 Tabela Comparativa

| Aspecto | **Arquitetura Atual** | **Nova Proposta (Browser-Native)** |
|---------|----------------------|-----------------------------------|
| **Runtime** | Node.js | Browser (JavaScript puro) |
| **Storage** | Node.js `fs` (JSONL files) | IndexedDB (Dexie.js) |
| **Crypto** | @noble/ed25519 + @noble/hashes (JS puro) | @noble/ed25519 + @noble/hashes (JS puro) ✅ |
| **Backend** | Express.js (`server.hardened.ts`) | Nenhum (ou Cloudflare Worker opcional) |
| **Frontend** | Next.js (separado) | React/Vite PWA (tudo junto) |
| **API Calls** | REST endpoints (`/api/arena/*`) | Direto no browser (fetch para LLMs) |
| **Ledger** | Arquivos `.jsonl` no disco | IndexedDB (coleção de spans) |
| **Backup/Sync** | Manual (export/import) | Google Drive automático (seamless) |
| **Offline** | ❌ Requer servidor rodando | ✅ Funciona 100% offline |
| **Deploy** | Servidor Node.js (AWS, Vercel, etc) | PWA (qualquer hosting estático) |
| **Custo Infra** | Servidor + banco de dados | Zero (ou Cloudflare Worker grátis) |
| **Escalabilidade** | Horizontal (múltiplos servidores) | Vertical (cada usuário tem seu próprio "servidor") |
| **Multiplayer** | Fácil (servidor centralizado) | Complexo (WebRTC, WebSocket, ou sync manual) |
| **Auditabilidade** | ✅ Arquivos `.jsonl` verificáveis | ✅ IndexedDB exportável |
| **Portabilidade** | Requer Node.js instalado | Qualquer browser moderno |

---

## 🏗️ Arquitetura Atual (Detalhada)

### Stack

```
┌─────────────────────────────────┐
│   Frontend (Next.js)            │
│   Arena-Frontend/               │
│   - React components            │
│   - Zustand store               │
│   - API calls via fetch         │
└────────────┬────────────────────┘
             │ HTTP REST
             ▼
┌─────────────────────────────────┐
│   Backend (Node.js + Express)   │
│   server.hardened.ts            │
│   - ArenaAPI                    │
│   - BattleRunner                │
│   - NarrativeSync               │
│   - Hardening Pack              │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Ledger (Node.js fs)           │
│   data/ledger/                  │
│   - battle.jsonl                │
│   - training.jsonl              │
│   - evolution.jsonl             │
└─────────────────────────────────┘
```

### Componentes Principais

1. **`server.hardened.ts`**
   - Express.js server
   - Mounts hardening pack (middleware, docs, metrics)
   - Integra `ArenaAPI`
   - Porta 3000 (configurável)

2. **`ArenaAPI`** (`src/arena/api.ts`)
   - REST endpoints: `/api/arena/battle`, `/api/arena/creatures/:id/train`, etc.
   - Gerencia estado das criaturas em memória (`Map`)
   - Chama `BattleRunner` para execução real
   - Grava spans no Ledger via `ledger.append()`

3. **`BattleRunner`** (`src/arena/battle-runner.ts`)
   - Executa batalhas reais usando `LLMCaller`
   - Calcula ELO, qualidade, XP
   - Gera spans de batalha

4. **`Ledger`** (`src/ledger.ts`)
   - Append-only JSONL files
   - Usa `fs/promises` (Node.js)
   - Hash BLAKE3 + Assinatura Ed25519

5. **Frontend** (`Arena-Frontend/`)
   - Next.js App Router
   - Zustand para state management
   - Faz `fetch()` para backend API

### Vantagens da Arquitetura Atual

- ✅ **Separação clara**: Frontend e backend independentes
- ✅ **Escalabilidade**: Pode rodar múltiplas instâncias do servidor
- ✅ **Multiplayer fácil**: Servidor centralizado gerencia estado
- ✅ **Leaderboard global**: Fácil agregar dados de todos usuários
- ✅ **Segurança**: Chaves de API ficam no servidor (não expostas)
- ✅ **Rate limiting**: Servidor controla limites
- ✅ **Métricas centralizadas**: Prometheus no servidor

### Limitações da Arquitetura Atual

- ❌ **Requer servidor**: Não funciona offline
- ❌ **Custo de infra**: Precisa hospedar servidor Node.js
- ❌ **Complexidade**: Dois projetos para manter (frontend + backend)
- ❌ **Deploy**: Precisa configurar servidor + banco
- ❌ **Portabilidade**: Usuário não pode "levar" o jogo consigo

---

## 🌐 Nova Arquitetura Proposta (Detalhada)

### Stack

```
┌─────────────────────────────────┐
│   PWA (React/Vite)             │
│   - UI components               │
│   - useLLM hook                 │
│   - Prompts YAML                │
└────────────┬────────────────────┘
             │
             ├─────────────────┐
             │                 │
             ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ Ledger (IndexedDB)│  │ LLM (BYOK)       │
│ Dexie.js         │  │ fetch() direto    │
│ JSON✯Atomic      │  │ OpenAI/Claude/etc│
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Crypto (JS puro)              │
│   - Ed25519                     │
│   - BLAKE3                      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Google Drive (Opcional)       │
│   - Backup automático           │
│   - Restore seamless            │
└─────────────────────────────────┘
```

### Componentes Principais

1. **Ledger Browser** (`src/ledger/index.ts`)
   - Dexie.js (wrapper IndexedDB)
   - Mesma interface: `ledger.append()`, `ledger.all()`
   - Mesmo formato JSON✯Atomic

2. **Crypto Browser** (`src/crypto/index.ts`)
   - Mesmas funções: `hashJsonAtomic()`, `signJsonAtomic()`
   - Mesmas libs: @noble/ed25519, @noble/hashes
   - **Portável**: Funciona igual no browser

3. **useLLM Hook** (`src/hooks/useLLM.ts`)
   - Hook React universal
   - Faz `fetch()` direto para APIs LLM (BYOK)
   - Suporta múltiplos providers

4. **Prompts YAML** (`data/prompts/`)
   - Templates parametrizáveis
   - Carregados em runtime
   - Geram conteúdo dinamicamente

5. **Google Backup** (`src/cloud/google-backup.ts`)
   - OAuth Google
   - Upload/Download automático
   - Zero custo admin

### Vantagens da Nova Arquitetura

- ✅ **Zero infra**: Não precisa servidor
- ✅ **Offline-first**: Funciona 100% offline
- ✅ **PWA**: Instalável no iPhone
- ✅ **Portabilidade**: Usuário "leva" o jogo consigo
- ✅ **Privacidade**: Dados nunca saem do device
- ✅ **Custo zero**: Nenhum custo de infra para admin
- ✅ **Personalização**: Cada LLM = experiência única
- ✅ **Simplicidade**: Um único projeto (frontend)

### Limitações da Nova Arquitetura

- ❌ **Multiplayer complexo**: Precisa WebRTC/WebSocket ou sync manual
- ❌ **Leaderboard global**: Difícil agregar sem servidor
- ❌ **Rate limiting**: Precisa ser no client (menos seguro)
- ❌ **Chaves expostas**: API keys ficam no browser (risco se mal gerenciado)
- ❌ **Escalabilidade limitada**: IndexedDB tem limites (~50MB iOS)
- ❌ **Quota storage**: Precisa gerenciar compressão/exportação
- ❌ **Sem métricas centralizadas**: Cada usuário tem seu próprio "servidor"

---

## 🔀 Comparação por Funcionalidade

### Batalhas

**Atual:**
- Frontend chama `POST /api/arena/battle`
- Backend executa via `BattleRunner`
- Backend grava span no Ledger (fs)
- Backend retorna resultado + narrative events

**Nova:**
- Frontend chama `useLLM()` com prompt de batalha
- LLM (BYOK) gera narração
- Frontend grava span no Ledger (IndexedDB)
- Frontend processa resultado localmente

**Trade-off:**
- ✅ Nova: Mais rápido (sem round-trip servidor)
- ❌ Nova: Perde validação centralizada
- ✅ Nova: Funciona offline

### Treinamento

**Atual:**
- Frontend chama `POST /api/arena/creatures/:id/train`
- Backend valida, grava span, retorna sessão
- Frontend completa após duração simulada

**Nova:**
- Frontend chama `useLLM()` com prompt de treinamento
- LLM gera programa personalizado
- Frontend grava span no Ledger
- Frontend aplica buffs/traits localmente

**Trade-off:**
- ✅ Nova: Programas personalizados por LLM
- ❌ Nova: Perde validação de programas pré-definidos

### Evolução

**Atual:**
- Backend valida requisitos (trust, level, spans)
- Backend gera evolução, grava span
- Frontend mostra cerimônia

**Nova:**
- Frontend valida requisitos localmente
- Frontend chama `useLLM()` para gerar descrição épica
- Frontend grava span no Ledger

**Trade-off:**
- ✅ Nova: Descrições únicas por LLM
- ❌ Nova: Perde validação centralizada

### DNA Timeline

**Atual:**
- Backend lê Ledger (fs), agrega spans
- Backend gera timeline estruturada
- Frontend renderiza

**Nova:**
- Frontend lê Ledger (IndexedDB)
- Frontend chama `useLLM()` com prompt de timeline
- LLM gera narrativa épica
- Frontend renderiza

**Trade-off:**
- ✅ Nova: Narrativa única e personalizada
- ❌ Nova: Pode ser menos estruturada

### Leaderboard

**Atual:**
- Backend agrega spans de todos usuários
- Backend calcula rankings
- Frontend renderiza

**Nova:**
- ❌ **Problema**: Não há servidor para agregar
- **Soluções possíveis**:
  - WebRTC peer-to-peer
  - Sync manual (export/import)
  - Cloudflare Worker (opcional, mas adiciona custo)

**Trade-off:**
- ❌ Nova: Leaderboard global é difícil sem servidor

### Ascensão (Production Agents)

**Atual:**
- Backend valida requisitos
- Backend gera API key, cria agente
- Backend expõe endpoint `/api/arena/agents/:id/invoke`
- Frontend mostra código snippets

**Nova:**
- Frontend valida requisitos
- Frontend gera "agente" local (não há endpoint real)
- Frontend mostra código snippets (mas agente não funciona sem servidor)

**Trade-off:**
- ❌ Nova: Agentes de produção não funcionam sem servidor
- **Solução**: Cloudflare Worker opcional para agentes

---

## 🎯 Casos de Uso: Qual Arquitetura Escolher?

### Use **Arquitetura Atual** se:

- ✅ Precisa de **multiplayer real-time**
- ✅ Precisa de **leaderboard global**
- ✅ Precisa de **agentes de produção** funcionais
- ✅ Precisa de **métricas centralizadas**
- ✅ Precisa de **rate limiting** robusto
- ✅ Tem orçamento para **infra servidor**
- ✅ Quer **validação centralizada** de regras

### Use **Nova Arquitetura** se:

- ✅ Quer **zero custo de infra**
- ✅ Quer **PWA no iPhone**
- ✅ Quer **offline-first**
- ✅ Quer **privacidade máxima** (dados nunca saem do device)
- ✅ Quer **experiência única** por LLM
- ✅ Quer **portabilidade** (usuário leva o jogo)
- ✅ Aceita **limitações de multiplayer**

---

## 🔀 Arquitetura Híbrida (Recomendada?)

### Visão: Melhor dos Dois Mundos

```
┌─────────────────────────────────┐
│   PWA (Browser-Native)          │
│   - Ledger IndexedDB            │
│   - Crypto JS puro              │
│   - useLLM (BYOK)               │
│   - Funciona 100% offline      │
└────────────┬────────────────────┘
             │
             │ (Opcional)
             ▼
┌─────────────────────────────────┐
│   Cloudflare Worker (Opcional)  │
│   - Leaderboard global          │
│   - Agentes de produção         │
│   - Sync entre devices          │
│   - Zero custo (free tier)      │
└─────────────────────────────────┘
```

### Como Funcionaria

1. **Core**: 100% browser-native (Ledger, Crypto, LLM)
2. **Opcional**: Cloudflare Worker para:
   - Leaderboard global (agrega spans exportados)
   - Agentes de produção (endpoints funcionais)
   - Sync entre devices (via export/import)
3. **Backup**: Google Drive (seamless, zero custo)

### Vantagens

- ✅ Funciona offline (core)
- ✅ Zero custo (Worker free tier suficiente)
- ✅ Leaderboard global (opcional)
- ✅ Agentes funcionais (opcional)
- ✅ Privacidade (dados no device)

---

## 📊 Matriz de Decisão

| Requisito | Atual | Nova | Híbrida |
|-----------|-------|------|---------|
| **Offline** | ❌ | ✅ | ✅ |
| **Zero Custo** | ❌ | ✅ | ✅ |
| **Multiplayer** | ✅ | ❌ | ⚠️ (limitado) |
| **Leaderboard Global** | ✅ | ❌ | ✅ (opcional) |
| **Agentes Produção** | ✅ | ❌ | ✅ (opcional) |
| **PWA iPhone** | ❌ | ✅ | ✅ |
| **Privacidade** | ⚠️ | ✅ | ✅ |
| **Simplicidade** | ⚠️ | ✅ | ⚠️ |
| **Escalabilidade** | ✅ | ❌ | ⚠️ |

---

## 🎯 Recomendação

### Para MVP / Protótipo
→ **Nova Arquitetura (Browser-Native)**
- Mais rápido de implementar
- Zero custo
- Funciona offline
- PWA no iPhone

### Para Produção com Multiplayer
→ **Arquitetura Híbrida**
- Core browser-native
- Cloudflare Worker para features sociais
- Melhor dos dois mundos

### Para Produção Enterprise
→ **Arquitetura Atual (Node.js)**
- Mais controle
- Escalabilidade horizontal
- Validação centralizada
- Métricas robustas

---

## 🔗 Referências

- **[Arquitetura Atual](../06-PESQUISA/ANALISES_TECNICAS/ARQUITETURA_MOTOR.md)**
- **[Nova Arquitetura](NOVA_ARQUITETURA_BROWSER_NATIVE.md)**
- **[Visão Geral](VISAO_GERAL.md)**

---

**Status**: Comparação completa  
**Última atualização**: 2025-11-10


