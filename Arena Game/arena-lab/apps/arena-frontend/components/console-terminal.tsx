"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, Download, Trash2, Search, Filter, Pause, Play } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type LogLevel = "info" | "success" | "warning" | "error" | "debug"

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
}

const logLevelStyles = {
  info: "text-primary",
  success: "text-success",
  warning: "text-chart-4",
  error: "text-destructive",
  debug: "text-muted-foreground",
}

const sampleLogs: Omit<LogEntry, "id" | "timestamp">[] = [
  { level: "info", message: "Initializing pipeline execution..." },
  { level: "success", message: "Dataset loaded: 10,000 samples from s3://bucket/news" },
  { level: "info", message: "Preprocessing data..." },
  { level: "debug", message: "Applied text normalization to 10,000 records" },
  { level: "success", message: "Data validation passed: 100% valid records" },
  { level: "info", message: "Splitting dataset: 80% train, 20% test" },
  { level: "success", message: "Train set: 8,000 samples, Test set: 2,000 samples" },
  { level: "info", message: "Loading model: hf://mistral-7b" },
  { level: "debug", message: "Model loaded with 7.24B parameters" },
  { level: "warning", message: "GPU memory at 82%, consider reducing batch size" },
  { level: "info", message: "Starting training with batch_size=32, lr=2e-5" },
  { level: "info", message: "Epoch 1/10 - Step 1/250" },
  { level: "debug", message: "Loss: 0.856, Accuracy: 0.625" },
  { level: "info", message: "Epoch 1/10 - Step 50/250" },
  { level: "debug", message: "Loss: 0.645, Accuracy: 0.712" },
  { level: "success", message: "Epoch 1/10 completed - Avg Loss: 0.523, Avg Accuracy: 0.784" },
  { level: "info", message: "Running validation..." },
  { level: "success", message: "Validation - Loss: 0.498, Accuracy: 0.802" },
  { level: "info", message: "Checkpoint saved: checkpoints/epoch_1.bin" },
]

export function ConsoleTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleLevels, setVisibleLevels] = useState<Record<LogLevel, boolean>>({
    info: true,
    success: true,
    warning: true,
    error: true,
    debug: true,
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)

  // Simulate live log streaming
  useEffect(() => {
    let logIndex = 0

    const interval = setInterval(() => {
      if (isPaused) return

      if (logIndex < sampleLogs.length) {
        const newLog: LogEntry = {
          id: `log-${Date.now()}-${logIndex}`,
          timestamp: new Date().toISOString(),
          ...sampleLogs[logIndex],
        }

        setLogs((prev) => [...prev, newLog])
        logIndex++
      } else {
        // Generate random logs after initial batch
        const randomLog = sampleLogs[Math.floor(Math.random() * sampleLogs.length)]
        const newLog: LogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...randomLog,
        }
        setLogs((prev) => [...prev, newLog])
      }
    }, 800)

    return () => clearInterval(interval)
  }, [isPaused])

  // Filter logs based on search and level filters
  useEffect(() => {
    let filtered = logs

    // Apply level filter
    filtered = filtered.filter((log) => visibleLevels[log.level])

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((log) => log.message.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredLogs(filtered)
  }, [logs, searchQuery, visibleLevels])

  // Auto scroll to bottom
  useEffect(() => {
    if (shouldAutoScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredLogs])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50
    shouldAutoScroll.current = isAtBottom
  }

  const clearLogs = () => {
    setLogs([])
    setFilteredLogs([])
  }

  const downloadLogs = () => {
    const logText = logs
      .map((log) => `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `arenalab-logs-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleLevel = (level: LogLevel) => {
    setVisibleLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }))
  }

  const levelCounts = logs.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1
      return acc
    },
    {} as Record<LogLevel, number>,
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold flex-1">Console Terminal</h3>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {filteredLogs.length} logs
          </Badge>
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent">
              <Filter className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(logLevelStyles) as LogLevel[]).map((level) => (
              <DropdownMenuCheckboxItem
                key={level}
                checked={visibleLevels[level]}
                onCheckedChange={() => toggleLevel(level)}
              >
                <span className={logLevelStyles[level]}>{level.toUpperCase()}</span>
                <span className="ml-auto text-xs text-muted-foreground">{levelCounts[level] || 0}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-transparent"
          onClick={downloadLogs}
          disabled={logs.length === 0}
        >
          <Download className="h-3 w-3" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-transparent"
          onClick={clearLogs}
          disabled={logs.length === 0}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Console Output */}
      <Card className="bg-black/90 border-border">
        <ScrollArea ref={scrollRef} className="h-96" onScrollCapture={handleScroll}>
          <div className="p-3 font-mono text-xs space-y-1">
            {filteredLogs.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {logs.length === 0 ? "Waiting for logs..." : "No logs match your filters"}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const time = new Date(log.timestamp).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })

                return (
                  <div key={log.id} className="flex items-start gap-2 hover:bg-white/5 px-1 rounded">
                    <span className="text-muted-foreground shrink-0">[{time}]</span>
                    <span className={`shrink-0 font-bold ${logLevelStyles[log.level]}`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-foreground/90">{log.message}</span>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Stats Bar */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Stats:</span>
        {(Object.entries(levelCounts) as [LogLevel, number][]).map(([level, count]) => (
          <Badge key={level} variant="outline" className="text-xs">
            <span className={logLevelStyles[level]}>{level}</span>: {count}
          </Badge>
        ))}
      </div>
    </div>
  )
}
