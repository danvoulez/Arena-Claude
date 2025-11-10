"use client"

import type React from "react"

import type { ModelCreature } from "@/lib/creature-types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Heart, Zap, TrendingUp, Sparkles, Target, Lightbulb, Brain } from "lucide-react"
import { getStatusEffectInfo, getXPForLevel } from "@/lib/creature-engine"
import { useToast } from "@/hooks/use-toast"

interface CreatureCardProps {
  creature: ModelCreature
  onRest?: () => void
  onSelect?: () => void
  isSelected?: boolean
}

export function CreatureCard({ creature, onRest, onSelect, isSelected }: CreatureCardProps) {
  const { toast } = useToast()

  const healthPercent = (creature.health / creature.maxHealth) * 100
  const staminaPercent = (creature.stamina / creature.maxStamina) * 100
  const xpForNextLevel = getXPForLevel(creature.level + 1)
  const currentLevelXP = getXPForLevel(creature.level)
  const xpProgress = ((creature.xp - currentLevelXP) / (xpForNextLevel - currentLevelXP)) * 100

  const winRate = creature.totalBattles > 0 ? (creature.winCount / creature.totalBattles) * 100 : 0

  const handleRest = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRest) {
      onRest()
      toast({
        title: `${creature.name} is resting`,
        description: "HP and Stamina restored. Status effects cleared.",
      })
    }
  }

  return (
    <Card
      className={`p-4 space-y-3 hover:border-primary/50 transition-all cursor-pointer ${
        isSelected ? "border-primary border-2" : ""
      }`}
      onClick={onSelect}
      style={{ borderTopColor: creature.color }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{creature.name}</h3>
            <Badge variant="outline" className="text-xs">
              Lv.{creature.level}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{creature.provider}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Win Rate</div>
          <div className="font-bold" style={{ color: creature.color }}>
            {winRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Status Effects */}
      {creature.statusEffects.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {creature.statusEffects.map((effect) => {
            const info = getStatusEffectInfo(effect)
            return (
              <Badge key={effect} variant="secondary" className="text-xs">
                <span className="mr-1">{info.icon}</span>
                {effect}
              </Badge>
            )
          })}
        </div>
      )}

      {/* HP Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3 w-3" />
            <span>HP</span>
          </div>
          <span className="font-mono font-medium">
            {creature.health}/{creature.maxHealth}
          </span>
        </div>
        <Progress value={healthPercent} className="h-2" style={{ backgroundColor: "rgba(239, 68, 68, 0.2)" }} />
      </div>

      {/* Stamina Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Zap className="h-3 w-3" />
            <span>Stamina</span>
          </div>
          <span className="font-mono font-medium">
            {creature.stamina}/{creature.maxStamina}
          </span>
        </div>
        <Progress value={staminaPercent} className="h-2" style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }} />
      </div>

      {/* XP Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>XP</span>
          </div>
          <span className="font-mono font-medium">
            {creature.xp}/{xpForNextLevel}
          </span>
        </div>
        <Progress value={xpProgress} className="h-2" style={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-pink-400" />
          <span className="text-muted-foreground">Charisma:</span>
          <span className="font-medium">{creature.charisma}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Target className="h-3 w-3 text-green-400" />
          <span className="text-muted-foreground">Accuracy:</span>
          <span className="font-medium">{creature.accuracy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lightbulb className="h-3 w-3 text-yellow-400" />
          <span className="text-muted-foreground">Creativity:</span>
          <span className="font-medium">{creature.creativity}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Brain className="h-3 w-3 text-blue-400" />
          <span className="text-muted-foreground">Reasoning:</span>
          <span className="font-medium">{creature.reasoning}</span>
        </div>
      </div>

      {/* Traits Permanentes */}
      {creature.traits && creature.traits.length > 0 && (
        <div className="pt-2 border-t">
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

      {/* Buffs Ativos */}
      {creature.activeBuffs && creature.activeBuffs.length > 0 && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-1">Active Buffs</div>
          <div className="space-y-1">
            {creature.activeBuffs.map((buff, idx) => {
              const expiresAt = new Date(buff.expiresAt)
              const hoursLeft = Math.max(0, (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))
              
              return (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {buff.buffs.map((b, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          +{b.amount} {b.stat}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-muted-foreground">{hoursLeft.toFixed(1)}h</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trust Indicator (se disponível) */}
      {(creature as any).trust !== undefined && (
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Trust</span>
            <div className="flex items-center gap-2">
              <Progress 
                value={(creature as any).trust} 
                className="h-1.5 w-20" 
                style={{ backgroundColor: "rgba(147, 51, 234, 0.2)" }}
              />
              <span className="font-mono font-medium">{(creature as any).trust}/100</span>
            </div>
          </div>
          {(creature as any).trust < 85 && (
            <p className="text-xs text-amber-600 mt-1">
              Needs {85 - (creature as any).trust} more trust to evolve
            </p>
          )}
        </div>
      )}

      {/* Record */}
      <div className="flex items-center justify-between text-xs pt-2 border-t">
        <div className="flex gap-3 text-muted-foreground">
          <span className="text-green-400">{creature.winCount}W</span>
          <span className="text-red-400">{creature.lossCount}L</span>
          <span className="text-gray-400">{creature.drawCount}D</span>
        </div>
        <span className="text-muted-foreground">{creature.totalBattles} battles</span>
      </div>

      {onRest && (creature.health < creature.maxHealth || creature.stamina < creature.maxStamina) && (
        <Button onClick={handleRest} variant="outline" size="sm" className="w-full gap-2 bg-transparent">
          <Zap className="h-3 w-3" />
          Rest & Recover
        </Button>
      )}
    </Card>
  )
}
