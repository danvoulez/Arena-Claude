/**
 * Creature Legend Component
 * 
 * Displays the complete narrative legend of a creature, generated from
 * its DNA timeline, with chapters, highlights, and cryptographic proof.
 */

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, CheckCircle, BookOpen, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Chapter {
  chapter: number
  title: string
  content: string
  highlightMoments: Array<{
    timestamp: string
    description: string
    spanSeq: number
  }>
  epigraph?: string
}

interface CreatureLegend {
  creatureId: string
  creatureName: string
  title: string
  chapters: Chapter[]
  appendix: {
    verifiedLedgerHashes: string[]
    cryptographicProof: string
    officialCertification: {
      issuedBy: string
      verifiedBattles: number
      verifiedTrainingHours: number
      peerReviewed: boolean
    }
  }
  shareUrl: string
}

interface CreatureLegendProps {
  creatureId: string
}

export function CreatureLegend({ creatureId }: CreatureLegendProps) {
  const [legend, setLegend] = useState<CreatureLegend | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetch(`/api/arena/creatures/${creatureId}/legend`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load legend: ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        setLegend(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load legend:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [creatureId])

  const handleShare = async () => {
    if (!legend) return
    
    const url = `${window.location.origin}${legend.shareUrl}`
    await navigator.clipboard.writeText(url)
    
    // Track share metric (would call API in production)
    try {
      await fetch(`/api/arena/creatures/${creatureId}/legend/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {}) // Ignore errors for metrics
    } catch (e) {
      // Ignore
    }
    
    toast({
      title: "Link copiado!",
      description: "A URL da lenda foi copiada para a área de transferência.",
    })
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading legend...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!legend) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">No legend data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <CardTitle>{legend.title}</CardTitle>
            </div>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Capítulos */}
          {legend.chapters.map((chapter) => (
            <div key={chapter.chapter} className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Capítulo {chapter.chapter}</Badge>
                <h2 className="text-2xl font-bold">
                  {chapter.title}
                </h2>
              </div>
              
              {chapter.epigraph && (
                <p className="text-sm italic text-muted-foreground mb-4 border-l-4 border-primary pl-4">
                  "{chapter.epigraph}"
                </p>
              )}
              
              <div className="prose max-w-none mb-4 text-sm leading-relaxed">
                {chapter.content.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>
              
              {chapter.highlightMoments.length > 0 && (
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Momentos Destacados
                  </h3>
                  <ul className="space-y-2">
                    {chapter.highlightMoments.map((moment, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <div className="flex-1">
                          <span>{moment.description}</span>
                          <span className="text-muted-foreground ml-2">
                            ({new Date(moment.timestamp).toLocaleDateString()})
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {legend.chapters.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              A lenda ainda está sendo escrita...
            </div>
          )}

          {/* Apêndice */}
          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Apêndice: Prova Criptográfica
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>
                  <strong>Hashes Verificáveis:</strong> {legend.appendix.verifiedLedgerHashes.length} spans do Ledger
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>
                  <strong>Merkle Root:</strong> <code className="text-xs bg-muted px-1 rounded">{legend.appendix.cryptographicProof}</code>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>
                  <strong>Emitido por:</strong> {legend.appendix.officialCertification.issuedBy}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>
                  <strong>Batalhas Verificadas:</strong> {legend.appendix.officialCertification.verifiedBattles}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>
                  <strong>Horas de Treino:</strong> {legend.appendix.officialCertification.verifiedTrainingHours}h
                </span>
              </div>
              {legend.appendix.officialCertification.peerReviewed && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <Badge variant="default">Revisado por Pares</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

