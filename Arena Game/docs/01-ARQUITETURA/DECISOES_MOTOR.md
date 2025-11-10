# ⚙️ Decisões Arquiteturais - Motor

**Status**: ✅ Oficial  
**Data**: 2025-11-10

---

## 📋 Princípios Oficiais

### 1. JSON✯Atomic como Protocolo Base

**Decisão Oficial:**
- ✅ **JSON✯Atomic** é o protocolo oficial
- ✅ Hash BLAKE3 para integridade
- ✅ Assinatura Ed25519 para autenticidade
- ✅ Formato determinístico (canonical JSON)

**Implementação Atual:**
- **Runtime**: Node.js (Express, fs/promises)
- **Protocolo**: JSON✯Atomic
- **Crypto**: JavaScript puro (@noble/ed25519, @noble/hashes)
- **Storage**: JSONL files via Node.js fs

**Arquivos:**
- `src/ledger.ts` - Ledger implementation
- `src/crypto.ts` - Crypto portável

---

### 2. Ledger Append-Only

**Decisão Oficial:**
- ✅ Ledger é append-only (imutável)
- ✅ Cada span é único e verificável
- ✅ Histórico completo e auditável

**Implementação:**
- **Atual**: JSONL files (Node.js fs)
- **Futuro**: IndexedDB (browser-native)

**Estrutura de Span:**
```typescript
{
  entity_type: "battle" | "training" | "evolution" | "ascension",
  who: string,        // ID da criatura/jogador
  did: string,        // Ação realizada
  this: any,          // Payload da ação
  when: string,       // ISO timestamp
  status: string,     // completed | pending | failed
  hash: string,       // BLAKE3 hash
  signature: string,  // Ed25519 signature
  metadata?: any      // Dados extras
}
```

---

### 3. Ledger como Fonte Única da Verdade

**Decisão Oficial:**
- ✅ Estado das criaturas é derivado do Ledger
- ✅ UI é um cache/mirror do Ledger
- ✅ Toda ação gera um span

**Implementação:**
- Backend grava spans no Ledger após cada ação
- Frontend lê Ledger para reconstruir estado
- Store (Zustand) atua como cache (stateless)

**Arquivos:**
- `src/ledger.ts` - Ledger implementation
- `Arena-Frontend/lib/store.ts` - Store stateless
- `src/arena/narrative-sync.ts` - Processa spans

---

### 4. Crypto Portável (JavaScript Puro)

**Decisão Oficial:**
- ✅ Crypto é JavaScript puro (portável)
- ✅ Não depende de Node.js
- ✅ Pode rodar no browser

**Bibliotecas:**
- `@noble/ed25519` - Assinaturas
- `@noble/hashes/blake3` - Hash

**Decisão:**
- ✅ Crypto já é portável
- ✅ Pronto para migração browser-native

---

## 🏗️ Arquitetura do Motor

### Atual: Híbrido (Node.js + JSON✯Atomic)

**Status**: ✅ **OFICIAL - Implementado**

**Stack:**
```
Node.js (Runtime)
  ↓
Express.js (Servidor HTTP)
  ↓
ArenaAPI (Lógica de negócio)
  ↓
Ledger (JSON✯Atomic + Node.js fs)
  ↓
Crypto (JavaScript puro)
```

**Componentes:**
- `server.hardened.ts` - Servidor Express
- `src/arena/api.ts` - ArenaAPI (endpoints)
- `src/arena/battle-runner.ts` - BattleRunner
- `src/ledger.ts` - Ledger (fs)
- `src/crypto.ts` - Crypto (portável)

---

### Futuro: Browser-Native (Proposta)

**Status**: 📋 **OFICIAL - Proposta Documentada**

**Stack:**
```
Browser (Runtime)
  ↓
React PWA (UI)
  ↓
Ledger (JSON✯Atomic + IndexedDB)
  ↓
Crypto (JavaScript puro)
  ↓
useLLM (BYOK)
```

**Decisão:**
- 📋 Migração para browser-native é proposta oficial
- ⚠️ Não urgente (atual funciona bem)
- ✅ Quando priorizar PWA/iPhone/zero custo

**Arquivos:**
- `docs/01-ARQUITETURA/NOVA_ARQUITETURA_BROWSER_NATIVE.md` - Proposta

---

## 🔄 Fluxo de Execução

### Battle Flow (Atual)

```
1. UI: Clique "Start Battle"
   ↓
2. API: POST /api/arena/battle
   ↓
3. Backend: BattleRunner.executeBattle()
   - Chama LLMs (ou simula)
   - Avalia com Quality Meter
   - Calcula resultado
   ↓
4. Ledger: Escreve span "battle"
   ↓
5. Narrative: Gera eventos narrativos
   ↓
6. API: Retorna resultado + eventos
   ↓
7. UI: Atualiza store + mostra eventos
```

### Battle Flow (Futuro Browser-Native)

```
1. UI: Clique "Start Battle"
   ↓
2. Frontend: useLLM() com prompt de batalha
   ↓
3. LLM (BYOK): Gera narração
   ↓
4. Frontend: Grava span no Ledger (IndexedDB)
   ↓
5. Frontend: Processa resultado localmente
   ↓
6. UI: Atualiza + mostra eventos
```

---

## 📦 Componentes do Motor

### BattleRunner

**Status**: ✅ **OFICIAL - Implementado**

**Função:**
- Executa batalhas reais usando LLMs
- Calcula ELO, qualidade, XP
- Gera spans de batalha

**Arquivo**: `src/arena/battle-runner.ts`

---

### NarrativeSync

**Status**: ✅ **OFICIAL - Implementado**

**Função:**
- Processa spans do Ledger
- Gera eventos narrativos
- Atualiza trust, XP, level

**Arquivo**: `src/arena/narrative-sync.ts`

---

### LLMCaller

**Status**: ✅ **OFICIAL - Implementado**

**Função:**
- Chama APIs LLM (Anthropic, OpenAI, Google, Groq)
- Gerencia API keys
- Retorna respostas formatadas

**Arquivo**: `src/arena/llm-caller.ts`

---

### ArenaAPI

**Status**: ✅ **OFICIAL - Implementado**

**Função:**
- Expõe endpoints REST
- Gerencia estado das criaturas
- Integra BattleRunner, NarrativeSync, Ledger

**Arquivo**: `src/arena/api.ts`

---

## 🔮 Decisões Futuras (Planejadas)

### Event Bus sobre Ledger

**Status**: 📋 **OFICIAL - Planejado**

**O Que É:**
- Event Bus construído sobre Ledger
- Quando span é escrito, emite evento
- Sistemas escutam eventos (UI, narrativa, métricas)

**Decisão:**
- 📋 Planejado para implementação futura
- ✅ Base: Ledger já funciona como event log
- ⚠️ Futuro: Adicionar subscriptions real-time

---

### ECS (Entity Component System)

**Status**: 📋 **OFICIAL - Planejado**

**O Que É:**
- Separar dados (components) de lógica (systems)
- Visual, Storytelling, Lógica independentes

**Decisão:**
- 📋 Planejado para refatoração futura
- ✅ Benefício: Separação de responsabilidades
- ⚠️ Futuro: Quando arquitetura atual limitar

---

### PostgreSQL + JSONL (CQRS)

**Status**: 📋 **OFICIAL - Planejado**

**O Que É:**
- PostgreSQL para queries relacionais
- JSONL Ledger para spans auditáveis
- CQRS pattern

**Decisão:**
- 📋 Planejado para quando precisar de queries avançadas
- ✅ Benefício: Leaderboard global, queries complexas
- ⚠️ Futuro: Quando volume crescer

---

## 🔗 Referências

- **[Arquitetura Atual](../06-PESQUISA/ANALISES_TECNICAS/ARQUITETURA_MOTOR.md)**
- **[Nova Arquitetura](NOVA_ARQUITETURA_BROWSER_NATIVE.md)**
- **[Comparação](COMPARACAO_ARQUITETURAS.md)**
- **[Decisões Arquiteturais Oficiais](DECISOES_ARQUITETURAIS_OFICIAIS.md)**

---

**Status**: ✅ Decisões motor oficiais  
**Última atualização**: 2025-11-10


