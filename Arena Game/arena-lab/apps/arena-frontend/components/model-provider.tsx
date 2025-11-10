"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cpu, Plus, Check, Zap } from "lucide-react"
import { useArenaStore } from "@/lib/store"

const providers = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    requiresKey: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-3.5-sonnet", "claude-3-opus", "claude-3-haiku"],
    requiresKey: true,
  },
  {
    id: "google",
    name: "Google",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    requiresKey: true,
  },
  {
    id: "groq",
    name: "Groq",
    models: ["llama-3.1-70b", "mixtral-8x7b", "gemma-7b"],
    requiresKey: true,
  },
  {
    id: "huggingface",
    name: "HuggingFace",
    models: ["mistral-7b", "llama-2-13b", "phi-2"],
    requiresKey: false,
  },
]

export function ModelProvider() {
  const { addArenaModel } = useArenaStore()
  const [selectedProvider, setSelectedProvider] = useState("openai")
  const [selectedModel, setSelectedModel] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [connectedModels, setConnectedModels] = useState<string[]>([])

  const currentProvider = providers.find((p) => p.id === selectedProvider)

  const handleConnect = () => {
    if (!selectedModel) return
    if (currentProvider?.requiresKey && !apiKey.trim()) return

    const modelName = selectedModel
    const providerName = currentProvider?.name || selectedProvider

    addArenaModel({
      name: modelName,
      provider: providerName,
    })

    setConnectedModels((prev) => [...prev, `${selectedProvider}-${selectedModel}`])
    setSelectedModel("")
    setApiKey("")
  }

  const isConnected = (providerId: string, model: string) => {
    return connectedModels.includes(`${providerId}-${model}`)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="connect" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connect">Connect Model</TabsTrigger>
          <TabsTrigger value="connected">Connected ({connectedModels.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {currentProvider?.models.map((model) => (
                    <SelectItem key={model} value={model} disabled={isConnected(selectedProvider, model)}>
                      <div className="flex items-center justify-between w-full">
                        {model}
                        {isConnected(selectedProvider, model) && <Check className="h-4 w-4 ml-2 text-success" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentProvider?.requiresKey && (
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder={`Enter your ${currentProvider.name} API key`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key will be stored securely in environment variables
                </p>
              </div>
            )}

            <Button
              onClick={handleConnect}
              disabled={!selectedModel || (currentProvider?.requiresKey && !apiKey.trim())}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Connect Model
            </Button>
          </Card>

          {/* Provider Cards */}
          <div className="grid grid-cols-2 gap-3">
            {providers.map((provider) => {
              const connected = connectedModels.filter((m) => m.startsWith(provider.id)).length
              return (
                <Card
                  key={provider.id}
                  className={`p-4 cursor-pointer hover:border-primary/50 transition-colors ${
                    selectedProvider === provider.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    {connected > 0 && (
                      <Badge variant="default" className="text-xs">
                        {connected}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm">{provider.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{provider.models.length} models</p>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-3">
          {connectedModels.length === 0 ? (
            <Card className="p-8 text-center">
              <Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No models connected yet</p>
            </Card>
          ) : (
            connectedModels.map((modelId) => {
              const [providerId, modelName] = modelId.split("-")
              const provider = providers.find((p) => p.id === providerId)

              return (
                <Card key={modelId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-sm font-medium">{modelName}</p>
                        <p className="text-xs text-muted-foreground">{provider?.name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Ready
                    </Badge>
                  </div>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
