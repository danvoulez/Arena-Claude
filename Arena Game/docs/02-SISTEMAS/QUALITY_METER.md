# 📊 Sistema de Qualidade (Quality Meter 5D) - ArenaLab

**Status**: ✅ Implementado  
**Data**: 2025-11-10

---

## 📋 Visão Geral

O Quality Meter 5D é o sistema oficial de avaliação de qualidade de respostas de IA. Avalia spans em 5 dimensões independentes e calcula um score total ponderado.

---

## 🎯 As 5 Dimensões

### 1. Completeness (Completude)

**O Que Avalia:**
- Resposta está completa?
- Cobre todos os aspectos da pergunta?
- Não deixa lacunas importantes?

**Range**: 0-100

**Peso**: 25% (0.25)

**Exemplo:**
- ✅ 100: Resposta completa, cobre todos os aspectos
- ⚠️ 70: Resposta parcial, falta alguns detalhes
- ❌ 30: Resposta incompleta, lacunas significativas

---

### 2. Provenance (Procedência)

**O Que Avalia:**
- Fonte é confiável?
- Baseado em dados verificáveis?
- Citações e referências adequadas?

**Range**: 0-100

**Peso**: 20% (0.20)

**Exemplo:**
- ✅ 100: Fonte verificável, citações adequadas
- ⚠️ 60: Fonte parcialmente confiável
- ❌ 20: Fonte não confiável ou sem referências

---

### 3. Impact (Impacto)

**O Que Avalia:**
- Resposta tem impacto significativo?
- Útil para o contexto?
- Resolve o problema proposto?

**Range**: 0-100

**Peso**: 20% (0.20)

**Exemplo:**
- ✅ 100: Alto impacto, resolve completamente o problema
- ⚠️ 50: Impacto moderado
- ❌ 10: Baixo impacto, pouco útil

---

### 4. Uniqueness (Unicidade)

**O Que Avalia:**
- Resposta é única ou repetitiva?
- Traz insights novos?
- Evita redundância?

**Range**: 0-100

**Peso**: 15% (0.15)

**Exemplo:**
- ✅ 100: Resposta única, insights novos
- ⚠️ 50: Alguma originalidade
- ❌ 10: Muito repetitiva, sem novidades

---

### 5. Coherence (Coerência)

**O Que Avalia:**
- Resposta é coerente e lógica?
- Argumentos são consistentes?
- Não há contradições?

**Range**: 0-100

**Peso**: 20% (0.20)

**Exemplo:**
- ✅ 100: Totalmente coerente, lógica perfeita
- ⚠️ 60: Algumas inconsistências menores
- ❌ 20: Incoerente, contradições significativas

---

## 📊 Cálculo do Score Total

### Fórmula

```typescript
total_score = (
  completeness * 0.25 +
  provenance * 0.20 +
  impact * 0.20 +
  uniqueness * 0.15 +
  coherence * 0.20
)
```

### Exemplo

```typescript
{
  completeness: 90,
  provenance: 85,
  impact: 80,
  uniqueness: 75,
  coherence: 95
}

total_score = (90 * 0.25) + (85 * 0.20) + (80 * 0.20) + (75 * 0.15) + (95 * 0.20)
            = 22.5 + 17.0 + 16.0 + 11.25 + 19.0
            = 85.75
```

---

## 🎯 Thresholds

### Diamond Span

**Definição**: Span de alta qualidade usado para treinamento

**Requisito**: `total_score >= 80`

**Uso**:
- Adicionado ao dataset da criatura
- Usado para trajectory matching
- Contribui para evolução

---

### Quality Levels

| Score | Nível | Descrição |
|-------|-------|-----------|
| 90-100 | ⭐⭐⭐⭐⭐ Excelente | Span excepcional, ideal para treinamento |
| 80-89 | ⭐⭐⭐⭐ Muito Bom | Span de alta qualidade (Diamond) |
| 70-79 | ⭐⭐⭐ Bom | Span aceitável, pode ser usado |
| 60-69 | ⭐⭐ Regular | Span com qualidade média |
| 0-59 | ⭐ Ruim | Span de baixa qualidade, não recomendado |

---

## 🔧 Implementação

### Arquivo

**Localização**: `src/quality_meter.ts`

### Interface

```typescript
interface QualityScore {
  completeness: number
  provenance: number
  impact: number
  uniqueness: number
  coherence: number
  total_score: number
}

function evaluate(response: string, context?: any): QualityScore
```

### Uso

```typescript
import { QualityMeter } from './quality_meter.js'

const qualityMeter = new QualityMeter()
const score = qualityMeter.evaluate(response, context)

if (score.total_score >= 80) {
  // É um Diamond Span!
  await addToDataset(span)
}
```

---

## 📊 Uso no Sistema

### Batalhas

**Onde**: `src/arena/battle-runner.ts`

**Como**:
1. Gera respostas de ambas criaturas
2. Avalia cada resposta com Quality Meter
3. Compara scores para determinar vencedor
4. Grava scores no span de batalha

**Código**:
```typescript
const qualityA = this.qualityMeter.evaluate(responseA, context)
const qualityB = this.qualityMeter.evaluate(responseB, context)

const winner = qualityA.total_score > qualityB.total_score ? 'A' : 'B'
```

---

### Treinamento

**Onde**: `src/arena/api.ts` - `handleCompleteTraining`

**Como**:
1. Completa treinamento
2. Seleciona spans de alta qualidade (score >= 80)
3. Adiciona ao dataset da criatura

---

### Evolução

**Onde**: `src/arena/api.ts` - `handleEvolve`

**Como**:
1. Expande dataset estrategicamente
2. Filtra spans por qualidade (score >= 85)
3. Adiciona apenas os melhores exemplos

---

## 🔗 Referências

- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_TREINO_IA.md)**
- **[Battle System](BATTLE_SYSTEM.md)**
- **[Training System](TRAINING_SYSTEM.md)**
- **[Formulas](../07-REFERENCIA/FORMULAS.md)**

---

**Status**: ✅ Sistema completo e documentado  
**Última atualização**: 2025-11-10


