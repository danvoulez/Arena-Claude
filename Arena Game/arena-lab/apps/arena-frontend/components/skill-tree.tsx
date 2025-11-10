"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Sparkles } from "lucide-react"
import { SKILL_TREE, getUnlockedSkills, type Skill } from "@/lib/progression-system"
import { useState } from "react"

interface SkillTreeProps {
  currentLevel: number
}

export function SkillTree({ currentLevel }: SkillTreeProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const unlockedSkills = getUnlockedSkills(currentLevel)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-electric-400" />
        <h3 className="text-lg font-bold text-white">Skill Tree</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SKILL_TREE.map((skill) => {
          const isUnlocked = skill.unlockLevel <= currentLevel
          const isSelected = selectedSkill?.id === skill.id

          return (
            <Card
              key={skill.id}
              className={`cursor-pointer border p-4 transition-all ${
                isUnlocked
                  ? isSelected
                    ? "border-electric-400 bg-electric-500/10"
                    : "border-electric-400/20 bg-dark-300/50 hover:border-electric-400/40"
                  : "border-gray-700/20 bg-dark-400/20 opacity-50"
              }`}
              onClick={() => isUnlocked && setSelectedSkill(isSelected ? null : skill)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-dark-400/50 text-xl">
                  {isUnlocked ? skill.icon : <Lock className="h-5 w-5 text-gray-500" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold ${isUnlocked ? "text-white" : "text-gray-500"}`}>{skill.name}</h4>
                    {!isUnlocked && (
                      <Badge variant="outline" className="text-xs">
                        Lvl {skill.unlockLevel}
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${isUnlocked ? "text-gray-400" : "text-gray-600"}`}>{skill.description}</p>
                  {isUnlocked && <p className="text-xs font-medium text-electric-400">{skill.effect}</p>}
                </div>
              </div>

              {isSelected && isUnlocked && (
                <div className="mt-3 border-t border-electric-400/20 pt-3 text-sm text-gray-300">
                  <p className="font-medium text-white">How it works:</p>
                  <p className="mt-1 leading-relaxed">{skill.tutorial}</p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
