"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Database,
  Beaker,
  Cpu,
  BarChart3,
  Rocket,
  Shield,
  Swords,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { DatasetUpload } from "./dataset-upload"
import { ModelProvider } from "./model-provider"

interface ToolboxSidebarProps {
  activeView: "pipeline" | "arena" | "training" | "production" | "ledger"
  onViewChange?: (view: "pipeline" | "arena" | "training" | "production" | "ledger") => void
}

const tools = [
  { id: "dataset", label: "Dataset Lab", icon: Database, color: "text-chart-2", view: "pipeline" },
  { id: "feature", label: "Feature Lab", icon: Beaker, color: "text-chart-3", view: "pipeline" },
  { id: "model", label: "Model Lab", icon: Cpu, color: "text-chart-1", view: "pipeline" },
  { id: "training", label: "Training Center", icon: GraduationCap, color: "text-primary", view: "training" },
  { id: "eval", label: "Evaluation", icon: BarChart3, color: "text-chart-4", view: "pipeline" },
  { id: "deploy", label: "Deploy", icon: Rocket, color: "text-chart-5", view: "pipeline" },
  { id: "policies", label: "Policies", icon: Shield, color: "text-muted-foreground", view: "pipeline" },
  { id: "arena", label: "Arena ⚡", icon: Swords, color: "text-arena", view: "arena" },
  { id: "production", label: "Production Lab", icon: Zap, color: "text-yellow-400", view: "production" },
  { id: "ledger", label: "Atomic Ledger", icon: BookOpen, color: "text-blue-400", view: "ledger" },
]

const nodeCategories = [
  {
    title: "DATA NODES",
    color: "bg-sidebar-accent/50 hover:bg-sidebar-accent",
    nodes: [
      { type: "ingest", label: "Ingest" },
      { type: "validate", label: "Validate" },
      { type: "clean", label: "Clean" },
      { type: "split", label: "Split" },
    ],
  },
  {
    title: "TRAINING NODES",
    color: "bg-primary/10 hover:bg-primary/20",
    nodes: [
      { type: "train", label: "Train" },
      { type: "fine-tune", label: "Fine-tune" },
      { type: "hp-tuner", label: "HP Tuner" },
      { type: "checkpoint", label: "Checkpoint" },
    ],
  },
  {
    title: "EVAL NODES",
    color: "bg-success/10 hover:bg-success/20",
    nodes: [
      { type: "metrics", label: "Metrics" },
      { type: "bias-check", label: "Bias Check" },
      { type: "robustness", label: "Robustness" },
    ],
  },
]

export function ToolboxSidebar({ activeView, onViewChange }: ToolboxSidebarProps) {
  const [activeTool, setActiveTool] = useState("dataset")

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.setData("label", label)
    event.dataTransfer.effectAllowed = "move"
  }

  const handleToolClick = (tool: (typeof tools)[0]) => {
    setActiveTool(tool.id)
    if (onViewChange && tool.view !== activeView) {
      onViewChange(tool.view as "pipeline" | "arena" | "training" | "production" | "ledger")
    }
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sm text-sidebar-foreground">Toolbox</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {tools.map((tool) => {
            const Icon = tool.icon
            const isActive = activeTool === tool.id

            return (
              <Button
                key={tool.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3 h-10", isActive && "bg-sidebar-accent")}
                onClick={() => handleToolClick(tool)}
              >
                <Icon className={cn("h-4 w-4", tool.color)} />
                <span className="flex-1 text-left text-sm">{tool.label}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Button>
            )
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border mt-4">
          {activeTool === "dataset" && <DatasetUpload />}
          {activeTool === "model" && <ModelProvider />}
          {activeTool === "training" && (
            <div className="text-sm text-muted-foreground text-center py-4">
              Select Training Center in the main view
            </div>
          )}
          {activeTool === "production" && (
            <div className="text-sm text-muted-foreground text-center py-4">Production tools in main view</div>
          )}
          {activeTool === "ledger" && (
            <div className="text-sm text-muted-foreground text-center py-4">Ledger tools in main view</div>
          )}
          {activeTool !== "dataset" &&
            activeTool !== "model" &&
            activeTool !== "training" &&
            activeTool !== "production" &&
            activeTool !== "ledger" && (
              <div className="space-y-4">
                {nodeCategories.map((category) => (
                  <div key={category.title}>
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2">{category.title}</h3>
                    <div className="space-y-1">
                      {category.nodes.map((node) => (
                        <div
                          key={node.type}
                          className={cn(
                            "p-2 rounded text-xs cursor-grab active:cursor-grabbing transition-colors",
                            category.color,
                          )}
                          draggable
                          onDragStart={(e) => onDragStart(e, node.type, node.label)}
                        >
                          {node.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </ScrollArea>
    </div>
  )
}
