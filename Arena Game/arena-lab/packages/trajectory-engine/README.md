# 🔍 Trajectory Engine

**Motor de Trajectory Matching para ArenaLab**

Este package implementa o sistema de Trajectory Matching, que permite encontrar spans similares no ledger e sintetizar resultados baseados em padrões históricos.

## 📋 Componentes

### Search (HNSW + TF-IDF)
- **TF-IDF Embedding**: Embeddings determinísticos baseados em TF-IDF (sem ML)
- **HNSW Index**: Índice hierárquico para busca rápida de vetores similares
- **Hybrid Index**: Combinação de HNSW + IVF para busca eficiente

### Quality Meter
- **5D Quality Meter**: Avalia spans em 5 dimensões (Completeness, Provenance, Impact, Uniqueness, Coherence)
- **Curator**: Filtra spans baseado em qualidade mínima

### Predictor
- **Context Matcher**: Encontra spans similares baseado em contexto
- **Outcome Synthesizer**: Sintetiza resultados baseado em spans similares
- **Confidence Calibration**: Calcula confiança das predições

### Narrative Generator
- **Deterministic Rules**: Regras determinísticas para eventos narrativos
- **Event Generator**: Gera eventos narrativos baseado em spans

## 🚀 Status

**FASE 1 - Em Desenvolvimento**

- [ ] Search (HNSW + TF-IDF)
- [ ] Quality Meter
- [ ] Predictor
- [ ] Narrative Generator
- [ ] Integration & Tests

## 📚 Documentação

Ver `docs/02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md` para detalhes completos dos algoritmos.

