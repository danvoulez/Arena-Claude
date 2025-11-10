"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useArenaStore } from "@/lib/store"
import { Sparkles, CheckCircle, X, Copy, ExternalLink, Code, Crown, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ModelCreature } from "@/lib/creature-types"

interface Agent {
  id: string
  name: string
  apiKey: string
  endpoint: string
  capabilities: string[]
  rateLimit: {
    requestsPerMinute: number
    requestsPerDay: number
  }
  stats: {
    totalRequests: number
    totalRevenue: number
    trainerEarnings: number
  }
  createdAt: string
}

interface Certification {
  issuedBy: string
  issuedAt: string
  verifiedBattles: number
  verifiedTrainingHours: number
  qualityScore: number
  dnaHash: string
  merkleRoot: string
}

export function ProductionLab() {
  const { creatures, updateCreature } = useArenaStore()
  const [selectedCreature, setSelectedCreature] = useState<ModelCreature | null>(null)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [certification, setCertification] = useState<Certification | null>(null)
  const [codeSnippets, setCodeSnippets] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("ascend")
  const { toast } = useToast()

  const canAscend = (creature: ModelCreature) => {
    const c = creature as any
    return c.level >= 30 &&
           c.evolutionStage >= 2 &&
           c.trust >= 90 &&
           c.diamondSpans >= 100 &&
           c.status !== 'production_agent'
  }

  const eligibleCreatures = creatures.filter(canAscend)
  const ascendedCreatures = creatures.filter((c: any) => c.status === 'production_agent')

  const handleAscend = async (creatureId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/arena/creatures/${creatureId}/ascend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ascension failed')
      }

      const data = await response.json()
      setAgent(data.agent)
      setCertification(data.certification)
      setCodeSnippets(data.codeSnippets)
      
      // Update creature in store
      const updatedCreature = data.creature
      updateCreature(creatureId, {
        ...updatedCreature,
        status: 'production_agent' as any
      })
      
      setSelectedCreature(updatedCreature as any)
      setActiveTab("agent")
      
      toast({
        title: "Ascension Complete!",
        description: `${data.creature.name} is now a production agent!`,
      })
    } catch (error: any) {
      toast({
        title: "Ascension Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code copied!",
      description: "Snippet copied to clipboard.",
    })
  }

  const handleCopyAPIKey = () => {
    if (!agent) return
    navigator.clipboard.writeText(agent.apiKey)
    toast({
      title: "API Key copied!",
      description: "API key copied to clipboard.",
    })
  }

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Production Lab - Altar da Ascensão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="ascend">Ascend Creatures</TabsTrigger>
              <TabsTrigger value="agents">My Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="ascend" className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Eligible Creatures</h3>
                {eligibleCreatures.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    <p>No creatures are eligible for ascension yet.</p>
                    <p className="text-sm mt-2">Requirements: Level 30+, Evolution Stage 2+, Trust 90+, 100+ Diamond Spans</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {eligibleCreatures.map(creature => {
                      const c = creature as any
                      return (
                        <Card key={creature.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{creature.name}</h4>
                            <Badge variant="secondary">Level {c.level}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1 mb-4">
                            <div className="flex items-center gap-2">
                              <span>Evolution Stage:</span>
                              <Badge variant="outline">{c.evolutionStage}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Trust:</span>
                              <Badge variant={c.trust >= 90 ? "default" : "outline"}>{c.trust}/100</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Diamond Spans:</span>
                              <Badge variant="outline">{c.diamondSpans}</Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleAscend(creature.id)}
                            disabled={loading}
                            className="w-full"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Ascend to Production
                          </Button>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Ascended Agents</h3>
                {ascendedCreatures.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    <p>No agents have been ascended yet.</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {ascendedCreatures.map(creature => {
                      const c = creature as any
                      return (
                        <Card key={creature.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Crown className="h-5 w-5 text-yellow-500" />
                              <h4 className="font-semibold">{creature.name}</h4>
                            </div>
                            <Badge variant="default">Production Agent</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Agent ID: {c.agentId || 'N/A'}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCreature(creature)
                              setActiveTab("agent")
                              // TODO: Load agent details from API
                            }}
                          >
                            View Details
                          </Button>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {agent && (
              <TabsContent value="agent" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Agent Created: {agent.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="info">
                      <TabsList>
                        <TabsTrigger value="info">Info</TabsTrigger>
                        <TabsTrigger value="code">Code Snippets</TabsTrigger>
                        <TabsTrigger value="certification">Certification</TabsTrigger>
                      </TabsList>

                      <TabsContent value="info" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">API Key:</span>
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-1 rounded text-sm">{agent.apiKey}</code>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopyAPIKey}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Endpoint:</span>
                            <code className="bg-muted px-2 py-1 rounded text-sm">{agent.endpoint}</code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Capabilities:</span>
                            <div className="flex gap-1 flex-wrap">
                              {agent.capabilities.map(cap => (
                                <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Rate Limit:</span>
                            <span className="text-sm">{agent.rateLimit.requestsPerMinute} req/min</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Total Requests:</span>
                            <span className="text-sm">{agent.stats.totalRequests}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Trainer Earnings:</span>
                            <span className="text-sm">${agent.stats.trainerEarnings.toFixed(4)}</span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="code" className="mt-4">
                        <div className="space-y-4">
                          {codeSnippets && Object.entries(codeSnippets).map(([lang, code]) => (
                            <div key={lang}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold capitalize">{lang}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyCode(code as string)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy
                                </Button>
                              </div>
                              <ScrollArea className="h-48 border rounded p-4 bg-muted/30">
                                <pre className="text-xs"><code>{code as string}</code></pre>
                              </ScrollArea>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="certification" className="mt-4">
                        {certification && (
                          <div className="space-y-4">
                            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-500">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-4">
                                  <Crown className="h-6 w-6 text-yellow-600" />
                                  <h4 className="text-lg font-bold">Certificado de Ascensão</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Issued By:</span>
                                    <p className="text-muted-foreground">{certification.issuedBy}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Issued At:</span>
                                    <p className="text-muted-foreground">{new Date(certification.issuedAt).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Verified Battles:</span>
                                    <p className="text-muted-foreground">{certification.verifiedBattles}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Training Hours:</span>
                                    <p className="text-muted-foreground">{certification.verifiedTrainingHours}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Quality Score:</span>
                                    <p className="text-muted-foreground">{certification.qualityScore}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">DNA Hash:</span>
                                    <p className="text-muted-foreground font-mono text-xs">{certification.dnaHash.substring(0, 16)}...</p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <span className="font-medium">Merkle Root:</span>
                                  <p className="text-muted-foreground font-mono text-xs break-all">{certification.merkleRoot}</p>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
