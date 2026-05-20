"use client"

import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  useStoreApi,
  type EdgeProps,
} from "@xyflow/react"
import { EDGE_COLOR, type CanvasEdge, type CanvasNode } from "@/types/canvas"

/** Visible stroke width, in canvas pixels — edges stay secondary to nodes. */
const STROKE_WIDTH = 1.5

/**
 * Width of the invisible path that captures hover and double-click. Far wider
 * than the visible stroke, so edges are easy to target without thickening the
 * line itself.
 */
const INTERACTION_WIDTH = 22

/** Stroke opacity at rest — edges sit quietly until hovered or selected. */
const REST_OPACITY = 0.55

/** Smallest width of the label editor, in characters, so the hint stays legible. */
const EDITOR_MIN_SIZE = 9

/** Hint shown on an active, unlabeled edge; also the editor placeholder. */
const LABEL_PLACEHOLDER = "Add label"

/**
 * Renderer registered for the custom `canvasEdge` React Flow type.
 *
 * Routes edges with clean right-angle (smooth-step) paths, keeps them dimmed
 * at rest and brightens them on hover or selection, and widens the hit area
 * with an invisible interaction path so edges stay easy to click without a
 * thicker line. Double-clicking an edge opens an inline label editor; the
 * label lives on `edge.data` and is synced through the same Liveblocks-backed
 * edge change pipeline used for every other edge update.
 */
export function CanvasEdgeView({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const { getEdge } = useReactFlow<CanvasNode, CanvasEdge>()
  const store = useStoreApi<CanvasNode, CanvasEdge>()

  // Smooth-step path: clean right-angle routing. `labelX`/`labelY` are the
  // path midpoint — used directly to place the label, never computed by hand.
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const label = data?.label ?? ""

  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

  const isActive = isHovered || Boolean(selected) || isEditing

  // Focus and select the editor as soon as it opens.
  useEffect(() => {
    if (!isEditing) return
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [isEditing])

  /**
   * Persist the label through React Flow's edge change pipeline:
   * `triggerEdgeChanges` forwards a `replace` change to the Liveblocks-backed
   * `onEdgesChange`, writing the new label into Storage for every collaborator.
   * The full edge is required — `replace` reconciles with full extent, so keys
   * absent from the item would be dropped.
   */
  function commitLabel(nextLabel: string) {
    const edge = getEdge(id)
    if (!edge) return
    store.getState().triggerEdgeChanges([
      {
        id,
        type: "replace",
        item: { ...edge, data: { ...edge.data, label: nextLabel } },
      },
    ])
  }

  function openEditor() {
    setDraft(label)
    setIsEditing(true)
  }

  function finishEditing() {
    commitLabel(draft.trim())
    setIsEditing(false)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setDraft(event.target.value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Keep typing — Backspace included — from reaching the canvas keyboard
    // shortcuts (edge deletion, selection).
    event.stopPropagation()
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault()
      finishEditing()
    }
  }

  return (
    <>
      {/* Group opacity dims the line and its arrowhead together at rest. */}
      <g
        style={{
          opacity: isActive ? 1 : REST_OPACITY,
          transition: "opacity 150ms ease",
        }}
      >
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          // The wide interaction path below owns hover/double-click, so the
          // one BaseEdge would add on its own is disabled to avoid a duplicate.
          interactionWidth={0}
          style={{
            stroke: EDGE_COLOR,
            strokeWidth: STROKE_WIDTH,
            strokeLinecap: "round",
          }}
        />
      </g>

      {/* Invisible wide path: widens the hit area for hover and double-click
          without thickening the visible edge. `nopan` keeps the
          editor-opening double-click from zooming the canvas. */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={INTERACTION_WIDTH}
        className="react-flow__edge-interaction nopan"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={openEditor}
      />

      {(isEditing || label !== "" || isActive) && (
        <EdgeLabelRenderer>
          <div
            // `nodrag`/`nopan` keep label clicks and typing from dragging or
            // panning the canvas. `pointer-events-auto` re-enables interaction
            // inside the otherwise click-through label layer.
            className="nodrag nopan pointer-events-auto absolute"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                value={draft}
                // The `size` attribute grows the input with the label text.
                size={Math.max(draft.length, EDITOR_MIN_SIZE)}
                placeholder={LABEL_PLACEHOLDER}
                onChange={handleChange}
                onBlur={finishEditing}
                onKeyDown={handleKeyDown}
                className="rounded-full border border-brand bg-surface px-2 py-0.5 text-center text-xs text-copy-primary outline-none placeholder:text-copy-faint"
              />
            ) : label !== "" ? (
              // Saved label — a small pill badge.
              <div
                onDoubleClick={openEditor}
                className="cursor-pointer select-none whitespace-nowrap rounded-full border border-surface-border bg-surface px-2 py-0.5 text-xs text-copy-secondary shadow-sm"
              >
                {label}
              </div>
            ) : (
              // Active but unlabeled — a faint hint prompting a label.
              <div
                onDoubleClick={openEditor}
                className="cursor-pointer select-none whitespace-nowrap rounded-full border border-dashed border-surface-border bg-surface/80 px-2 py-0.5 text-xs text-copy-faint"
              >
                {LABEL_PLACEHOLDER}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
