# Implementação Fase 3: O Ecossistema Vivo
## Da Memória à Lenda - DNA Atômico, Leaderboard e História Verificável

**Objetivo:** Transformar a jornada da criatura de experiência privada para história pública, com DNA verificável, ranking global e narrativa derivada do Ledger.

**Mantra:** "Reputação não é opinião. É matemática imutável. O Ledger prova tudo."

---

## 🎯 Definition of Done

- [ ] Endpoint `GET /api/arena/creatures/:id/dna` retorna timeline completa
- [ ] Endpoint `GET /api/arena/leaderboard` retorna ranking global
- [ ] Endpoint `GET /api/arena/creatures/:id/legend` retorna história narrativa
- [ ] Componente `EvolutionTimeline` renderiza DNA visualmente
- [ ] Componente `Leaderboard` exibe ranking com filtros
- [ ] Componente `CreatureLegend` exibe história verificável
- [ ] URLs públicas para compartilhamento (`/legend/:id`)
- [ ] Testes E2E para DNA e Leaderboard
- [ ] Métricas de visualização e compartilhamento

---

## 📋 Checklist de Implementação

### 1. Backend: DNA Atômico

#### 1.1 Endpoint `GET /api/arena/creatures/:id/dna`

**Arquivo:** `src/arena/api.ts`

**Objetivo:** Retornar timeline completa da criatura baseada em spans do Ledger.

**Ação:**
- [ ] Criar método `handleGetCreatureDna`
- [ ] Buscar todos os spans relacionados à criatura no Ledger
- [ ] Agrupar spans por tipo (`battle`, `training`, `evolution`)
- [ ] Ordenar cronologicamente
- [ ] Calcular estatísticas agregadas
- [ ] Retornar formato estruturado

**Contrato:**
```typescript
GET /api/arena/creatures/:id/dna

Response: {
  creatureId: string
  creatureName: string
  totalSpans: number
  diamondSpans: number
  timeline: Array<{
    seq: number
    type: 'battle' | 'training' | 'evolution'
    timestamp: string
    span: SpanData
    narrative: string  // Narrativa gerada do span
  }>
  stats: {
    totalBattles: number
    winRate: number
    totalTraining: number
    evolutions: number
    currentLevel: number
    currentElo: number
    trustLevel: number
  }
  milestones: Array<{
    type: 'first_battle' | 'first_victory' | 'first_training' | 'evolution' | 'level_up'
    timestamp: string
    spanSeq: number
    description: string
  }>
  qualityProfile: {
    avgQuality: number
    bestQuality: number
    worstQuality: number
    qualityTrend: Array<{ timestamp: string, quality: number }>
  }
}
```

**Código de Referência:**
```typescript
// src/arena/api.ts
private async handleGetCreatureDna(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  sendJSON: (res: ServerResponse, data: any, status?: number) => void
): Promise<boolean> {
  const id = pathname.replace('/api/arena/creatures/', '').replace('/dna', '')
  
  const creature = this.creatures.get(id)
  if (!creature) {
    sendJSON(res, { error: 'Creature not found' }, 404)
    return true
  }

  try {
    // Buscar todos os spans da criatura
    const ledger = this.narrativeSync['ledger']
    const allSpans = await ledger.getAll()
    
    const creatureSpans = allSpans.filter((entry: any) => {
      const span = entry.data
      return span.who === id || 
             span.metadata?.creatureId === id ||
             span.metadata?.opponent === id
    })

    // Ordenar por timestamp
    creatureSpans.sort((a: any, b: any) => 
      new Date(a.data.when).getTime() - new Date(b.data.when).getTime()
    )

    // Agrupar e processar
    const timeline = creatureSpans.map((entry: any, index: number) => ({
      seq: entry.seq || index + 1,
      type: entry.data.type || entry.data.did?.split('_')[0],
      timestamp: entry.data.when,
      span: entry.data,
      narrative: this.generateNarrativeFromSpan(entry.data)
    }))

    // Calcular estatísticas
    const battles = creatureSpans.filter((s: any) => s.data.type === 'battle')
    const trainings = creatureSpans.filter((s: any) => s.data.type === 'training')
    const evolutions = creatureSpans.filter((s: any) => s.data.type === 'evolution')

    const wins = battles.filter((b: any) => 
      b.data.metadata?.winner === 'A' || 
      b.data.confirmed_by === id
    ).length

    const stats = {
      totalBattles: battles.length,
      winRate: battles.length > 0 ? wins / battles.length : 0,
      totalTraining: trainings.length,
      evolutions: evolutions.length,
      currentLevel: creature.level,
      currentElo: creature.elo,
      trustLevel: creature.trust
    }

    // Identificar marcos
    const milestones = this.identifyMilestones(creatureSpans)

    // Calcular perfil de qualidade
    const qualityProfile = this.calculateQualityProfile(battles)

    sendJSON(res, {
      creatureId: id,
      creatureName: creature.name,
      totalSpans: creatureSpans.length,
      diamondSpans: creatureSpans.filter((s: any) => s.data.metadata?.quality >= 85).length,
      timeline,
      stats,
      milestones,
      qualityProfile
    })

    return true
  } catch (error: any) {
    sendJSON(res, { error: error.message }, 500)
    return true
  }
}
```

---

#### 1.2 Helper: Gerar Narrativa de Span

**Arquivo:** `src/arena/api.ts` ou `src/arena/narrative-sync.ts`

**Ação:**
- [ ] Criar método `generateNarrativeFromSpan(span)`
- [ ] Mapear tipos de span para narrativas
- [ ] Incluir contexto emocional e filosófico

**Código:**
```typescript
private generateNarrativeFromSpan(span: any): string {
  switch (span.type || span.did?.split('_')[0]) {
    case 'battle':
      const winner = span.metadata?.winner
      const opponent = span.metadata?.opponent
      if (winner === span.who) {
        return `Victory against ${opponent}. Quality score: ${span.metadata?.qualityA || 'N/A'}.`
      } else if (winner === 'draw') {
        return `Draw against ${opponent}. Both showed resilience.`
      } else {
        return `Defeat against ${opponent}. A lesson learned.`
      }
    
    case 'training':
      const program = span.this?.programName || span.this?.programId
      return `Completed ${program} training. Growth documented.`
    
    case 'evolution':
      const stage = span.metadata?.evolution_stage
      return `Evolution to stage ${stage}. Transformation complete.`
    
    default:
      return `Event recorded: ${span.did || span.type}`
  }
}
```

---

#### 1.3 Helper: Identificar Marcos

**Ação:**
- [ ] Criar método `identifyMilestones(spans)`
- [ ] Detectar primeiro battle, primeira vitória, primeiro treino, evoluções, level ups

**Código:**
```typescript
private identifyMilestones(spans: any[]): Array<any> {
  const milestones: any[] = []
  let firstBattle = true
  let firstVictory = true
  let firstTraining = true

  for (const entry of spans) {
    const span = entry.data

    if (span.type === 'battle' && firstBattle) {
      milestones.push({
        type: 'first_battle',
        timestamp: span.when,
        spanSeq: entry.seq,
        description: 'First battle entered'
      })
      firstBattle = false
    }

    if (span.type === 'battle' && 
        (span.metadata?.winner === span.who || span.confirmed_by === span.who) &&
        firstVictory) {
      milestones.push({
        type: 'first_victory',
        timestamp: span.when,
        spanSeq: entry.seq,
        description: 'First victory achieved'
      })
      firstVictory = false
    }

    if (span.type === 'training' && span.did === 'start_training' && firstTraining) {
      milestones.push({
        type: 'first_training',
        timestamp: span.when,
        spanSeq: entry.seq,
        description: 'First training session started'
      })
      firstTraining = false
    }

    if (span.type === 'evolution') {
      milestones.push({
        type: 'evolution',
        timestamp: span.when,
        spanSeq: entry.seq,
        description: `Evolution to stage ${span.metadata?.evolution_stage}`
      })
    }

    if (span.metadata?.level_up) {
      milestones.push({
        type: 'level_up',
        timestamp: span.when,
        spanSeq: entry.seq,
        description: `Leveled up to ${span.metadata.new_level}`
      })
    }
  }

  return milestones
}
```

---

#### 1.4 Helper: Calcular Perfil de Qualidade

**Ação:**
- [ ] Criar método `calculateQualityProfile(battles)`
- [ ] Calcular média, melhor, pior
- [ ] Calcular tendência ao longo do tempo

**Código:**
```typescript
private calculateQualityProfile(battles: any[]): any {
  if (battles.length === 0) {
    return {
      avgQuality: 0,
      bestQuality: 0,
      worstQuality: 0,
      qualityTrend: []
    }
  }

  const qualities = battles
    .map((b: any) => b.data.metadata?.qualityA || b.data.metadata?.quality || 0)
    .filter((q: number) => q > 0)

  const avgQuality = qualities.reduce((a: number, b: number) => a + b, 0) / qualities.length
  const bestQuality = Math.max(...qualities)
  const worstQuality = Math.min(...qualities)

  const qualityTrend = battles
    .map((b: any) => ({
      timestamp: b.data.when,
      quality: b.data.metadata?.qualityA || b.data.metadata?.quality || 0
    }))
    .filter((q: any) => q.quality > 0)

  return {
    avgQuality: Math.round(avgQuality * 100) / 100,
    bestQuality,
    worstQuality,
    qualityTrend
  }
}
```

---

### 2. Backend: Leaderboard

#### 2.1 Endpoint `GET /api/arena/leaderboard`

**Arquivo:** `src/arena/api.ts`

**Objetivo:** Retornar ranking global de criaturas com filtros e categorias.

**Ação:**
- [ ] Criar método `handleLeaderboard`
- [ ] Suportar query params: `?sort=elo&limit=100&category=all`
- [ ] Calcular rankings por categoria
- [ ] Retornar formato estruturado

**Contrato:**
```typescript
GET /api/arena/leaderboard?sort=elo&limit=100&category=all

Query Params:
- sort: 'elo' | 'wins' | 'level' | 'diamond_spans' | 'trust'
- limit: number (default: 100)
- category: 'all' | 'undefeated' | 'survivors' | 'mentors' | 'philosophers' | 'artists' | 'loyal' | 'evolved' | 'ascended'

Response: {
  category: string
  sortBy: string
  totalCreatures: number
  rankings: Array<{
    rank: number
    creature: Creature
    stats: {
      elo: number
      wins: number
      losses: number
      winRate: number
      level: number
      trust: number
      diamondSpans: number
      totalSpans: number
    }
    badges: string[]  // ['undefeated', 'evolved', 'ascended']
  }>
  metadata: {
    generatedAt: string
    cacheExpiresAt: string
  }
}
```

**Código:**
```typescript
private async handleLeaderboard(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  sendJSON: (res: ServerResponse, data: any, status?: number) => void
): Promise<boolean> {
  const url = new URL(`http://localhost${pathname}`)
  const sort = url.searchParams.get('sort') || 'elo'
  const limit = parseInt(url.searchParams.get('limit') || '100')
  const category = url.searchParams.get('category') || 'all'

  try {
    const allCreatures = Array.from(this.creatures.values())

    // Filtrar por categoria
    let filtered = allCreatures
    switch (category) {
      case 'undefeated':
        filtered = allCreatures.filter(c => c.losses === 0)
        break
      case 'survivors':
        filtered = allCreatures.filter(c => c.losses > 0 && c.wins > c.losses)
        break
      case 'evolved':
        filtered = allCreatures.filter(c => c.evolutionStage > 0)
        break
      case 'ascended':
        filtered = allCreatures.filter(c => (c as any).status === 'production_agent')
        break
      case 'loyal':
        filtered = allCreatures.filter(c => c.trust >= 90)
        break
      // Adicionar mais categorias conforme necessário
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sort) {
        case 'elo':
          return b.elo - a.elo
        case 'wins':
          return b.wins - a.wins
        case 'level':
          return b.level - a.level
        case 'diamond_spans':
          return b.diamondSpans - a.diamondSpans
        case 'trust':
          return b.trust - a.trust
        default:
          return b.elo - a.elo
      }
    })

    // Limitar
    const topCreatures = filtered.slice(0, limit)

    // Construir rankings
    const rankings = topCreatures.map((creature, index) => {
      const badges: string[] = []
      if (creature.losses === 0 && creature.wins > 0) badges.push('undefeated')
      if (creature.evolutionStage > 0) badges.push('evolved')
      if ((creature as any).status === 'production_agent') badges.push('ascended')
      if (creature.trust >= 90) badges.push('loyal')

      return {
        rank: index + 1,
        creature,
        stats: {
          elo: creature.elo,
          wins: creature.wins,
          losses: creature.losses,
          winRate: creature.wins + creature.losses > 0 
            ? creature.wins / (creature.wins + creature.losses) 
            : 0,
          level: creature.level,
          trust: creature.trust,
          diamondSpans: creature.diamondSpans,
          totalSpans: creature.totalSpans
        },
        badges
      }
    })

    sendJSON(res, {
      category,
      sortBy: sort,
      totalCreatures: filtered.length,
      rankings,
      metadata: {
        generatedAt: new Date().toISOString(),
        cacheExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min cache
      }
    })

    return true
  } catch (error: any) {
    sendJSON(res, { error: error.message }, 500)
    return true
  }
}
```

---

### 3. Backend: História de Vida Verificável

#### 3.1 Endpoint `GET /api/arena/creatures/:id/legend`

**Arquivo:** `src/arena/api.ts`

**Objetivo:** Retornar história narrativa completa da criatura, derivada do Ledger.

**Ação:**
- [ ] Criar método `handleGetCreatureLegend`
- [ ] Buscar DNA da criatura
- [ ] Gerar narrativa em formato de "livro"
- [ ] Incluir capítulos, epígrafes, ilustrações (metadados)

**Contrato:**
```typescript
GET /api/arena/creatures/:id/legend

Response: {
  creatureId: string
  creatureName: string
  title: string  // "The Legend of {name}"
  chapters: Array<{
    chapter: number
    title: string
    content: string  // Narrativa gerada
    spans: Array<SpanData>  // Spans que compõem o capítulo
    highlightMoments: Array<{
      timestamp: string
      description: string
      spanSeq: number
    }>
    epigraph?: string  // Citação do Professor Oak
  }>
  appendix: {
    verifiedLedgerHashes: string[]
    cryptographicProof: string  // Merkle root
    officialCertification: {
      issuedBy: string
      verifiedBattles: number
      verifiedTrainingHours: number
      peerReviewed: boolean
    }
  }
  shareUrl: string  // URL pública para compartilhamento
}
```

**Código:**
```typescript
private async handleGetCreatureLegend(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  sendJSON: (res: ServerResponse, data: any, status?: number) => void
): Promise<boolean> {
  const id = pathname.replace('/api/arena/creatures/', '').replace('/legend', '')
  
  const creature = this.creatures.get(id)
  if (!creature) {
    sendJSON(res, { error: 'Creature not found' }, 404)
    return true
  }

  try {
    // Buscar DNA
    const dnaResponse = await this.handleGetCreatureDna(
      req,
      res,
      `/api/arena/creatures/${id}/dna`,
      sendJSON
    )

    // Gerar capítulos
    const chapters = this.generateChapters(dnaResponse.timeline, creature)

    // Calcular prova criptográfica (simplificado)
    const ledger = this.narrativeSync['ledger']
    const allSpans = await ledger.getAll()
    const creatureSpans = allSpans.filter((e: any) => 
      e.data.who === id || e.data.metadata?.creatureId === id
    )
    const hashes = creatureSpans.map((e: any) => e.hash || e.data.hash).filter(Boolean)
    const merkleRoot = this.calculateMerkleRoot(hashes) // Simplificado

    sendJSON(res, {
      creatureId: id,
      creatureName: creature.name,
      title: `The Legend of ${creature.name}`,
      chapters,
      appendix: {
        verifiedLedgerHashes: hashes,
        cryptographicProof: merkleRoot,
        officialCertification: {
          issuedBy: 'ArenaLab Foundation',
          verifiedBattles: creature.wins + creature.losses + creature.draws,
          verifiedTrainingHours: Math.floor(creature.totalSpans * 0.1), // Estimativa
          peerReviewed: creature.diamondSpans >= 50
        }
      },
      shareUrl: `/legend/${id}`
    })

    return true
  } catch (error: any) {
    sendJSON(res, { error: error.message }, 500)
    return true
  }
}

private generateChapters(timeline: any[], creature: Creature): any[] {
  const chapters: any[] = []

  // Capítulo 1: O Despertar
  const awakeningSpans = timeline.filter(s => 
    s.type === 'battle' && s.seq <= 10
  )
  chapters.push({
    chapter: 1,
    title: 'The Awakening',
    content: this.narrativizeSpans(awakeningSpans, 'awakening'),
    spans: awakeningSpans,
    highlightMoments: awakeningSpans
      .filter(s => s.span.metadata?.first_victory || s.span.metadata?.first_battle)
      .map(s => ({
        timestamp: s.timestamp,
        description: s.narrative,
        spanSeq: s.seq
      })),
    epigraph: 'Every legend begins with a single step. - Professor Oak'
  })

  // Capítulo 2: O Cultivo
  const trainingSpans = timeline.filter(s => s.type === 'training')
  if (trainingSpans.length > 0) {
    chapters.push({
      chapter: 2,
      title: 'The Cultivation',
      content: this.narrativizeSpans(trainingSpans, 'cultivation'),
      spans: trainingSpans,
      highlightMoments: trainingSpans
        .filter(s => s.span.did === 'start_training' || s.span.did === 'complete_training')
        .map(s => ({
          timestamp: s.timestamp,
          description: s.narrative,
          spanSeq: s.seq
        })),
      epigraph: 'True growth is not forced. It is nurtured. - Professor Oak'
    })
  }

  // Capítulo 3: As Crônicas da Arena
  const battleSpans = timeline.filter(s => s.type === 'battle')
  if (battleSpans.length > 0) {
    chapters.push({
      chapter: 3,
      title: 'The Arena Chronicles',
      content: this.narrativizeSpans(battleSpans, 'battles'),
      spans: battleSpans,
      highlightMoments: battleSpans
        .filter(s => s.span.metadata?.quality >= 90)
        .slice(0, 5)
        .map(s => ({
          timestamp: s.timestamp,
          description: s.narrative,
          spanSeq: s.seq
        })),
      epigraph: 'In the arena, truth is revealed. - Professor Oak'
    })
  }

  // Capítulo 4: A Ascensão (se aplicável)
  if (creature.evolutionStage > 0) {
    const evolutionSpans = timeline.filter(s => s.type === 'evolution')
    chapters.push({
      chapter: 4,
      title: 'The Ascension',
      content: this.narrativizeSpans(evolutionSpans, 'evolution'),
      spans: evolutionSpans,
      highlightMoments: evolutionSpans.map(s => ({
        timestamp: s.timestamp,
        description: s.narrative,
        spanSeq: s.seq
      })),
      epigraph: 'Evolution is not replacement. It is becoming. - Professor Oak'
    })
  }

  return chapters
}

private narrativizeSpans(spans: any[], context: string): string {
  // Gerar narrativa a partir dos spans
  // Pode usar LLM ou template-based
  return spans.map(s => s.narrative).join('\n\n')
}

private calculateMerkleRoot(hashes: string[]): string {
  // Simplificado: usar hash da concatenação
  // Em produção, usar árvore Merkle real
  const combined = hashes.join('')
  return `merkle:${combined.substring(0, 64)}`
}
```

---

### 4. Frontend: Evolution Timeline

#### 4.1 Componente `EvolutionTimeline`

**Arquivo:** `Arena-Frontend/components/evolution-timeline.tsx`

**Objetivo:** Renderizar timeline visual do DNA da criatura.

**Ação:**
- [ ] Criar componente React
- [ ] Buscar DNA via API
- [ ] Renderizar timeline com eventos
- [ ] Destacar marcos
- [ ] Mostrar estatísticas

**Código:**
```typescript
// Arena-Frontend/components/evolution-timeline.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Trophy, Target, Sparkles } from "lucide-react"

interface TimelineEvent {
  seq: number
  type: 'battle' | 'training' | 'evolution'
  timestamp: string
  narrative: string
}

interface CreatureDNA {
  creatureId: string
  creatureName: string
  timeline: TimelineEvent[]
  stats: {
    totalBattles: number
    winRate: number
    totalTraining: number
    evolutions: number
    currentLevel: number
    currentElo: number
    trustLevel: number
  }
  milestones: Array<{
    type: string
    timestamp: string
    description: string
  }>
}

export function EvolutionTimeline({ creatureId }: { creatureId: string }) {
  const [dna, setDna] = useState<CreatureDNA | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/arena/creatures/${creatureId}/dna`)
      .then(res => res.json())
      .then(data => {
        setDna(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load DNA:', err)
        setLoading(false)
      })
  }, [creatureId])

  if (loading) return <div>Loading DNA...</div>
  if (!dna) return <div>Failed to load DNA</div>

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          DNA Atômico: {dna.creatureName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-sm text-muted-foreground">Batalhas</div>
            <div className="text-2xl font-bold">{dna.stats.totalBattles}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Taxa de Vitória</div>
            <div className="text-2xl font-bold">{(dna.stats.winRate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">ELO</div>
            <div className="text-2xl font-bold">{dna.stats.currentElo}</div>
          </div>
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {dna.timeline.map((event, index) => (
              <div key={event.seq} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    event.type === 'battle' ? 'bg-red-500' :
                    event.type === 'training' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`} />
                  {index < dna.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={
                      event.type === 'battle' ? 'destructive' :
                      event.type === 'training' ? 'default' :
                      'secondary'
                    }>
                      {event.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{event.narrative}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Marcos */}
        {dna.milestones.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Marcos</h3>
            <div className="space-y-2">
              {dna.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{milestone.description}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(milestone.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

### 5. Frontend: Leaderboard

#### 5.1 Componente `Leaderboard`

**Arquivo:** `Arena-Frontend/components/leaderboard.tsx`

**Ação:**
- [ ] Criar componente React
- [ ] Buscar leaderboard via API
- [ ] Suportar filtros (categoria, ordenação)
- [ ] Renderizar tabela/lista
- [ ] Mostrar badges

**Código:**
```typescript
// Arena-Frontend/components/leaderboard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Crown } from "lucide-react"

interface Ranking {
  rank: number
  creature: {
    id: string
    name: string
    type: string
    level: number
  }
  stats: {
    elo: number
    wins: number
    losses: number
    winRate: number
    level: number
    trust: number
  }
  badges: string[]
}

export function Leaderboard() {
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('elo')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/arena/leaderboard?category=${category}&sort=${sort}&limit=100`)
      .then(res => res.json())
      .then(data => {
        setRankings(data.rankings)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load leaderboard:', err)
        setLoading(false)
      })
  }, [category, sort])

  if (loading) return <div>Loading leaderboard...</div>

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Hall of Legends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-4 mb-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creatures</SelectItem>
              <SelectItem value="undefeated">Undefeated</SelectItem>
              <SelectItem value="evolved">Evolved</SelectItem>
              <SelectItem value="ascended">Ascended</SelectItem>
              <SelectItem value="loyal">Loyal (Trust ≥90)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="elo">ELO</SelectItem>
              <SelectItem value="wins">Wins</SelectItem>
              <SelectItem value="level">Level</SelectItem>
              <SelectItem value="trust">Trust</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="space-y-2">
          {rankings.map((ranking) => (
            <div key={ranking.creature.id} className="flex items-center gap-4 p-4 border rounded">
              <div className="w-12 text-center font-bold text-lg">
                {ranking.rank === 1 && <Crown className="h-6 w-6 text-yellow-500 mx-auto" />}
                {ranking.rank === 2 && <Medal className="h-6 w-6 text-gray-400 mx-auto" />}
                {ranking.rank === 3 && <Medal className="h-6 w-6 text-orange-400 mx-auto" />}
                {ranking.rank > 3 && ranking.rank}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{ranking.creature.name}</div>
                <div className="text-sm text-muted-foreground">
                  Level {ranking.stats.level} • ELO {ranking.stats.elo} • {ranking.stats.wins}W/{ranking.stats.losses}L
                </div>
              </div>
              <div className="flex gap-2">
                {ranking.badges.map(badge => (
                  <Badge key={badge} variant="secondary">{badge}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### 6. Frontend: Creature Legend

#### 6.1 Componente `CreatureLegend`

**Arquivo:** `Arena-Frontend/components/creature-legend.tsx`

**Ação:**
- [ ] Criar componente React
- [ ] Buscar legend via API
- [ ] Renderizar capítulos
- [ ] Mostrar apêndice com provas criptográficas
- [ ] Botão de compartilhamento

**Código:**
```typescript
// Arena-Frontend/components/creature-legend.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, CheckCircle } from "lucide-react"

interface Chapter {
  chapter: number
  title: string
  content: string
  highlightMoments: Array<{
    timestamp: string
    description: string
  }>
  epigraph?: string
}

interface CreatureLegend {
  creatureId: string
  creatureName: string
  title: string
  chapters: Chapter[]
  appendix: {
    verifiedLedgerHashes: string[]
    cryptographicProof: string
    officialCertification: any
  }
  shareUrl: string
}

export function CreatureLegend({ creatureId }: { creatureId: string }) {
  const [legend, setLegend] = useState<CreatureLegend | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/arena/creatures/${creatureId}/legend`)
      .then(res => res.json())
      .then(data => {
        setLegend(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load legend:', err)
        setLoading(false)
      })
  }, [creatureId])

  if (loading) return <div>Loading legend...</div>
  if (!legend) return <div>Failed to load legend</div>

  const handleShare = () => {
    const url = `${window.location.origin}${legend.shareUrl}`
    navigator.clipboard.writeText(url)
    // Toast: "Link copied to clipboard"
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{legend.title}</CardTitle>
            <Button onClick={handleShare} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Capítulos */}
          {legend.chapters.map((chapter) => (
            <div key={chapter.chapter} className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Chapter {chapter.chapter}: {chapter.title}
              </h2>
              {chapter.epigraph && (
                <p className="text-sm italic text-muted-foreground mb-4">
                  "{chapter.epigraph}"
                </p>
              )}
              <div className="prose max-w-none mb-4">
                {chapter.content.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>
              {chapter.highlightMoments.length > 0 && (
                <div className="bg-muted p-4 rounded">
                  <h3 className="font-semibold mb-2">Highlight Moments</h3>
                  <ul className="space-y-1">
                    {chapter.highlightMoments.map((moment, i) => (
                      <li key={i} className="text-sm">
                        • {moment.description} ({new Date(moment.timestamp).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Apêndice */}
          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-bold mb-4">Appendix: Cryptographic Proof</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Verified Ledger Hashes: {legend.appendix.verifiedLedgerHashes.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Merkle Root: {legend.appendix.cryptographicProof}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Issued by: {legend.appendix.officialCertification.issuedBy}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### 7. Integração no Arena View

#### 7.1 Adicionar Tabs

**Arquivo:** `Arena-Frontend/components/arena-view.tsx`

**Ação:**
- [ ] Adicionar tab "DNA" com `EvolutionTimeline`
- [ ] Adicionar tab "Leaderboard" com `Leaderboard`
- [ ] Adicionar tab "Legend" com `CreatureLegend`

**Código:**
```typescript
// Adicionar ao TabsList
<TabsTrigger value="dna">DNA</TabsTrigger>
<TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
<TabsTrigger value="legend">Legend</TabsTrigger>

// Adicionar TabsContent
<TabsContent value="dna">
  {selectedCreature && <EvolutionTimeline creatureId={selectedCreature.id} />}
</TabsContent>

<TabsContent value="leaderboard">
  <Leaderboard />
</TabsContent>

<TabsContent value="legend">
  {selectedCreature && <CreatureLegend creatureId={selectedCreature.id} />}
</TabsContent>
```

---

### 8. Rota Pública para Compartilhamento

#### 8.1 Página `/legend/:id`

**Arquivo:** `Arena-Frontend/app/legend/[id]/page.tsx` (Next.js) ou componente standalone

**Ação:**
- [ ] Criar rota pública
- [ ] Buscar legend via API
- [ ] Renderizar `CreatureLegend`
- [ ] SEO-friendly (meta tags)

---

### 9. Testes E2E

#### 9.1 Teste de DNA

**Arquivo:** `tests/e2e/dna-flow.test.ts`

**Ação:**
- [ ] Testar `GET /api/arena/creatures/:id/dna`
- [ ] Verificar timeline completa
- [ ] Verificar estatísticas
- [ ] Verificar marcos

#### 9.2 Teste de Leaderboard

**Arquivo:** `tests/e2e/leaderboard-flow.test.ts`

**Ação:**
- [ ] Testar `GET /api/arena/leaderboard`
- [ ] Verificar ordenação
- [ ] Verificar filtros
- [ ] Verificar badges

#### 9.3 Teste de Legend

**Arquivo:** `tests/e2e/legend-flow.test.ts`

**Ação:**
- [ ] Testar `GET /api/arena/creatures/:id/legend`
- [ ] Verificar capítulos
- [ ] Verificar apêndice
- [ ] Verificar provas criptográficas

---

### 10. Métricas

#### 10.1 Métricas de Visualização

**Arquivo:** `packages/hardening-pack/src/metrics/metrics.ts`

**Ação:**
- [ ] Adicionar `dnaViewsTotal` - Contador de visualizações de DNA
- [ ] Adicionar `legendViewsTotal` - Contador de visualizações de legend
- [ ] Adicionar `leaderboardViewsTotal` - Contador de visualizações de leaderboard
- [ ] Adicionar `legendSharesTotal` - Contador de compartilhamentos

**Código:**
```typescript
export const dnaViewsTotal = new client.Counter({ 
  name: "diamond_dna_views_total", 
  help: "Total de visualizações de DNA",
  labelNames: ["creature_id"]
});

export const legendViewsTotal = new client.Counter({ 
  name: "diamond_legend_views_total", 
  help: "Total de visualizações de legend",
  labelNames: ["creature_id"]
});

export const leaderboardViewsTotal = new client.Counter({ 
  name: "diamond_leaderboard_views_total", 
  help: "Total de visualizações de leaderboard"
});

export const legendSharesTotal = new client.Counter({ 
  name: "diamond_legend_shares_total", 
  help: "Total de compartilhamentos de legend",
  labelNames: ["creature_id"]
});
```

---

## 🚀 Ordem de Execução Recomendada

1. **Backend primeiro:**
   - [ ] 1.1 Endpoint DNA
   - [ ] 1.2 Endpoint Leaderboard
   - [ ] 1.3 Endpoint Legend
   - [ ] 1.4 Helpers (narrativa, marcos, qualidade)

2. **Frontend depois:**
   - [ ] 2.1 EvolutionTimeline
   - [ ] 2.2 Leaderboard
   - [ ] 2.3 CreatureLegend
   - [ ] 2.4 Integração no ArenaView

3. **Rota pública:**
   - [ ] 3.1 Página `/legend/:id`

4. **Testes:**
   - [ ] 4.1 Teste E2E DNA
   - [ ] 4.2 Teste E2E Leaderboard
   - [ ] 4.3 Teste E2E Legend

5. **Métricas:**
   - [ ] 5.1 Métricas de visualização

---

## ✅ Critérios de Aceite Final

- [ ] DNA retorna timeline completa baseada no Ledger
- [ ] Leaderboard funciona com filtros e ordenação
- [ ] Legend gera narrativa verificável
- [ ] URLs públicas funcionam para compartilhamento
- [ ] Componentes renderizam corretamente
- [ ] Testes E2E passam
- [ ] Métricas expostas em `/metrics`
- [ ] Performance: DNA carrega em < 2s
- [ ] Performance: Leaderboard carrega em < 1s

---

## 📊 Métricas de Sucesso

- ✅ 100% das timelines renderizam a partir do Ledger
- ✅ Leaderboard consistente entre runs
- ✅ Legend compartilhável via URL pública
- ✅ Provas criptográficas verificáveis
- ✅ P95 latency DNA ≤ 2s
- ✅ P95 latency Leaderboard ≤ 1s

---

**Status:** 📋 **PLANEJAMENTO COMPLETO**

*Documento gerado em: 2025-11-09*  
*Versão: 1.0-planning*  
*Pronto para implementação*

