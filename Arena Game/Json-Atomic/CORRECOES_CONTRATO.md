# ✅ Correções de Contrato - JSON✯Atomic

**Data:** 2025-11-10  
**Objetivo:** Harmonizar contratos entre Ledger, Bots, APIs e Types

---

## 🔧 Problemas Corrigidos

### 1. ✅ `Ledger.scan()` - Retorno Inconsistente

**Problema:**
- `ledger.scan()` retorna `{ atomics, next_cursor }`
- Bots esperavam `{ items }` (com `items[].atomic`)

**Correção:**
- Ajustados `observerBot.ts`, `policyAgent.ts`, `scheduledTrigger.ts` para usar `scanResult.atomics` diretamente
- Mantido formato `{ atomics, next_cursor }` do `ledger.scan()`

**Arquivos Corrigidos:**
- `services/observerBot.ts` (linha 35-44)
- `services/policyAgent.ts` (linha 42-46)
- `services/scheduledTrigger.ts` (linha 37-42)

---

### 2. ✅ `trace_id` - Localização Inconsistente

**Problema:**
- `types.ts` define `trace_id?: string` como **top-level**
- `ledger.query()` buscava `atomic.metadata?.trace_id` (incorreto)
- `promptApi.ts` gravava `metadata.trace_id` (incorreto)
- Bots usavam `atomic.metadata?.trace_id` (incorreto)

**Correção:**
- `ledger.query()` agora busca `atomic.trace_id` (top-level)
- `promptApi.ts` agora grava `trace_id` como top-level
- Bots agora usam `atomic.trace_id` (top-level)
- `e2e.test.ts` corrigido para usar `trace_id` top-level

**Arquivos Corrigidos:**
- `core/ledger/ledger.ts` (linha 121)
- `api/promptApi.ts` (linha 18)
- `services/observerBot.ts` (linha 46)
- `services/policyAgent.ts` (linha 56)
- `services/scheduledTrigger.ts` (linha 47)
- `scripts/e2e.test.ts` (linha 19, 50)

---

### 3. ✅ `AtomicExecutor.processAtomic()` - Método Faltante

**Problema:**
- `observerBot.ts`, `policyAgent.ts`, `scheduledTrigger.ts` chamavam `executor.processAtomic()`
- Método não existia em `AtomicExecutor`

**Correção:**
- Implementado `processAtomic(atomic: Atomic): Promise<Atomic>`
- Método:
  1. Atualiza status para `running`
  2. Executa atomic via `execute()`
  3. Cria atomic completo com resultado
  4. Atualiza `status`, `output`, `when.completed_at`
  5. Adiciona `hash` se não presente
  6. Append ao ledger
  7. Retorna atomic processado

**Arquivo Corrigido:**
- `core/execution/executor.ts` (adicionado método `processAtomic()`)

---

### 4. ✅ `curr_hash` → `hash` - Nomenclatura

**Problema:**
- `promptApi.ts` usava `curr_hash` (legado)
- Tipo `Atomic` usa `hash`

**Correção:**
- `promptApi.ts` agora usa `hash` ao invés de `curr_hash`

**Arquivo Corrigido:**
- `api/promptApi.ts` (linha 26-27)

---

## 📋 Resumo das Mudanças

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `core/ledger/ledger.ts` | `query()` busca `trace_id` top-level | ✅ |
| `services/observerBot.ts` | Usa `scanResult.atomics`, `trace_id` top-level | ✅ |
| `services/policyAgent.ts` | Usa `scanResult.atomics`, `trace_id` top-level | ✅ |
| `services/scheduledTrigger.ts` | Usa `scanResult.atomics`, `trace_id` top-level | ✅ |
| `api/promptApi.ts` | `trace_id` top-level, `hash` ao invés de `curr_hash` | ✅ |
| `core/execution/executor.ts` | Implementado `processAtomic()` | ✅ |
| `scripts/e2e.test.ts` | `trace_id` top-level | ✅ |

---

## ✅ Próximos Passos (Sugeridos)

### Testes
- [ ] Criar testes unitários para `Ledger.scan()` verificando formato de retorno
- [ ] Criar testes unitários para `Ledger.query()` verificando busca por `trace_id` top-level
- [ ] Criar testes unitários para `AtomicExecutor.processAtomic()`
- [ ] Criar testes de integração cobrindo REST e CLI Deno

### Validação
- [ ] Adicionar validação Zod para garantir `trace_id` sempre top-level
- [ ] Adicionar validação em `ledger.append()` para rejeitar `metadata.trace_id`
- [ ] Adicionar pre-commit hook para validar spans

### Documentação
- [ ] Atualizar documentação sobre localização de `trace_id`
- [ ] Documentar formato de retorno de `Ledger.scan()`
- [ ] Documentar fluxo `processAtomic()`

---

## 🎯 Impacto

**Antes:**
- Bots quebravam ao tentar acessar `scan().items`
- Queries por `trace_id` retornavam vazias
- `processAtomic()` não existia, impedindo execução derivada
- Inconsistência entre schema e implementação

**Depois:**
- ✅ Bots funcionam corretamente com `scan().atomics`
- ✅ Queries por `trace_id` funcionam corretamente
- ✅ `processAtomic()` implementado e funcional
- ✅ Schema e implementação alinhados

---

**Status:** ✅ Todas as correções aplicadas

