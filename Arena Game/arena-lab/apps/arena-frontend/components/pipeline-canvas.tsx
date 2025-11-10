"use client"

import { PipelineFlow } from "./pipeline-flow"
import { ArenaView } from "./arena-view"
import { TrainingCenter } from "./training-center"

interface PipelineCanvasProps {
  selectedNode: string | null
  onNodeSelect: (nodeId: string | null) => void
  activeView: "pipeline" | "arena" | "training" | "production" // added production view type
}

export function PipelineCanvas({ selectedNode, onNodeSelect, activeView }: PipelineCanvasProps) {
  return (
    <div className="flex-1 relative bg-background/50">
      {/* Main Canvas Area */}
      {activeView === "pipeline" && <PipelineFlow selectedNode={selectedNode} onNodeSelect={onNodeSelect} />}
      {activeView === "arena" && <ArenaView />}
      {activeView === "training" && <TrainingCenter />}
    </div>
  )
}
