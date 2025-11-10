/**
 * Evolution Timeline Component
 * 
 * Displays the complete DNA timeline of a creature, showing all events
 * from battles, training, and evolution in chronological order.
 */

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Trophy, Target, Sparkles, TrendingUp } from "lucide-react"

interface TimelineEvent {
  seq: number
  type: 'battle' | 'training' | 'evolution' | 'unknown'
  timestamp: string
  narrative: string
  span?: any
}

interface CreatureDNA {
  creatureId: string
  creatureName: string
  totalSpans: number
  diamondSpans: number
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
  qualityProfile: {
    avgQuality: number
    bestQuality: number
    worstQuality: number
    qualityTrend: Array<{ timestamp: string; quality: number }>
  }
}

interface EvolutionTimelineProps {
  creatureId: string
}

export function EvolutionTimeline({ creatureId }: EvolutionTimelineProps) {
  const [dna, setDna] = useState<CreatureDNA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/arena/creatures/${creatureId}/dna`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load DNA: ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        setDna(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load DNA:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [creatureId])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading DNA...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!dna) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">No DNA data available</div>
        </CardContent>
      </Card>
    )
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'battle':
        return 'bg-red-500'
      case 'training':
        return 'bg-blue-500'
      case 'evolution':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getEventBadgeVariant = (type: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (type) {
      case 'battle':
        return 'destructive'
      case 'training':
        return 'default'
      case 'evolution':
        return 'secondary'
      default:
        return 'outline'
    }
  }

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
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Batalhas</div>
            <div className="text-2xl font-bold">{dna.stats.totalBattles}</div>
            <div className="text-xs text-muted-foreground">
              {dna.stats.winRate > 0 ? `${(dna.stats.winRate * 100).toFixed(1)}% vitórias` : 'Sem vitórias ainda'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">ELO</div>
            <div className="text-2xl font-bold">{dna.stats.currentElo}</div>
            <div className="text-xs text-muted-foreground">
              Nível {dna.stats.currentLevel}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Spans Diamante</div>
            <div className="text-2xl font-bold">{dna.diamondSpans}</div>
            <div className="text-xs text-muted-foreground">
              de {dna.totalSpans} total
            </div>
          </div>
        </div>

        {/* Perfil de Qualidade */}
        {dna.qualityProfile.avgQuality > 0 && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">Perfil de Qualidade</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Média</div>
                <div className="font-bold">{dna.qualityProfile.avgQuality.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Melhor</div>
                <div className="font-bold text-green-600">{dna.qualityProfile.bestQuality.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Pior</div>
                <div className="font-bold text-red-600">{dna.qualityProfile.worstQuality.toFixed(1)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Timeline Completa</h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              {dna.timeline.map((event, index) => (
                <div key={event.seq || index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getEventColor(event.type)}`} />
                    {index < dna.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-border min-h-[40px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getEventBadgeVariant(event.type)}>
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
              {dna.timeline.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum evento registrado ainda
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Marcos */}
        {dna.milestones.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Marcos da Jornada
            </h3>
            <div className="space-y-2">
              {dna.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{milestone.description}</span>
                  </div>
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
