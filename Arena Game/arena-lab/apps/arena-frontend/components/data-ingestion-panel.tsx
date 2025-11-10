"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Upload,
  FileText,
  Database,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Sparkles
} from "lucide-react"

interface FileStatus {
  name: string
  size: number
  status: 'pending' | 'processing' | 'success' | 'error'
  error?: string
  spansCreated?: number
  qualityScore?: number
}

interface DataIngestionPanelProps {
  onIngest: (files: File[]) => Promise<void>
  isProcessing: boolean
}

export function DataIngestionPanel({ onIngest, isProcessing }: DataIngestionPanelProps) {
  const [files, setFiles] = useState<FileStatus[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    // Filter para apenas .md
    const mdFiles = newFiles.filter(f => f.name.endsWith('.md'))

    const fileStatuses: FileStatus[] = mdFiles.map(f => ({
      name: f.name,
      size: f.size,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...fileStatuses])
  }

  const handleStartIngestion = async () => {
    if (files.length === 0 || isProcessing) return

    // TODO: Implementar processamento real
    // Por enquanto, simulação
    for (let i = 0; i < files.length; i++) {
      setFiles(prev =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'processing' } : f
        )
      )

      await new Promise(resolve => setTimeout(resolve, 500))

      // Simular sucesso com dados aleatórios
      const spansCreated = Math.floor(Math.random() * 50) + 10
      const qualityScore = 0.6 + Math.random() * 0.4

      setFiles(prev =>
        prev.map((f, idx) =>
          idx === i
            ? { ...f, status: 'success', spansCreated, qualityScore }
            : f
        )
      )
    }
  }

  const handleClear = () => {
    setFiles([])
  }

  const totalFiles = files.length
  const processedFiles = files.filter(f => f.status === 'success' || f.status === 'error').length
  const successFiles = files.filter(f => f.status === 'success').length
  const totalSpans = files.reduce((sum, f) => sum + (f.spansCreated || 0), 0)
  const avgQuality = successFiles > 0
    ? files.filter(f => f.status === 'success').reduce((sum, f) => sum + (f.qualityScore || 0), 0) / successFiles
    : 0

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Ingestion
          {isProcessing && (
            <Badge variant="default" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary/50'}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-sm font-semibold">
              Drop your .md files here
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: ChatGPT exports, Claude conversations, documentation
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".md"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Stats */}
        {totalFiles > 0 && (
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Total Files</div>
              <div className="font-semibold">{totalFiles}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Processed</div>
              <div className="font-semibold text-green-500">{processedFiles}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Spans Created</div>
              <div className="font-semibold text-blue-500">{totalSpans}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Avg Quality</div>
              <div className="font-semibold text-purple-500">
                {(avgQuality * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        {totalFiles > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">
                {processedFiles} / {totalFiles}
              </span>
            </div>
            <Progress value={(processedFiles / totalFiles) * 100} />
          </div>
        )}

        {/* File List */}
        <ScrollArea className="flex-1 border rounded-lg">
          <div className="p-2 space-y-1">
            {files.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No files selected yet
              </div>
            ) : (
              files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  {/* Status Icon */}
                  <div className="shrink-0">
                    {file.status === 'pending' && <FileText className="h-4 w-4 text-muted-foreground" />}
                    {file.status === 'processing' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                    {file.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {file.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                      {file.spansCreated && (
                        <span className="ml-2">• {file.spansCreated} spans</span>
                      )}
                      {file.qualityScore && (
                        <span className="ml-2">• Q: {(file.qualityScore * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant={
                      file.status === 'success' ? 'default' :
                      file.status === 'error' ? 'destructive' :
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {file.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleStartIngestion}
            disabled={files.length === 0 || isProcessing}
            className="flex-1 gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Start Ingestion
              </>
            )}
          </Button>

          <Button
            onClick={handleClear}
            variant="outline"
            disabled={isProcessing}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
