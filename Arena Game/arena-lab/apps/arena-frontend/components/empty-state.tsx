"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Key, Sparkles, Lock, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface EmptyStateProps {
  onActivate: (apiKey: string, provider: "openai" | "anthropic" | "google") => void
}

function validateApiKey(key: string, provider: string): { valid: boolean; error?: string } {
  if (!key.trim()) {
    return { valid: false, error: "API key cannot be empty" }
  }

  if (key.length < 20) {
    return { valid: false, error: "API key seems too short" }
  }

  // Provider-specific validation
  if (provider === "openai" && !key.startsWith("sk-")) {
    return { valid: false, error: "OpenAI keys should start with 'sk-'" }
  }

  if (provider === "anthropic" && !key.startsWith("sk-ant-")) {
    return { valid: false, error: "Anthropic keys should start with 'sk-ant-'" }
  }

  return { valid: true }
}

export function EmptyState({ onActivate }: EmptyStateProps) {
  const [apiKey, setApiKey] = useState("")
  const [provider, setProvider] = useState<"openai" | "anthropic" | "google">("openai")
  const [isActivating, setIsActivating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleActivate = async () => {
    setValidationError(null)

    const validation = validateApiKey(apiKey, provider)
    if (!validation.valid) {
      setValidationError(validation.error || "Invalid API key")
      toast({
        title: "Invalid API Key",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    setIsActivating(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      onActivate(apiKey, provider)

      toast({
        title: "Arena Activated!",
        description: "Professor Oak is now online and ready to assist.",
      })
    } catch (error) {
      console.error("[v0] Activation failed:", error)
      toast({
        title: "Activation Failed",
        description: "Failed to activate the arena. Please try again.",
        variant: "destructive",
      })
      setIsActivating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && apiKey.trim() && !isActivating) {
      handleActivate()
    }
  }

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <div className="relative z-10 max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-16 w-16 rounded-xl bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
              <Lock className="h-8 w-8 text-muted-foreground/40" />
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">ArenaLab está dormindo</h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            A arena precisa de uma alma para ganhar vida. Traga seu próprio Professor Oak.
          </p>
        </div>

        {/* BYOK Card */}
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Bring Your Own Key
            </CardTitle>
            <CardDescription>
              Sua chave API se torna o Professor Oak - o agente que narra, ensina e coordena toda a arena
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Professor Oak Provider</label>
              <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-4o-mini)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude Sonnet 3.5)</SelectItem>
                  <SelectItem value="google">Google (Gemini 2.0 Flash)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <Input
                type="password"
                placeholder={`Cole sua ${provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Anthropic" : "Google"} API key`}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setValidationError(null)
                }}
                onKeyPress={handleKeyPress}
                className="font-mono"
              />
              {validationError && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {validationError}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Armazenada localmente no seu browser. Nunca enviada para servidores externos.
              </p>
            </div>

            {/* Activate Button */}
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleActivate}
              disabled={!apiKey.trim() || isActivating}
            >
              {isActivating ? (
                <>
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  Acordando Professor Oak...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Despertar Arena
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <Card className="bg-muted/30">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-2xl">🎓</div>
              <p className="font-medium">Narrativa IA</p>
              <p className="text-xs text-muted-foreground">Professor Oak narra cada evolução</p>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-2xl">💡</div>
              <p className="font-medium">Coaching Adaptativo</p>
              <p className="text-xs text-muted-foreground">Dicas contextuais em tempo real</p>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-2xl">🔐</div>
              <p className="font-medium">100% Privado</p>
              <p className="text-xs text-muted-foreground">Sua chave nunca sai do browser</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
