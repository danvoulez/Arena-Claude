# 🔧 ARQUITETURA ATUAL DO MOTOR: Node.js + JSON✯Atomic (Híbrido)

**Data:** 2025-11-09  
**Questão:** "Do jeito que está implementado, o motor é Node.js, Json Atomic ou híbrido?"

---

## 🎯 RESPOSTA DIRETA

### **✅ É HÍBRIDO: Node.js (Runtime) + JSON✯Atomic (Protocolo)**

**O motor atual é uma arquitetura híbrida:**
- **Runtime:** Node.js (Express, fs/promises)
- **Protocolo/Formato:** JSON✯Atomic (hash, assinatura, estrutura)
- **Crypto:** Bibliotecas JavaScript puras (portáveis)
- **Storage:** JSONL files via Node.js fs (mas pode ser IndexedDB no browser)

---

## 📊 ANÁLISE DA IMPLEMENTAÇÃO ATUAL

### **1. Ledger (`src/ledger.ts`)**

**Implementação:**
```typescript
import { readFile, writeFile, appendFile, mkdir } from 'fs/promises'  // ← Node.js
import { createReadStream } from 'fs'                                  // ← Node.js
import { hashJsonAtomic, signJsonAtomic, verifyJsonAtomic } from './crypto.js'  // ← JSON✯Atomic

export class Ledger {
  // Usa Node.js fs para I/O
  async append(entityType: LedgerEntityType, data: any): Promise<LedgerEntry> {
    const entry: LedgerEntry = {
      entity_type: entityType,
      seq,
      hash: hashJsonAtomic(data),        // ← JSON✯Atomic
      signature: await signJsonAtomic(...),  // ← JSON✯Atomic
      created_at: new Date().toISOString(),
      data,
    }
    
    // Node.js fs para escrever
    await appendFile(filePath, line, 'utf-8')  // ← Node.js
  }
}
```

**Análise:**
- ✅ **Node.js:** Usa `fs/promises` para I/O de arquivos
- ✅ **JSON✯Atomic:** Usa `hashJsonAtomic`, `signJsonAtomic` para formato/protocolo
- ✅ **Híbrido:** Combina runtime Node.js com protocolo JSON✯Atomic

---

### **2. Crypto (`src/crypto.ts`)**

**Implementação:**
```typescript
import { ed25519 } from '@noble/curves/ed25519'    // ← JavaScript puro (portável)
import { blake3 } from '@noble/hashes/blake3'      // ← JavaScript puro (portável)

export function hashJsonAtomic(atomic: any): string {
  const canonical = canonicalizeJSON(atomic)  // ← JSON✯Atomic (determinístico)
  return hash(canonical)                      // ← BLAKE3
}

export async function signJsonAtomic(atomic: any, privateKeyHex: string): Promise<string> {
  const canonical = canonicalizeJSON(atomic)  // ← JSON✯Atomic
  return sign(canonical, privateKeyHex)       // ← Ed25519
}
```

**Análise:**
- ✅ **Portável:** Usa `@noble/ed25519` e `@noble/hashes` (JavaScript puro)
- ✅ **Não depende de Node.js:** Pode rodar no browser também
- ✅ **JSON✯Atomic:** Implementa o protocolo JSON✯Atomic (canonical JSON + hash + assinatura)

---

### **3. Server (`server.hardened.ts`)**

**Implementação:**
```typescript
import express from "express";                    // ← Node.js
import { ArenaAPI } from "./logline-diamond-training/src/arena/api.js";

const app = express();                            // ← Node.js
const arenaAPI = new ArenaAPI("./data/ledger");  // ← Usa Ledger (Node.js + JSON✯Atomic)

server.listen(port, async () => {
  await arenaAPI.init();  // ← Inicializa Ledger (Node.js fs)
});
```

**Análise:**
- ✅ **Node.js:** Express.js como servidor HTTP
- ✅ **JSON✯Atomic:** `ArenaAPI` usa `Ledger` que implementa JSON✯Atomic
- ✅ **Híbrido:** Runtime Node.js + Protocolo JSON✯Atomic

---

### **4. Battle Runner (`src/arena/battle-runner.ts`)**

**Implementação:**
```typescript
import { Ledger } from '../ledger.js'

export class BattleRunner {
  private ledger: Ledger
  
  constructor(config: BattleConfig) {
    this.ledger = new Ledger(config.ledgerPath)  // ← Ledger (Node.js + JSON✯Atomic)
  }
  
  async executeBattle(...) {
    // ... lógica de batalha ...
    
    // Grava span no ledger
    const battleSpan = await this.ledger.append('battle', {
      who: creatureA.id,
      did: `battle_vs_${creatureB.id}`,
      this: prompt,
      when: new Date().toISOString(),
      // ... dados da batalha ...
    })
    // ↑ JSON✯Atomic format
  }
}
```

**Análise:**
- ✅ **Node.js:** Usa `Ledger` que depende de Node.js fs
- ✅ **JSON✯Atomic:** Grava spans no formato JSON✯Atomic (hash, assinatura)
- ✅ **Híbrido:** Combina ambos

---

## 🔄 DIAGRAMA DA ARQUITETURA

```
┌─────────────────────────────────────────┐
│  SERVER (Node.js)                       │
│  - Express.js                           │
│  - HTTP endpoints                        │
│  - Middleware                            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  ARENA API (Node.js)                    │
│  - BattleRunner                         │
│  - NarrativeSync                        │
│  - Training/Evolution logic             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  LEDGER (Híbrido)                       │
│  ┌─────────────────────────────────┐   │
│  │ Node.js (Runtime)                │   │
│  │ - fs/promises (I/O)              │   │
│  │ - createReadStream               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ JSON✯Atomic (Protocolo)         │   │
│  │ - hashJsonAtomic()               │   │
│  │ - signJsonAtomic()               │   │
│  │ - verifyJsonAtomic()              │   │
│  │ - canonicalizeJSON()              │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  CRYPTO (Portável)                       │
│  - @noble/ed25519 (JavaScript puro)     │
│  - @noble/hashes/blake3 (JavaScript)    │
│  - Pode rodar no browser também!         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  STORAGE (Node.js fs)                   │
│  - JSONL files                          │
│  - ./data/ledger/                       │
│  - battle.jsonl, training.jsonl, etc    │
└─────────────────────────────────────────┘
```

---

## ✅ POR QUE É HÍBRIDO

### **1. Node.js (Runtime/Infraestrutura)**

**O que é Node.js:**
- Runtime JavaScript no servidor
- APIs de sistema (fs, http, etc)
- Ecossistema (npm, Express, etc)

**Onde está no código:**
- ✅ `server.hardened.ts`: Express.js
- ✅ `ledger.ts`: `fs/promises`, `createReadStream`
- ✅ `package.json`: Dependências Node.js

**Por que precisa:**
- Servidor HTTP (Express)
- I/O de arquivos (JSONL)
- Processamento no servidor

---

### **2. JSON✯Atomic (Protocolo/Formato)**

**O que é JSON✯Atomic:**
- Formato de serialização determinístico
- Hash criptográfico (BLAKE3)
- Assinatura digital (Ed25519)
- Ledger append-only

**Onde está no código:**
- ✅ `crypto.ts`: `hashJsonAtomic()`, `signJsonAtomic()`, `canonicalizeJSON()`
- ✅ `ledger.ts`: Usa funções JSON✯Atomic para criar entries
- ✅ Estrutura de spans: `{ entity_type, who, did, this, when, hash, signature }`

**Por que precisa:**
- Auditabilidade
- Imutabilidade
- Rastreabilidade
- Verificação criptográfica

---

### **3. Portabilidade (Crypto)**

**O que é portável:**
- Código JavaScript puro
- Não depende de APIs Node.js específicas
- Pode rodar no browser também

**Onde está no código:**
- ✅ `crypto.ts`: Usa `@noble/ed25519` e `@noble/hashes` (JavaScript puro)
- ✅ Não usa `crypto` do Node.js
- ✅ Pode ser usado no browser (IndexedDB, Web Crypto API)

**Por que é importante:**
- Permite rodar no browser no futuro
- Não fica preso ao Node.js
- Alinhado com a visão "browser-native" do LogLine

---

## 🎯 CONCLUSÃO

### **Arquitetura Atual:**

```
┌─────────────────────────────────────────┐
│  CAMADA DE RUNTIME                     │
│  → Node.js (Express, fs)                │
│  → Servidor HTTP                        │
│  → I/O de arquivos                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  CAMADA DE PROTOCOLO                    │
│  → JSON✯Atomic (hash, assinatura)       │
│  → Formato determinístico                │
│  → Ledger append-only                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  CAMADA DE CRYPTO                       │
│  → JavaScript puro (portável)           │
│  → Ed25519 + BLAKE3                     │
│  → Pode rodar no browser                │
└─────────────────────────────────────────┘
```

### **Resposta Final:**

**✅ É HÍBRIDO:**
- **Runtime:** Node.js (servidor, I/O)
- **Protocolo:** JSON✯Atomic (formato, hash, assinatura)
- **Crypto:** Portável (JavaScript puro)
- **Storage:** Node.js fs (mas pode ser IndexedDB no browser)

**Por que funciona:**
- Node.js fornece a infraestrutura (servidor, I/O)
- JSON✯Atomic fornece o protocolo (auditabilidade, imutabilidade)
- Crypto portável permite evoluir para browser no futuro

**É o melhor dos dois mundos:**
- ✅ Funciona hoje (Node.js)
- ✅ Protocolo auditável (JSON✯Atomic)
- ✅ Preparado para o futuro (portável)

---

## 🚀 EVOLUÇÃO FUTURA

### **Visão: Browser-Native (100% JSON✯Atomic)**

**Hoje (Híbrido):**
```
Node.js (Runtime) + JSON✯Atomic (Protocolo) + Node.js fs (Storage)
```

**Futuro (Browser-Native):**
```
Browser (Runtime) + JSON✯Atomic (Protocolo) + IndexedDB (Storage)
```

**Por que já está preparado:**
- ✅ Crypto é portável (JavaScript puro)
- ✅ JSON✯Atomic é independente de runtime
- ✅ Só precisa trocar storage (fs → IndexedDB)

---

**Versão:** 1.0  
**Status:** Análise Completa  
**Conclusão:** Motor atual é **HÍBRIDO (Node.js + JSON✯Atomic)**

