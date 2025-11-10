"use client"

import { AgentWorkspace } from "@/components/agent-workspace"

export default function AgentPage() {
  return (
    <div className="h-screen flex bg-background">
      <div className="flex-1">
        <AgentWorkspace />
      </div>
    </div>
  )
}
