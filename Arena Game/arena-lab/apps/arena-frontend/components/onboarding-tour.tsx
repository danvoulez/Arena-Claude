"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, ArrowRight, Sparkles } from "lucide-react"
import { ONBOARDING_STEPS } from "@/lib/progression-system"

interface OnboardingTourProps {
  currentStep: number
  onComplete: (step: number) => void
  onSkip: () => void
}

export function OnboardingTour({ currentStep, onComplete, onSkip }: OnboardingTourProps) {
  const [visible, setVisible] = useState(true)
  const step = ONBOARDING_STEPS[currentStep - 1]

  if (!visible || !step) return null

  const progress = (currentStep / ONBOARDING_STEPS.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="relative w-full max-w-2xl border-electric-400/20 bg-dark-200 p-8">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
          onClick={onSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-electric-500/20 text-2xl">
            <Sparkles className="h-6 w-6 text-electric-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </div>
            <h2 className="text-2xl font-bold text-white">{step.title}</h2>
          </div>
        </div>

        <Progress value={progress} className="mb-6 h-2" />

        <div className="space-y-4 text-gray-300">
          <p className="text-lg font-medium text-white">{step.description}</p>
          <p className="leading-relaxed">{step.tutorial}</p>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={onSkip} className="text-gray-400 hover:text-white">
            Skip Tutorial
          </Button>
          <Button
            onClick={() => {
              onComplete(currentStep)
              if (currentStep >= ONBOARDING_STEPS.length) {
                setVisible(false)
              }
            }}
            className="bg-electric-500 hover:bg-electric-600"
          >
            {currentStep >= ONBOARDING_STEPS.length ? "Finish" : "Next Step"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
