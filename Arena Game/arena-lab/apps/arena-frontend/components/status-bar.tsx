"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, DollarSign, Clock, Zap } from "lucide-react"

export function StatusBar() {
  return (
    <div className="h-10 border-t border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 text-xs">
      {/* Left Section - Job Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-muted-foreground">Training Model</span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={68} className="w-24 h-1.5" />
          <span className="font-mono">68%</span>
        </div>
      </div>

      {/* Center Section - Metrics */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono">12m 34s</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono">$2.45</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono">seed: 42</span>
        </div>
      </div>

      {/* Right Section - Status */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>Jobs: 3 Running</span>
        </Badge>
      </div>
    </div>
  )
}
