"use client"

import type React from "react"

import { useCallback, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  ConnectionMode,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useArenaStore } from "@/lib/store"
import { CustomNode } from "./custom-node"

const nodeTypes = {
  custom: CustomNode,
}

interface PipelineFlowProps {
  selectedNode: string | null
  onNodeSelect: (nodeId: string | null) => void
}

export function PipelineFlow({ selectedNode, onNodeSelect }: PipelineFlowProps) {
  const {
    collections,
    activeCollectionId,
    activePipelineId,
    addNode,
    updateNode,
    deleteNode,
    addEdge: addStoreEdge,
    deleteEdge,
    selectedNodeId,
    setSelectedNode,
  } = useArenaStore()

  const activePipeline = collections
    .find((c) => c.id === activeCollectionId)
    ?.pipelines.find((p) => p.id === activePipelineId)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    if (activePipeline) {
      const flowNodes: Node[] = activePipeline.nodes.map((node) => ({
        id: node.id,
        type: "custom",
        position: node.position,
        data: {
          ...node.data,
          label: node.label,
          nodeType: node.type,
          status: node.status,
        },
      }))

      const flowEdges: Edge[] = activePipeline.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: "rgb(99 102 241 / 0.5)" },
      }))

      setNodes(flowNodes)
      setEdges(flowEdges)
    }
  }, [activePipeline, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const newEdge = {
          id: `edge-${params.source}-${params.target}`,
          source: params.source,
          target: params.target,
        }
        addStoreEdge(newEdge)
      }
    },
    [addStoreEdge],
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      const label = event.dataTransfer.getData("label")

      if (type) {
        const reactFlowBounds = event.currentTarget.getBoundingClientRect()
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        }

        const newNode = {
          id: `node-${Date.now()}`,
          type,
          label,
          position,
          data: { label, nodeType: type },
          status: "idle" as const,
        }

        addNode(newNode)
      }
    },
    [addNode],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes)

      changes.forEach((change: any) => {
        if (change.type === "position" && change.dragging === false && change.position) {
          updateNode(change.id, { position: change.position })
        }
        if (change.type === "remove") {
          deleteNode(change.id)
        }
      })
    },
    [onNodesChange, updateNode, deleteNode],
  )

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes)

      changes.forEach((change: any) => {
        if (change.type === "remove") {
          deleteEdge(change.id)
        }
      })
    },
    [onEdgesChange, deleteEdge],
  )

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id)
      onNodeSelect(node.id)
    },
    [setSelectedNode, onNodeSelect],
  )

  return (
    <div className="w-full h-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
      >
        <Background gap={40} size={1} color="rgb(255 255 255 / 0.03)" />
        <Controls className="bg-card border border-border" />
        <MiniMap
          className="bg-card/80 backdrop-blur-sm border border-border"
          nodeColor={(node) => {
            if (node.data.status === "success") return "#22c55e"
            if (node.data.status === "running") return "#6366f1"
            if (node.data.status === "error") return "#ef4444"
            return "#71717a"
          }}
        />
      </ReactFlow>
    </div>
  )
}
