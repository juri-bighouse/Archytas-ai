"use client"

import { useReactFlow } from "@xyflow/react"
import { useCanRedo, useCanUndo, useRedo, useUndo } from "@liveblocks/react"
import {
  Maximize,
  Minus,
  Plus,
  Redo2,
  Undo2,
  type LucideIcon,
} from "lucide-react"

/** Duration (ms) of the smooth zoom / fit transition. */
const ZOOM_DURATION = 200

interface ControlButtonProps {
  /** Accessible label and tooltip text. */
  label: string
  /** Lucide icon rendered inside the button. */
  icon: LucideIcon
  /** Action to run on click. */
  onClick: () => void
  /** When true, the button is non-interactive and visually dimmed. */
  disabled?: boolean
}

/** A single icon button inside the canvas control bar. */
function ControlButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

/**
 * Floating pill-shaped control bar pinned to the bottom-left of the canvas.
 *
 * Holds two groups separated by a thin divider:
 * - zoom controls (zoom out, fit view, zoom in) wired to the React Flow
 *   instance with a short transition so the movement feels smooth;
 * - history controls (undo, redo) wired to Liveblocks history. Each history
 *   button is disabled — and visually dimmed — when there is nothing to undo
 *   or redo.
 */
export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  return (
    <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 px-2 py-2 shadow-lg backdrop-blur">
      <ControlButton
        label="Zoom out"
        icon={Minus}
        onClick={() => {
          void zoomOut({ duration: ZOOM_DURATION })
        }}
      />
      <ControlButton
        label="Fit view"
        icon={Maximize}
        onClick={() => {
          void fitView({ duration: ZOOM_DURATION })
        }}
      />
      <ControlButton
        label="Zoom in"
        icon={Plus}
        onClick={() => {
          void zoomIn({ duration: ZOOM_DURATION })
        }}
      />

      <div aria-hidden className="mx-1 h-5 w-px bg-surface-border" />

      <ControlButton
        label="Undo"
        icon={Undo2}
        onClick={undo}
        disabled={!canUndo}
      />
      <ControlButton
        label="Redo"
        icon={Redo2}
        onClick={redo}
        disabled={!canRedo}
      />
    </div>
  )
}
