"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useArenaStore } from "@/lib/store"
import { TRAINING_PROGRAMS, startTraining, canTrain, getTrainingProgress, getBuffedStats } from "@/lib/training-engine"
import type { TrainingType, ModelCreature } from "@/lib/creature-types"
import { Zap, Cpu, Sparkles, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TrainingCenter() {
  const { creatures, trainingSessions, updateCreature, addTrainingSession, addLifeEvent, setRecentNarrativeEvents } = useArenaStore()
  const [selectedCreature, setSelectedCreature] = useState<ModelCreature | null>(null)
  const { toast } = useToast()

  const handleStartTraining = async (creatureId: string, programId: TrainingType) => {
    const creature = creatures.find((c) => c.id === creatureId)
    if (!creature) return

    // Validação local (pode ser duplicada no backend, mas útil para UX)
    const { canTrain: allowed, reason } = canTrain(creature)
    if (!allowed) {
      toast({
        title: "Cannot Train",
        description: reason,
        variant: "destructive",
      })
      return
    }

    try {
      // Call real API
      const response = await fetch(`/api/arena/creatures/${creatureId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Training failed')
      }

      const data = await response.json()

      // Map backend Creature to frontend ModelCreature
      const mapCreatureToModel = (creature: any): Partial<ModelCreature> => {
        return {
          xp: creature.xp || 0,
          level: creature.level || 1,
          // Marcar como em treino
          isTraining: true,
          lastUsed: new Date().toISOString()
        }
      }

      // Atualizar criatura
      updateCreature(creatureId, mapCreatureToModel(data.creature))

      // Adicionar sessão de treino (mapear formato backend para frontend)
      const frontendSession = {
        id: data.trainingSession.id,
        creatureId: data.trainingSession.creatureId,
        programId: data.trainingSession.programId as TrainingType,
        startedAt: data.trainingSession.startedAt,
        completesAt: data.trainingSession.completesAt,
        status: data.trainingSession.status as 'training' | 'completed' | 'failed'
      }
      addTrainingSession(frontendSession)

      // Processar eventos narrativos
      setRecentNarrativeEvents(data.narrativeEvents || [])

      // Completar treino automaticamente após duração
      const duration = TRAINING_PROGRAMS[programId].duration * 60 * 1000 // minutos → ms
      setTimeout(async () => {
        await handleCompleteTraining(frontendSession.id)
      }, duration)

      toast({
        title: "Training Started!",
        description: `${creature.name} has started ${TRAINING_PROGRAMS[programId].name}. Will complete in ${TRAINING_PROGRAMS[programId].duration} minutes.`,
      })
    } catch (error: any) {
      console.error("[Arena] Training start failed:", error)
      toast({
        title: "Training Failed",
        description: error.message || "Failed to start training. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCompleteTraining = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/arena/sessions/${sessionId}/complete`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete training')
      }

      const data = await response.json()

      // Map backend Creature to frontend ModelCreature
      const mapCreatureToModel = (creature: any, trainingData?: any): Partial<ModelCreature> => {
        const base: Partial<ModelCreature> = {
          xp: creature.xp || 0,
          level: creature.level || 1,
          isTraining: false,
          lastUsed: new Date().toISOString()
        }

        // Aplicar buffs/traits se fornecidos
        if (trainingData) {
          // Aplicar traits (permanentes)
          if (trainingData.traitsGained && trainingData.traitsGained.length > 0) {
            const currentCreature = creatures.find(c => c.id === creature.id)
            base.traits = [...new Set([
              ...(currentCreature?.traits || []),
              ...trainingData.traitsGained
            ])]
          }

          // Aplicar buffs (temporários)
          if (trainingData.buffsApplied && trainingData.buffsApplied.length > 0) {
            const currentCreature = creatures.find(c => c.id === creature.id)
            base.activeBuffs = [
              ...(currentCreature?.activeBuffs || []),
              ...trainingData.buffsApplied.map((buff: any) => ({
                programId: buff.programId,
                appliedAt: buff.appliedAt,
                expiresAt: buff.expiresAt,
                buffs: buff.buffs,
                traits: buff.traits || []
              }))
            ]
          }

          // Aplicar status effects
          if (trainingData.statusEffectsGained && trainingData.statusEffectsGained.length > 0) {
            const currentCreature = creatures.find(c => c.id === creature.id)
            base.statusEffects = [...new Set([
              ...(currentCreature?.statusEffects || []),
              ...trainingData.statusEffectsGained
            ])]
          }

          // Aplicar cooldown
          if (trainingData.cooldownUntil) {
            base.trainingCooldownUntil = trainingData.cooldownUntil
          }
        }

        return base
      }

      // Atualizar criatura com buffs/traits aplicados
      updateCreature(data.creature.id, mapCreatureToModel(data.creature, {
        buffsApplied: data.buffsApplied,
        traitsGained: data.traitsGained,
        statusEffectsGained: data.statusEffectsGained,
        cooldownUntil: data.cooldownUntil
      }))

      // Atualizar sessão
      const session = trainingSessions.find(s => s.id === sessionId)
      if (session) {
        // updateTrainingSession já existe no store
        const { updateTrainingSession } = useArenaStore.getState()
        updateTrainingSession(sessionId, { status: 'completed' })
      }

      // Processar eventos narrativos
      setRecentNarrativeEvents(data.narrativeEvents || [])

      // Criar mensagem de sucesso com buffs/traits
      const traitsMsg = data.traitsGained && data.traitsGained.length > 0 
        ? ` Gained traits: ${data.traitsGained.join(', ')}.` 
        : ''
      const buffsMsg = data.buffsApplied && data.buffsApplied.length > 0
        ? ` Active buffs: ${data.buffsApplied[0].buffs.map((b: any) => `+${b.amount} ${b.stat}`).join(', ')}.`
        : ''

      toast({
        title: "Training Complete!",
        description: `${data.creature.name} completed training!${traitsMsg}${buffsMsg}`,
      })
    } catch (error: any) {
      console.error("[Arena] Training completion failed:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const activeSessions = trainingSessions.filter((s) => s.status === "training")
  const completedSessions = trainingSessions.filter((s) => s.status === "completed")

  if (creatures.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-lg mb-2">No Creatures to Train</h3>
          <p className="text-sm text-muted-foreground">Create creatures first to start training them.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Training Center</h2>
            <p className="text-sm text-muted-foreground">Send your creatures to training and watch them evolve</p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Zap className="h-3 w-3" />
            {activeSessions.length} Active
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="programs" className="flex-1 flex flex-col">
        <TabsList className="mx-6 mt-4 w-auto">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="active">Active ({activeSessions.length})</TabsTrigger>
          <TabsTrigger value="creatures">My Creatures</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="flex-1 p-6 space-y-4">
          <div className="grid gap-4">
            {Object.values(TRAINING_PROGRAMS).map((program) => (
              <Card key={program.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{program.name}</h3>
                      {program.requiresGPU ? (
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          GPU
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Cpu className="h-3 w-3" />
                          CPU
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {program.duration}m
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">CD: {program.cooldown}m</div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Buffs:</span>
                    {program.buffs.map((buff, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        +{buff.amount} {buff.stat}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Traits:</span>
                    {program.traits.map((trait) => (
                      <Badge key={trait} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Effects:</span>
                    {program.statusEffects.map((effect) => (
                      <Badge key={effect} variant="secondary" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                    onChange={(e) => {
                      const creature = creatures.find((c) => c.id === e.target.value)
                      setSelectedCreature(creature || null)
                    }}
                  >
                    <option value="">Select creature...</option>
                    {creatures.map((creature) => (
                      <option key={creature.id} value={creature.id}>
                        {creature.name} (Lv.{creature.level})
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    disabled={!selectedCreature || !canTrain(selectedCreature).canTrain}
                    onClick={() => selectedCreature && handleStartTraining(selectedCreature.id, program.id)}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Train
                  </Button>
                </div>

                {selectedCreature && !canTrain(selectedCreature).canTrain && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    {canTrain(selectedCreature).reason}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="flex-1 p-6">
          <ScrollArea className="h-full">
            {activeSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Zap className="h-12 w-12 mb-2 opacity-50" />
                <p>No active training sessions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => {
                  const creature = creatures.find((c) => c.id === session.creatureId)
                  const program = TRAINING_PROGRAMS[session.programId]
                  const progress = getTrainingProgress(session)

                  return (
                    <Card key={session.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{creature?.name}</h3>
                          <p className="text-sm text-muted-foreground">{program.name}</p>
                        </div>
                        <Badge variant="secondary">
                          <Zap className="h-3 w-3 mr-1 animate-pulse" />
                          Training
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-mono">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Completes at {new Date(session.completesAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="creatures" className="flex-1 p-6">
          <ScrollArea className="h-full">
            <div className="grid gap-4">
              {creatures.map((creature) => {
                const buffed = getBuffedStats(creature)
                const hasBuffs = creature.activeBuffs.length > 0
                const { canTrain: allowed, reason } = canTrain(creature)

                return (
                  <Card key={creature.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{creature.name}</h3>
                          <Badge variant="outline">Lv.{creature.level}</Badge>
                          {creature.isTraining && (
                            <Badge variant="secondary">
                              <Zap className="h-3 w-3 mr-1 animate-pulse" />
                              Training
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{creature.provider}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className="text-sm font-medium">{allowed ? "✅ Ready" : "⏳ Cooldown"}</div>
                      </div>
                    </div>

                    {creature.traits.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-muted-foreground mb-1">Traits</div>
                        <div className="flex flex-wrap gap-1">
                          {creature.traits.map((trait) => (
                            <Badge key={trait} variant="secondary" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasBuffs && (
                      <div className="mb-3 p-2 bg-primary/5 rounded border border-primary/20">
                        <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Active Buffs
                        </div>
                        <div className="space-y-2">
                          {creature.activeBuffs.map((buff, idx) => {
                            const program = TRAINING_PROGRAMS[buff.programId]
                            const expiresIn = Math.ceil(
                              (new Date(buff.expiresAt).getTime() - Date.now()) / (60 * 60 * 1000),
                            )

                            return (
                              <div key={idx} className="text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{program.name}</span>
                                  <span className="text-muted-foreground">{expiresIn}h left</span>
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {buff.buffs.map((b, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      +{b.amount} {b.stat}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Charisma:</span>
                        <span className={`ml-1 font-medium ${hasBuffs ? "text-primary" : ""}`}>
                          {buffed.charisma}
                          {buffed.charisma !== creature.charisma && (
                            <span className="text-primary text-xs ml-1">(+{buffed.charisma - creature.charisma})</span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className={`ml-1 font-medium ${hasBuffs ? "text-primary" : ""}`}>
                          {buffed.accuracy}
                          {buffed.accuracy !== creature.accuracy && (
                            <span className="text-primary text-xs ml-1">(+{buffed.accuracy - creature.accuracy})</span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Creativity:</span>
                        <span className={`ml-1 font-medium ${hasBuffs ? "text-primary" : ""}`}>
                          {buffed.creativity}
                          {buffed.creativity !== creature.creativity && (
                            <span className="text-primary text-xs ml-1">
                              (+{buffed.creativity - creature.creativity})
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reasoning:</span>
                        <span className={`ml-1 font-medium ${hasBuffs ? "text-primary" : ""}`}>
                          {buffed.reasoning}
                          {buffed.reasoning !== creature.reasoning && (
                            <span className="text-primary text-xs ml-1">
                              (+{buffed.reasoning - creature.reasoning})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {!allowed && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        {reason}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
