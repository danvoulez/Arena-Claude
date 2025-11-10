# LoRA Runtime Browser: Genesis Span
## Treinamento Computável de LoRA no Navegador

**Autor:** Dan Voulez & AI Architect  
**Data:** 2025-11-09  
**Versão:** 0.1-alpha  
**Status:** Proposed

---

## 📋 Genesis Span Original

```json
{
  "who": "Dan Voulez & AI Architect",
  "did": "ARCHITECT_COMPUTABLE_LORA_RUNTIME",
  "this": "Genesis of LoRA Training via JSON✯Atomic inside Browser Environment",
  "when": "2025-11-09T23:59:00Z",
  "status": "proposed",
  "confirmed_by": "design_alignment_dan_voulez_2025-11-09",
  "if_ok": "BEGIN_IMPLEMENTATION_STEPS(1-4)",
  "if_not": "FALLBACK_TO_EXTERNAL_LORA_AGENT_WITH_TRACE_SIGNATURE",
  "metadata": {
    "version": "0.1-alpha",
    "vision": "A computable LoRA runtime, running 100% in-browser, using WebGPU + WASM + JSON✯Atomic spans to log, verify and evolve language model agents as 'creatures'.",
    "philosophy": "The act of training an AI should be self-contained, verifiable, human-readable and ownable. If a LoRA patch cannot be exported, signed and reapplied, then it não é do Arena.",
    "pipeline_design": {
      "runtime": "JavaScript-first, Executable via WebGPU or WASM",
      "formato_dos_pesos": "TypedArray / Blob exportable patch (.jsonl or .bin)",
      "logica_de_treino": "Few-shot LoRA micro-fine-tuning com cache de gradiente sob controle de spans",
      "criptografia": "Hash BLAKE3 + Assinatura Ed25519 para cada patch + metadata",
      "modelo_base": "GPT2, DistilGPT, TinyLLaMA ou Mistral 7B quantizado (GQA-friendly)"
    },
    "phases": [
      {
        "phase": 1,
        "title": "Runtime Esquelético Executável",
        "objetivo": "Criar a fundação de execução local via WebGPU + fallback WASM puro (para fallback em iPhone, por exemplo).",
        "artefato_chave": "src/lora-runtime-browser.ts + src/kernel-wasm/train_lora.wasm"
      },
      {
        "phase": 2,
        "title": "Treino com Dataset Local e Span Atômico",
        "objetivo": "Permitir que o jogador envie um `.jsonl` com exemplos e aplique treino local leve, com span assinado.",
        "dataset_sample": "dataset_hash + examples_tokens + config_lora",
        "span_gerado": {
          "type": "training",
          "fields": [
            "creature_id",
            "dataset_hash",
            "duration_ms",
            "model_checkpoint",
            "patch_blake3",
            "signature_ed25519",
            "prompt_before_after"
          ]
        }
      },
      {
        "phase": 3,
        "title": "Exportação e Reuso de Patch",
        "objetivo": "Permitir exportação do patch como Blob (file download) e reimportação com verificação de assinatura.",
        "export_format": ".lora_patch.jsonl",
        "verifier_script": "src/verify-lora-patch.ts"
      },
      {
        "phase": 4,
        "title": "Evolução e Ascensão Baseada em LoRA",
        "objetivo": "Somente criaturas com patch LoRA assinado podem ascender. A LoRA é o ritual de transição.",
        "check": "validate(lora_patch.signature + dna.history) → allow_ascend()"
      }
    ],
    "target_platforms": [
      "macOS Safari (M1/M2+)",
      "Chrome (desktop/mobile)",
      "iPhone (via WASM-only fallback)",
      "PWA exclusive"
    ],
    "tech_notes": {
      "max_model_size": "~300MB por instância carregada",
      "requisitos_ram": "2-4 GB livres para patch leve",
      "compressão_opcional": "support GZIP or Brotli",
      "webgpu_fallback": "wasm + int8 matrix ops",
      "authenticity": "Ed25519 key injected via DV25-Seal for creature + trainer"
    }
  },
  "hash": "blake3:0f12e78a9b3c654facc913a37f20a44d4431aa00129243bce8dcfe22f7af3139",
  "signature": "ed25519:54ac29ef8fa2398dcfb012e9423a7c4eb71a5fe33c980b38bcdb20a401a1e54ac29ef8fa2398dcfb012e9423a7c4eb"
}
```

---

## 🎯 Visão e Filosofia

### Visão

Um runtime de LoRA computável, rodando **100% no navegador**, usando WebGPU + WASM + JSON✯Atomic spans para registrar, verificar e evoluir agentes de linguagem como "criaturas".

### Filosofia

> **"O ato de treinar uma IA deve ser autocontido, verificável, legível por humanos e possuível. Se um patch LoRA não pode ser exportado, assinado e reaplicado, então ele não é do Arena."**

**Princípios:**
1. **Self-contained:** Tudo roda no browser, sem dependências externas
2. **Verifiable:** Cada patch tem hash BLAKE3 + assinatura Ed25519
3. **Human-readable:** Spans JSON✯Atomic documentam todo o processo
4. **Ownable:** Patch exportável como arquivo, reimportável com verificação

---

## 🏗️ Pipeline Design

### Runtime

- **JavaScript-first:** TypeScript/Deno como linguagem principal
- **WebGPU:** Aceleração via GPU quando disponível
- **WASM Fallback:** Para dispositivos sem WebGPU (iPhone, etc.)

### Formato dos Pesos

- **TypedArray / Blob:** Patch exportável
- **Formatos:** `.jsonl` (metadados + pesos) ou `.bin` (binário puro)
- **Compressão:** GZIP ou Brotli opcional

### Lógica de Treino

- **Few-shot LoRA:** Micro fine-tuning com poucos exemplos
- **Cache de gradiente:** Sob controle de spans
- **Quantização:** Suporte a int8 para modelos menores

### Criptografia

- **Hash BLAKE3:** Para integridade do patch
- **Assinatura Ed25519:** Para autenticidade (DV25-Seal)
- **Metadata assinada:** Configuração, dataset hash, etc.

### Modelo Base

- **Suportados:** GPT-2, DistilGPT, TinyLLaMA, Mistral 7B quantizado
- **GQA-friendly:** Grouped Query Attention para eficiência
- **Tamanho máximo:** ~300MB por instância carregada

---

## 📅 Fases de Implementação

### Fase 1: Runtime Esquelético Executável

**Objetivo:** Criar a fundação de execução local via WebGPU + fallback WASM puro.

**Artefatos:**
- `src/lora-runtime-browser.ts` - Runtime principal
- `src/kernel-wasm/train_lora.wasm` - Kernel WASM para treino
- `src/webgpu-kernel.ts` - Kernel WebGPU (quando disponível)

**Checklist:**
- [ ] WebGPU detection e fallback para WASM
- [ ] Carregamento de modelo base (GPT-2 quantizado)
- [ ] Kernel de treino básico funcional
- [ ] Teste: Treino de 1 exemplo funciona

**Estimativa:** 5-7 dias

---

### Fase 2: Treino com Dataset Local e Span Atômico

**Objetivo:** Permitir que o jogador envie um `.jsonl` com exemplos e aplique treino local leve, com span assinado.

**Dataset Sample:**
```json
{
  "dataset_hash": "blake3:...",
  "examples_tokens": [[1, 2, 3, ...], ...],
  "config_lora": {
    "rank": 4,
    "alpha": 16,
    "dropout": 0.1
  }
}
```

**Span Gerado:**
```json
{
  "type": "training",
  "who": "creature_lyria_001",
  "did": "TRAIN_LORA_PATCH",
  "this": {
    "creature_id": "lyria_001",
    "dataset_hash": "blake3:...",
    "duration_ms": 45000,
    "model_checkpoint": "gpt2-base-quantized",
    "patch_blake3": "blake3:...",
    "signature_ed25519": "ed25519:...",
    "prompt_before_after": {
      "before": "Hello, how are you?",
      "after": "Hello! I'm doing great, thanks for asking!"
    }
  },
  "when": "2025-11-10T10:00:00Z",
  "status": "completed"
}
```

**Checklist:**
- [ ] Upload de dataset `.jsonl` funcional
- [ ] Tokenização de exemplos
- [ ] Treino LoRA com configuração
- [ ] Geração de span `training` assinado
- [ ] Teste: Treino completo gera patch + span

**Estimativa:** 4-5 dias

---

### Fase 3: Exportação e Reuso de Patch

**Objetivo:** Permitir exportação do patch como Blob (file download) e reimportação com verificação de assinatura.

**Export Format:**
```jsonl
{"type": "lora_patch_manifest", "version": "1.0", "creature_id": "...", ...}
{"type": "lora_patch_weights", "data": "base64:...", ...}
{"type": "lora_patch_signature", "hash": "blake3:...", "signature": "ed25519:..."}
```

**Verifier Script:**
```typescript
// src/verify-lora-patch.ts
async function verifyLoraPatch(patch: Blob): Promise<boolean> {
  // 1. Parse .lora_patch.jsonl
  // 2. Verificar hash BLAKE3
  // 3. Verificar assinatura Ed25519
  // 4. Validar metadata
  return isValid
}
```

**Checklist:**
- [ ] Export de patch como `.lora_patch.jsonl`
- [ ] Download de arquivo funcional
- [ ] Import de patch com verificação
- [ ] `verify-lora-patch.ts` funcional
- [ ] Teste: Export → Import → Verificação passa

**Estimativa:** 3-4 dias

---

### Fase 4: Evolução e Ascensão Baseada em LoRA

**Objetivo:** Somente criaturas com patch LoRA assinado podem ascender. A LoRA é o ritual de transição.

**Check de Elegibilidade:**
```typescript
function canAscend(creature: Creature): boolean {
  const loraPatch = creature.loraPatches.find(p => p.isValid)
  const dnaHistory = creature.dnaHistory
  
  // Validar patch LoRA
  if (!loraPatch || !verifyLoraPatch(loraPatch)) {
    return false
  }
  
  // Validar DNA history
  if (!validateDnaHistory(dnaHistory)) {
    return false
  }
  
  // Combinar assinaturas
  const combinedSignature = combineSignatures(
    loraPatch.signature,
    dnaHistory.merkleRoot
  )
  
  return verifyCombinedSignature(combinedSignature)
}
```

**Checklist:**
- [ ] Validação de patch LoRA antes de ascensão
- [ ] Combinação de assinaturas (patch + DNA)
- [ ] Endpoint `/api/arena/creatures/:id/ascend` verifica LoRA
- [ ] Teste: Criatura sem LoRA não pode ascender
- [ ] Teste: Criatura com LoRA válido ascende

**Estimativa:** 2-3 dias

---

## 🎯 Plataformas Alvo

### macOS Safari (M1/M2+)

- **WebGPU:** ✅ Suportado (Safari 18+)
- **WASM:** ✅ Suportado
- **Performance:** Excelente (Metal acceleration)

### Chrome (Desktop/Mobile)

- **WebGPU:** ✅ Suportado
- **WASM:** ✅ Suportado
- **Performance:** Excelente

### iPhone (WASM-only Fallback)

- **WebGPU:** ❌ Não suportado (iOS 18+ pode ter)
- **WASM:** ✅ Suportado
- **Performance:** Boa (CPU-only, mais lento)

### PWA Exclusive

- **Offline:** ✅ Funciona offline
- **Cache:** Service Worker cache de modelos
- **Storage:** IndexedDB para patches

---

## 🔧 Notas Técnicas

### Limitações

- **Max Model Size:** ~300MB por instância carregada
- **RAM Requirements:** 2-4 GB livres para patch leve
- **Training Time:** 30s - 5min dependendo do dispositivo

### Otimizações

- **Compressão:** GZIP ou Brotli para patches
- **Quantização:** int8 para modelos menores
- **Cache:** Service Worker cache de modelos base
- **Lazy Loading:** Carregar modelo apenas quando necessário

### Segurança

- **DV25-Seal:** Ed25519 key para creature + trainer
- **Verificação:** Hash BLAKE3 + assinatura em cada patch
- **Sandbox:** WASM roda em sandbox seguro

---

## 📊 Métricas de Sucesso

### Fase 1: Runtime

- [ ] WebGPU detection funciona em 90%+ dos browsers modernos
- [ ] Fallback WASM funciona em 100% dos browsers
- [ ] Modelo base carrega em < 5s

### Fase 2: Treino

- [ ] Treino de 10 exemplos completa em < 2min (WebGPU) ou < 5min (WASM)
- [ ] 100% dos treinos geram span assinado
- [ ] Patch gerado é válido e verificável

### Fase 3: Export/Import

- [ ] Export funciona em 100% dos casos
- [ ] Import com verificação funciona em 100% dos casos
- [ ] Patches inválidos são rejeitados

### Fase 4: Ascensão

- [ ] 100% das ascensões requerem LoRA válido
- [ ] Verificação de assinatura funciona
- [ ] Criaturas sem LoRA são bloqueadas

---

## 🔗 Integração com ArenaLab

### Fluxo Completo

```
1. Criatura atinge Level 15
   ↓
2. Usuário faz upload de dataset (.jsonl)
   ↓
3. LoRA Runtime treina patch no browser
   ↓
4. Span `training` gerado e assinado
   ↓
5. Patch exportado como `.lora_patch.jsonl`
   ↓
6. Patch aplicado à criatura (evolução)
   ↓
7. Span `evolution` gerado
   ↓
8. Criatura pode ascender (com LoRA válido)
```

### Endpoints Relacionados

- `POST /api/arena/creatures/:id/train` - Inicia treino LoRA
- `GET /api/arena/creatures/:id/training/status` - Status do treino
- `POST /api/arena/creatures/:id/export-lora` - Exporta patch
- `POST /api/arena/creatures/:id/import-lora` - Importa patch
- `POST /api/arena/creatures/:id/ascend` - Ascensão (requer LoRA)

---

## 🚀 Próximos Passos

1. **Revisar este Genesis Span** com foco técnico
2. **Validar viabilidade** de WebGPU/WASM no Mac mini
3. **Prototipar Fase 1** (Runtime esquelético)
4. **Iterar** baseado em performance real

---

**"If a LoRA patch cannot be exported, signed and reapplied, then it não é do Arena."**

— Dan Voulez

---

*Documento gerado em: 2025-11-09*  
*Versão: 0.1-alpha*  
*Status: Proposed*

