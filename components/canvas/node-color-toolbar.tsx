"use client"

import type { CSSProperties } from "react"
import { NODE_COLORS, type NodeColorId } from "@/types/canvas"

interface NodeColorToolbarProps {
  /** The node's current color — its swatch renders in the active state. */
  activeColorId: NodeColorId
  /** Invoked with the chosen color when a swatch is clicked. */
  onSelectColor: (colorId: NodeColorId) => void
}

/** Capitalizes a color id for display, e.g. `"blue"` -> `"Blue"`. */
function colorLabel(id: NodeColorId): string {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

/**
 * Floating color toolbar shown above a selected node.
 *
 * Renders one swatch per {@link NODE_COLORS} pair — each swatch previews the
 * pair as the dark node fill with a dot in its paired text color. Clicking a
 * swatch recolors the node (background fill + text color together). The active
 * swatch carries a brand-accent ring; hovering any swatch shows a tight glow
 * in that swatch's text color. `nodrag`/`nopan` keep swatch interaction from
 * dragging the node or panning the canvas.
 */
export function NodeColorToolbar({
  activeColorId,
  onSelectColor,
}: NodeColorToolbarProps) {
  return (
    <div
      // Sits slightly above the node without overlapping it. `nodrag`/`nopan`
      // stop swatch clicks from dragging the node or panning the canvas.
      className="nodrag nopan absolute bottom-[calc(100%+0.5rem)] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface/95 px-2 py-2 shadow-lg backdrop-blur"
      // A double-click on a swatch must not bubble to the node's label editor.
      onDoubleClick={(event) => event.stopPropagation()}
    >
      {NODE_COLORS.map((color) => {
        const isActive = color.id === activeColorId
        const label = colorLabel(color.id)
        return (
          <button
            key={color.id}
            type="button"
            aria-label={`Node color: ${label}`}
            aria-pressed={isActive}
            title={label}
            onClick={() => onSelectColor(color.id)}
            // The brand ring (active) and the hover glow are both box-shadows,
            // so they compose: a hovered active swatch shows ring and glow.
            className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border transition-shadow duration-150 hover:shadow-[0_0_8px_1px_var(--swatch-glow)] ${
              isActive ? "border-brand ring-2 ring-brand" : "border-surface-border"
            }`}
            style={
              {
                backgroundColor: color.fill,
                "--swatch-glow": color.text,
              } as CSSProperties
            }
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color.text }}
            />
          </button>
        )
      })}
    </div>
  )
}
