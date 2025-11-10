# 🤖 Agent Workspace - Terminal Controlado por Agente

Interface limpa tipo GitHub Copilot Agent / Claude Code Agent.

## 🎯 Conceito

O **agente controla** o terminal - você vê em tempo real:
- Comandos que o agente executa
- Tool calls sendo chamados
- Resultados de ferramentas
- Pensamento do agente

## 🚀 Uso

```bash
# Rodar
cd "Arena Game/arena-lab/apps/arena-frontend"
pnpm dev

# Abrir
http://localhost:3000/agent
```

## 💬 Interface

### Layout Limpo (tipo Postman/VSCode):
```
┌─────────────────────────────────────────┐
│ 🤖 Agent Workspace         [Running]    │
├─────────────────────────────────────────┤
│                                         │
│  You: Process ./conversations/*.md     │
│                                         │
│  Agent: Processing...                  │
│                                         │
│  Tool Call: searchSimilarSpans()       │
│  [running]                             │
│                                         │
│  Result: Found 47 spans, matched 8     │
│  [success] Show data ▼                 │
│                                         │
│  Agent: ✅ Analysis complete           │
│                                         │
├─────────────────────────────────────────┤
│ > Enter command...              [Send] │
└─────────────────────────────────────────┘
```

## 📨 Message Types

1. **User** - Seus comandos
2. **Agent** - Respostas do agente
3. **Tool Call** - Funções sendo executadas
4. **Tool Result** - Resultados das funções
5. **System** - Mensagens do sistema

## 🔧 Tool Calls Visíveis

Quando o agente executa funções, você vê:

```
Tool Call: searchSimilarSpans(query: "...", k: 10)
[running]

Result: Found 47 candidate spans, matched 8
[success] {
  "found": 47,
  "matched": 8,
  "avgQuality": 0.87
}
```

## 💎 Trajectory Matching

O agente usa o novo método:
1. Você dá comando: "Process ./conversations/*.md"
2. Agent processa cada .md
3. Tool Call: `extractConversations(file)`
4. Tool Call: `calculateQuality(conversation)`
5. Tool Result: "87/100 quality"
6. Agent: "✅ Created 342 Diamond Spans"

## 🎮 Comandos Exemplo

```
Process ./conversations/*.md
→ Processa todos os .md e extrai Diamond Spans

Train on project X
→ Treina usando dataset do projeto X

Show quality distribution
→ Mostra distribuição de qualidade dos spans

Export dataset
→ Exporta dataset em JSONL
```

## 🔗 Próximos Passos

1. ✅ Interface funcional
2. ⚠️ Conectar com backend real
3. ⚠️ Implementar tool calls de verdade
4. ⚠️ Integrar LLM (BYOK)
5. ⚠️ File upload drag & drop

---

**Foco**: Terminal controlado por agente. Limpo, funcional, profissional.
