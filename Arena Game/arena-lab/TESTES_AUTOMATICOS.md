# 🧪 Testes Automáticos - Como Funciona

**Guia completo sobre CI/CD e testes automáticos**

---

## 🤔 O Que São Testes Automáticos?

Testes automáticos são scripts que **verificam se seu código funciona** sem você precisar testar manualmente.

### Exemplo Manual vs Automático

**❌ Manual (chato):**
1. Você faz uma mudança no código
2. Abre o navegador
3. Clica em vários botões
4. Verifica se tudo funciona
5. Repete isso toda vez que muda algo

**✅ Automático (mágico):**
1. Você faz uma mudança no código
2. Faz `git push`
3. **GitHub automaticamente:**
   - Compila o código
   - Roda todos os testes
   - Verifica tipos TypeScript
   - Te avisa se algo quebrou

---

## 🔄 Como Funciona o CI/CD

### CI = Continuous Integration (Integração Contínua)

**O que faz:**
- Roda **automaticamente** quando você faz push
- Verifica se seu código compila
- Roda todos os testes
- Verifica tipos e lint

**Onde roda:**
- No GitHub (GitHub Actions)
- Em servidores virtuais (não no seu computador)

### CD = Continuous Deployment (Deploy Contínuo)

**O que faz:**
- Depois que CI passa, faz deploy automaticamente
- Atualiza produção sem você precisar fazer nada

**Para ArenaLab:**
- CI: ✅ Configurado (GitHub Actions)
- CD: ⏳ Ainda não (precisa configurar deploy)

---

## 📁 Arquivos de Configuração

### 1. `.github/workflows/ci.yml`

**O que é:**
Arquivo que diz ao GitHub **quando** e **como** rodar testes.

**O que faz:**
```yaml
# Roda quando você faz push
on:
  push:
    branches: [main, master]

jobs:
  test:
    - Instala dependências
    - Compila código
    - Roda testes
```

**Como funciona:**
1. Você faz `git push`
2. GitHub detecta o push
3. GitHub lê `.github/workflows/ci.yml`
4. GitHub cria um servidor virtual (Ubuntu)
5. GitHub executa os comandos do arquivo
6. GitHub te mostra o resultado (✅ ou ❌)

### 2. `vitest.config.ts`

**O que é:**
Configuração do Vitest (framework de testes).

**O que faz:**
- Diz onde estão os testes (`**/*.test.ts`)
- Configura como rodar (paralelo, timeout, etc.)
- Configura coverage (quanto do código está testado)

---

## 🚀 Como Usar

### 1. Ver Resultados no GitHub

1. Vá para seu repositório no GitHub
2. Clique em **"Actions"** (aba no topo)
3. Veja os workflows rodando:
   - 🟢 Verde = Tudo OK
   - 🔴 Vermelho = Algo quebrou
   - 🟡 Amarelo = Rodando

### 2. Rodar Testes Localmente

```bash
# Rodar todos os testes
pnpm test

# Rodar testes em watch mode (atualiza quando você salva)
pnpm test --watch

# Rodar testes com UI (interface visual)
pnpm test:ui

# Ver coverage (quanto do código está testado)
pnpm test:coverage
```

### 3. Ver o Que Quebrou

Se um teste falhar no GitHub:

1. Clique no workflow que falhou (🔴)
2. Clique no job que falhou
3. Veja os logs:
   ```
   ❌ Test failed: createSpan should create valid hash
   Expected: "abc123"
   Received: "xyz789"
   ```
4. Corrija o código
5. Faça push novamente

---

## 📝 Criar Seu Primeiro Teste

### Exemplo: Testar `createSpan`

**Arquivo:** `packages/atomic-core/src/atomic/create.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createSpan } from './create'

describe('createSpan', () => {
  it('should create a span with hash', () => {
    const span = createSpan({
      entity_type: 'test',
      this: 'test',
      did: { actor: 'test', action: 'test' }
    })
    
    // Verifica se hash existe
    expect(span.hash).toBeDefined()
    expect(span.hash).toHaveLength(64) // BLAKE3 hash tem 64 chars
  })
  
  it('should create unique hashes for different inputs', () => {
    const span1 = createSpan({
      entity_type: 'test',
      this: 'input1',
      did: { actor: 'test', action: 'test' }
    })
    
    const span2 = createSpan({
      entity_type: 'test',
      this: 'input2',
      did: { actor: 'test', action: 'test' }
    })
    
    // Hashes devem ser diferentes
    expect(span1.hash).not.toBe(span2.hash)
  })
})
```

**Rodar:**
```bash
cd packages/atomic-core
pnpm test
```

---

## 🎯 Fluxo Completo

### Cenário: Você Adiciona uma Nova Função

1. **Você escreve código:**
   ```typescript
   // packages/atomic-core/src/atomic/create.ts
   export function createSpan(data) {
     return { hash: 'abc123', ...data }
   }
   ```

2. **Você escreve teste:**
   ```typescript
   // packages/atomic-core/src/atomic/create.test.ts
   it('should create span', () => {
     const span = createSpan({ entity_type: 'test' })
     expect(span.hash).toBe('abc123')
   })
   ```

3. **Você testa localmente:**
   ```bash
   pnpm test
   # ✅ Todos os testes passam
   ```

4. **Você faz commit:**
   ```bash
   git add .
   git commit -m "Add createSpan function"
   git push
   ```

5. **GitHub automaticamente:**
   - ✅ Detecta o push
   - ✅ Roda `.github/workflows/ci.yml`
   - ✅ Instala dependências
   - ✅ Compila código
   - ✅ Roda testes
   - ✅ Te mostra resultado (verde ✅)

6. **Se algo quebrar:**
   - ❌ GitHub mostra erro
   - 📧 Você recebe email (opcional)
   - 🔍 Você vê o log do erro
   - 🔧 Você corrige e faz push novamente

---

## 🔧 Configurar Notificações

### Email quando CI falha

1. Vá em GitHub → Settings → Notifications
2. Marque "Actions"
3. Escolha "Only failures"

### Badge no README

Adicione no `README.md`:

```markdown
![CI](https://github.com/seu-usuario/arena-lab/workflows/CI/badge.svg)
```

Isso mostra um badge 🟢/🔴 no README mostrando se CI está passando.

---

## 📊 Coverage (Cobertura de Código)

**O que é:**
Porcentagem do seu código que está testado.

**Exemplo:**
- Código tem 100 funções
- Você testou 80 funções
- Coverage = 80%

**Ver coverage:**
```bash
pnpm test:coverage
```

Isso gera um relatório HTML em `coverage/index.html`.

**Meta:**
- 🎯 80%+ coverage = Bom
- 🎯 90%+ coverage = Excelente

---

## 🚨 Troubleshooting

### CI falha mas funciona localmente

**Possíveis causas:**
1. Versão do Node.js diferente
2. Dependências não instaladas
3. Variáveis de ambiente faltando

**Solução:**
```yaml
# .github/workflows/ci.yml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18' # Mesma versão que você usa localmente
```

### Testes muito lentos

**Solução:**
```typescript
// vitest.config.ts
test: {
  pool: 'threads', // Rodar em paralelo
  poolOptions: {
    threads: {
      maxThreads: 4 // Máximo de threads
    }
  }
}
```

### Coverage não aparece

**Solução:**
```bash
# Instalar coverage provider
pnpm add -D @vitest/coverage-v8

# Rodar com coverage
pnpm test:coverage
```

---

## 🎓 Próximos Passos

### FASE 5: Implementar Testes

1. ✅ **Configurar Vitest** (feito)
2. ⏳ **Criar testes unitários** para cada package
3. ⏳ **Criar testes E2E** para API e Frontend
4. ⏳ **Configurar coverage** reports
5. ⏳ **Adicionar pre-commit hooks** (rodar testes antes de commit)

### Pre-commit Hooks (Opcional)

**O que faz:**
Roda testes **antes** de você fazer commit.

**Configurar:**
```bash
# Instalar husky
pnpm add -D husky

# Configurar
npx husky init
```

**Arquivo:** `.husky/pre-commit`
```bash
#!/bin/sh
pnpm test
```

Agora, quando você faz `git commit`, os testes rodam automaticamente!

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vitest Docs](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Última atualização:** 2025-01-XX

