"use client"

import { useState } from "react"
import { CollectionsSidebar } from "@/components/collections-sidebar"
import { ToolboxSidebar } from "@/components/toolbox-sidebar"
import { PipelineCanvas } from "@/components/pipeline-canvas"
import { InspectorPanel } from "@/components/inspector-panel"
import { TopBar } from "@/components/top-bar"
import { StatusBar } from "@/components/status-bar"
import { ProductionLab } from "@/components/production-lab"
import { EmptyState } from "@/components/empty-state"
import { ProfessorOakPanel } from "@/components/professor-oak-panel"
import { AtomicLedgerViewer } from "@/components/atomic-ledger-viewer"
import { TrainingLab } from "@/components/training-lab"
import { useArenaStore } from "@/lib/store"

export default function ArenaLabPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"pipeline" | "arena" | "training" | "production" | "ledger">("pipeline")
  const { arenaActive, setProfessorOak } = useArenaStore()

  if (!arenaActive) {
    return <EmptyState onActivate={setProfessorOak} />
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <TopBar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collections Sidebar */}
        <CollectionsSidebar />

        {/* Left Sidebar - Toolbox */}
        <ToolboxSidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Central Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === "production" ? (
            <ProductionLab />
          ) : activeView === "ledger" ? (
            <AtomicLedgerViewer />
          ) : activeView === "training" ? (
            <TrainingLab />
          ) : (
            <PipelineCanvas selectedNode={selectedNode} onNodeSelect={setSelectedNode} activeView={activeView} />
          )}
        </div>

        {/* Right Sidebar - Inspector + Professor Oak */}
        <div className="w-80 border-l border-border flex flex-col">
          <div className="flex-1 min-h-0">
            <InspectorPanel selectedNode={selectedNode} />
          </div>
          <div className="h-80 border-t border-border">
            <ProfessorOakPanel />
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  )
}

