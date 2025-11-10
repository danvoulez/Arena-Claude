# 🔧 Como Compilar e Testar - ArenaLab

**Guia rápido para compilar e testar o sistema**

---

## 📦 Setup Inicial

### 1. Instalar Dependências

```bash
cd arena-lab
pnpm install
```

Isso instala todas as dependências do monorepo (packages + apps).

---

## 🏗️ Compilar

### Compilar Todos os Packages

```bash
# Na raiz do monorepo
pnpm build
```

Isso compila:
- `packages/atomic-core` → `dist/`
- `packages/arena-domain` → `dist/`
- `packages/trajectory-engine` → `dist/`
- `apps/arena-frontend` → `.next/` (Next.js build)
- `apps/arena-api` → Não precisa build (Cloudflare Workers usa TypeScript direto)

### Compilar Package Específico

```bash
# Compilar apenas atomic-core
cd packages/atomic-core
pnpm build

# Compilar apenas trajectory-engine
cd packages/trajectory-engine
pnpm build
```

### Compilar Frontend

```bash
cd apps/arena-frontend
pnpm build
```

Isso gera o build de produção do Next.js em `.next/`.

---

## 🧪 Testar

### Status Atual

**⚠️ Testes ainda não estão implementados** - Todos os packages têm:
```json
"test": "echo \"Tests not yet implemented\""
```

### Para Implementar Testes (FASE 5)

#### 1. Escolher Framework de Testes

**Recomendado:**
- **Vitest** - Rápido, compatível com TypeScript, funciona bem com monorepos
- **Jest** - Alternativa tradicional
- **Bun Test** - Se usar Bun runtime

#### 2. Configurar Vitest

```bash
# Instalar Vitest
pnpm add -D -w vitest @vitest/ui

# Criar vitest.config.ts na raiz
```

#### 3. Adicionar Scripts de Teste

Atualizar `package.json` de cada package:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

#### 4. Criar Testes

Exemplo: `packages/atomic-core/src/atomic/create.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createSpan } from '../create'

describe('createSpan', () => {
  it('should create a valid span', () => {
    const span = createSpan({
      entity_type: 'test',
      this: 'test',
      did: { actor: 'test', action: 'test' }
    })
    
    expect(span.hash).toBeDefined()
    expect(span.entity_type).toBe('test')
  })
})
```

---

## 🚀 Rodar em Desenvolvimento

### Frontend (Next.js)

```bash
cd apps/arena-frontend
pnpm dev
```

Acessa em: `http://localhost:3000`

### API (Cloudflare Workers)

```bash
cd apps/arena-api
pnpm dev
```

Acessa em: `http://localhost:8787`

**Nota:** Precisa configurar `wrangler.toml` com `account_id` para produção.

### Packages (Watch Mode)

```bash
# Compilar atomic-core em watch mode
cd packages/atomic-core
pnpm dev

# Compilar trajectory-engine em watch mode
cd packages/trajectory-engine
pnpm dev
```

---

## ✅ Verificar TypeScript

### Typecheck de Tudo

```bash
# Na raiz do monorepo
pnpm typecheck
```

Isso verifica tipos em todos os packages e apps.

### Typecheck de Package Específico

```bash
cd packages/atomic-core
npx tsc --noEmit
```

---

## 🔍 Verificar Linting

```bash
# Na raiz do monorepo
pnpm lint
```

**Nota:** ESLint ainda não está configurado em todos os packages.

---

## 📋 Checklist para Testar

### Antes de Testar

- [ ] `pnpm install` executado
- [ ] `pnpm build` executado (ou packages em watch mode)
- [ ] TypeScript compila sem erros (`pnpm typecheck`)

### Testar Frontend

- [ ] `cd apps/arena-frontend && pnpm dev`
- [ ] Abrir `http://localhost:3000`
- [ ] Verificar se UI carrega
- [ ] Verificar se componentes renderizam

### Testar API

- [ ] `cd apps/arena-api && pnpm dev`
- [ ] Abrir `http://localhost:8787/health`
- [ ] Verificar se retorna `{ status: 'ok' }`
- [ ] Testar endpoints manualmente (Postman, curl, etc.)

### Testar Packages

- [ ] `cd packages/atomic-core && pnpm build`
- [ ] `cd packages/arena-domain && pnpm build`
- [ ] `cd packages/trajectory-engine && pnpm build`
- [ ] Verificar se `dist/` foi criado em cada package

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@arenalab/atomic-core'"

**Solução:**
```bash
# Reinstalar dependências
pnpm install

# Verificar se workspace está configurado
cat pnpm-workspace.yaml
```

### Erro: TypeScript não encontra tipos

**Solução:**
```bash
# Rebuild todos os packages
pnpm build

# Verificar tsconfig.json
npx tsc --showConfig
```

### Erro: Next.js não encontra módulos

**Solução:**
```bash
# Limpar cache do Next.js
cd apps/arena-frontend
rm -rf .next
pnpm dev
```

### Erro: Wrangler não funciona

**Solução:**
```bash
# Verificar se wrangler está instalado
cd apps/arena-api
pnpm list wrangler

# Se não, instalar
pnpm add -D wrangler
```

---

## 📝 Próximos Passos (FASE 5)

### Configurar Testes

1. **Escolher Vitest** (recomendado)
2. **Configurar vitest.config.ts** na raiz
3. **Adicionar testes unitários** para cada package
4. **Adicionar testes E2E** para API e Frontend
5. **Configurar CI** para rodar testes automaticamente

### Exemplo de Configuração Vitest

```typescript
// vitest.config.ts (raiz)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.spec.ts']
  }
})
```

---

## 🎯 Comandos Rápidos

```bash
# Setup completo
pnpm install

# Compilar tudo
pnpm build

# Verificar tipos
pnpm typecheck

# Rodar frontend
cd apps/arena-frontend && pnpm dev

# Rodar API
cd apps/arena-api && pnpm dev

# Limpar builds
pnpm clean  # (se configurado)
```

---

**Última atualização:** 2025-01-XX

