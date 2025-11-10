# ⚖️ Trade-offs e Decisões Arquiteturais - ArenaLab

**Data**: 2025-11-10  
**Objetivo**: Documentar trade-offs, decisões e critérios para escolha arquitetural

---

## 🎯 Decisão Principal: Browser-Native vs Node.js

### Contexto

O ArenaLab pode ser implementado de duas formas:
1. **Atual**: Node.js + Express (servidor) + Next.js (frontend)
2. **Proposta**: 100% Browser-Native (PWA, IndexedDB, zero servidor)

### Critérios de Decisão

| Critério | Peso | Atual | Nova | Vencedor |
|----------|------|-------|------|----------|
| **Custo de Infra** | 🔴 Alto | ❌ Servidor + DB | ✅ Zero | Nova |
| **Offline** | 🟡 Médio | ❌ Requer servidor | ✅ 100% offline | Nova |
| **PWA iPhone** | 🟡 Médio | ❌ Não é PWA | ✅ PWA nativo | Nova |
| **Multiplayer** | 🟡 Médio | ✅ Fácil | ❌ Complexo | Atual |
| **Leaderboard Global** | 🟢 Baixo | ✅ Centralizado | ❌ Difícil | Atual |
| **Privacidade** | 🟡 Médio | ⚠️ Dados no servidor | ✅ Dados no device | Nova |
| **Simplicidade** | 🟡 Médio | ⚠️ 2 projetos | ✅ 1 projeto | Nova |
| **Escalabilidade** | 🟢 Baixo | ✅ Horizontal | ❌ Vertical | Atual |
| **Validação Centralizada** | 🟢 Baixo | ✅ Servidor valida | ❌ Client valida | Atual |

### Decisão Recomendada

**Para ArenaLab**: **Nova Arquitetura (Browser-Native)** com **Cloudflare Worker opcional**

**Justificativa:**
- ✅ Alinha com visão de PWA/iPhone
- ✅ Zero custo (crítico para MVP)
- ✅ Offline-first (melhor UX)
- ✅ Privacidade (dados nunca saem do device)
- ⚠️ Trade-off aceitável: Multiplayer limitado (pode ser adicionado depois)

---

## 🔀 Trade-offs por Componente

### 1. Ledger: fs (Node.js) vs IndexedDB (Browser)

#### Node.js fs

**Prós:**
- ✅ Sem limites de tamanho (disco)
- ✅ Fácil backup (copiar arquivos)
- ✅ Acesso direto via terminal
- ✅ Performance excelente para grandes volumes

**Contras:**
- ❌ Requer servidor rodando
- ❌ Não funciona offline
- ❌ Não portável (precisa Node.js)

#### IndexedDB (Browser)

**Prós:**
- ✅ Funciona offline
- ✅ Portável (qualquer browser)
- ✅ PWA-ready
- ✅ Mesma interface (Dexie.js)

**Contras:**
- ❌ Limite de quota (~50MB iOS, ~GBs desktop)
- ❌ Backup requer exportação
- ❌ Performance pode degradar com muitos spans

**Decisão**: **IndexedDB** (com compressão automática e exportação periódica)

**Justificativa:**
- Para ArenaLab, ~50k spans é suficiente (comprimido <10MB)
- Offline é mais importante que volume gigantesco
- Exportação resolve backup

---

### 2. Crypto: Mesma Implementação

**Ambas usam:**
- @noble/ed25519 (JS puro)
- @noble/hashes/blake3 (JS puro)

**Decisão**: **Sem mudança** - já é portável!

---

### 3. Backend: Express vs Nenhum

#### Express (Atual)

**Prós:**
- ✅ Validação centralizada
- ✅ Rate limiting robusto
- ✅ Métricas centralizadas
- ✅ Segurança (chaves no servidor)
- ✅ Multiplayer fácil

**Contras:**
- ❌ Custo de infra
- ❌ Complexidade (2 projetos)
- ❌ Requer deploy

#### Nenhum (Nova)

**Prós:**
- ✅ Zero custo
- ✅ Simplicidade (1 projeto)
- ✅ Deploy trivial (static hosting)

**Contras:**
- ❌ Validação no client (menos seguro)
- ❌ Rate limiting no client (pode ser burlado)
- ❌ Chaves expostas no browser
- ❌ Multiplayer complexo

**Decisão**: **Nenhum backend obrigatório** (com Cloudflare Worker opcional)

**Justificativa:**
- Para single-player, backend não é necessário
- Para multiplayer/leaderboard, Cloudflare Worker resolve (free tier)
- Trade-off aceitável: Validação no client (usuário confiável)

---

### 4. State Management: Servidor vs Client

#### Servidor Centralizado (Atual)

**Prós:**
- ✅ Fonte única da verdade
- ✅ Sincronização automática
- ✅ Leaderboard global fácil

**Contras:**
- ❌ Requer servidor
- ❌ Latência (round-trip)
- ❌ Não funciona offline

#### Client Local (Nova)

**Prós:**
- ✅ Zero latência
- ✅ Funciona offline
- ✅ Privacidade

**Contras:**
- ❌ Cada device tem seu próprio estado
- ❌ Sincronização manual
- ❌ Leaderboard global difícil

**Decisão**: **Client Local** (com sync opcional via Google Drive)

**Justificativa:**
- Offline-first é mais importante que sync automático
- Google Drive resolve sync entre devices
- Leaderboard pode ser opcional (ou via Worker)

---

### 5. LLM Calls: Servidor vs Client (BYOK)

#### Servidor (Atual)

**Prós:**
- ✅ Chaves seguras (nunca expostas)
- ✅ Rate limiting centralizado
- ✅ Cache compartilhado
- ✅ Logs centralizados

**Contras:**
- ❌ Custo de API recai sobre admin
- ❌ Requer servidor
- ❌ Latência adicional

#### Client BYOK (Nova)

**Prós:**
- ✅ Zero custo para admin
- ✅ Privacidade (chave nunca sai do device)
- ✅ Usuário controla custos
- ✅ Sem latência de servidor

**Contras:**
- ❌ Chave exposta no browser (risco se mal gerenciado)
- ❌ Rate limiting no client (pode ser burlado)
- ❌ Cada usuário paga sua própria API

**Decisão**: **Client BYOK**

**Justificativa:**
- Alinha com filosofia "Bring Your Own Key"
- Usuário controla seus custos
- Privacidade máxima
- Trade-off aceitável: Chave no browser (educar usuário sobre segurança)

---

### 6. Conteúdo: Estático vs Gerado (LLM)

#### Estático (Atual)

**Prós:**
- ✅ Determinístico
- ✅ Consistente
- ✅ Fácil de testar
- ✅ Performance (sem chamadas LLM)

**Contras:**
- ❌ Limitado (precisa criar todo conteúdo)
- ❌ Não personalizável
- ❌ Manutenção (precisa atualizar código)

#### Gerado por LLM (Nova)

**Prós:**
- ✅ Infinito (LLM gera conteúdo)
- ✅ Personalizável (cada LLM = experiência única)
- ✅ Sem manutenção (prompts são dados)
- ✅ Escalável (não precisa criar 100 quests)

**Contras:**
- ❌ Não determinístico (pode variar)
- ❌ Requer chamadas LLM (latência, custo)
- ❌ Pode gerar conteúdo inconsistente
- ❌ Difícil de testar

**Decisão**: **Híbrido** (Gerado por LLM, com cache de respostas importantes)

**Justificativa:**
- Conteúdo gerado é mais interessante e escalável
- Cache resolve determinismo para spans importantes
- Trade-off aceitável: Latência de LLM (usuário já espera)

---

## 🎯 Decisões por Feature

### Battle System

**Atual**: Backend executa, valida, grava  
**Nova**: Frontend executa (via LLM), valida local, grava

**Trade-off:**
- ✅ Nova: Mais rápido (sem round-trip)
- ❌ Nova: Validação menos robusta
- ✅ Nova: Funciona offline

**Decisão**: **Nova** (validação local é suficiente para single-player)

---

### Training System

**Atual**: Backend valida programas pré-definidos  
**Nova**: LLM gera programas personalizados

**Trade-off:**
- ✅ Nova: Programas únicos e personalizados
- ❌ Nova: Pode gerar programas inválidos
- ✅ Nova: Escalável (não precisa criar programas)

**Decisão**: **Nova** (com validação básica de formato)

---

### Evolution System

**Atual**: Backend valida requisitos, gera evolução fixa  
**Nova**: Frontend valida, LLM gera descrição épica

**Trade-off:**
- ✅ Nova: Descrições únicas e épicas
- ❌ Nova: Pode ser inconsistente
- ✅ Nova: Mais narrativo

**Decisão**: **Nova** (com cache de descrições importantes)

---

### DNA Timeline

**Atual**: Backend agrega spans, gera timeline estruturada  
**Nova**: Frontend agrega, LLM gera narrativa épica

**Trade-off:**
- ✅ Nova: Narrativa única e personalizada
- ❌ Nova: Menos estruturada (pode variar)
- ✅ Nova: Mais interessante

**Decisão**: **Nova** (com estrutura mínima garantida)

---

### Leaderboard

**Atual**: Backend agrega todos usuários  
**Nova**: Difícil sem servidor

**Trade-off:**
- ❌ Nova: Não há servidor para agregar
- **Soluções**:
  - WebRTC peer-to-peer (complexo)
  - Cloudflare Worker (opcional)
  - Sync manual (export/import)

**Decisão**: **Cloudflare Worker opcional** (para leaderboard global)

---

### Production Agents

**Atual**: Backend expõe endpoints funcionais  
**Nova**: Não há servidor para expor endpoints

**Trade-off:**
- ❌ Nova: Agentes não funcionam sem servidor
- **Soluções**:
  - Cloudflare Worker (opcional)
  - Usuário deploya seu próprio Worker
  - Agente "local" (só funciona no browser do usuário)

**Decisão**: **Cloudflare Worker opcional** (para agentes de produção)

---

## 📊 Matriz de Trade-offs Resumida

| Feature | Atual | Nova | Trade-off Principal |
|---------|-------|------|---------------------|
| **Battle** | Servidor executa | Client executa | Validação vs Velocidade |
| **Training** | Programas fixos | LLM gera | Consistência vs Personalização |
| **Evolution** | Descrição fixa | LLM gera | Determinismo vs Narrativa |
| **DNA** | Timeline estruturada | LLM gera narrativa | Estrutura vs Criatividade |
| **Leaderboard** | Global centralizado | Local ou Worker | Centralização vs Privacidade |
| **Agents** | Endpoints funcionais | Local ou Worker | Funcionalidade vs Custo |

---

## 🎯 Decisões Finais Recomendadas

### 1. Core: Browser-Native

**Decisão**: Migrar core para browser-native
- Ledger: IndexedDB (Dexie.js)
- Crypto: JS puro (já é portável)
- LLM: BYOK no client
- Backup: Google Drive automático

**Justificativa**: Zero custo, offline, PWA, privacidade

---

### 2. Features Sociais: Cloudflare Worker Opcional

**Decisão**: Usar Cloudflare Worker para features que requerem servidor
- Leaderboard global
- Agentes de produção
- Sync entre devices

**Justificativa**: Free tier suficiente, zero custo, resolve limitações

---

### 3. Conteúdo: Prompt-First com Cache

**Decisão**: Gerar conteúdo via LLM, cachear respostas importantes
- Prompts YAML para templates
- LLM gera conteúdo dinamicamente
- Cache de spans importantes no Ledger

**Justificativa**: Escalável, personalizável, interessante

---

### 4. Validação: Client com Fallback

**Decisão**: Validar no client, com validação opcional no Worker
- Validação básica no client (trust, level, etc)
- Validação robusta no Worker (se disponível)

**Justificativa**: Funciona offline, mas pode ter validação extra se necessário

---

## ⚠️ Riscos e Mitigações

### Risco 1: Quota IndexedDB Excedida

**Mitigação:**
- Compressão automática quando >10MB
- Exportação periódica sugerida
- Segmentação por data/mês
- Backup automático Google Drive

---

### Risco 2: Chave API Exposta no Browser

**Mitigação:**
- Educar usuário sobre segurança
- Opção de proteger com senha/biometria
- Armazenar em IndexedDB (não localStorage)
- Opcional: Worker proxy (mas perde privacidade)

---

### Risco 3: Conteúdo LLM Inconsistente

**Mitigação:**
- Cache de respostas importantes
- Validação de formato básica
- Prompts bem estruturados
- Fallback para conteúdo estático se LLM falhar

---

### Risco 4: Multiplayer Limitado

**Mitigação:**
- Aceitar limitação inicial
- WebRTC para peer-to-peer (futuro)
- Cloudflare Worker para sync (opcional)
- Export/import manual (sempre disponível)

---

## 🎯 Conclusão

### Decisão Final

**Arquitetura Híbrida Recomendada:**

1. **Core**: 100% Browser-Native
   - Ledger IndexedDB
   - Crypto JS puro
   - LLM BYOK
   - Funciona offline

2. **Features Sociais**: Cloudflare Worker (Opcional)
   - Leaderboard global
   - Agentes de produção
   - Sync entre devices

3. **Backup**: Google Drive (Seamless)
   - Zero custo admin
   - Restore automático
   - Opção paranoia (criptografia)

### Próximos Passos

1. **Validar proposta** com protótipo mínimo
2. **Testar IndexedDB** com dataset real
3. **Implementar useLLM** hook universal
4. **Criar prompts** YAML base
5. **Testar PWA** no iPhone
6. **Avaliar Cloudflare Worker** para features sociais

---

## 🔗 Referências

- **[Comparação de Arquiteturas](COMPARACAO_ARQUITETURAS.md)**
- **[Nova Arquitetura](NOVA_ARQUITETURA_BROWSER_NATIVE.md)**
- **[Arquitetura Atual](../06-PESQUISA/ANALISES_TECNICAS/ARQUITETURA_MOTOR.md)**

---

**Status**: Trade-offs documentados  
**Última atualização**: 2025-11-10


