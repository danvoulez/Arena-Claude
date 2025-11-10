/**
 * Leaderboard Component
 * 
 * Displays global rankings of creatures with filters and sorting options.
 */

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Crown, Sparkles } from "lucide-react"

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
    diamondSpans: number
    totalSpans: number
  }
  badges: string[]
}

interface LeaderboardData {
  category: string
  sortBy: string
  totalCreatures: number
  rankings: Ranking[]
  metadata: {
    generatedAt: string
    cacheExpiresAt: string
  }
}

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('elo')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/arena/leaderboard?category=${category}&sort=${sort}&limit=100`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load leaderboard: ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load leaderboard:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [category, sort])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading leaderboard...</div>
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

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">No leaderboard data available</div>
        </CardContent>
      </Card>
    )
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-400" />
    return null
  }

  const getBadgeVariant = (badge: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (badge) {
      case 'undefeated':
        return 'destructive'
      case 'evolved':
        return 'secondary'
      case 'ascended':
        return 'default'
      case 'loyal':
        return 'default'
      case 'elite':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Hall of Legends
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {data.totalCreatures} {data.totalCreatures === 1 ? 'criatura' : 'criaturas'} nesta categoria
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Criaturas</SelectItem>
              <SelectItem value="undefeated">Invictas</SelectItem>
              <SelectItem value="survivors">Sobreviventes</SelectItem>
              <SelectItem value="evolved">Evoluídas</SelectItem>
              <SelectItem value="ascended">Ascendidas</SelectItem>
              <SelectItem value="loyal">Leais (Trust ≥90)</SelectItem>
              <SelectItem value="philosophers">Filósofos (ELO ≥1500)</SelectItem>
              <SelectItem value="artists">Artistas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="elo">ELO</SelectItem>
              <SelectItem value="wins">Vitórias</SelectItem>
              <SelectItem value="level">Nível</SelectItem>
              <SelectItem value="trust">Trust</SelectItem>
              <SelectItem value="diamond_spans">Spans Diamante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de Rankings */}
        <div className="space-y-2">
          {data.rankings.map((ranking) => (
            <div
              key={ranking.creature.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Rank */}
              <div className="w-12 text-center font-bold text-lg flex items-center justify-center">
                {getRankIcon(ranking.rank) || ranking.rank}
              </div>

              {/* Creature Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg truncate">{ranking.creature.name}</div>
                <div className="text-sm text-muted-foreground">
                  Nível {ranking.stats.level} • ELO {ranking.stats.elo} • {ranking.stats.wins}W/{ranking.stats.losses}L
                  {ranking.stats.winRate > 0 && (
                    <span className="ml-2">
                      ({(ranking.stats.winRate * 100).toFixed(1)}% vitórias)
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Trust: {ranking.stats.trust}/100 • {ranking.stats.diamondSpans} spans diamante
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                {ranking.badges.map(badge => (
                  <Badge key={badge} variant={getBadgeVariant(badge)}>
                    {badge === 'undefeated' && '🏆'}
                    {badge === 'evolved' && <Sparkles className="h-3 w-3 mr-1" />}
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          {data.rankings.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma criatura encontrada nesta categoria
            </div>
          )}
        </div>

        {/* Metadata */}
        {data.metadata && (
          <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
            Gerado em: {new Date(data.metadata.generatedAt).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

