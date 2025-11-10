"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Database, Filter, Split, Cpu, BarChart3, CheckCircle2, Play, Beaker, Save, Shield } from "lucide-react"

const iconMap: Record<string, any> = {
  ingest: Database,
  validate: CheckCircle2,
  clean: Filter,
  split: Split,
  train: Cpu,
  "fine-tune": Cpu,
  "hp-tuner": Beaker,
  checkpoint: Save,
  metrics: BarChart3,
  "bias-check": Shield,
  robustness: Shield,
}

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const Icon = iconMap[data.nodeType] || Database
  const status = data.status || "idle"

  return (
    <Card
      className={cn(
        "w-36 p-3 cursor-pointer transition-all",
        selected && "ring-2 ring-primary",
        status === "running" && "arena-glow",
      )}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Icon
            className={cn(
              "h-5 w-5",
              status === "success" && "text-success",
              status === "running" && "text-primary",
              status === "error" && "text-destructive",
              status === "idle" && "text-muted-foreground",
            )}
          />
          {status === "running" && <Play className="h-3 w-3 text-primary animate-pulse" />}
        </div>

        <p className="text-xs font-medium leading-tight">{data.label}</p>

        <Badge
          variant={status === "success" ? "default" : status === "running" ? "secondary" : "outline"}
          className="text-[10px] px-1.5 py-0"
        >
          {status}
        </Badge>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary" />
    </Card>
  )
})

CustomNode.displayName = "CustomNode"
