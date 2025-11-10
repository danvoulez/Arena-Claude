"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, GitCompare, Radio, Search, Zap, Settings, GraduationCap, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useArenaStore } from "@/lib/store"
import { EnvironmentManager } from "@/components/environment-manager"

interface TopBarProps {
  activeView: "pipeline" | "arena" | "training" | "production" | "ledger"
  onViewChange: (view: "pipeline" | "arena" | "training" | "production" | "ledger") => void
}

export function TopBar({ activeView, onViewChange }: TopBarProps) {
  const { environments, activeEnvironmentId, setActiveEnvironment, clearProfessorOak, professorOakProvider } =
    useArenaStore()
  const activeEnv = environments.find((e) => e.id === activeEnvironmentId)

  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ArenaLab</span>
          <Badge variant="secondary" className="text-xs">
            {professorOakProvider?.toUpperCase()}
          </Badge>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Select value={activeEnvironmentId || undefined} onValueChange={setActiveEnvironment}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {environments.map((env) => (
                <SelectItem key={env.id} value={env.id}>
                  {env.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Environment Variables</DialogTitle>
                <DialogDescription>Manage variables for {activeEnv?.name}</DialogDescription>
              </DialogHeader>
              <EnvironmentManager />
            </DialogContent>
          </Dialog>
        </div>

        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Play className="h-4 w-4" />
          Run
        </Button>

        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <GitCompare className="h-4 w-4" />
          Compare
        </Button>

        <Button
          variant={activeView === "training" ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={() => onViewChange("training")}
        >
          <GraduationCap className="h-4 w-4" />
          Training
        </Button>

        <Button
          variant={activeView === "arena" ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={() => onViewChange("arena")}
        >
          <Radio className="h-4 w-4" />
          Arena
        </Button>

        <Button
          variant={activeView === "production" ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={() => onViewChange("production")}
        >
          <Zap className="h-4 w-4" />
          Production
        </Button>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search pipelines, datasets, models..." className="pl-9 h-8" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-success" />
          All Systems
        </Badge>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearProfessorOak} title="Desligar Arena">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
