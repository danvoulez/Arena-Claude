# Implementação Fase 4: A Ascensão
## Do Jogo à Produção - Altar da Ascensão e API Funcional

**Objetivo:** Transformar criaturas evoluídas em agentes de produção funcionais, com API segura, snippets de código e certificação final no Ledger.

**Mantra:** "O jogo não termina. Ele se transforma em ferramenta. A criatura não desaparece. Ela serve."

---

## 🎯 Definition of Done

- [ ] Endpoint `POST /api/arena/creatures/:id/ascend` cria agente de produção
- [ ] Endpoint `GET /api/arena/agents/:id` retorna agente funcional
- [ ] Endpoint `POST /api/arena/agents/:id/invoke` executa chamada do agente
- [ ] Componente `ProductionLab` permite ascender criaturas
- [ ] Componente `AgentAPI` mostra endpoint e snippets
- [ ] Span `ascension` gravado no Ledger
- [ ] Certificação final gerada
- [ ] Testes E2E para ascensão e invocação
- [ ] Métricas de ascensão e uso de agentes

---

## 📋 Checklist de Implementação

### 1. Backend: Ascensão

#### 1.1 Endpoint `POST /api/arena/creatures/:id/ascend`

**Arquivo:** `src/arena/api.ts`

**Objetivo:** Transformar criatura evoluída em agente de produção.

**Ação:**
- [ ] Criar método `handleAscendCreature`
- [ ] Validar requisitos (level, evolutionStage, trust, diamondSpans)
- [ ] Gerar API key única
- [ ] Criar agente de produção
- [ ] Gravar span `ascension` no Ledger
- [ ] Retornar informações do agente

**Contrato:**
```typescript
POST /api/arena/creatures/:id/ascend
Request: {
  confirm?: boolean  // Confirmação explícita do usuário
}

Response: {
  success: true
  creature: Creature  // Criatura atualizada (status: 'production_agent')
  agent: {
    id: string
    name: string
    apiKey: string  // Chave única para autenticação
    endpoint: string  // URL do endpoint
    createdAt: string
    capabilities: string[]  // Habilidades do agente
    rateLimit: {
      requestsPerMinute: number
      requestsPerDay: number
    }
    costModel: {
      perRequest: number
      trainerRoyalty: number  // % para o treinador
    }
  }
  certification: {
    issuedBy: string
    issuedAt: string
    verifiedBattles: number
    verifiedTrainingHours: number
    qualityScore: number
    dnaHash: string
    merkleRoot: string
  }
  codeSnippets: {
    nodejs: string
    python: string
    curl: string
    javascript: string
  }
  narrativeEvents: NarrativeEvent[]
}
```

**Código de Referência:**
```typescript
// src/arena/api.ts
private async handleAscendCreature(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  parseBody: (req: IncomingMessage) => Promise<any>,
  sendJSON: (res: ServerResponse, data: any, status?: number) => void
): Promise<boolean> {
  const id = pathname.replace('/api/arena/creatures/', '').replace('/ascend', '')
  
  const creature = this.creatures.get(id)
  if (!creature) {
    sendJSON(res, { error: 'Creature not found' }, 404)
    return true
  }

  try {
    // Validar requisitos
    if (creature.level < 30) {
      sendJSON(res, { 
        error: 'Creature must be level 30 or higher to ascend',
        currentLevel: creature.level,
        requiredLevel: 30
      }, 400)
      return true
    }

    if (creature.evolutionStage < 2) {
      sendJSON(res, { 
        error: 'Creature must be at evolution stage 2 or higher',
        currentStage: creature.evolutionStage,
        requiredStage: 2
      }, 400)
      return true
    }

    if (creature.trust < 90) {
      sendJSON(res, { 
        error: 'Creature trust must be 90 or higher to ascend',
        currentTrust: creature.trust,
        requiredTrust: 90
      }, 400)
      return true
    }

    if (creature.diamondSpans < 100) {
      sendJSON(res, { 
        error: 'Creature must have at least 100 diamond spans',
        currentDiamondSpans: creature.diamondSpans,
        requiredDiamondSpans: 100
      }, 400)
      return true
    }

    // Verificar se já está ascendida
    if ((creature as any).status === 'production_agent') {
      sendJSON(res, { 
        error: 'Creature is already ascended',
        agentId: (creature as any).agentId
      }, 400)
      return true
    }

    // Gerar API key
    const apiKey = this.generateAPIKey(id)
    
    // Criar agente
    const agentId = `agent_${id}_${Date.now()}`
    const agent = {
      id: agentId,
      creatureId: id,
      name: creature.name,
      apiKey,
      endpoint: `/api/arena/agents/${agentId}`,
      createdAt: new Date().toISOString(),
      capabilities: this.getAgentCapabilities(creature),
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 10000
      },
      costModel: {
        perRequest: 0.001, // $0.001 por request
        trainerRoyalty: 0.15 // 15% para o treinador
      },
      stats: {
        totalRequests: 0,
        totalRevenue: 0,
        trainerEarnings: 0
      }
    }

    // Atualizar criatura
    (creature as any).status = 'production_agent'
    (creature as any).agentId = agentId
    (creature as any).ascendedAt = new Date().toISOString()
    creature.updatedAt = new Date().toISOString()
    this.creatures.set(id, creature)

    // Armazenar agente (em produção, seria em banco de dados)
    this.agents = this.agents || new Map()
    this.agents.set(agentId, agent)

    // Buscar DNA para certificação
    const ledger = (this.narrativeSync as any).ledger
    const battleSpans = await ledger.getAll('battle')
    const trainingSpans = await ledger.getAll('training')
    const evolutionSpans = await ledger.getAll('evolution')
    const spanSpans = await ledger.getAll('span')
    const allSpans = [...battleSpans, ...trainingSpans, ...evolutionSpans, ...spanSpans]
    const creatureSpans = allSpans.filter((e: any) => 
      e.data.who === id || e.data.metadata?.creatureId === id
    )
    const hashes = creatureSpans.map((e: any) => e.hash || e.data.hash).filter(Boolean)
    const merkleRoot = this.calculateMerkleRoot(hashes)

    // Calcular quality score médio
    const battles = creatureSpans.filter((s: any) => 
      s.data.type === 'battle' || s.entity_type === 'battle'
    )
    const qualityScores = battles
      .map((b: any) => b.data.metadata?.qualityA || b.data.metadata?.quality || 0)
      .filter((q: number) => q > 0)
    const avgQuality = qualityScores.length > 0
      ? qualityScores.reduce((a: number, b: number) => a + b, 0) / qualityScores.length
      : 0

    // Gerar certificação
    const certification = {
      issuedBy: 'ArenaLab Foundation',
      issuedAt: new Date().toISOString(),
      verifiedBattles: creature.wins + creature.losses + creature.draws,
      verifiedTrainingHours: Math.floor(creature.totalSpans * 0.1),
      qualityScore: Math.round(avgQuality * 100) / 100,
      dnaHash: hashes[hashes.length - 1] || 'unknown',
      merkleRoot
    }

    // Gravar span de ascensão
    const ascensionSpan = await ledger.append('ascension', {
      who: id,
      did: 'ascend_to_production',
      this: {
        agentId,
        apiKey: apiKey.substring(0, 8) + '...', // Não expor chave completa no span
        endpoint: agent.endpoint,
        certification
      },
      when: new Date().toISOString(),
      status: 'completed',
      confirmed_by: 'trainer_and_system',
      if_ok: 'AGENT_AVAILABLE_FOR_PRODUCTION',
      if_not: 'ASCENSION_FAILED',
      metadata: {
        creatureLevel: creature.level,
        creatureEvolutionStage: creature.evolutionStage,
        creatureTrust: creature.trust,
        creatureDiamondSpans: creature.diamondSpans,
        agentCapabilities: agent.capabilities
      }
    })

    // Gerar snippets de código
    const codeSnippets = this.generateCodeSnippets(agent)

    // Processar eventos narrativos
    const events = await this.narrativeSync.processSpan(ascensionSpan, creature)

    // Métricas: Ascension
    // (adicionar métricas de ascensão)

    sendJSON(res, {
      success: true,
      creature,
      agent,
      certification,
      codeSnippets,
      narrativeEvents: events
    }, 201)

    return true
  } catch (error: any) {
    sendJSON(res, { error: error.message }, 500)
    return true
  }
}
```

---

#### 1.2 Helper: Gerar API Key

**Ação:**
- [ ] Criar método `generateAPIKey(creatureId)`
- [ ] Usar formato seguro e único
- [ ] Armazenar hash para validação

**Código:**
```typescript
private generateAPIKey(creatureId: string): string {
  // Gerar chave única baseada em creatureId + timestamp + random
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const combined = `${creatureId}_${timestamp}_${random}`
  
  // Em produção, usar hash seguro (BLAKE3)
  const hash = require('crypto').createHash('sha256').update(combined).digest('hex')
  return `ak_${hash.substring(0, 32)}`
}
```

---

#### 1.3 Helper: Obter Capacidades do Agente

**Ação:**
- [ ] Criar método `getAgentCapabilities(creature)`
- [ ] Mapear tipo e habilidades para capacidades

**Código:**
```typescript
private getAgentCapabilities(creature: Creature): string[] {
  const capabilities: string[] = []
  
  // Baseado no tipo
  switch (creature.type) {
    case 'creative':
      capabilities.push('creative_writing', 'storytelling', 'poetry')
      break
    case 'logical':
      capabilities.push('reasoning', 'analysis', 'problem_solving')
      break
    case 'synthetic':
      capabilities.push('synthesis', 'integration', 'multi_domain')
      break
  }
  
  // Baseado em habilidades desbloqueadas
  creature.abilities.forEach(ability => {
    if (ability.unlockedAtLevel <= creature.level) {
      capabilities.push(ability.id)
    }
  })
  
  // Baseado em traits (se houver)
  // (adicionar lógica para traits)
  
  return [...new Set(capabilities)] // Remove duplicatas
}
```

---

#### 1.4 Helper: Gerar Snippets de Código

**Ação:**
- [ ] Criar método `generateCodeSnippets(agent)`
- [ ] Gerar snippets para Node.js, Python, cURL, JavaScript

**Código:**
```typescript
private generateCodeSnippets(agent: any): any {
  const baseUrl = process.env.API_BASE_URL || 'https://api.arenalab.ai'
  const endpoint = `${baseUrl}${agent.endpoint}`
  
  return {
    nodejs: `const response = await fetch('${endpoint}/invoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${agent.apiKey}'
  },
  body: JSON.stringify({
    prompt: 'Your prompt here',
    maxTokens: 500
  })
})

const data = await response.json()
console.log(data.response)`,
    
    python: `import requests

response = requests.post(
    '${endpoint}/invoke',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer ${agent.apiKey}'
    },
    json={
        'prompt': 'Your prompt here',
        'maxTokens': 500
    }
)

data = response.json()
print(data['response'])`,
    
    curl: `curl -X POST '${endpoint}/invoke' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${agent.apiKey}' \\
  -d '{
    "prompt": "Your prompt here",
    "maxTokens": 500
  }'`,
    
    javascript: `fetch('${endpoint}/invoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${agent.apiKey}'
  },
  body: JSON.stringify({
    prompt: 'Your prompt here',
    maxTokens: 500
  })
})
.then(res => res.json())
.then(data => console.log(data.response))`
  }
}
```

---

### 2. Backend: Agente de Produção

#### 2.1 Endpoint `GET /api/arena/agents/:id`

**Arquivo:** `src/arena/api.ts`

**Objetivo:** Retornar informações do agente (sem API key).

**Ação:**
- [ ] Criar método `handleGetAgent`
- [ ] Retornar informações públicas do agente
- [ ] Não expor API key completa

**Contrato:**
```typescript
GET /api/arena/agents/:id

Response: {
  id: string
  name: string
  endpoint: string
  capabilities: string[]
  rateLimit: {
    requestsPerMinute: number
    requestsPerDay: number
  }
  stats: {
    totalRequests: number
    totalRevenue: number
    trainerEarnings: number
  }
  createdAt: string
  certification: {
    issuedBy: string
    issuedAt: string
    verifiedBattles: number
    qualityScore: number
  }
}
```

---

#### 2.2 Endpoint `POST /api/arena/agents/:id/invoke`

**Arquivo:** `src/arena/api.ts`

**Objetivo:** Executar chamada do agente em produção.

**Ação:**
- [ ] Criar método `handleInvokeAgent`
- [ ] Validar API key
- [ ] Verificar rate limit
- [ ] Chamar LLM com contexto do agente
- [ ] Registrar uso (para métricas e billing)
- [ ] Retornar resposta

**Contrato:**
```typescript
POST /api/arena/agents/:id/invoke
Headers: {
  Authorization: "Bearer {apiKey}"
}
Request: {
  prompt: string
  maxTokens?: number
  temperature?: number
  context?: any  // Contexto adicional
}

Response: {
  response: string
  metadata: {
    tokensUsed: number
    latency: number
    cost: number
    trainerRoyalty: number
  }
  agent: {
    id: string
    name: string
  }
}
```

**Código:**
```typescript
private async handleInvokeAgent(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  parseBody: (req: IncomingMessage) => Promise<any>,
  sendJSON: (res: ServerResponse, data: any, status?: number) => void
): Promise<boolean> {
  const agentId = pathname.replace('/api/arena/agents/', '').replace('/invoke', '')
  
  try {
    // Obter agente
    const agents = (this as any).agents || new Map()
    const agent = agents.get(agentId)
    
    if (!agent) {
      sendJSON(res, { error: 'Agent not found' }, 404)
      return true
    }

    // Validar API key
    const authHeader = req.headers.authorization || ''
    const apiKey = authHeader.replace('Bearer ', '')
    
    if (apiKey !== agent.apiKey) {
      sendJSON(res, { error: 'Invalid API key' }, 401)
      return true
    }

    // Verificar rate limit (simplificado)
    // Em produção, usar Redis ou similar
    const now = Date.now()
    const lastRequest = (agent as any).lastRequest || 0
    const requestsInMinute = (agent as any).requestsInMinute || 0
    
    if (now - lastRequest < 60000 && requestsInMinute >= agent.rateLimit.requestsPerMinute) {
      sendJSON(res, { 
        error: 'Rate limit exceeded',
        retryAfter: 60 - Math.floor((now - lastRequest) / 1000)
      }, 429)
      return true
    }

    // Parse body
    const body = await parseBody(req)
    const { prompt, maxTokens = 500, temperature = 0.7, context } = body

    if (!prompt) {
      sendJSON(res, { error: 'Missing prompt' }, 400)
      return true
    }

    // Obter criatura
    const creature = this.creatures.get(agent.creatureId)
    if (!creature) {
      sendJSON(res, { error: 'Creature not found' }, 404)
      return true
    }

    // Chamar LLM com contexto do agente
    const startTime = Date.now()
    const response = await this.invokeAgentLLM(creature, prompt, maxTokens, temperature, context)
    const latency = Date.now() - startTime

    // Calcular custo
    const tokensUsed = response.tokensUsed || maxTokens
    const cost = tokensUsed * agent.costModel.perRequest
    const trainerRoyalty = cost * agent.costModel.trainerRoyalty

    // Atualizar estatísticas do agente
    agent.stats.totalRequests++
    agent.stats.totalRevenue += cost
    agent.stats.trainerEarnings += trainerRoyalty
    ;(agent as any).lastRequest = now
    ;(agent as any).requestsInMinute = (now - lastRequest < 60000) ? requestsInMinute + 1 : 1
    agents.set(agentId, agent)

    // Métricas: Agent invocation
    // (adicionar métricas)

    sendJSON(res, {
      response: response.text,
      metadata: {
        tokensUsed,
        latency,
        cost,
        trainerRoyalty
      },
      agent: {
        id: agent.id,
        name: agent.name
      }
    })

    return true
  } catch (error: any) {
    sendJSON(res, { error: error.message }, 500)
    return true
  }
}

private async invokeAgentLLM(
  creature: Creature,
  prompt: string,
  maxTokens: number,
  temperature: number,
  context?: any
): Promise<{ text: string; tokensUsed: number }> {
  // Usar BattleRunner ou LLMCaller para invocar
  // Com contexto do agente (melhores spans, habilidades, etc.)
  
  // Por enquanto, simplificado
  const llmCaller = await import('./llm-caller.js')
  return await llmCaller.callLLM({
    provider: creature.provider,
    model: creature.baseModel,
    prompt,
    maxTokens,
    temperature,
    context: {
      ...context,
      creatureCapabilities: creature.abilities.map(a => a.id),
      creatureType: creature.type
    }
  })
}
```

---

### 3. Frontend: Production Lab

#### 3.1 Componente `ProductionLab` (Atualizar)

**Arquivo:** `Arena-Frontend/components/production-lab.tsx`

**Objetivo:** Permitir ascender criaturas e visualizar agentes.

**Ação:**
- [ ] Atualizar componente existente
- [ ] Adicionar botão "Ascend" para criaturas elegíveis
- [ ] Mostrar requisitos de ascensão
- [ ] Exibir informações do agente após ascensão
- [ ] Mostrar snippets de código
- [ ] Mostrar certificação

**Código:**
```typescript
// Arena-Frontend/components/production-lab.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useArenaStore } from "@/lib/store"
import { Sparkles, CheckCircle, X, Copy, ExternalLink, Code } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProductionLab() {
  const { creatures } = useArenaStore()
  const [selectedCreature, setSelectedCreature] = useState<any>(null)
  const [agent, setAgent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const canAscend = (creature: any) => {
    return creature.level >= 30 &&
           creature.evolutionStage >= 2 &&
           creature.trust >= 90 &&
           creature.diamondSpans >= 100 &&
           creature.status !== 'production_agent'
  }

  const handleAscend = async (creatureId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/arena/creatures/${creatureId}/ascend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ascension failed')
      }

      const data = await response.json()
      setAgent(data.agent)
      setSelectedCreature(data.creature)
      
      toast({
        title: "Ascension Complete!",
        description: `${data.creature.name} is now a production agent!`,
      })
    } catch (error: any) {
      toast({
        title: "Ascension Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code copied!",
      description: "Snippet copied to clipboard.",
    })
  }

  return (
    <div className="w-full h-full p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Production Lab - Altar da Ascensão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ascend">
            <TabsList>
              <TabsTrigger value="ascend">Ascend Creatures</TabsTrigger>
              <TabsTrigger value="agents">My Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="ascend">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Eligible Creatures</h3>
                <div className="grid grid-cols-2 gap-4">
                  {creatures.filter(canAscend).map(creature => (
                    <Card key={creature.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{creature.name}</h4>
                        <Badge variant="secondary">Level {creature.level}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Evolution Stage: {creature.evolutionStage}</div>
                        <div>Trust: {creature.trust}/100</div>
                        <div>Diamond Spans: {creature.diamondSpans}</div>
                      </div>
                      <Button
                        onClick={() => handleAscend(creature.id)}
                        disabled={loading}
                        className="w-full mt-4"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ascend to Production
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agents">
              {/* Lista de agentes ascendidos */}
            </TabsContent>
          </Tabs>

          {agent && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Agent Created: {agent.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info">
                  <TabsList>
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="code">Code Snippets</TabsTrigger>
                    <TabsTrigger value="certification">Certification</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info">
                    <div className="space-y-2">
                      <div><strong>API Key:</strong> <code className="bg-muted px-2 py-1 rounded">{agent.apiKey}</code></div>
                      <div><strong>Endpoint:</strong> <code className="bg-muted px-2 py-1 rounded">{agent.endpoint}</code></div>
                      <div><strong>Capabilities:</strong> {agent.capabilities.join(', ')}</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="code">
                    <div className="space-y-4">
                      {Object.entries(agent.codeSnippets || {}).map(([lang, code]) => (
                        <div key={lang}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{lang}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyCode(code as string)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <ScrollArea className="h-48 border rounded p-4">
                            <pre className="text-xs"><code>{code as string}</code></pre>
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="certification">
                    {/* Mostrar certificação */}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### 4. Frontend: Agent API Component

#### 4.1 Componente `AgentAPI`

**Arquivo:** `Arena-Frontend/components/agent-api.tsx`

**Objetivo:** Mostrar informações do agente e permitir testar chamadas.

**Ação:**
- [ ] Criar componente React
- [ ] Mostrar endpoint e API key
- [ ] Mostrar snippets de código
- [ ] Permitir testar chamada (opcional)

---

### 5. Integração no Arena View

#### 5.1 Adicionar Tab "Production"

**Arquivo:** `Arena-Frontend/components/arena-view.tsx`

**Ação:**
- [ ] Adicionar tab "Production" com `ProductionLab`

---

### 6. Testes E2E

#### 6.1 Teste de Ascensão

**Arquivo:** `tests/e2e/ascension-flow.test.ts`

**Ação:**
- [ ] Testar `POST /api/arena/creatures/:id/ascend`
- [ ] Verificar requisitos
- [ ] Verificar span no Ledger
- [ ] Verificar agente criado

#### 6.2 Teste de Invocação

**Arquivo:** `tests/e2e/agent-invocation.test.ts`

**Ação:**
- [ ] Testar `POST /api/arena/agents/:id/invoke`
- [ ] Verificar autenticação
- [ ] Verificar rate limit
- [ ] Verificar resposta

---

### 7. Métricas

#### 7.1 Métricas de Ascensão

**Arquivo:** `packages/hardening-pack/src/metrics/metrics.ts`

**Ação:**
- [ ] Adicionar `ascensionsTotal` - Contador de ascensões
- [ ] Adicionar `agentInvocationsTotal` - Contador de invocações
- [ ] Adicionar `agentRevenueTotal` - Receita total de agentes

---

## 🚀 Ordem de Execução Recomendada

1. **Backend primeiro:**
   - [ ] 1.1 Endpoint de Ascensão
   - [ ] 1.2 Helpers (API key, capacidades, snippets)
   - [ ] 1.3 Endpoint de Agente
   - [ ] 1.4 Endpoint de Invocação

2. **Frontend depois:**
   - [ ] 2.1 Atualizar ProductionLab
   - [ ] 2.2 Criar AgentAPI component
   - [ ] 2.3 Integração no ArenaView

3. **Testes:**
   - [ ] 3.1 Teste E2E Ascensão
   - [ ] 3.2 Teste E2E Invocação

4. **Métricas:**
   - [ ] 4.1 Métricas de ascensão e uso

---

## ✅ Critérios de Aceite Final

- [ ] Ascensão funciona end-to-end (requisitos → agente → API)
- [ ] Span `ascension` gravado no Ledger
- [ ] Agente funcional via API
- [ ] Snippets de código gerados
- [ ] Certificação final criada
- [ ] Testes E2E passam
- [ ] Métricas expostas em `/metrics`
- [ ] Rate limiting funciona
- [ ] Billing/trainer royalty calculado

---

## 📊 Métricas de Sucesso

- ✅ 100% das ascensões gravam span no Ledger
- ✅ Agentes respondem em < 2s (P95)
- ✅ Rate limiting funciona corretamente
- ✅ Trainer royalty calculado corretamente
- ✅ Snippets de código funcionais

---

**Status:** 📋 **PLANEJAMENTO COMPLETO**

*Documento gerado em: 2025-11-09*  
*Versão: 1.0-planning*  
*Pronto para implementação*

