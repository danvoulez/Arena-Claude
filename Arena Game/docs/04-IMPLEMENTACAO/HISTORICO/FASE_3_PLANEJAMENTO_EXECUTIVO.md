# Fase 3: Planejamento Executivo
## O Ecossistema Vivo - Da Memória à Lenda

**Data:** 2025-11-09  
**Status:** 📋 **PLANEJAMENTO COMPLETO**

---

## 🎯 Objetivo da Fase

Transformar a jornada da criatura de experiência privada para história pública, com DNA verificável, ranking global e narrativa derivada do Ledger.

**Mantra:** "Reputação não é opinião. É matemática imutável. O Ledger prova tudo."

---

## 📊 Escopo da Fase

### Backend (3 endpoints principais):
1. **`GET /api/arena/creatures/:id/dna`** - Timeline completa da criatura
2. **`GET /api/arena/leaderboard`** - Ranking global com filtros
3. **`GET /api/arena/creatures/:id/legend`** - História narrativa verificável

### Frontend (3 componentes principais):
1. **`EvolutionTimeline`** - Visualização de DNA
2. **`Leaderboard`** - Ranking com filtros
3. **`CreatureLegend`** - História em formato de livro

### Infraestrutura:
- Rota pública `/legend/:id` para compartilhamento
- Métricas de visualização e compartilhamento
- Testes E2E para todos os endpoints

---

## ⏱️ Timeline Estimado

**Duração:** 2-3 semanas

### Semana 1: Backend
- **Dia 1-2:** Endpoint DNA + Helpers (narrativa, marcos, qualidade)
- **Dia 3-4:** Endpoint Leaderboard + Filtros
- **Dia 5:** Endpoint Legend + Geração de capítulos

### Semana 2: Frontend
- **Dia 1-2:** Componente EvolutionTimeline
- **Dia 3-4:** Componente Leaderboard
- **Dia 5:** Componente CreatureLegend

### Semana 3: Integração e Testes
- **Dia 1-2:** Integração no ArenaView + Rota pública
- **Dia 3-4:** Testes E2E
- **Dia 5:** Métricas + Documentação

---

## 🎯 Métricas de Sucesso

### Funcionalidade:
- ✅ 100% das timelines renderizam a partir do Ledger
- ✅ Leaderboard consistente entre runs
- ✅ Legend compartilhável via URL pública
- ✅ Provas criptográficas verificáveis

### Performance:
- ✅ P95 latency DNA ≤ 2s
- ✅ P95 latency Leaderboard ≤ 1s
- ✅ P95 latency Legend ≤ 3s

### Qualidade:
- ✅ Testes E2E passam (DNA, Leaderboard, Legend)
- ✅ Métricas expostas em `/metrics`
- ✅ URLs públicas funcionam sem autenticação

---

## 🔧 Componentes Técnicos

### Backend:

#### 1. DNA Endpoint
- **Input:** `creatureId`
- **Output:** Timeline completa, estatísticas, marcos, perfil de qualidade
- **Complexidade:**** Média (processamento de spans)

#### 2. Leaderboard Endpoint
- **Input:** Query params (sort, limit, category)
- **Output:** Rankings com badges e estatísticas
- **Complexidade:**** Baixa (agregação de dados)

#### 3. Legend Endpoint
- **Input:** `creatureId`
- **Output:** Capítulos narrativos, apêndice criptográfico
- **Complexidade:**** Alta (geração de narrativa)

### Frontend:

#### 1. EvolutionTimeline
- **Dependências:** API DNA
- **Complexidade:**** Média (visualização de timeline)

#### 2. Leaderboard
- **Dependências:** API Leaderboard
- **Complexidade:**** Baixa (tabela com filtros)

#### 3. CreatureLegend
- **Dependências:** API Legend
- **Complexidade:**** Média (renderização de capítulos)

---

## 🚨 Riscos e Mitigações

### Risco 1: Performance do DNA com muitos spans
**Probabilidade:** Média  
**Impacto:** Alto  
**Mitigação:**
- Paginação de spans
- Cache de DNA processado (5 min TTL)
- Lazy loading de timeline

### Risco 2: Geração de narrativa lenta
**Probabilidade:** Baixa  
**Impacto:** Médio  
**Mitigação:**
- Template-based narrativa (sem LLM)
- Cache de legend gerada
- Background job para pré-geração

### Risco 3: Leaderboard inconsistente
**Probabilidade:** Baixa  
**Impacto:** Médio  
**Mitigação:**
- Ordenação determinística
- Testes de propriedade (mesmo input = mesmo output)
- Cache de leaderboard (1 min TTL)

---

## 📋 Definition of Done

### Backend:
- [ ] Endpoint DNA retorna timeline completa
- [ ] Endpoint Leaderboard funciona com filtros
- [ ] Endpoint Legend gera narrativa verificável
- [ ] Helpers (narrativa, marcos, qualidade) implementados
- [ ] Métricas de visualização expostas

### Frontend:
- [ ] EvolutionTimeline renderiza DNA
- [ ] Leaderboard exibe rankings com filtros
- [ ] CreatureLegend exibe narrativa
- [ ] Integração no ArenaView (tabs)
- [ ] Rota pública `/legend/:id` funciona

### Testes:
- [ ] Teste E2E DNA passa
- [ ] Teste E2E Leaderboard passa
- [ ] Teste E2E Legend passa
- [ ] Testes de propriedade (consistência)

### Observabilidade:
- [ ] Métricas de visualização em `/metrics`
- [ ] Logs estruturados para debugging
- [ ] Performance monitoring

---

## 🎨 Experiência do Usuário

### DNA Atômico:
1. Usuário clica em "View DNA" na criatura
2. Timeline visual carrega mostrando todos os eventos
3. Marcos destacados (primeira batalha, primeira vitória, evolução)
4. Estatísticas agregadas (win rate, ELO, trust)
5. Perfil de qualidade com tendência

### Leaderboard:
1. Usuário acessa tab "Leaderboard"
2. Vê ranking global por ELO (padrão)
3. Pode filtrar por categoria (undefeated, evolved, etc.)
4. Pode ordenar por diferentes métricas
5. Badges visíveis (undefeated, evolved, ascended)

### Legend:
1. Usuário clica em "View Legend" na criatura
2. História em formato de livro carrega
3. Capítulos narrativos (Awakening, Cultivation, Arena Chronicles, Ascension)
4. Apêndice com provas criptográficas
5. Botão de compartilhamento gera URL pública

---

## 📈 Métricas de Negócio

### Engajamento:
- Visualizações de DNA por criatura
- Visualizações de Leaderboard
- Compartilhamentos de Legend
- Tempo médio na página de Legend

### Qualidade:
- Taxa de erro em endpoints
- Latência P95/P99
- Taxa de cache hit

### Crescimento:
- Novos usuários que visualizam DNA
- Criaturas com Legend gerada
- Compartilhamentos externos

---

## 🔄 Dependências

### Depende de:
- ✅ Fase 1 (Batalhas gravando spans)
- ✅ Fase 2 (Treino e evolução gravando spans)
- Ledger funcional com spans históricos

### Bloqueia:
- Fase 4 (Ascensão - precisa de Legend para certificação)

---

## 📝 Notas de Implementação

### Priorização:
1. **DNA primeiro** - Base para tudo
2. **Leaderboard depois** - Mais simples, valida conceito
3. **Legend por último** - Mais complexo, depende dos outros

### Decisões Técnicas:
- **Narrativa:** Template-based inicialmente (sem LLM para performance)
- **Cache:** 5 min para DNA, 1 min para Leaderboard, 10 min para Legend
- **Paginação:** DNA com limite de 1000 spans (scroll infinito no frontend)

### Extensões Futuras:
- Exportar Legend como PDF
- NFT de Legend (opcional)
- Timeline interativa com zoom
- Comparação de DNA entre criaturas

---

**Status:** 📋 **PLANEJAMENTO COMPLETO - PRONTO PARA IMPLEMENTAÇÃO**

*Documento gerado em: 2025-11-09*  
*Versão: 1.0-executive*  
*Próximo passo: Iniciar implementação do endpoint DNA*

