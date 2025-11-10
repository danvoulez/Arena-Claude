# Bugs e Problemas Encontrados
## Análise Geral do Código - Fase 4

**Data:** 2025-11-09  
**Status:** 🔍 **ANÁLISE COMPLETA**

---

## 🐛 Bugs Críticos

### 1. **Tipo `status` não definido em `Creature`**

**Localização:** `src/arena/types.ts` e múltiplos arquivos

**Problema:**
- O tipo `Creature` não possui a propriedade `status`
- Estamos usando `(creature as any).status` em vários lugares
- Isso pode causar problemas de tipo e runtime errors

**Arquivos Afetados:**
- `src/arena/api.ts` (linhas 441, 483, 1470, 1508)
- `Arena-Frontend/components/production-lab.tsx` (linhas 58, 62, 87)
- `tests/e2e/ascension-flow.test.ts` (linhas 85, 179)

**Correção:**
```typescript
// src/arena/types.ts
export interface Creature {
  // ... campos existentes ...
  
  // Status (adicionar)
  status?: 'active' | 'production_agent' | 'retired'
  agentId?: string  // ID do agente se ascendido
  ascendedAt?: string  // Data de ascensão
}
```

---

### 2. **`invokeAgentLLM` usa placeholder, não chama LLM real**

**Localização:** `src/arena/api.ts` linha 1873-1887

**Problema:**
- O método `invokeAgentLLM` retorna uma resposta simulada
- Não integra com `LLMCaller` que já existe no projeto
- Agentes não funcionam de verdade em produção

**Código Atual:**
```typescript
private async invokeAgentLLM(...): Promise<{ text: string; tokensUsed: number }> {
  const systemPrompt = this.buildSystemPrompt(creature)
  
  // TODO: Integrar com LLMCaller real
  return {
    text: `[Agent ${creature.name} response to: "${prompt.substring(0, 50)}..."]`,
    tokensUsed: Math.floor(prompt.length / 4) + maxTokens
  }
}
```

**Correção:**
```typescript
private async invokeAgentLLM(
  creature: Creature,
  prompt: string,
  maxTokens: number,
  temperature: number,
  context?: any
): Promise<{ text: string; tokensUsed: number }> {
  const systemPrompt = this.buildSystemPrompt(creature)
  
  // Integrar com LLMCaller real
  const { LLMCaller } = await import('./llm-caller.js')
  const llmCaller = new LLMCaller()
  
  // Obter API key do creature (precisa ser passado ou configurado)
  // Por enquanto, usar API key do BattleRunner ou config
  const apiKey = process.env[`${creature.provider.toUpperCase()}_API_KEY`] || ''
  
  if (!apiKey) {
    throw new Error(`No API key configured for provider: ${creature.provider}`)
  }
  
  const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`
  
  const response = await llmCaller.call(fullPrompt, {
    provider: creature.provider as 'anthropic' | 'openai' | 'google' | 'groq',
    model: creature.baseModel,
    apiKey
  })
  
  return {
    text: response.output,
    tokensUsed: response.tokens || maxTokens
  }
}
```

---

### 3. **Rate limiting usa propriedades dinâmicas não tipadas**

**Localização:** `src/arena/api.ts` linhas 1783-1784, 1819-1820

**Problema:**
- `Agent` interface não tem `lastRequest` e `requestsInMinute`
- Usando `(agent as any)` para acessar essas propriedades
- Pode causar problemas de tipo e bugs silenciosos

**Correção:**
```typescript
// Adicionar ao interface Agent
interface Agent {
  // ... campos existentes ...
  
  // Rate limiting state
  lastRequest?: number
  requestsInMinute?: number
}
```

---

### 4. **API Key exposta completamente em snippets de código**

**Localização:** `src/arena/api.ts` linha 1645-1700

**Problema:**
- Os snippets de código expõem a API key completa
- Isso é um risco de segurança se os snippets forem compartilhados
- Deveria usar placeholder ou variável de ambiente

**Correção:**
```typescript
private generateCodeSnippets(agent: Agent): any {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000'
  const endpoint = `${baseUrl}${agent.endpoint}`
  const apiKeyPlaceholder = 'YOUR_API_KEY_HERE'  // Não expor chave real
  
  return {
    nodejs: `const response = await fetch('${endpoint}/invoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKeyPlaceholder}'
  },
  // ... resto do código
})`,
    // ... outros snippets
  }
}
```

**OU** criar um endpoint separado para obter snippets sem a chave, e mostrar a chave apenas uma vez na UI.

---

## ⚠️ Problemas de Design

### 5. **Rate limiting em memória não escala**

**Localização:** `src/arena/api.ts` linha 1782-1792

**Problema:**
- Rate limiting está em memória (Map)
- Não funciona em múltiplas instâncias
- Perde estado ao reiniciar servidor

**Mitigação:**
- Documentar limitação
- Em produção, usar Redis ou similar
- Adicionar TODO comentário

---

### 6. **Falta tratamento de erro para Ledger**

**Localização:** Múltiplos lugares usando `(this.narrativeSync as any).ledger`

**Problema:**
- Acesso ao ledger via `as any` pode falhar silenciosamente
- Não há verificação se ledger existe antes de usar

**Correção:**
```typescript
// Adicionar método helper
private getLedger() {
  const ledger = (this.narrativeSync as any).ledger
  if (!ledger) {
    throw new Error('Ledger not initialized')
  }
  return ledger
}
```

---

### 7. **Falta validação de API key format**

**Localização:** `src/arena/api.ts` linha 1607-1613

**Problema:**
- `generateAPIKey` não valida formato
- Pode gerar chaves inválidas ou duplicadas

**Correção:**
```typescript
private generateAPIKey(creatureId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const combined = `${creatureId}_${timestamp}_${random}`
  const hash = Buffer.from(combined).toString('base64').substring(0, 32)
  const apiKey = `ak_${hash}`
  
  // Verificar se já existe (em produção, verificar no banco)
  const existing = Array.from(this.agents.values()).find(a => a.apiKey === apiKey)
  if (existing) {
    // Regenerar se duplicado (raro, mas possível)
    return this.generateAPIKey(creatureId)
  }
  
  return apiKey
}
```

---

## 🔧 Problemas Menores

### 8. **Falta validação de `maxTokens` e `temperature`**

**Localização:** `src/arena/api.ts` linha 1789

**Problema:**
- Não valida se `maxTokens` está em range válido
- Não valida se `temperature` está em range válido (0-2)

**Correção:**
```typescript
const { prompt, maxTokens = 500, temperature = 0.7, context } = body

// Validações
if (maxTokens < 1 || maxTokens > 4000) {
  sendJSON(res, { error: 'maxTokens must be between 1 and 4000' }, 400)
  return true
}

if (temperature < 0 || temperature > 2) {
  sendJSON(res, { error: 'temperature must be between 0 and 2' }, 400)
  return true
}
```

---

### 9. **Falta tratamento de erro para `parseBody`**

**Localização:** `src/arena/api.ts` múltiplos lugares

**Problema:**
- `parseBody` pode lançar exceção se JSON inválido
- Não há try/catch específico

**Correção:**
```typescript
try {
  const body = await parseBody(req)
  // ... resto do código
} catch (error: any) {
  if (error.message?.includes('JSON')) {
    sendJSON(res, { error: 'Invalid JSON in request body' }, 400)
    return true
  }
  throw error
}
```

---

### 10. **Falta verificação de `creature.abilities` antes de iterar**

**Localização:** `src/arena/api.ts` linha 1633

**Problema:**
- `creature.abilities` pode ser undefined
- `.forEach` vai falhar

**Correção:**
```typescript
(creature.abilities || []).forEach(ability => {
  if (ability.unlockedAtLevel <= creature.level) {
    capabilities.push(ability.id)
  }
})
```

---

## 📋 Resumo de Prioridades

### 🔴 Crítico (Corrigir Imediatamente):
1. ✅ Adicionar `status` ao tipo `Creature`
2. ✅ Integrar `LLMCaller` real em `invokeAgentLLM`
3. ✅ Adicionar propriedades de rate limiting ao tipo `Agent`

### 🟡 Importante (Corrigir em Breve):
4. ✅ Não expor API key completa em snippets
5. ✅ Adicionar validações de `maxTokens` e `temperature`
6. ✅ Melhorar tratamento de erros

### 🟢 Melhorias (Futuro):
7. ✅ Rate limiting com Redis
8. ✅ Validação de formato de API key
9. ✅ Helper para acesso ao Ledger

---

**Status:** 🔍 **ANÁLISE COMPLETA - PRONTO PARA CORREÇÕES**

*Documento gerado em: 2025-11-09*  
*Versão: 1.0-analysis*

