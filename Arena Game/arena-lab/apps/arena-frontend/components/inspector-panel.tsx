"use client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, FileText, Database } from "lucide-react"
import { MetricsDashboard } from "./metrics-dashboard"
import { ConsoleTerminal } from "./console-terminal"

interface InspectorPanelProps {
  selectedNode: string | null
}

export function InspectorPanel({ selectedNode }: InspectorPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-80 border-l border-border bg-card flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground text-center">Select a node to view details</p>
      </div>
    )
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Inspector
        </h2>
      </div>

      <Tabs defaultValue="props" className="flex-1 flex flex-col">
        <div className="px-2 pt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="props" className="text-xs">
              Props
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs">
              Metrics
            </TabsTrigger>
            <TabsTrigger value="artifacts" className="text-xs">
              Files
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              Logs
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="props" className="p-4 space-y-4 m-0">
            <div>
              <h3 className="text-sm font-semibold mb-2">Node Properties</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <Badge variant="default" className="mt-1 w-full justify-center">
                    Running
                  </Badge>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Dataset</label>
                  <p className="text-sm font-mono mt-1 p-2 bg-muted rounded">s3://bucket/news</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Model</label>
                  <p className="text-sm font-mono mt-1 p-2 bg-muted rounded">hf://mistral-7b</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Seed</label>
                  <p className="text-sm font-mono mt-1 p-2 bg-muted rounded">42</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="p-4 space-y-4 m-0">
            <MetricsDashboard />
          </TabsContent>

          <TabsContent value="artifacts" className="p-4 space-y-2 m-0">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Artifacts
            </h3>
            {["model_checkpoint_v1.bin", "training_curve.png", "confusion_matrix.json", "hyperparams.yaml"].map(
              (file) => (
                <Button key={file} variant="ghost" className="w-full justify-start text-xs font-mono h-auto py-2">
                  <Database className="h-3 w-3 mr-2" />
                  {file}
                </Button>
              ),
            )}
          </TabsContent>

          <TabsContent value="logs" className="p-4 m-0">
            <ConsoleTerminal />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
