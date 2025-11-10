# 🔬 Training Lab - Setup Simplificado

Interface limpa tipo Postman para o novo método de treinar IA via Trajectory Matching.

## 🚀 Quick Start

```bash
# 1. Instalar dependências
cd "Arena Game/arena-lab"
pnpm install

# 2. Rodar frontend
cd apps/arena-frontend
pnpm dev

# 3. Abrir browser
http://localhost:3000
```

## 📁 Estrutura Simplificada

```
arena-lab/
├── apps/arena-frontend/
│   ├── app/page.tsx           # Main UI
│   ├── components/
│   │   ├── training-lab.tsx    # Interface principal
│   │   ├── training-terminal.tsx
│   │   ├── tool-calling-panel.tsx
│   │   └── data-ingestion-panel.tsx
│   └── lib/processors/
│       └── md-processor.ts     # Processa .md → Diamond Spans
```

## 🎯 Interface (tipo Postman)

### Layout:
- **Top Bar**: Configuração do modelo/ambiente
- **Left Panel**: Collections (seus projetos de treinamento)
- **Center**: Request/Response tabs
- **Right Panel**: Terminal com logs em tempo real
- **Bottom**: Stats e métricas

### Funcionamento:
1. **Upload .md files** (ChatGPT/Claude exports)
2. **Processamento automático** com Quality Meter 5D
3. **Extração de Diamond Spans** (quality >= 80)
4. **Visualização em tempo real** no terminal
5. **Dataset pronto** para Trajectory Matching

## 💎 Quality Meter 5D

Cada conversa é avaliada:
- **Completeness** (25%): Resposta completa?
- **Provenance** (20%): Fonte confiável?
- **Impact** (20%): Útil?
- **Uniqueness** (15%): Original?
- **Coherence** (20%): Lógica?

**Diamond Span** = overall >= 80

## 📊 Output

Dataset em formato JSONL:
```json
{"context": "...", "response": "...", "quality": {"completeness": 92, ...}}
{"context": "...", "response": "...", "quality": {"completeness": 87, ...}}
```

## 🔄 Próximos Passos

1. ✅ Interface funcional
2. ⚠️ Conectar com ledger real (IndexedDB)
3. ⚠️ Implementar Trajectory Matching de verdade
4. ⚠️ Integrar LLM (BYOK)

---

**Foco**: Interface limpa e funcional. Sem gamificação desnecessária.
