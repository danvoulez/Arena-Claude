"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Download, PlayCircle, Search, CheckCircle, XCircle } from "lucide-react"
import type { AtomicSpan, ReplayResult } from "@/lib/atomic-types"
import { atomicAPI } from "@/lib/atomic-api"

export function AtomicLedgerViewer() {
  const [spans, setSpans] = useState<AtomicSpan[]>([])
  const [filteredSpans, setFilteredSpans] = useState<AtomicSpan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterKind, setFilterKind] = useState<string>("all")
  const [replayResults, setReplayResults] = useState<Record<string, ReplayResult>>({})
  const [loading, setLoading] = useState(false)

  // Load spans on mount
  useEffect(() => {
    loadSpans()
  }, [])

  // Filter spans when search/filter changes
  useEffect(() => {
    let filtered = spans

    if (searchTerm) {
      filtered = filtered.filter(
        (span) =>
          span.id.includes(searchTerm) || span.trace.bichinho_id.includes(searchTerm) || span.kind.includes(searchTerm),
      )
    }

    if (filterKind !== "all") {
      filtered = filtered.filter((span) => span.kind === filterKind)
    }

    setFilteredSpans(filtered)
  }, [spans, searchTerm, filterKind])

  async function loadSpans() {
    setLoading(true)
    try {
      const allSpans = await atomicAPI.getLedger()
      setSpans(allSpans)
      setFilteredSpans(allSpans)
    } catch (error) {
      console.error("[v0] Failed to load spans:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleReplaySpan(spanId: string) {
    const span = spans.find((s) => s.id === spanId)
    if (!span) return

    setLoading(true)
    try {
      const results = await atomicAPI.replayAll()
      const result = results.find((r) => r.expected === span.output)

      if (result) {
        setReplayResults((prev) => ({ ...prev, [spanId]: result }))
      }
    } catch (error) {
      console.error("[v0] Replay failed:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    await atomicAPI.exportNDJSON(undefined, `arenalab-ledger-${Date.now()}.ndjson`)
  }

  const kinds = ["all", "training", "evaluation", "battle", "sandbox"]

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Atomic Ledger</h2>
          <p className="text-sm text-muted-foreground">
            {spans.length} spans recorded • JSON Atomic format • Ed25519 signed
          </p>
        </div>

        <Button onClick={handleExport} disabled={spans.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export NDJSON
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, creature, or kind..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {kinds.map((kind) => (
            <Button
              key={kind}
              variant={filterKind === kind ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterKind(kind)}
            >
              {kind}
            </Button>
          ))}
        </div>
      </div>

      {/* Spans Table */}
      <div className="flex-1 overflow-auto rounded-lg border border-border/50 bg-card">
        <table className="w-full">
          <thead className="sticky top-0 border-b border-border/50 bg-card">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Kind</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Creature</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Timestamp</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpans.map((span) => (
              <tr key={span.id} className="border-b border-border/30 hover:bg-accent/10">
                <td className="p-3 font-mono text-xs text-foreground">{span.id.slice(0, 16)}...</td>
                <td className="p-3">
                  <Badge variant="outline">{span.kind}</Badge>
                </td>
                <td className="p-3 text-sm text-muted-foreground">{span.trace.bichinho_id}</td>
                <td className="p-3">
                  <Badge
                    variant={
                      span.status === "completed" ? "default" : span.status === "failed" ? "destructive" : "secondary"
                    }
                  >
                    {span.status}
                  </Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(span.timestamp).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => handleReplaySpan(span.id)} disabled={loading}>
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSpans.length === 0 && (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            {loading ? "Loading spans..." : "No spans found"}
          </div>
        )}
      </div>

      {/* Replay Results */}
      {Object.keys(replayResults).length > 0 && (
        <Card className="border-border/50 bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Replay Results</h3>
          {Object.entries(replayResults).map(([spanId, result]) => (
            <div key={spanId} className="mb-2 flex items-center gap-2 text-sm">
              {result.match ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-mono text-xs">{spanId.slice(0, 16)}...</span>
              <span className="text-muted-foreground">
                {result.match ? "Match" : "Diverged"} • {result.duration.toFixed(2)}ms
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
