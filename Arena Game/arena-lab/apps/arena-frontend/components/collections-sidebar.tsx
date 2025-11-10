"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useArenaStore } from "@/lib/store"
import { Folder, Plus, MoreVertical, FileText, Trash2, Edit, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function CollectionsSidebar() {
  const {
    collections,
    activeCollectionId,
    activePipelineId,
    addCollection,
    addPipeline,
    deletePipeline,
    setActivePipeline,
  } = useArenaStore()

  const [newCollectionName, setNewCollectionName] = useState("")
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set(["default"]))

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      addCollection(newCollectionName)
      setNewCollectionName("")
      setShowNewCollection(false)
    }
  }

  const toggleCollection = (id: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <h2 className="font-semibold text-sm text-sidebar-foreground">Collections</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewCollection(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {showNewCollection && (
            <div className="p-2 space-y-2 bg-sidebar-accent rounded-md">
              <Input
                placeholder="Collection name..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCollection()}
                className="h-7"
                autoFocus
              />
              <div className="flex gap-1">
                <Button size="sm" onClick={handleAddCollection} className="h-6 flex-1">
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNewCollection(false)
                    setNewCollectionName("")
                  }}
                  className="h-6 flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {collections.map((collection) => {
            const isExpanded = expandedCollections.has(collection.id)

            return (
              <div key={collection.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-sidebar-accent group",
                    activeCollectionId === collection.id && "bg-sidebar-accent",
                  )}
                  onClick={() => toggleCollection(collection.id)}
                >
                  <Folder className="h-4 w-4 text-chart-2" />
                  <span className="flex-1 text-sm truncate">{collection.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        addPipeline(collection.id, `Pipeline ${collection.pipelines.length + 1}`)
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {collection.pipelines.map((pipeline) => (
                      <div
                        key={pipeline.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-sidebar-accent group",
                          activePipelineId === pipeline.id && "bg-sidebar-accent text-primary",
                        )}
                        onClick={() => setActivePipeline(pipeline.id)}
                      >
                        <FileText className="h-3 w-3" />
                        <span className="flex-1 text-xs truncate">{pipeline.name}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-3 w-3 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-3 w-3 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePipeline(pipeline.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
