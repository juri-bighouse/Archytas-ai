"use client"

import "@xyflow/react/dist/style.css"

import type { DragEvent } from "react"
import { useCallback, useRef } from "react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Panel,
  type NodeTypes,
} from "@xyflow/react"
import {
  CANVAS_NODE_TYPE,
  DEFAULT_NODE_COLOR,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas"
import { CanvasNodeView } from "./canvas-node"
import { ShapePanel } from "./shape-panel"
import { readShapeDragPayload } from "./shape-drag"

/**
 * Custom React Flow node types. Declared at module scope so the object
 * identity is stable across renders (React Flow re-warns otherwise).
 */
const nodeTypes: NodeTypes = {
  [CANVAS_NODE_TYPE]: CanvasNodeView,
}

/**
 * The collaborative React Flow canvas.
 *
 * Nodes and edges are stored in Liveblocks Storage through `useLiveblocksFlow`,
 * so every change is shared with other collaborators in the room in real time.
 * Dragging a shape from the `ShapePanel` onto the canvas creates a new node at
 * the drop position.
 */
function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const { screenToFlowPosition } = useReactFlow()
  // Disambiguates node IDs created within the same millisecond.
  const dropCounter = useRef(0)

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const payload = readShapeDragPayload(event.dataTransfer)
      if (!payload) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${dropCounter.current++}`,
        type: CANVAS_NODE_TYPE,
        position,
        width: payload.width,
        height: payload.height,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          shape: payload.shape,
        },
      }

      onNodesChange([{ type: "add", item: newNode }])
    },
    [screenToFlowPosition, onNodesChange],
  )

  return (
    <div
      className="relative h-full w-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
        <Panel position="bottom-center" className="z-10 mb-2">
          <ShapePanel />
        </Panel>
      </ReactFlow>
    </div>
  )
}

/**
 * Client entry point for the React Flow canvas surface.
 *
 * Wraps the canvas in `ReactFlowProvider` so `CanvasFlow` can call
 * `useReactFlow` to convert drop coordinates into canvas space. `suspense` is
 * enabled inside `CanvasFlow`, so it only renders once Storage is ready — the
 * `ClientSideSuspense` boundary in `CanvasRoom` covers the wait.
 */
export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  )
}
