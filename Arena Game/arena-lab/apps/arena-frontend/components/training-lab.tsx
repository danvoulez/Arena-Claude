"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Square,
  Sparkles,
  Zap,
  TrendingUp,
  BarChart3,
  Settings
} from "lucide-react"
import { TrainingTerminal, TrainingEvent } from "./training-terminal"
import { ToolCallingPanel, ToolCall } from "./tool-calling-panel"
import { TrajectoryMatchingVisualizer, TrajectoryMatchingState, MatchedSpan, QualityScore } from "./trajectory-matching-visualizer"
import { DataIngestionPanel } from "./data-ingestion-panel"
import { useArenaStore } from "@/lib/store"
import { processMDFiles, DiamondSpan } from "@/lib/processors/md-processor"

export function TrainingLab() {
  const { creatures } = useArenaStore()

  // Training state
  const [isTraining, setIsTraining] = useState(false)
  const [isIngesting, setIsIngesting] = useState(false)
  const [selectedCreatureId, setSelectedCreatureId] = useState(creatures[0]?.id || "")
  const [prompt, setPrompt] = useState("")
  const [activeMode, setActiveMode] = useState<'manual' | 'batch'>('manual')

  // Terminal events
  const [terminalEvents, setTerminalEvents] = useState<TrainingEvent[]>([])

  // Tool calls
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
  const [currentToolCall, setCurrentToolCall] = useState<string | null>(null)

  // Trajectory matching state
  const [trajectoryState, setTrajectoryState] = useState<TrajectoryMatchingState>({
    phase: 'idle',
    candidateSpans: 0,
    matchedSpans: [],
    qualityThreshold: 0.7,
    avgSimilarity: 0,
    avgQuality: 0
  })

  // Training stats
  const [stats, setStats] = useState({
    totalSpans: 0,
    matchedSpans: 0,
    avgQuality: 0,
    xpGained: 0
  })

  const selectedCreature = creatures.find(c => c.id === selectedCreatureId)

  const addTerminalEvent = (event: Omit<TrainingEvent, 'id' | 'timestamp'>) => {
    setTerminalEvents(prev => [
      ...prev,
      {
        ...event,
        id: `event_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString()
      }
    ])
  }

  const addToolCall = (call: Omit<ToolCall, 'id' | 'timestamp'>) => {
    const id = `tool_${Date.now()}_${Math.random()}`
    setToolCalls(prev => [
      ...prev,
      {
        ...call,
        id,
        timestamp: new Date().toISOString()
      }
    ])
    return id
  }

  const updateToolCall = (id: string, updates: Partial<ToolCall>) => {
    setToolCalls(prev =>
      prev.map(call => (call.id === id ? { ...call, ...updates } : call))
    )
  }

  const simulateTraining = async () => {
    setIsTraining(true)
    addTerminalEvent({
      type: 'log',
      message: `🚀 Starting training session for ${selectedCreature?.name}...`,
      level: 'info'
    })

    // Simular busca de spans
    addTerminalEvent({
      type: 'search',
      message: 'Searching for similar training contexts in ledger...',
      level: 'info'
    })

    setTrajectoryState(prev => ({ ...prev, phase: 'searching' }))

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simular encontrar candidatos
    const candidateCount = Math.floor(Math.random() * 50) + 10
    setTrajectoryState(prev => ({ ...prev, candidateSpans: candidateCount }))

    addTerminalEvent({
      type: 'search',
      message: `Found ${candidateCount} candidate spans`,
      level: 'success'
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Simular matching
    setTrajectoryState(prev => ({ ...prev, phase: 'matching' }))
    addTerminalEvent({
      type: 'match',
      message: 'Computing trajectory similarities...',
      level: 'info'
    })

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simular quality check
    setTrajectoryState(prev => ({ ...prev, phase: 'quality_check' }))
    addTerminalEvent({
      type: 'quality',
      message: 'Running Quality Meter 5D...',
      level: 'info'
    })

    // Simular tool calls
    const toolId1 = addToolCall({
      name: 'searchSimilarSpans',
      parameters: { query: prompt, k: 10 },
      status: 'running'
    })
    setCurrentToolCall(toolId1)

    await new Promise(resolve => setTimeout(resolve, 800))

    updateToolCall(toolId1, {
      status: 'success',
      result: { found: candidateCount, matched: 8 },
      duration: 800
    })

    const toolId2 = addToolCall({
      name: 'calculateQuality',
      parameters: { spans: 8 },
      status: 'running'
    })
    setCurrentToolCall(toolId2)

    await new Promise(resolve => setTimeout(resolve, 600))

    updateToolCall(toolId2, {
      status: 'success',
      result: { avgQuality: 0.82 },
      duration: 600
    })

    // Simular matched spans
    const matchedSpans: MatchedSpan[] = Array.from({ length: 5 }, (_, i) => ({
      id: `span_${i}`,
      similarity: 0.7 + Math.random() * 0.3,
      quality: {
        completeness: 0.6 + Math.random() * 0.4,
        provenance: 0.7 + Math.random() * 0.3,
        impact: 0.5 + Math.random() * 0.5,
        uniqueness: 0.6 + Math.random() * 0.4,
        coherence: 0.7 + Math.random() * 0.3,
        overall: 0.65 + Math.random() * 0.35
      },
      context: `Training context ${i + 1}: ${prompt.substring(0, 50)}...`,
      outcome: `Outcome ${i + 1}: Success with high quality`,
      timestamp: new Date().toISOString()
    }))

    const avgSimilarity = matchedSpans.reduce((sum, s) => sum + s.similarity, 0) / matchedSpans.length
    const avgQuality = matchedSpans.reduce((sum, s) => sum + s.quality.overall, 0) / matchedSpans.length

    setTrajectoryState(prev => ({
      ...prev,
      phase: 'complete',
      matchedSpans,
      avgSimilarity,
      avgQuality
    }))

    addTerminalEvent({
      type: 'result',
      message: `Matched ${matchedSpans.length} high-quality spans`,
      data: { avgSimilarity: avgSimilarity.toFixed(2), avgQuality: avgQuality.toFixed(2) },
      level: 'success'
    })

    // Simular XP gain
    const xpGain = Math.floor(50 + avgQuality * 100)
    addTerminalEvent({
      type: 'critical_hit',
      message: `💎 CRITICAL HIT! Gained ${xpGain} XP`,
      level: 'success'
    })

    setStats({
      totalSpans: candidateCount,
      matchedSpans: matchedSpans.length,
      avgQuality,
      xpGained: xpGain
    })

    setCurrentToolCall(null)
    setIsTraining(false)

    addTerminalEvent({
      type: 'log',
      message: '✅ Training session complete!',
      level: 'success'
    })
  }

  const handleStartTraining = () => {
    if (!prompt.trim() || !selectedCreature) return
    simulateTraining()
  }

  const handleStopTraining = () => {
    setIsTraining(false)
    addTerminalEvent({
      type: 'log',
      message: '⏹️ Training stopped by user',
      level: 'warning'
    })
  }

  const handleClearLogs = () => {
    setTerminalEvents([])
    setToolCalls([])
    setStats({
      totalSpans: 0,
      matchedSpans: 0,
      avgQuality: 0,
      xpGained: 0
    })
    setTrajectoryState({
      phase: 'idle',
      candidateSpans: 0,
      matchedSpans: [],
      qualityThreshold: 0.7,
      avgSimilarity: 0,
      avgQuality: 0
    })
  }

  const handleBatchIngest = async (files: File[]) => {
    setIsIngesting(true)
    setIsTraining(true)

    addTerminalEvent({
      type: 'log',
      message: `📥 Starting batch ingestion of ${files.length} .md files...`,
      level: 'info'
    })

    try {
      const diamondSpans = await processMDFiles(files, (current, total, filename) => {
        addTerminalEvent({
          type: 'log',
          message: `Processing (${current}/${total}): ${filename}`,
          level: 'info'
        })
      })

      addTerminalEvent({
        type: 'result',
        message: `✅ Extracted ${diamondSpans.length} Diamond Spans!`,
        level: 'success'
      })

      // Simular adição ao ledger
      let totalQuality = 0
      diamondSpans.forEach((span, idx) => {
        totalQuality += span.quality.overall

        if (idx < 5) { // Mostrar apenas primeiros 5
          addTerminalEvent({
            type: 'quality',
            message: `Diamond Span #${idx + 1}: Quality ${span.quality.overall}/100`,
            data: span.quality,
            level: 'success'
          })
        }
      })

      const avgQuality = totalQuality / diamondSpans.length / 100
      const xpGained = Math.floor(diamondSpans.length * 10 * avgQuality)

      addTerminalEvent({
        type: 'critical_hit',
        message: `💎 MASSIVE GAIN! +${xpGained} XP from ${diamondSpans.length} Diamond Spans`,
        level: 'success'
      })

      setStats({
        totalSpans: diamondSpans.length,
        matchedSpans: diamondSpans.length,
        avgQuality,
        xpGained
      })
    } catch (error) {
      addTerminalEvent({
        type: 'error',
        message: `Error during batch ingestion: ${error}`,
        level: 'error'
      })
    } finally {
      setIsIngesting(false)
      setIsTraining(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Control Panel */}
      <Card className="m-4 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Training Laboratory</h2>
            {isTraining && (
              <Badge variant="default" className="gap-1">
                <Zap className="h-3 w-3 animate-pulse" />
                {isIngesting ? 'Ingesting' : 'Training'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCreatureId}
              onChange={(e) => setSelectedCreatureId(e.target.value)}
              disabled={isTraining}
              className="px-3 py-1 border rounded text-sm"
            >
              {creatures.map(creature => (
                <option key={creature.id} value={creature.id}>
                  {creature.name} (Level {(creature as any).level || 1})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Tabs */}
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Training</TabsTrigger>
            <TabsTrigger value="batch">Batch Ingestion</TabsTrigger>
          </TabsList>

          {/* Manual Training */}
          <TabsContent value="manual" className="space-y-4 mt-4">

            <Textarea
              placeholder="Enter training prompt... (e.g., 'Explain quantum computing in simple terms')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isTraining}
              className="min-h-20"
            />

            <div className="flex items-center gap-2">
              {!isTraining ? (
                <Button
                  onClick={handleStartTraining}
                  disabled={!prompt.trim() || !selectedCreature}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Training
                </Button>
              ) : (
                <Button
                  onClick={handleStopTraining}
                  variant="destructive"
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Training
                </Button>
              )}

              <Button
                onClick={handleClearLogs}
                variant="outline"
                disabled={isTraining}
              >
                Clear Logs
              </Button>
            </div>
          </TabsContent>

          {/* Batch Ingestion */}
          <TabsContent value="batch" className="mt-4">
            <DataIngestionPanel
              onIngest={handleBatchIngest}
              isProcessing={isIngesting}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Main Panels - 3 columns */}
      <div className="flex-1 grid grid-cols-3 gap-4 px-4 pb-4 min-h-0">
        {/* Left: Terminal */}
        <div className="flex flex-col min-h-0">
          <TrainingTerminal
            events={terminalEvents}
            isRunning={isTraining}
            onClear={handleClearLogs}
            stats={stats}
          />
        </div>

        {/* Center: Trajectory Matching */}
        <div className="flex flex-col min-h-0">
          <TrajectoryMatchingVisualizer state={trajectoryState} />
        </div>

        {/* Right: Tool Calls */}
        <div className="flex flex-col min-h-0">
          <ToolCallingPanel
            toolCalls={toolCalls}
            currentlyRunning={currentToolCall}
          />
        </div>
      </div>
    </div>
  )
}
