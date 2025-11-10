"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Terminal,
  Play,
  Square,
  Trash2,
  TrendingUp,
  Zap,
  Database,
  Search,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface TrainingEvent {
  id: string
  timestamp: string
  type: 'log' | 'tool_call' | 'search' | 'match' | 'quality' | 'result' | 'error' | 'critical_hit'
  message: string
  data?: any
  level?: 'info' | 'success' | 'warning' | 'error'
}

interface TrainingTerminalProps {
  events: TrainingEvent[]
  isRunning: boolean
  onStart?: () => void
  onStop?: () => void
  onClear?: () => void
  stats?: {
    totalSpans: number
    matchedSpans: number
    avgQuality: number
    xpGained: number
  }
}

export function TrainingTerminal({
  events,
  isRunning,
  onStart,
  onStop,
  onClear,
  stats
}: TrainingTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll to bottom quando novos eventos chegam
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events, autoScroll])

  const getEventIcon = (event: TrainingEvent) => {
    switch (event.type) {
      case 'tool_call':
        return <Zap className="h-4 w-4 text-purple-500" />
      case 'search':
        return <Search className="h-4 w-4 text-blue-500" />
      case 'match':
        return <Target className="h-4 w-4 text-green-500" />
      case 'quality':
        return <Database className="h-4 w-4 text-yellow-500" />
      case 'result':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'critical_hit':
        return <TrendingUp className="h-4 w-4 text-pink-500 animate-pulse" />
      default:
        return <Terminal className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getEventColor = (event: TrainingEvent) => {
    if (event.level) {
      switch (event.level) {
        case 'success':
          return 'text-green-500'
        case 'warning':
          return 'text-yellow-500'
        case 'error':
          return 'text-red-500'
        default:
          return 'text-foreground'
      }
    }

    switch (event.type) {
      case 'critical_hit':
        return 'text-pink-500 font-bold animate-pulse'
      case 'error':
        return 'text-red-500'
      case 'result':
        return 'text-green-500'
      default:
        return 'text-foreground'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="font-semibold text-sm">Training Terminal</span>
          {isRunning && (
            <Badge variant="default" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Running
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {stats && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground mr-4">
              <span>Spans: {stats.totalSpans}</span>
              <span>Matched: {stats.matchedSpans}</span>
              <span>Quality: {stats.avgQuality.toFixed(2)}</span>
              <span className="text-green-500 font-semibold">XP: +{stats.xpGained}</span>
            </div>
          )}

          {onStart && !isRunning && (
            <Button size="sm" variant="ghost" onClick={onStart}>
              <Play className="h-4 w-4" />
            </Button>
          )}

          {onStop && isRunning && (
            <Button size="sm" variant="ghost" onClick={onStop}>
              <Square className="h-4 w-4" />
            </Button>
          )}

          {onClear && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <ScrollArea className="flex-1 p-4 font-mono text-xs" ref={scrollRef}>
        <div className="space-y-1">
          {events.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No training events yet. Start a training session to see logs.
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-2 py-1 px-2 rounded hover:bg-muted/50 transition-colors",
                  event.type === 'critical_hit' && "bg-pink-500/10 border-l-2 border-pink-500"
                )}
              >
                {/* Timestamp */}
                <span className="text-muted-foreground text-[10px] w-24 shrink-0">
                  {formatTimestamp(event.timestamp)}
                </span>

                {/* Icon */}
                <div className="shrink-0 mt-0.5">
                  {getEventIcon(event)}
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <span className={getEventColor(event)}>
                    {event.message}
                  </span>

                  {/* Data (se houver) */}
                  {event.data && (
                    <div className="mt-1 pl-4 text-muted-foreground">
                      <pre className="text-[10px] overflow-x-auto">
                        {typeof event.data === 'string'
                          ? event.data
                          : JSON.stringify(event.data, null, 2)
                        }
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer com auto-scroll toggle */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
        <span>{events.length} events</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded"
          />
          Auto-scroll
        </label>
      </div>
    </Card>
  )
}
