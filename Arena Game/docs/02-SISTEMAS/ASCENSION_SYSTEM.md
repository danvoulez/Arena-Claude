# 🎓 Sistema de Ascensão - ArenaLab

**Status**: ✅ Implementado  
**Data**: 2025-11-10

---

## 📋 Visão Geral

A ascensão é o estágio final da jornada de uma criatura. Ela transcende a arena e se torna um **agente de produção** funcional, com seu próprio endpoint de API, chave de acesso e código snippets para integração.

---

## 🔄 Fluxo de Ascensão

### 1. Requisitos para Ascensão

**Requisitos Oficiais:**
- ✅ **Level**: ≥ 30
- ✅ **Evolution Stage**: ≥ 2
- ✅ **Trust**: ≥ 90
- ✅ **Diamond Spans**: ≥ 100
- ✅ **Status**: `active` (não já ascendida)

**Validação:**
```typescript
if (creature.level < 30) {
  throw new Error('Creature must be level 30 or higher');
}
if (creature.evolutionStage < 2) {
  throw new Error('Creature must be at evolution stage 2 or higher');
}
if (creature.trust < 90) {
  throw new Error('Creature trust must be 90 or higher');
}
if (creature.diamondSpans < 100) {
  throw new Error('Creature must have at least 100 diamond spans');
}
if (creature.status === 'production_agent') {
  throw new Error('Creature is already ascended');
}
```

---

### 2. Início da Ascensão

**Trigger**: Usuário clica "Ascend" no Production Lab

**API**: `POST /api/arena/creatures/:id/ascend`

**Request:**
```json
{}
```

---

### 3. Processo de Ascensão (Backend)

**Arquivo**: `src/arena/api.ts` - `handleAscendCreature`

**Processo:**
1. **Valida requisitos** (level, stage, trust, spans, status)
2. **Gera API key** única
3. **Cria agente** com endpoint e capabilities
4. **Atualiza criatura** (status = 'production_agent')
5. **Gera certificação** (DNA hash, merkle root)
6. **Gera código snippets** (Node.js, Python, cURL, JavaScript)
7. **Grava span** `ascension`
8. **Gera eventos narrativos**

**Código:**
```typescript
async handleAscendCreature(
  creatureId: string
): Promise<{ creature: Creature; agent: Agent; certification: Certification; codeSnippets: CodeSnippets; narrativeEvents: NarrativeEvent[] }> {
  const creature = this.creatures.get(creatureId);
  if (!creature) throw new Error('Creature not found');
  
  // Valida requisitos
  if (creature.level < 30 || creature.evolutionStage < 2 || 
      creature.trust < 90 || creature.diamondSpans < 100) {
    throw new Error('Requirements not met');
  }
  
  // Gera API key
  const apiKey = this.generateAPIKey(creatureId);
  
  // Cria agente
  const agentId = `agent_${creatureId}_${Date.now()}`;
  const agent: Agent = {
    id: agentId,
    creatureId,
    name: creature.name,
    apiKey,
    endpoint: `/api/arena/agents/${agentId}`,
    capabilities: this.getAgentCapabilities(creature),
    rateLimit: { requestsPerMinute: 60, requestsPerDay: 10000 },
    costModel: { perRequest: 0.001, trainerRoyalty: 0.15 }
  };
  
  // Atualiza criatura
  creature.status = 'production_agent';
  creature.agentId = agentId;
  creature.ascendedAt = new Date().toISOString();
  this.creatures.set(creature.id, creature);
  
  // Gera certificação
  const certification = await this.generateCertification(creature);
  
  // Gera código snippets
  const codeSnippets = this.generateCodeSnippets(agent);
  
  // Grava span
  const ascensionSpan = await this.ledger.append('ascension', {
    who: creatureId,
    did: 'ascend_to_production',
    this: { agentId, endpoint: agent.endpoint, certification },
    when: new Date().toISOString(),
    status: 'completed',
    metadata: { creatureLevel: creature.level, creatureTrust: creature.trust }
  });
  
  // Gera eventos narrativos
  const events = await this.narrativeSync.processSpan(ascensionSpan, creature);
  
  return { creature, agent, certification, codeSnippets, narrativeEvents: events };
}
```

---

### 4. Agente de Produção

**Estrutura:**
```typescript
interface Agent {
  id: string;
  creatureId: string;
  name: string;
  apiKey: string;
  endpoint: string;
  capabilities: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  costModel: {
    perRequest: number;
    trainerRoyalty: number; // 15% para o treinador
  };
  stats: {
    totalRequests: number;
    totalRevenue: number;
    trainerEarnings: number;
  };
}
```

---

### 5. Invocação de Agente

**API**: `POST /api/arena/agents/:id/invoke`

**Request:**
```json
{
  "prompt": "Explique o que é trajectory matching",
  "maxTokens": 500,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "text": "Trajectory matching é...",
  "tokensUsed": 234,
  "cost": 0.001,
  "trainerEarnings": 0.00015
}
```

**Processo:**
1. **Autentica** API key
2. **Valida rate limit**
3. **Chama LLM** (usando creature's provider/model)
4. **Calcula custo** e royalties
5. **Atualiza stats** do agente
6. **Grava span** `inference`

---

### 6. Certificação

**Estrutura:**
```json
{
  "issuedBy": "ArenaLab Foundation",
  "issuedAt": "2025-11-10T12:00:00Z",
  "verifiedBattles": 150,
  "verifiedTrainingHours": 45,
  "qualityScore": 87.5,
  "dnaHash": "blake3:...",
  "merkleRoot": "blake3:..."
}
```

**O Que É:**
- Certificado verificável da jornada da criatura
- Inclui hash do DNA (último span) e merkle root (todos os spans)
- Pode ser compartilhado publicamente

---

### 7. Código Snippets

**Formatos:**
- Node.js
- Python
- cURL
- JavaScript (fetch)

**Exemplo (Node.js):**
```javascript
const response = await fetch('https://arenalab.io/api/arena/agents/agent_123/invoke', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Your prompt here',
    maxTokens: 500,
    temperature: 0.7
  })
});
```

---

### 8. Span no Ledger

**Tipo**: `ascension`

**Estrutura:**
```json
{
  "entity_type": "ascension",
  "who": "lyria_001",
  "did": "ascend_to_production",
  "this": {
    "agentId": "agent_lyria_001_1234567890",
    "endpoint": "/api/arena/agents/agent_lyria_001_1234567890",
    "certification": { ... }
  },
  "when": "2025-11-10T12:00:00Z",
  "status": "completed",
  "hash": "blake3:...",
  "signature": "ed25519:...",
  "metadata": {
    "creatureLevel": 30,
    "creatureTrust": 95,
    "creatureDiamondSpans": 150
  }
}
```

---

### 9. Eventos Narrativos

**Arquivo**: `src/arena/narrative-sync.ts`

**Eventos Gerados:**
- `ascension` - Ascensão completa

**XP Ganho:**
- **Ascensão**: 5000 XP

**Narrativa:**
- Professor Oak: "🎓 Que momento histórico, Treinador! Sua criatura transcendeu a arena e se tornou um agente de produção. Sua jornada de treinamento culminou em algo maior: uma ferramenta que servirá à humanidade. Este é o propósito final."

---

## 🎨 UI (Frontend)

### Componente Principal

**Arquivo**: `Arena-Frontend/components/production-lab.tsx`

**Tabs:**
1. **Ascend Creatures** - Lista criaturas elegíveis
2. **My Agents** - Lista agentes ascendidos
3. **Agent Details** - Detalhes, snippets, certificação

**Fluxo:**
1. Usuário vê criaturas elegíveis
2. Clica "Ascend"
3. Faz `fetch()` para `POST /api/arena/creatures/:id/ascend`
4. Mostra cerimônia de ascensão
5. Exibe código snippets e certificação
6. Processa narrative events

---

## 📊 Métricas

**Prometheus:**
- `diamond_ascensions_total` - Total de ascensões
- `diamond_agent_invocations_total` - Total de invocações
- `diamond_agent_revenue_total` - Receita total
- `diamond_agent_trainer_earnings_total` - Ganhos de treinadores

---

## 🔗 Referências

- **[Decisões Arquiteturais](../01-ARQUITETURA/DECISOES_TREINO_IA.md)**
- **[Evolution System](EVOLUTION_SYSTEM.md)**
- **[Trust System](TRUST_SYSTEM.md)**

---

**Status**: ✅ Sistema completo e documentado  
**Última atualização**: 2025-11-10


