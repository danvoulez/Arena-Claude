# 🤖 Decisões Arquiteturais - Treino IA

**Status**: ✅ Oficial  
**Data**: 2025-11-10

---

## 📋 Princípios Oficiais

### 1. Trajectory Matching (Sem Gradientes)

**Decisão Oficial:**
- ✅ **Trajectory Matching** é o mecanismo oficial de treinamento
- ❌ **NÃO** usa: backpropagation, gradientes, LoRA tradicional, fine-tuning tradicional
- ✅ **SIM** usa: pattern matching, busca vetorial, síntese de respostas

**O Que É:**
- Busca padrões similares no dataset (HNSW, TF-IDF)
- Sintetiza respostas baseadas em exemplos
- Zero gradientes, CPU-friendly

**Implementação:**
- **Localização**: `A-Texts/packages/`
- **Algoritmos**: HNSW (busca vetorial), TF-IDF (embedding)
- **Pipeline**: Embed → Search → Filter → Synthesize

**Arquivos Relacionados:**
- **Repositório**: `Arena Game/A-Texts/` (repositório separado)
- **[TRAJECTORY_MATCHING_ADVANCED.md](../02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md)** 🔥 - Algoritmos completos (HNSW, IVF, Context Matching, Outcome Synthesis)
- `A-Texts/docs/formula.md` - Fórmula técnica de trajectory matching
- `A-Texts/packages/search/` - Busca vetorial (HNSW, TF-IDF)
- `A-Texts/packages/predictor/` - Síntese de respostas (confidence calibration)

---

### 2. Curadoria de Dados = Treinamento

**Decisão Oficial:**
- ✅ "Treinamento" não é backpropagation
- ✅ É **curadoria de spans de alta qualidade** para o dataset
- ✅ Dataset expansion = evolução da criatura

**Como Funciona:**
1. Usuário inicia programa de treinamento
2. Completa treinamento (duração simulada ou real)
3. Spans de alta qualidade são adicionados ao dataset da criatura
4. Dataset expandido = criatura "aprendeu"

**Implementação:**
- `POST /api/arena/creatures/:id/train` - Inicia treinamento
- `POST /api/arena/sessions/:id/complete` - Completa treinamento
- Adiciona spans ao dataset da criatura

---

### 3. Quality Meter 5D

**Decisão Oficial:**
- ✅ Avaliação de qualidade em 5 dimensões:
  1. **Completeness** - Resposta completa?
  2. **Provenance** - Fonte confiável?
  3. **Impact** - Impacto significativo?
  4. **Uniqueness** - Único ou repetitivo?
  5. **Coherence** - Coerente e lógico?

**Implementação:**
- `src/quality_meter.ts` - Implementação
- Usado em batalhas para avaliar respostas
- Determina "diamond spans" (alta qualidade)

**Decisão:**
- ✅ Quality Meter 5D é o padrão oficial
- ✅ Spans com qualidade alta = "diamond spans"
- ✅ Diamond spans = melhor treinamento

---

### 4. Training Programs (Programas de Treino)

**Decisão Oficial:**
- ✅ Programas são definidos em YAML (data-driven)
- ✅ Cada programa tem: buffs, traits, duração, cooldown
- ✅ Completar programa adiciona spans ao dataset

**Estrutura:**
```yaml
name: "Sessão de Empatia Socrática"
duration_hours: 8
buffs:
  - stat: "charisma"
    value: 15
    duration_hours: 24
traits:
  - name: "Empathic Listener"
    permanent: true
```

**Implementação:**
- `Arena-Frontend/lib/training-engine.ts` - Programas (frontend)
- `src/arena/api.ts` - Funções helper (`getTrainingProgramInfo`, `getProgramName`, `getProgramDuration`)
- Futuro: Mover para YAML (data-driven)

---

### 5. Trust System

**Decisão Oficial:**
- ✅ Stat emocional da criatura (0-100)
- ✅ Influencia comportamento e evolução
- ✅ Atualizado baseado em vitórias, derrotas, treinos

**Regras:**
- **Vitória**: +5 trust
- **Derrota**: -3 trust
- **Treino**: +2 trust
- **Evolução requer**: Trust ≥ 85

**Implementação:**
- `src/arena/types.ts` - `Creature.trust`
- `src/arena/narrative-sync.ts` - Atualiza trust
- `Arena-Frontend/components/creature-card.tsx` - Exibe trust

---

### 6. Evolução = Dataset Expansion

**Decisão Oficial:**
- ✅ Evolução não é "mudança de forma"
- ✅ É **expansão estratégica do dataset**
- ✅ Novas habilidades = novos exemplos no dataset

**Como Funciona:**
1. Criatura atinge requisitos (level, trust, spans)
2. Evolução expande dataset estrategicamente
3. Novas habilidades = novos padrões no dataset
4. Criatura "aprende" novos comportamentos

**Implementação:**
- `POST /api/arena/evolve/:id` - Evolução
- Expande dataset da criatura
- Adiciona novas habilidades

---

## 🔬 Motor de IA (A-Texts)

### Decisão: A-Texts como Motor Oficial

**Status**: ✅ **OFICIAL**

**O Que É:**
- Repositório separado com implementação de trajectory matching
- Packages modulares: search, predictor, ledger, etc.
- Cloudflare Worker para API edge

**Localização:**
- **Repositório Separado**: `Arena Game/A-Texts/` (não está em `diamond-applied/`)
- `A-Texts/packages/` - Packages modulares (search, predictor, ledger, etc.)
- `A-Texts/apps/api-worker/` - Cloudflare Worker para API edge
- `A-Texts/docs/formula.md` - Fórmula técnica de trajectory matching

**Decisão:**
- ✅ A-Texts é o motor oficial de trajectory matching
- ✅ ArenaLab usa A-Texts para treinamento
- ✅ Integração via API ou import direto

---

### Algoritmos Oficiais

#### HNSW (Hierarchical Navigable Small World)
- **Função**: Busca vetorial O(log N)
- **Uso**: Encontrar spans similares no dataset
- **Implementação**: `A-Texts/packages/search/`

#### TF-IDF (Term Frequency-Inverse Document Frequency)
- **Função**: Embedding determinístico
- **Uso**: Representar spans como vetores
- **Implementação**: `A-Texts/packages/search/`

#### Confidence Calibration (Platt Scaling)
- **Função**: Calibrar confiança das predições
- **Uso**: Determinar quando usar predição
- **Implementação**: `A-Texts/packages/predictor/`

---

## 📊 Fluxo de Treinamento Oficial

### 1. Curadoria (Training)
```
Usuário inicia programa
  ↓
Completa treinamento
  ↓
Spans de alta qualidade adicionados ao dataset
  ↓
Criatura "aprendeu" novos padrões
```

### 2. Evolução
```
Criatura atinge requisitos
  ↓
Dataset expandido estrategicamente
  ↓
Novas habilidades desbloqueadas
  ↓
Criatura "evoluiu"
```

### 3. Ascensão
```
Criatura atinge requisitos finais
  ↓
Dataset congelado (snapshot)
  ↓
Agente de produção criado
  ↓
Criatura "ascendeu"
```

---

## 🔗 Referências

- **[A-Texts](../../A-Texts/)** - Motor de IA
- **[A-Texts/docs/formula.md](../../A-Texts/docs/formula.md)** - Fórmula técnica
- **[Decisões Arquiteturais Oficiais](DECISOES_ARQUITETURAIS_OFICIAIS.md)**
- **[Nova Arquitetura](NOVA_ARQUITETURA_BROWSER_NATIVE.md)** - Trajectory Matching no browser

---

**Status**: ✅ Decisões treino IA oficiais  
**Última atualização**: 2025-11-10

