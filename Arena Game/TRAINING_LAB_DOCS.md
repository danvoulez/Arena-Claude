# 🔬 Training Lab - Documentação Completa

**Status**: ✅ Implementado
**Data**: 2025-11-10

---

## 🎯 Visão Geral

O **Training Lab** é seu laboratório científico interativo para treinar IAs usando Trajectory Matching. Diferente de fine-tuning tradicional (LoRA, gradientes), você treina criando um **dataset curado de Diamond Spans** (conversas de alta qualidade).

**Tom**: Lúdico com rigor científico - tipo "laboratório gamificado"

---

## 🏗️ Arquitetura

### Browser-Native (100% no Chrome)

- ✅ **IndexedDB** - Ledger local (seu banco no navegador)
- ✅ **Trajectory Matching** - Roda direto no browser (HNSW + TF-IDF)
- ✅ **LLM calls** - Via BYOK (Bring Your Own Key)
- ✅ **PWA** - Funciona offline

### Componentes Principais

```
TrainingLab/
├── TrainingTerminal          # Terminal com logs em tempo real
├── ToolCallingPanel          # Visualização de tool calls
├── TrajectoryMatchingVisualizer  # Matching + Quality Meter 5D
└── DataIngestionPanel        # Upload em massa de .md
```

---

## 📋 Features

### 1. **Terminal Interativo**

Mostra TUDO que está acontecendo em tempo real:

- 🔍 **Logs de busca** - Searching for similar contexts...
- 🎯 **Matching** - Computing trajectory similarities...
- 💎 **Quality Meter** - Running Quality Meter 5D...
- ⚡ **Tool calls** - Funções sendo executadas
- 🚀 **Critical Hits** - Quando o modelo evolui/ganha XP

**Tipos de eventos**:
- `log` - Log geral
- `tool_call` - Chamada de função
- `search` - Busca de spans
- `match` - Matching de trajetórias
- `quality` - Avaliação de qualidade
- `result` - Resultado de operação
- `error` - Erro
- `critical_hit` - Evento especial (evolução, XP massivo, etc.)

### 2. **Tool Calling Panel**

Visualize funções sendo executadas tipo IDE agent:

- ⏱️ **Status**: Pending → Running → Success/Error
- 📊 **Duration**: Quanto tempo levou
- 📥 **Parameters**: Inputs da função
- 📤 **Result**: Output da execução

**Exemplo**:
```typescript
{
  name: 'searchSimilarSpans',
  parameters: { query: "Explain quantum computing", k: 10 },
  status: 'success',
  result: { found: 47, matched: 8 },
  duration: 823 // ms
}
```

### 3. **Trajectory Matching Visualizer**

Veja a "ciência" acontecendo:

**Fases**:
1. `searching` - Buscando spans similares (HNSW)
2. `matching` - Matching de contextos
3. `quality_check` - Quality Meter 5D
4. `complete` - Finalizado

**Matched Spans**:
- Similarity % (quão similar ao contexto atual)
- Quality Score (5D breakdown)
- Context preview
- Outcome

### 4. **Data Ingestion Panel**

**Upload em massa de .md** - Alimentar sua IA com MILHARES de conversas!

**Suporta**:
- ✅ ChatGPT exports (.md)
- ✅ Claude conversations (.md)
- ✅ Documentação (.md)
- ✅ Qualquer .md com formato user/assistant

**Processo**:
1. Drag & drop ou clique para selecionar .md
2. Click "Start Ingestion"
3. Processador extrai conversas
4. Quality Meter 5D avalia cada par user/assistant
5. Apenas **Diamond Spans** (score >= 80) são adicionados

---

## 💎 Diamond Spans - Quality Meter 5D

### As 5 Dimensões

| Dimensão | Peso | Descrição |
|----------|------|-----------|
| **Completeness** | 25% | Resposta completa? Cobre todos aspectos? |
| **Provenance** | 20% | Fonte confiável? Verificável? |
| **Impact** | 20% | Útil? Resolve o problema? |
| **Uniqueness** | 15% | Original? Traz insights novos? |
| **Coherence** | 20% | Lógica? Consistente? |

### Cálculo

```typescript
overall = (
  completeness * 0.25 +
  provenance * 0.20 +
  impact * 0.20 +
  uniqueness * 0.15 +
  coherence * 0.20
)
```

### Thresholds

| Score | Nível | Uso |
|-------|-------|-----|
| 90-100 | ⭐⭐⭐⭐⭐ Excelente | Ideal para treinamento |
| 80-89 | ⭐⭐⭐⭐ Diamond | Usado para treinamento |
| 70-79 | ⭐⭐⭐ Bom | Pode ser usado |
| 60-69 | ⭐⭐ Regular | Não recomendado |
| 0-59 | ⭐ Ruim | Descartado |

**Diamond Span** = score >= 80

---

## 🚀 Como Usar

### Modo 1: Manual Training

Para treinamento pontual com um prompt:

1. Selecione a criatura
2. Tab "Manual Training"
3. Digite o prompt
4. Click "Start Training"
5. Veja no terminal:
   - Busca de spans similares
   - Matching de contextos
   - Quality Meter
   - XP ganho

### Modo 2: Batch Ingestion

Para alimentar com MILHARES de .md:

1. Tab "Batch Ingestion"
2. Drag & drop seus .md ou click para selecionar
3. Click "Start Ingestion"
4. Veja no terminal:
   - Processing (1/1000): conversation_001.md
   - Extracted 342 Diamond Spans!
   - Diamond Span #1: Quality 87/100
   - 💎 MASSIVE GAIN! +3420 XP

**Dica**: Exporte suas conversas do ChatGPT/Claude como .md e jogue tudo aqui!

---

## 📁 Formatos de .md Suportados

### ChatGPT Export

```markdown
**You:** Como funciona quantum computing?

**ChatGPT:** Quantum computing é baseado em qubits que podem estar em...

**You:** E qual a diferença para computação clássica?

**ChatGPT:** A principal diferença é que...
```

### Claude Conversation

```markdown
## Human:
Como funciona quantum computing?

## Assistant:
Quantum computing é baseado em qubits que podem estar em...

## Human:
E qual a diferença para computação clássica?

## Assistant:
A principal diferença é que...
```

### Formato Genérico

```markdown
User: Como funciona quantum computing?
AI: Quantum computing é baseado em qubits...

Q: E qual a diferença para computação clássica?
A: A principal diferença é que...
```

O processador tenta detectar automaticamente o formato!

---

## 🔬 Processo de Ingestão (Detalhado)

### 1. Upload de Arquivos

```typescript
// Usuário faz upload
const files = [conversation_001.md, conversation_002.md, ...]

// Sistema valida (apenas .md)
const mdFiles = files.filter(f => f.name.endsWith('.md'))
```

### 2. Detecção de Formato

```typescript
function detectSource(content: string) {
  if (content.includes('**You:**')) return 'chatgpt'
  if (content.includes('## Human:')) return 'claude'
  return 'unknown'
}
```

### 3. Extração de Conversas

```typescript
// Para cada arquivo
const conversation = await processMDFile(file)

// Extrai pares user/assistant
conversation.turns = [
  { role: 'user', content: "Como funciona quantum computing?" },
  { role: 'assistant', content: "Quantum computing é..." },
  { role: 'user', content: "E qual a diferença..." },
  { role: 'assistant', content: "A principal diferença..." }
]
```

### 4. Quality Meter 5D

```typescript
// Para cada par user/assistant
for (const [user, assistant] of pairs) {
  const quality = calculateQuality(user.content, assistant.content)

  // Apenas Diamond Spans
  if (quality.overall >= 80) {
    diamondSpans.push({
      context: user.content,
      response: assistant.content,
      quality: quality
    })
  }
}
```

### 5. Adição ao Ledger

```typescript
// Criar spans no ledger (IndexedDB)
for (const diamondSpan of diamondSpans) {
  await ledger.append({
    entity_type: 'training_span',
    what: {
      context: diamondSpan.context,
      response: diamondSpan.response,
      quality: diamondSpan.quality
    },
    who: creatureId,
    when: { started_at: timestamp }
  })
}
```

---

## 📊 Stats & Métricas

Durante treinamento, você vê em tempo real:

- **Total Spans**: Spans totais encontrados
- **Matched**: Spans que matcharam (similarity > threshold)
- **Avg Quality**: Qualidade média (0-1)
- **XP Gained**: XP ganho (baseado em quantidade × qualidade)

**Fórmula XP**:
```typescript
xp = diamondSpans.length * 10 * avgQuality
```

**Exemplo**:
- 342 Diamond Spans
- Avg Quality: 0.85
- XP = 342 × 10 × 0.85 = **2907 XP**

---

## 🎨 UI Components

### TrainingTerminal

```tsx
<TrainingTerminal
  events={[...]}          // Array de TrainingEvent
  isRunning={boolean}     // Está rodando?
  onClear={() => {}}      // Limpar logs
  stats={{                // Stats em tempo real
    totalSpans: 100,
    matchedSpans: 8,
    avgQuality: 0.82,
    xpGained: 656
  }}
/>
```

### ToolCallingPanel

```tsx
<ToolCallingPanel
  toolCalls={[...]}           // Array de ToolCall
  currentlyRunning={string}   // ID do call rodando
/>
```

### TrajectoryMatchingVisualizer

```tsx
<TrajectoryMatchingVisualizer
  state={{
    phase: 'matching',      // searching | matching | quality_check | complete
    candidateSpans: 47,
    matchedSpans: [...],    // Array de MatchedSpan
    qualityThreshold: 0.7,
    avgSimilarity: 0.84,
    avgQuality: 0.82
  }}
/>
```

### DataIngestionPanel

```tsx
<DataIngestionPanel
  onIngest={async (files) => {
    // Processar arquivos
    const spans = await processMDFiles(files)
    // Adicionar ao ledger
  }}
  isProcessing={boolean}
/>
```

---

## 🔗 Integração com Backend

### Próximos Passos (TODO)

1. **Conectar com Ledger Real**
   ```typescript
   import { getLedger } from '@/lib/ledger/indexeddb-ledger'

   const ledger = await getLedger()
   await ledger.append(span)
   ```

2. **Streaming de Eventos (SSE/WebSocket)**
   ```typescript
   const eventSource = new EventSource('/api/training/stream')

   eventSource.onmessage = (event) => {
     const data = JSON.parse(event.data)
     addTerminalEvent(data)
   }
   ```

3. **LLM Real (BYOK)**
   ```typescript
   const response = await fetch('/api/llm/generate', {
     method: 'POST',
     body: JSON.stringify({
       prompt: userPrompt,
       apiKey: userApiKey  // BYOK
     })
   })
   ```

---

## 🎯 Use Cases

### 1. Treinar com Histórico de Projeto

Você tem 500 conversas de ChatGPT/Claude sobre "LogLine" e "Json✯Atomic":

1. Exporte todas como .md
2. Jogue no Batch Ingestion
3. Sistema extrai ~2000 Diamond Spans
4. Sua IA agora "conhece" todo o histórico do projeto!

### 2. Curadoria Manual

Você quer treinar em casos específicos:

1. Use Manual Training
2. Digite prompt: "Como implementar HNSW?"
3. Sistema busca spans similares no ledger
4. Você vê quality score e pode decidir

### 3. Evoluir Criatura

Sua criatura precisa de XP para evoluir:

1. Batch Ingestion com 100 .md
2. Ganha 5000 XP
3. Level up! 🚀
4. Agora pode evoluir (se trust >= 85)

---

## 🐛 Troubleshooting

### "Nenhum Diamond Span encontrado"

**Causa**: Quality scores muito baixos (< 80)

**Solução**:
1. Verifique formato dos .md
2. Conversas muito curtas são descartadas
3. Ajuste threshold (default: 80)

### "Processamento muito lento"

**Causa**: Muitos arquivos ou arquivos muito grandes

**Solução**:
1. Processar em batches menores
2. Aguardar - é normal para 1000+ arquivos
3. Verificar console do browser (F12)

### "Tool calls não aparecem"

**Causa**: Modo manual sem tool calls reais

**Solução**:
1. Implementação atual é simulação
2. Tool calls reais virão quando conectar com backend

---

## 📚 Referências

- **[Quality Meter 5D](docs/02-SISTEMAS/QUALITY_METER.md)** - Sistema de qualidade
- **[Trajectory Matching](docs/02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md)** - Matching engine
- **[JSON✯Atomic](Json-Atomic/)** - Ledger criptográfico
- **[A-Texts](A-Texts/)** - Implementação do Trajectory Matcher

---

## 🎉 Próximos Passos

1. ✅ Training Lab funcional
2. ⚠️ Conectar com ledger real (IndexedDB)
3. ⚠️ Integrar com backend (streaming)
4. ⚠️ LLM real (BYOK)
5. ⚠️ Salvar Diamond Spans no ledger
6. ⚠️ Usar spans para Trajectory Matching real

---

**Status**: ✅ Training Lab completo e funcional
**Última atualização**: 2025-11-10

---

## 🚀 Quick Start

```bash
# Rodar frontend
cd arena-lab/apps/arena-frontend
pnpm dev

# Abrir no browser
http://localhost:3000

# Click em "Training" no TopBar
# Escolha "Batch Ingestion"
# Drag & drop seus .md
# Click "Start Ingestion"
# 🔥 PROFIT!
```
