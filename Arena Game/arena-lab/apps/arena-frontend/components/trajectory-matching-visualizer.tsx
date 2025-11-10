"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TrendingUp,
  Search,
  Target,
  Database,
  CheckCircle,
  XCircle,
  Sparkles,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface QualityScore {
  completeness: number
  provenance: number
  impact: number
  uniqueness: number
  coherence: number
  overall: number
}

export interface MatchedSpan {
  id: string
  similarity: number
  quality: QualityScore
  context: string
  outcome: string
  timestamp: string
}

export interface TrajectoryMatchingState {
  phase: 'searching' | 'matching' | 'quality_check' | 'complete' | 'idle'
  currentQuery?: string
  candidateSpans: number
  matchedSpans: MatchedSpan[]
  qualityThreshold: number
  avgSimilarity: number
  avgQuality: number
}

interface TrajectoryMatchingVisualizerProps {
  state: TrajectoryMatchingState
}

export function TrajectoryMatchingVisualizer({ state }: TrajectoryMatchingVisualizerProps) {
  const [selectedSpan, setSelectedSpan] = useState<MatchedSpan | null>(null)

  const getPhaseColor = (phase: TrajectoryMatchingState['phase']) => {
    switch (phase) {
      case 'searching':
        return 'text-blue-500'
      case 'matching':
        return 'text-purple-500'
      case 'quality_check':
        return 'text-yellow-500'
      case 'complete':
        return 'text-green-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getPhaseIcon = (phase: TrajectoryMatchingState['phase']) => {
    switch (phase) {
      case 'searching':
        return <Search className="h-4 w-4 animate-pulse" />
      case 'matching':
        return <Target className="h-4 w-4 animate-pulse" />
      case 'quality_check':
        return <Database className="h-4 w-4 animate-pulse" />
      case 'complete':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500'
    if (score >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getQualityBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 0.8) return 'default'
    if (score >= 0.6) return 'secondary'
    return 'destructive'
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-2 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-semibold text-sm">Trajectory Matching</span>
          </div>
          <Badge variant={state.phase === 'complete' ? 'default' : 'secondary'}>
            {state.phase.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Phase Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <div className={cn("flex items-center gap-1", getPhaseColor(state.phase))}>
            {getPhaseIcon(state.phase)}
            <span className="font-medium">
              {state.phase === 'searching' && 'Searching for similar contexts...'}
              {state.phase === 'matching' && 'Matching trajectories...'}
              {state.phase === 'quality_check' && 'Computing quality scores...'}
              {state.phase === 'complete' && 'Matching complete'}
              {state.phase === 'idle' && 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b px-4 py-2 bg-muted/20">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Candidates</div>
            <div className="font-semibold">{state.candidateSpans}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Matched</div>
            <div className="font-semibold text-green-500">{state.matchedSpans.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Avg Similarity</div>
            <div className="font-semibold">{(state.avgSimilarity * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Avg Quality</div>
            <div className={cn("font-semibold", getQualityColor(state.avgQuality))}>
              {(state.avgQuality * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Matched Spans */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {state.matchedSpans.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              {state.phase === 'idle' ? (
                <>
                  <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No matches yet</p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
                  <p>Searching for similar trajectories...</p>
                </>
              )}
            </div>
          ) : (
            state.matchedSpans.map((span) => (
              <Card
                key={span.id}
                className={cn(
                  "p-3 cursor-pointer transition-all hover:shadow-md",
                  selectedSpan?.id === span.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedSpan(span)}
              >
                {/* Span Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {(span.similarity * 100).toFixed(1)}% match
                    </Badge>
                    <Badge
                      variant={getQualityBadgeVariant(span.quality.overall)}
                      className="text-xs"
                    >
                      Q: {(span.quality.overall * 100).toFixed(0)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(span.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>

                {/* Context Preview */}
                <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {span.context}
                </div>

                {/* Quality Breakdown (se selecionado) */}
                {selectedSpan?.id === span.id && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <div className="text-xs font-semibold mb-2 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Quality Meter 5D
                    </div>

                    {Object.entries(span.quality).map(([key, value]) => {
                      if (key === 'overall') return null
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="capitalize">{key}</span>
                            <span className={getQualityColor(value as number)}>
                              {((value as number) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={(value as number) * 100}
                            className="h-1"
                          />
                        </div>
                      )
                    })}

                    {/* Outcome */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs font-semibold mb-1">Outcome</div>
                      <div className="text-xs bg-muted/50 rounded p-2">
                        {span.outcome}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Quality Threshold Indicator */}
      <div className="border-t px-4 py-2 bg-muted/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Quality Threshold</span>
          <Badge variant="outline">
            {(state.qualityThreshold * 100).toFixed(0)}%
          </Badge>
        </div>
      </div>
    </Card>
  )
}
