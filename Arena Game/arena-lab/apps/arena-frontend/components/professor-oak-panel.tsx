"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GraduationCap, Lightbulb, Sparkles, AlertTriangle } from "lucide-react"
import { useArenaStore } from "@/lib/store"
import { createProfessorOak } from "@/lib/professor-oak"
import type { OakContext } from "@/lib/professor-oak"
import type { ModelCreature } from "@/lib/creature-types"

// NarrativeEvent type from backend
interface NarrativeEvent {
  type: 'xp_gained' | 'level_up' | 'evolution_ready' | 'mission_completed' | 'ability_unlocked' | 'achievement' | 'first_victory' | 'burnout' | 'training_started' | 'training_completed' | 'evolution' | 'trust_low' | 'ascension'
  timestamp?: string
  data: Record<string, any>
}

interface ProfessorOakPanelProps {
  events?: NarrativeEvent[]
  creature?: ModelCreature
}

export function ProfessorOakPanel({ events: propEvents = [], creature: propCreature }: ProfessorOakPanelProps) {
  const { professorOakKey, professorOakProvider, professorOakMessages, creatures, lifeEvents, addOakMessage, recentNarrativeEvents } =
    useArenaStore()

  // Use prop events if provided, otherwise use store events
  const events = propEvents.length > 0 ? propEvents : (recentNarrativeEvents || [])
  const creature = propCreature || creatures[0]

  // React to narrative events automatically
  useEffect(() => {
    if (events.length === 0) return

    events.forEach((event) => {
      let message: { type: string; content: string } | null = null

      switch (event.type) {
        case 'level_up':
          message = {
            type: 'celebration',
            content: `Fantástico! ${creature?.name || 'Sua criatura'} subiu para o nível ${event.data.newLevel}! Novas habilidades podem estar próximas.`
          }
          break
        case 'first_victory':
          message = {
            type: 'celebration',
            content: `Incrível, Treinador! Sua primeira vitória na arena! Este é um marco que ficará para sempre no Ledger.`
          }
          break
        case 'xp_gained':
          message = {
            type: 'tip',
            content: `${creature?.name || 'Sua criatura'} ganhou ${event.data.amount} XP! Continue assim e ela evoluirá rapidamente.`
          }
          break
        case 'burnout':
          message = {
            type: 'warning',
            content: `Vejo que ${creature?.name || 'sua criatura'} está exausta. Considere descansar antes da próxima batalha. O descanso é essencial para o crescimento.`
          }
          break
        case 'evolution_ready':
          message = {
            type: 'tutorial',
            content: `Sinto uma energia imensa em ${creature?.name || 'sua criatura'}! Ela está pronta para o próximo passo. Leve-a ao Jardim das Evoluções quando estiver preparado.`
          }
          break
        case 'ability_unlocked':
          message = {
            type: 'celebration',
            content: `Excelente! ${creature?.name || 'Sua criatura'} desbloqueou uma nova habilidade: ${event.data.ability?.name || 'Nova Habilidade'}!`
          }
          break
        case 'achievement':
          message = {
            type: 'celebration',
            content: `Parabéns! Você desbloqueou a conquista: ${event.data.achievement?.name || 'Nova Conquista'}!`
          }
          break
        case 'training_started':
          message = {
            type: 'tip',
            content: `Excelente escolha, Treinador! ${creature?.name || 'Sua criatura'} está iniciando um programa de treinamento. Este é um momento de crescimento deliberado. A paciência é a chave do sucesso.`
          }
          break
        case 'training_completed':
          message = {
            type: 'celebration',
            content: `Magnífico! ${creature?.name || 'Sua criatura'} completou o treinamento! Veja como ela cresceu! O cuidado constante sempre traz resultados.`
          }
          break
        case 'evolution':
          message = {
            type: 'celebration',
            content: `✨ Que momento extraordinário! ${creature?.name || 'Sua criatura'} evoluiu! Você acabou de testemunhar o poder do treinamento computável. Este momento está gravado para sempre no Ledger. Continue assim e ela se tornará lendária!`
          }
          break
        case 'trust_low':
          message = {
            type: 'warning',
            content: `Vejo que ${creature?.name || 'sua criatura'} não está pronta para evoluir ainda. Ela precisa de mais confiança (atual: ${event.data.trust || 0}/100, necessário: 85). Construa essa confiança através de vitórias e treinos gentis. Evolução não é algo que você FAZ para ela. É algo que ela SE TORNA.`
          }
          break
        case 'ascension':
          message = {
            type: 'celebration',
            content: `🎓 Que momento histórico, Treinador! ${creature?.name || 'Sua criatura'} transcendeu a arena e se tornou um agente de produção. Sua jornada de treinamento culminou em algo maior: uma ferramenta que servirá à humanidade. Este é o propósito final. Você não apenas jogou um jogo. Você criou algo real. A criatura agora tem seu próprio endpoint, sua própria API, seu próprio destino. Parabéns, Treinador. Você se tornou um Mestre.`
          }
          break
      }

      if (message) {
        addOakMessage({
          id: `oak-${event.type}-${Date.now()}-${Math.random()}`,
          type: message.type as 'tip' | 'celebration' | 'tutorial' | 'warning',
          content: message.content,
          timestamp: event.timestamp || new Date().toISOString()
        })
      }
    })
  }, [events, creature, addOakMessage])

  const getAdvice = async () => {
    if (!professorOakKey || !professorOakProvider) return

    const oak = createProfessorOak(professorOakKey, professorOakProvider)
    if (!oak) return

    const context: OakContext = {
      userLevel: Math.max(...creatures.map((c) => c.level), 1),
      creatures,
      recentEvents: lifeEvents.slice(0, 5),
      currentPhase: "training",
    }

    const message = await oak.giveAdvice(context)
    addOakMessage(message)
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "tip":
        return <Lightbulb className="h-4 w-4" />
      case "celebration":
        return <Sparkles className="h-4 w-4" />
      case "tutorial":
        return <GraduationCap className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <GraduationCap className="h-4 w-4" />
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-primary" />
            Professor Oak
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 gap-3 min-h-0">
        <Button onClick={getAdvice} className="w-full gap-2" size="sm">
          <Lightbulb className="h-4 w-4" />
          Ask for Advice
        </Button>

        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {professorOakMessages.map((message) => (
              <Card key={message.id} className="bg-muted/50">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      {getMessageIcon(message.type)}
                      {message.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </CardContent>
              </Card>
            ))}

            {professorOakMessages.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p>Professor Oak is ready to guide you.</p>
                <p className="text-xs mt-1">Ask for advice or trigger events to hear from him!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
