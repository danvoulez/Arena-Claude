"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronRight,
  ChevronDown,
  Code,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToolCall {
  id: string
  timestamp: string
  name: string
  parameters: any
  status: 'pending' | 'running' | 'success' | 'error'
  result?: any
  error?: string
  duration?: number
}

interface ToolCallingPanelProps {
  toolCalls: ToolCall[]
  currentlyRunning?: string | null
}

export function ToolCallingPanel({ toolCalls, currentlyRunning }: ToolCallingPanelProps) {
  const [expandedCalls, setExpandedCalls] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedCalls(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getStatusIcon = (status: ToolCall['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: ToolCall['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Running</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <span className="font-semibold text-sm">Tool Calls</span>
          {currentlyRunning && (
            <Badge variant="default" className="gap-1 bg-blue-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Executing
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {toolCalls.length} calls
        </div>
      </div>

      {/* Tool Calls List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {toolCalls.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No tool calls yet. Start a training session to see tool executions.
            </div>
          ) : (
            toolCalls.map((call) => {
              const isExpanded = expandedCalls.has(call.id)
              const isCurrentlyRunning = currentlyRunning === call.id

              return (
                <div
                  key={call.id}
                  className={cn(
                    "border rounded-lg overflow-hidden transition-all",
                    isCurrentlyRunning && "ring-2 ring-blue-500 bg-blue-500/5"
                  )}
                >
                  {/* Tool Call Header */}
                  <button
                    onClick={() => toggleExpand(call.id)}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>

                    <div className="shrink-0">
                      {getStatusIcon(call.status)}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold truncate">
                          {call.name}
                        </span>
                        {getStatusBadge(call.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(call.timestamp).toLocaleTimeString('pt-BR')}
                        {call.duration && (
                          <span className="ml-2">
                            • {formatDuration(call.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20 p-3 space-y-3">
                      {/* Parameters */}
                      <div>
                        <div className="text-xs font-semibold mb-1 flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          Parameters
                        </div>
                        <pre className="text-xs bg-background rounded p-2 overflow-x-auto">
                          {JSON.stringify(call.parameters, null, 2)}
                        </pre>
                      </div>

                      {/* Result */}
                      {call.status === 'success' && call.result && (
                        <div>
                          <div className="text-xs font-semibold mb-1 text-green-500 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Result
                          </div>
                          <pre className="text-xs bg-background rounded p-2 overflow-x-auto max-h-48">
                            {JSON.stringify(call.result, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Error */}
                      {call.status === 'error' && call.error && (
                        <div>
                          <div className="text-xs font-semibold mb-1 text-red-500 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Error
                          </div>
                          <pre className="text-xs bg-red-500/10 text-red-500 rounded p-2 overflow-x-auto">
                            {call.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center justify-between">
          <span>
            Success: {toolCalls.filter(c => c.status === 'success').length} /
            Failed: {toolCalls.filter(c => c.status === 'error').length}
          </span>
          {toolCalls.length > 0 && (
            <span>
              Avg: {formatDuration(
                toolCalls
                  .filter(c => c.duration)
                  .reduce((sum, c) => sum + (c.duration || 0), 0) /
                  toolCalls.filter(c => c.duration).length
              )}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
