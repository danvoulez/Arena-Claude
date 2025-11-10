"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, File, X, CheckCircle, Loader2, Database, LinkIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Dataset {
  id: string
  name: string
  source: "upload" | "url" | "s3" | "huggingface"
  size: number
  rows?: number
  status: "uploading" | "processing" | "ready" | "error"
  createdAt: string
}

export function DatasetUpload() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [datasetUrl, setDatasetUrl] = useState("")
  const [s3Path, setS3Path] = useState("")
  const [hfDataset, setHfDataset] = useState("")

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)

          const newDataset: Dataset = {
            id: `dataset-${Date.now()}`,
            name: file.name,
            source: "upload",
            size: file.size,
            rows: Math.floor(Math.random() * 10000) + 1000,
            status: "ready",
            createdAt: new Date().toISOString(),
          }
          setDatasets((prev) => [newDataset, ...prev])
          return 0
        }
        return prev + 10
      })
    }, 200)
  }, [])

  const handleUrlImport = () => {
    if (!datasetUrl.trim()) return

    const newDataset: Dataset = {
      id: `dataset-${Date.now()}`,
      name: datasetUrl.split("/").pop() || "URL Dataset",
      source: "url",
      size: 0,
      status: "processing",
      createdAt: new Date().toISOString(),
    }
    setDatasets((prev) => [newDataset, ...prev])
    setDatasetUrl("")

    setTimeout(() => {
      setDatasets((prev) =>
        prev.map((d) =>
          d.id === newDataset.id
            ? { ...d, status: "ready" as const, rows: Math.floor(Math.random() * 10000) + 1000 }
            : d,
        ),
      )
    }, 2000)
  }

  const handleS3Import = () => {
    if (!s3Path.trim()) return

    const newDataset: Dataset = {
      id: `dataset-${Date.now()}`,
      name: s3Path.split("/").pop() || "S3 Dataset",
      source: "s3",
      size: 0,
      status: "processing",
      createdAt: new Date().toISOString(),
    }
    setDatasets((prev) => [newDataset, ...prev])
    setS3Path("")

    setTimeout(() => {
      setDatasets((prev) =>
        prev.map((d) =>
          d.id === newDataset.id
            ? { ...d, status: "ready" as const, rows: Math.floor(Math.random() * 10000) + 1000 }
            : d,
        ),
      )
    }, 2000)
  }

  const handleHFImport = () => {
    if (!hfDataset.trim()) return

    const newDataset: Dataset = {
      id: `dataset-${Date.now()}`,
      name: hfDataset,
      source: "huggingface",
      size: 0,
      status: "processing",
      createdAt: new Date().toISOString(),
    }
    setDatasets((prev) => [newDataset, ...prev])
    setHfDataset("")

    setTimeout(() => {
      setDatasets((prev) =>
        prev.map((d) =>
          d.id === newDataset.id
            ? { ...d, status: "ready" as const, rows: Math.floor(Math.random() * 10000) + 1000 }
            : d,
        ),
      )
    }, 2000)
  }

  const deleteDataset = (id: string) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id))
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="s3">S3</TabsTrigger>
          <TabsTrigger value="hf">HuggingFace</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium">Click to upload</span>
                  <span className="text-sm text-muted-foreground"> or drag and drop</span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.json,.parquet,.txt"
                  onChange={handleFileUpload}
                />
                <p className="text-xs text-muted-foreground mt-2">CSV, JSON, Parquet, TXT (max 500MB)</p>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Dataset URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/dataset.csv"
                  value={datasetUrl}
                  onChange={(e) => setDatasetUrl(e.target.value)}
                />
                <Button onClick={handleUrlImport} disabled={!datasetUrl.trim()}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="s3" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>S3 Path</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="s3://bucket-name/path/to/dataset.csv"
                  value={s3Path}
                  onChange={(e) => setS3Path(e.target.value)}
                />
                <Button onClick={handleS3Import} disabled={!s3Path.trim()}>
                  <Database className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hf" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>HuggingFace Dataset</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="username/dataset-name"
                  value={hfDataset}
                  onChange={(e) => setHfDataset(e.target.value)}
                />
                <Button onClick={handleHFImport} disabled={!hfDataset.trim()}>
                  Import
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dataset List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Your Datasets ({datasets.length})</h3>
        {datasets.length === 0 ? (
          <Card className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No datasets yet</p>
          </Card>
        ) : (
          datasets.map((dataset) => (
            <Card key={dataset.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <File className="h-5 w-5 text-chart-2" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{dataset.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {dataset.source}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {dataset.rows && <span>{dataset.rows.toLocaleString()} rows</span>}
                      {dataset.size > 0 && <span>{formatBytes(dataset.size)}</span>}
                      <span>{new Date(dataset.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {dataset.status === "ready" && <CheckCircle className="h-4 w-4 text-success" />}
                  {dataset.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {dataset.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteDataset(dataset.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
