"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useArenaStore } from "@/lib/store"
import { Swords, TrendingUp, ThumbsUp, X, Loader2, ScrollText, AlertCircle, Sparkles } from "lucide-react"
import type { ModelCreature } from "@/lib/creature-types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CreatureCard } from "./creature-card"
import { EvolutionCeremony } from "./evolution-ceremony"
// Removed: import { executeBattle } from "@/lib/battle-engine"
// Battles now use real API calls
import { useToast } from "@/hooks/use-toast"
import { EvolutionTimeline } from "./evolution-timeline"
import { Leaderboard } from "./leaderboard"
import { CreatureLegend } from "./creature-legend"
import { ProductionLab } from "./production-lab"

export function ArenaView() {
  const { creatures, duelRecords, lifeEvents, updateCreature, addDuelRecord, addLifeEvent, restCreature, setRecentNarrativeEvents } =
    useArenaStore()
  const [evolutionCeremony, setEvolutionCeremony] = useState<{
    creature: ModelCreature
    evolution: any
  } | null>(null)

  const [creatureAId, setCreatureAId] = useState(creatures[0]?.id || "")
  const [creatureBId, setCreatureBId] = useState(creatures[1]?.id || "")
  const [prompt, setPrompt] = useState("")
  const [currentBattle, setCurrentBattle] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const creatureA = creatures.find((c) => c.id === creatureAId)
  const creatureB = creatures.find((c) => c.id === creatureBId)

  const sortedCreatures = [...creatures].sort((a, b) => {
    const winRateA = a.totalBattles > 0 ? a.winCount / a.totalBattles : 0
    const winRateB = b.totalBattles > 0 ? b.winCount / b.totalBattles : 0
    return winRateB - winRateA
  })

  const handleStartBattle = async () => {
    if (!prompt.trim() || !creatureA || !creatureB || !creatureAId || !creatureBId) {
      toast({
        title: "Missing Information",
        description: "Please select two creatures and enter a prompt.",
        variant: "destructive",
      })
      return
    }

    if (creatureA.health <= 0 || creatureB.health <= 0) {
      toast({
        title: "Cannot Battle",
        description: "One or both creatures have no HP. Rest them first.",
        variant: "destructive",
      })
      return
    }

    if (creatureA.stamina < 10 || creatureB.stamina < 10) {
      toast({
        title: "Low Stamina",
        description: "Creatures need at least 10 stamina to battle.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Call real API
      const response = await fetch('/api/arena/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatureAId: creatureA.id,
          creatureBId: creatureB.id,
          prompt: prompt.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Battle failed')
      }

      const data = await response.json()

      // Map backend Creature to frontend ModelCreature format
      const mapCreatureToModel = (creature: any): Partial<ModelCreature> => {
        return {
          xp: creature.xp || 0,
          level: creature.level || 1,
          // Map ELO to win/loss stats (simplified mapping)
          winCount: creature.wins || 0,
          lossCount: creature.losses || 0,
          drawCount: creature.draws || 0,
          totalBattles: (creature.wins || 0) + (creature.losses || 0) + (creature.draws || 0),
          // Update health/stamina based on battle result (simplified)
          health: creatureA.health - (data.battleResult.winner === 'B' ? 10 : data.battleResult.winner === 'A' ? 0 : 5),
          stamina: creatureA.stamina - 15,
          lastUsed: new Date().toISOString()
        }
      }

      // Update creatures with state from API
      updateCreature(creatureA.id, mapCreatureToModel(data.updatedCreatureA))
      updateCreature(creatureB.id, mapCreatureToModel(data.updatedCreatureB))

      // Create duel record from API response
      const duelRecord: DuelRecord = {
        id: `duel_${data.battleResult.battleId}`,
        traceId: data.battleResult.battleId.toString(),
        modelAId: creatureA.id,
        modelBId: creatureB.id,
        prompt: prompt.trim(),
        responseA: data.battleResult.responseA || '',
        responseB: data.battleResult.responseB || '',
        winner: data.battleResult.winner === 'A' ? 'A' : data.battleResult.winner === 'B' ? 'B' : 'draw',
        xpGained: {
          A: data.battleResult.eloChanges.creatureA > 0 ? 150 : 25,
          B: data.battleResult.eloChanges.creatureB > 0 ? 150 : 25
        },
        damageDealt: {
          A: data.battleResult.winner === 'A' ? 0 : 10,
          B: data.battleResult.winner === 'B' ? 0 : 10
        },
        staminaCost: { A: 15, B: 15 },
        statusApplied: { A: [], B: [] },
        latencyA: data.battleResult.metrics.latencyA,
        latencyB: data.battleResult.metrics.latencyB,
        tokensA: data.battleResult.metrics.tokensA,
        tokensB: data.battleResult.metrics.tokensB,
        timestamp: new Date().toISOString()
      }
      addDuelRecord(duelRecord)

      // Process narrative events
      const allEvents = [
        ...(data.narrativeEvents.creatureA || []),
        ...(data.narrativeEvents.creatureB || [])
      ]

      // Store events for ProfessorOakPanel to react to
      setRecentNarrativeEvents(allEvents)

      allEvents.forEach((event: any) => {
        if (event.type === 'level_up') {
          addLifeEvent({
            id: `event_${Date.now()}_${Math.random()}`,
            creatureId: event.type.includes('A') ? creatureA.id : creatureB.id,
            type: 'levelup',
            description: `Leveled up to ${event.data.newLevel}!`,
            timestamp: new Date().toISOString(),
            metadata: event.data
          })
          
          // Add Oak message for level up
          addOakMessage({
            id: `oak-levelup-${Date.now()}`,
            type: 'celebration',
            content: `Fantástico! ${event.type.includes('A') ? creatureA.name : creatureB.name} subiu para o nível ${event.data.newLevel}!`,
            timestamp: new Date().toISOString()
          })
        } else if (event.type === 'xp_gained') {
          addLifeEvent({
            id: `event_${Date.now()}_${Math.random()}`,
            creatureId: event.type.includes('A') ? creatureA.id : creatureB.id,
            type: 'battle',
            description: `Gained ${event.data.amount} XP from battle`,
            timestamp: new Date().toISOString()
          })
        } else if (event.type === 'first_victory') {
          addOakMessage({
            id: `oak-first-victory-${Date.now()}`,
            type: 'celebration',
            content: `Incrível, Treinador! Sua primeira vitória na arena! Este é um marco que ficará para sempre no Ledger.`,
            timestamp: new Date().toISOString()
          })
        }
      })

      toast({
        title: "Battle Complete!",
        description: `${data.battleResult.winner === "draw" ? "Draw" : data.battleResult.winner === "A" ? creatureA.name : creatureB.name} ${data.battleResult.winner === "draw" ? "declared" : "wins"}!`,
      })

      setCurrentBattle(null)
      setPrompt("")
    } catch (error: any) {
      console.error("[Arena] Battle failed:", error)
      toast({
        title: "Battle Failed",
        description: error.message || "Failed to complete battle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Remove handleVote - battles are now automatic via API
  const handleVote = async (winner: "A" | "B" | "draw") => {
    // This function is now deprecated - battles are executed automatically
    // Keeping for backwards compatibility but it does nothing
    console.warn("handleVote is deprecated - battles are now automatic via API")
  }

  // Handle evolution
  const handleEvolve = async (creatureId: string) => {
    try {
      const response = await fetch(`/api/arena/evolve/${creatureId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Evolution failed')
      }

      const data = await response.json()

      // Map backend Creature to frontend ModelCreature
      const mapCreatureToModel = (creature: any): Partial<ModelCreature> => {
        return {
          xp: creature.xp || 0,
          level: creature.level || 1,
          name: creature.name,
          lastUsed: new Date().toISOString()
        }
      }

      // Atualizar criatura
      updateCreature(creatureId, mapCreatureToModel(data.creature))

      // Mostrar cerimônia
      setEvolutionCeremony({
        creature: { ...creatures.find(c => c.id === creatureId)!, ...mapCreatureToModel(data.creature) } as ModelCreature,
        evolution: data.evolution
      })

      // Processar eventos narrativos
      setRecentNarrativeEvents(data.narrativeEvents || [])

      toast({
        title: "Evolution Complete!",
        description: `${data.creature.name} has evolved!`,
      })
    } catch (error: any) {
      toast({
        title: "Evolution Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (creatures.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-lg mb-2">No Creatures Yet</h3>
          <p className="text-sm text-muted-foreground">Create your first creature to start battling in the arena.</p>
        </Card>
      </div>
    )
  }

  return (
    <>
      {evolutionCeremony && (
        <EvolutionCeremony
          creature={evolutionCeremony.creature}
          evolution={evolutionCeremony.evolution}
          onComplete={() => {
            setEvolutionCeremony(null)
          }}
        />
      )}
      <div className="w-full h-full overflow-auto">
      <Tabs defaultValue="battle" className="w-full h-full flex flex-col">
        <div className="border-b px-6 pt-4">
          <TabsList>
            <TabsTrigger value="battle">Battle Arena</TabsTrigger>
            <TabsTrigger value="creatures">My Creatures</TabsTrigger>
            <TabsTrigger value="dna">DNA</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="legend">Legend</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="history">Battle History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="battle" className="flex-1 p-6 space-y-6 m-0">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-arena/20 flex items-center justify-center">
                  <Swords className="h-6 w-6 text-arena" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-balance">Creature Battle Arena</h1>
                  <p className="text-sm text-muted-foreground">Living LLMs evolve through combat</p>
                </div>
              </div>
            </div>

            {/* Creature Selection */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Challenger A</label>
                <div className="grid gap-2">
                  {creatures.map((creature) => (
                    <div
                      key={creature.id}
                      onClick={() => setCreatureAId(creature.id)}
                      className={creatureAId === creature.id ? "ring-2 ring-primary rounded-lg" : ""}
                    >
                      <CreatureCard
                        creature={creature}
                        isSelected={creatureAId === creature.id}
                        onRest={() => restCreature(creature.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Challenger B</label>
                <div className="grid gap-2">
                  {creatures.map((creature) => (
                    <div
                      key={creature.id}
                      onClick={() => setCreatureBId(creature.id)}
                      className={creatureBId === creature.id ? "ring-2 ring-primary rounded-lg" : ""}
                    >
                      <CreatureCard
                        creature={creature}
                        isSelected={creatureBId === creature.id}
                        onRest={() => restCreature(creature.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Battle Prompt */}
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Battle Prompt</label>
                <Textarea
                  placeholder="Enter your prompt to test both creatures..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24"
                  disabled={isGenerating}
                />
              </div>

              <Button
                onClick={handleStartBattle}
                disabled={!prompt.trim() || isGenerating || creatureAId === creatureBId || !creatureA || !creatureB}
                className="w-full gap-2 bg-arena text-arena-foreground hover:bg-arena/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Battle in Progress...
                  </>
                ) : (
                  <>
                    <Swords className="h-4 w-4" />
                    Start Battle
                  </>
                )}
              </Button>
            </Card>

            {/* Battle Results */}
            {currentBattle && !isGenerating && (
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Choose the Winner</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button onClick={() => handleVote("A")} className="gap-2" size="lg" disabled={isGenerating}>
                    <ThumbsUp className="h-4 w-4" />
                    {creatureA?.name} Wins
                  </Button>
                  <Button
                    onClick={() => handleVote("draw")}
                    variant="outline"
                    className="gap-2"
                    size="lg"
                    disabled={isGenerating}
                  >
                    <X className="h-4 w-4" />
                    Draw
                  </Button>
                  <Button onClick={() => handleVote("B")} className="gap-2" size="lg" disabled={isGenerating}>
                    <ThumbsUp className="h-4 w-4" />
                    {creatureB?.name} Wins
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="creatures" className="flex-1 p-6 m-0">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {creatures.map((creature) => (
                <div key={creature.id} className="space-y-2">
                  <CreatureCard creature={creature} onRest={() => restCreature(creature.id)} />
                  {/* Botão de Evolução (se elegível) */}
                  {(creature as any).trust >= 85 && creature.level >= 15 && (
                    <Button
                      onClick={() => handleEvolve(creature.id)}
                      className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      size="sm"
                    >
                      <Sparkles className="h-4 w-4" />
                      Evolve
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dna" className="flex-1 p-6 m-0">
          <div className="max-w-6xl mx-auto">
            {creatureAId && (
              <EvolutionTimeline creatureId={creatureAId} />
            )}
            {!creatureAId && (
              <div className="text-center text-muted-foreground py-8">
                Selecione uma criatura para ver seu DNA
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="flex-1 p-6 m-0">
          <div className="max-w-6xl mx-auto">
            <Leaderboard />
          </div>
        </TabsContent>

        <TabsContent value="legend" className="flex-1 p-6 m-0">
          <div className="max-w-6xl mx-auto">
            {creatureAId && (
              <CreatureLegend creatureId={creatureAId} />
            )}
            {!creatureAId && (
              <div className="text-center text-muted-foreground py-8">
                Selecione uma criatura para ver sua lenda
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="production" className="flex-1 p-6 m-0">
          <ProductionLab />
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-6 m-0">
          <div className="max-w-6xl mx-auto grid grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Swords className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Battle History</h3>
              </div>
              {duelRecords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Swords className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No battles yet.</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {duelRecords.map((duel) => {
                      const creatureA = creatures.find((c) => c.id === duel.modelAId)
                      const creatureB = creatures.find((c) => c.id === duel.modelBId)

                      return (
                        <div key={duel.id} className="p-3 rounded-lg border space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{creatureA?.name}</span>
                              <span className="text-muted-foreground">vs</span>
                              <span className="font-medium">{creatureB?.name}</span>
                            </div>
                            {duel.winner && (
                              <Badge variant={duel.winner === "draw" ? "secondary" : "default"} className="text-xs">
                                {duel.winner === "draw"
                                  ? "Draw"
                                  : `${duel.winner === "A" ? creatureA?.name : creatureB?.name} Won`}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              XP: {duel.xpGained.A} / {duel.xpGained.B}
                            </span>
                            <span>
                              DMG: {duel.damageDealt.A} / {duel.damageDealt.B}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(duel.timestamp).toLocaleString()}</p>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ScrollText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Life Events</h3>
              </div>
              {lifeEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No events yet.</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {lifeEvents.map((event) => {
                      const creature = creatures.find((c) => c.id === event.creatureId)

                      return (
                        <div key={event.id} className="p-3 rounded-lg bg-muted/30 space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                            <span className="font-medium text-xs">{creature?.name}</span>
                          </div>
                          <p className="text-xs leading-relaxed">{event.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </>
  )
}
