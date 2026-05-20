"use client"

import "@xyflow/react/dist/style.css"

import type { DragEvent } from "react"
import { useCallback, useEffect, useRef } from "react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useRedo, useUndo } from "@liveblocks/react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Panel,
  type DefaultEdgeOptions,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react"
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  DEFAULT_NODE_COLOR,
  EDGE_COLOR,
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type NodeShape,
} from "@/types/canvas"
import { cn } from "@/lib/utils"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useWorkspaceContext } from "@/components/editor/workspace-context"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { CanvasNodeView } from "./canvas-node"
import { CanvasEdgeView } from "./canvas-edge"
import { CanvasControls } from "./canvas-controls"
import { ShapePanel } from "./shape-panel"
import { readShapeDragPayload } from "./shape-drag"

/**
 * Custom React Flow node types. Declared at module scope so the object
 * identity is stable across renders (React Flow re-warns otherwise).
 */
const nodeTypes: NodeTypes = {
  [CANVAS_NODE_TYPE]: CanvasNodeView,
}

/** Custom React Flow edge types — module-scoped for stable identity. */
const edgeTypes: EdgeTypes = {
  [CANVAS_EDGE_TYPE]: CanvasEdgeView,
}

/**
 * Defaults applied to every new edge. New connections render with the custom
 * canvas edge renderer and carry a filled arrowhead at the target end; the
 * stroke styling itself lives in the renderer. React Flow merges these into
 * the connection before `onConnect` runs, so the type and marker are persisted
 * to Liveblocks Storage with the edge.
 */
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: CANVAS_EDGE_TYPE,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: EDGE_COLOR,
    width: 18,
    height: 18,
  },
  data: { label: "" },
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

  const reactFlow = useReactFlow()
  const { screenToFlowPosition } = reactFlow
  // Disambiguates node IDs created within the same millisecond.
  const dropCounter = useRef(0)
  // Set when a template import needs the view fitted once its nodes render.
  const pendingFitViewRef = useRef(false)

  // Keyboard shortcuts share the floating control bar's actions: zoom via the
  // React Flow instance, undo/redo via Liveblocks history.
  const undo = useUndo()
  const redo = useRedo()
  useKeyboardShortcuts({ reactFlow, onUndo: undo, onRedo: redo })

  // The starter templates modal is opened from the editor navbar; its
  // open/close state lives in the shared workspace context.
  const workspace = useWorkspaceContext()

  // After a template import, fit the view once the new nodes have rendered.
  useEffect(() => {
    if (!pendingFitViewRef.current) return
    pendingFitViewRef.current = false
    const frame = requestAnimationFrame(() => {
      void reactFlow.fitView({ duration: 400, padding: 0.2 })
    })
    return () => cancelAnimationFrame(frame)
  }, [nodes, reactFlow])

  const onImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      // Replace the canvas: clear every existing edge and node first so the
      // template does not stack on top of current work.
      if (edges.length > 0) {
        onEdgesChange(
          edges.map((edge) => ({ type: "remove" as const, id: edge.id })),
        )
      }
      if (nodes.length > 0) {
        onNodesChange(
          nodes.map((node) => ({ type: "remove" as const, id: node.id })),
        )
      }

      // Add the template content once the canvas is cleared. Each item is
      // cloned so the shared template constants are never mutated.
      onNodesChange(
        template.nodes.map((node) => ({
          type: "add" as const,
          item: {
            ...node,
            position: { ...node.position },
            data: { ...node.data },
          },
        })),
      )
      onEdgesChange(
        template.edges.map((edge) => ({
          type: "add" as const,
          item: {
            ...edge,
            data: edge.data ? { ...edge.data } : undefined,
          },
        })),
      )

      // Fit the view after the new nodes render (handled by the effect above).
      pendingFitViewRef.current = true
    },
    [nodes, edges, onNodesChange, onEdgesChange],
  )

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      let payload = readShapeDragPayload(event.dataTransfer)

      // Fallback in case the drag dataTransfer custom MIME type is stripped or empty
      if (!payload) {
        const shapeStr =
          event.dataTransfer.getData("application/reactflow") ||
          event.dataTransfer.getData("text/plain")
        if (shapeStr && (NODE_SHAPES as readonly string[]).includes(shapeStr)) {
          const shape = shapeStr as NodeShape
          const size = SHAPE_DEFAULT_SIZES[shape]
          payload = {
            shape,
            width: size.width,
            height: size.height,
          }
        }
      }

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
      className="relative h-full w-full bg-base border-none shadow-none rounded-none p-0 m-0 overflow-hidden"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
        className="border-none shadow-none rounded-none p-0 m-0"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="var(--border-default)"
          gap={20}
          size={1}
        />
        <Panel
          position="bottom-left"
          className={cn(
            "z-10 mb-2 transition-transform duration-200 ease-in-out",
            // Shift clear of the project sidebar (w-64) while it is open so it
            // does not cover the zoom and history controls.
            workspace?.sidebarOpen && "translate-x-64",
          )}
        >
          <CanvasControls />
        </Panel>
        <Panel position="bottom-center" className="z-10 mb-2">
          <ShapePanel />
        </Panel>
      </ReactFlow>
      <StarterTemplatesModal
        open={workspace?.templatesModalOpen ?? false}
        onOpenChange={(next) => {
          if (!next) workspace?.closeTemplatesModal()
        }}
        onImport={onImportTemplate}
      />
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
