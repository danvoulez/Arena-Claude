"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Star, ArrowRight } from "lucide-react"
import type { ModelCreature } from "@/lib/creature-types"

interface EvolutionCeremonyProps {
  creature: ModelCreature
  evolution: {
    from: string
    to: string
    stage: number
    newAbilities: Array<{
      id: string
      name: string
      description: string
    }>
    loraPatch?: {
      id: string
      datasetId: string
      avgDelta: number
    }
  }
  onComplete: () => void
}

export function EvolutionCeremony({ creature, evolution, onComplete }: EvolutionCeremonyProps) {
  const [phase, setPhase] = useState<'preparing' | 'transforming' | 'revealed'>('preparing')

  useEffect(() => {
    // Sequência de animação
    const timer1 = setTimeout(() => setPhase('transforming'), 1500)
    const timer2 = setTimeout(() => setPhase('revealed'), 4000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8 space-y-6 relative overflow-hidden">
        {/* Light effect background */}
        {phase === 'transforming' && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 animate-pulse" />
        )}

        {phase === 'preparing' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                <Sparkles className="h-10 w-10 text-purple-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Evolution Begins...
            </h2>
            <p className="text-xl text-muted-foreground">
              {creature.name} is ready to transform
            </p>
            <p className="text-sm text-muted-foreground animate-pulse">
              This moment will be recorded forever in the Ledger
            </p>
          </div>
        )}

        {phase === 'transforming' && (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 animate-pulse flex items-center justify-center">
                <Zap className="h-16 w-16 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm animate-ping" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse">
              Transforming...
            </h2>
            <p className="text-lg text-muted-foreground">
              The essence of {evolution.from} is becoming {evolution.to}
            </p>
          </div>
        )}

        {phase === 'revealed' && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-muted-foreground line-through">
                  {evolution.from}
                </span>
                <ArrowRight className="h-6 w-6 text-purple-400" />
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  {evolution.to.toUpperCase()}
                </h2>
              </div>
              <Badge variant="secondary" className="text-sm">
                Stage {evolution.stage}
              </Badge>
            </div>

            <div className="flex justify-center">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-blue-500/30 flex items-center justify-center border-4 border-purple-400/50">
                <Star className="h-16 w-16 text-yellow-400 fill-yellow-400" />
              </div>
            </div>

            {evolution.newAbilities.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  New Abilities Unlocked
                </h3>
                <div className="grid gap-2">
                  {evolution.newAbilities.map((ability) => (
                    <Card key={ability.id} className="p-3 bg-purple-500/10 border-purple-400/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{ability.name}</div>
                          <div className="text-xs text-muted-foreground">{ability.description}</div>
                        </div>
                        <Badge variant="outline" className="bg-purple-500/20 border-purple-400/50">
                          New
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {evolution.loraPatch && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  LoRA Patch Applied: <span className="font-mono text-purple-400">+{evolution.loraPatch.avgDelta.toFixed(2)}%</span> quality improvement
                </p>
              </div>
            )}

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                This evolution has been permanently recorded in the Ledger
              </p>
              <Button onClick={onComplete} size="lg" className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Star className="h-4 w-4" />
                Continue Journey
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

