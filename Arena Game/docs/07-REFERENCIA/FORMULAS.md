# 🧮 Fórmulas e Cálculos - ArenaLab

**Referência rápida de fórmulas matemáticas**

---

## 📊 Quality Meter 5D

### Score Total

```
total_score = (
  completeness * 0.25 +
  provenance * 0.20 +
  impact * 0.20 +
  uniqueness * 0.15 +
  coherence * 0.20
)
```

**Exemplo**:
```
completeness = 90
provenance = 85
impact = 80
uniqueness = 75
coherence = 95

total_score = (90 * 0.25) + (85 * 0.20) + (80 * 0.20) + (75 * 0.15) + (95 * 0.20)
            = 22.5 + 17.0 + 16.0 + 11.25 + 19.0
            = 85.75
```

---

### Thresholds

| Score | Status |
|-------|--------|
| ≥ 80 | Diamond Span (alta qualidade) |
| ≥ 85 | Excelente (para evolução) |
| ≥ 90 | Excepcional |

---

## ⚔️ ELO System

### Cálculo de ELO

**Fórmula Padrão (Chess ELO)**:

```
K = 32  // Fator de ajuste

expectedScore_A = 1 / (1 + 10^((ELO_B - ELO_A) / 400))
expectedScore_B = 1 / (1 + 10^((ELO_A - ELO_B) / 400))

actualScore_A = 1 se venceu, 0.5 se empate, 0 se perdeu
actualScore_B = 1 se venceu, 0.5 se empate, 0 se perdeu

newELO_A = ELO_A + K * (actualScore_A - expectedScore_A)
newELO_B = ELO_B + K * (actualScore_B - expectedScore_B)
```

**Exemplo**:
```
ELO_A = 1500
ELO_B = 1500

expectedScore_A = 1 / (1 + 10^((1500 - 1500) / 400)) = 0.5
expectedScore_B = 0.5

// A vence
actualScore_A = 1
actualScore_B = 0

newELO_A = 1500 + 32 * (1 - 0.5) = 1516
newELO_B = 1500 + 32 * (0 - 0.5) = 1484
```

---

## 📈 XP System

### XP Ganho por Evento

| Evento | XP |
|--------|-----|
| Vitória em batalha | 100 |
| Derrota em batalha | 30 |
| Empate | 50 |
| Treinamento completo | 50 |
| Evolução | 1000 |
| Ascensão | 5000 |

---

### Level Up

**Fórmula**:
```
level = floor(sqrt(xp / 100)) + 1
```

**Exemplo**:
```
xp = 2500
level = floor(sqrt(2500 / 100)) + 1
     = floor(sqrt(25)) + 1
     = floor(5) + 1
     = 6
```

---

## 🤝 Trust System

### Atualização de Trust

| Evento | Mudança |
|--------|---------|
| Vitória | +5 |
| Derrota | -3 |
| Treinamento | +2 |
| Evolução | +10 |
| Burnout | -5 |
| Descanso | +1 por hora |

**Fórmula**:
```
newTrust = clamp(oldTrust + change, 0, 100)
```

---

### Requisitos

| Ação | Trust Mínimo |
|------|--------------|
| Evolução | 85 |
| Ascensão | 90 |

---

## 🎯 Evolution Requirements

### Primeira Evolução

```
level >= 15
trust >= 85
diamondSpans >= 50
evolutionStage < 2
```

### Segunda Evolução

```
level >= 25
trust >= 85
diamondSpans >= 100
evolutionStage < 2
```

---

## 🎓 Ascension Requirements

```
level >= 30
evolutionStage >= 2
trust >= 90
diamondSpans >= 100
status === 'active'
```

---

## 💰 Cost Calculation

### Agent Invocation Cost

```
cost = baseCost * tokensUsed / 1000

// Exemplo
baseCost = 0.001  // por request
tokensUsed = 500
cost = 0.001 * 500 / 1000 = 0.0005
```

---

### Trainer Royalty

```
trainerEarnings = cost * royaltyRate

// Exemplo
cost = 0.001
royaltyRate = 0.15  // 15%
trainerEarnings = 0.001 * 0.15 = 0.00015
```

---

## 📊 Rate Limiting

### Requests Per Minute

```
if (currentTime - lastRequest < 60000) {
  requestsInMinute++
} else {
  requestsInMinute = 1
}

if (requestsInMinute > rateLimit.requestsPerMinute) {
  // Rate limit exceeded
}
```

---

## 🔗 Referências

- **[Quality Meter](../02-SISTEMAS/QUALITY_METER.md)**
- **[Battle System](../02-SISTEMAS/BATTLE_SYSTEM.md)**
- **[Trust System](../02-SISTEMAS/TRUST_SYSTEM.md)**

---

**Status**: ✅ Fórmulas documentadas  
**Última atualização**: 2025-11-10


