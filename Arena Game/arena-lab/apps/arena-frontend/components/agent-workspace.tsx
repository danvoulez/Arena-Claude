"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Terminal,
  Send,
  Square,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Code,
  Play
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentMessage {
  id: string
  type: 'user' | 'agent' | 'tool_call' | 'tool_result' | 'system'
  content: string
  timestamp: string
  status?: 'running' | 'success' | 'error'
  data?: any
}

export function AgentWorkspace() {
  const [messages, setMessages] = useState<AgentMessage[]>([{
    id: '0',
    type: 'system',
    content: '🤖 Agent ready. Type your command or upload .md files to train.',
    timestamp: new Date().toISOString()
  }])
  const [input, setInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (msg: Omit<AgentMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString()
    }])
  }

  const handleSubmit = async () => {
    if (!input.trim() || isRunning) return

    addMessage({
      type: 'user',
      content: input
    })

    const userInput = input
    setInput('')
    setIsRunning(true)

    // Simulate agent processing
    await new Promise(r => setTimeout(r, 500))

    addMessage({
      type: 'agent',
      content: `Processing: "${userInput}"...`
    })

    // Simulate tool call
    await new Promise(r => setTimeout(r, 800))

    addMessage({
      type: 'tool_call',
      content: 'searchSimilarSpans(query: "' + userInput + '", k: 10)',
      status: 'running'
    })

    await new Promise(r => setTimeout(r, 1200))

    addMessage({
      type: 'tool_result',
      content: 'Found 47 candidate spans, matched 8 high-quality spans',
      status: 'success',
      data: { found: 47, matched: 8, avgQuality: 0.87 }
    })

    await new Promise(r => setTimeout(r, 400))

    addMessage({
      type: 'agent',
      content: `✅ Analysis complete. Found 8 high-quality examples with avg quality 87/100.`
    })

    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    addMessage({
      type: 'system',
      content: '⏹️ Agent stopped by user'
    })
  }

  const getMessageIcon = (msg: AgentMessage) => {
    switch (msg.type) {
      case 'tool_call':
        return <Zap className="h-4 w-4 text-purple-500" />
      case 'tool_result':
        return msg.status === 'success' ?
          <CheckCircle className="h-4 w-4 text-green-500" /> :
          <XCircle className="h-4 w-4 text-red-500" />
      case 'agent':
        return <Code className="h-4 w-4 text-blue-500" />
      case 'system':
        return <Terminal className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const getMessageStyle = (msg: AgentMessage) => {
    switch (msg.type) {
      case 'user':
        return 'bg-primary/10 border-primary/20'
      case 'agent':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'tool_call':
        return 'bg-purple-500/10 border-purple-500/20'
      case 'tool_result':
        return msg.status === 'success' ?
          'bg-green-500/10 border-green-500/20' :
          'bg-red-500/10 border-red-500/20'
      case 'system':
        return 'bg-muted/30 border-muted'
      default:
        return ''
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          <span className="font-semibold">Agent Workspace</span>
          {isRunning && (
            <Badge variant="default" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Running
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Trajectory Matching Engine v1.0
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                "p-3 rounded-lg border",
                getMessageStyle(msg)
              )}
            >
              <div className="flex items-start gap-2">
                <div className="shrink-0 mt-0.5">
                  {getMessageIcon(msg)}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {msg.type === 'user' ? 'You' :
                       msg.type === 'agent' ? 'Agent' :
                       msg.type === 'tool_call' ? 'Tool Call' :
                       msg.type === 'tool_result' ? 'Result' : 'System'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                    {msg.status && (
                      <Badge variant="outline" className="text-xs">
                        {msg.status}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>

                  {/* Data */}
                  {msg.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        Show data
                      </summary>
                      <pre className="mt-1 text-xs bg-background rounded p-2 overflow-x-auto">
                        {JSON.stringify(msg.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 bg-muted/20">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Enter command or query... (e.g., 'Process ./conversations/*.md')"
            disabled={isRunning}
            className="flex-1"
          />
          {!isRunning ? (
            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              variant="destructive"
              size="icon"
            >
              <Square className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}
