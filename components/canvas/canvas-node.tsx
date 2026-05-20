"use client"

import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  useStoreApi,
  useUpdateNodeInternals,
  type NodeProps,
} from "@xyflow/react"
import {
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type NodeColorId,
} from "@/types/canvas"
import { NodeShapeGraphic } from "./node-shape-graphic"
import { NodeColorToolbar } from "./node-color-toolbar"

/**
 * Connection handles — one per side. The canvas runs in `ConnectionMode.Loose`,
 * so a single handle per side can act as either end of an edge: nodes can be
 * wired together from any direction.
 */
const HANDLES = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
] as const

/** Smallest a node may be resized to, in canvas units. */
const MIN_NODE_WIDTH = 80
const MIN_NODE_HEIGHT = 60

/** Hint shown for an unlabeled node and inside the empty label editor. */
const LABEL_PLACEHOLDER = "Add label"

/**
 * Renderer registered for the custom `canvasNode` React Flow type.
 *
 * Resolves the node's color and size from the Liveblocks-synced `data`, then
 * delegates shape rendering to {@link NodeShapeGraphic}. Selected nodes expose
 * resize handles; double-clicking a node opens an inline label editor. Every
 * node update — resize and label edit alike — flows through React Flow's node
 * change pipeline into Liveblocks Storage, so it stays in sync for every
 * collaborator in the room.
 */
export function CanvasNodeView({
  id,
  data,
  width,
  height,
  selected,
  isConnectable,
}: NodeProps<CanvasNode>) {
  const updateNodeInternals = useUpdateNodeInternals()
  const { getNode } = useReactFlow<CanvasNode, CanvasEdge>()
  const store = useStoreApi<CanvasNode, CanvasEdge>()

  const color =
    NODE_COLORS.find((entry) => entry.id === data.color) ?? NODE_COLORS[0]
  const size = SHAPE_DEFAULT_SIZES[data.shape]
  const nodeWidth = width ?? size.width
  const nodeHeight = height ?? size.height

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // React Flow records a node's handle positions while measuring the node
  // itself. Nodes created with an explicit width/height skip that measuring
  // pass, so the connection system is left with no handle bounds and dragging
  // from a handle does nothing. Force a re-measure once the handles are
  // mounted, and again whenever the node is resized.
  useEffect(() => {
    updateNodeInternals(id)
  }, [id, nodeWidth, nodeHeight, updateNodeInternals])

  // Focus and size the label editor as soon as it opens.
  useEffect(() => {
    if (!isEditing) return
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.focus()
    textarea.select()
    autoGrowTextarea(textarea)
  }, [isEditing])

  /**
   * Persist a label change through the same node-change pipeline React Flow
   * uses internally: `triggerNodeChanges` forwards a `replace` change to the
   * Liveblocks-backed `onNodesChange`, so the new label is written to Storage
   * and synced to every collaborator.
   */
  function commitLabel(label: string) {
    const node = getNode(id)
    if (!node) return
    store.getState().triggerNodeChanges([
      {
        id,
        type: "replace",
        item: { ...node, data: { ...node.data, label } },
      },
    ])
  }

  /**
   * Persist a color change through the same node-change pipeline as
   * {@link commitLabel}: a `replace` change updates `data.color`, which writes
   * to Liveblocks Storage and syncs to every collaborator. The node body and
   * label re-render with the new fill/text immediately — no server call.
   */
  function commitColor(color: NodeColorId) {
    const node = getNode(id)
    if (!node) return
    store.getState().triggerNodeChanges([
      {
        id,
        type: "replace",
        item: { ...node, data: { ...node.data, color } },
      },
    ])
  }

  function openEditor() {
    setDraft(data.label)
    setIsEditing(true)
  }

  function handleLabelChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDraft(event.target.value)
    autoGrowTextarea(event.target)
    commitLabel(event.target.value)
  }

  function handleLabelKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Keep typing — Backspace included — from reaching the canvas keyboard
    // shortcuts (node deletion, selection).
    event.stopPropagation()
    if (event.key === "Escape") {
      event.preventDefault()
      setIsEditing(false)
    }
  }

  return (
    <div
      // `nopan` keeps the double-click that opens the editor from zooming the
      // canvas; it does not affect node dragging (that is the `nodrag` class).
      className="group relative nopan"
      style={{ width: nodeWidth, height: nodeHeight }}
      onDoubleClick={openEditor}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        lineStyle={{ borderColor: "var(--border-subtle)" }}
        handleStyle={{
          width: 9,
          height: 9,
          borderRadius: 2,
          backgroundColor: "var(--accent-primary)",
          border: "1px solid var(--bg-base)",
        }}
      />

      <NodeShapeGraphic
        shape={data.shape}
        width={nodeWidth}
        height={nodeHeight}
        fill={color.fill}
        textColor={color.text}
        // Hide the rendered label while editing so it does not show through
        // the transparent textarea overlaid on top of it.
        label={isEditing ? "" : data.label}
        selected={selected}
      />

      {!isEditing && data.label === "" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-sm leading-tight text-copy-faint"
        >
          {LABEL_PLACEHOLDER}
        </div>
      )}

      {isEditing && (
        <div className="nodrag absolute inset-0 flex items-center justify-center px-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            placeholder={LABEL_PLACEHOLDER}
            onChange={handleLabelChange}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleLabelKeyDown}
            className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-center text-sm leading-tight outline-none placeholder:text-copy-faint"
            style={{ color: color.text }}
          />
        </div>
      )}

      {HANDLES.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          isConnectable={isConnectable}
          className="opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            // Small white dot with a dark border so it stays subtle but
            // defined against the node and the canvas behind it.
            border: "1.5px solid var(--bg-base)",
            background: "var(--text-primary)",
          }}
        />
      ))}

      {selected && (
        <NodeColorToolbar activeColorId={color.id} onSelectColor={commitColor} />
      )}
    </div>
  )
}

/** Grows a textarea to fit its content so the label editor never scrolls. */
function autoGrowTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto"
  textarea.style.height = `${textarea.scrollHeight}px`
}
