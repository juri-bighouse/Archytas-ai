"use client"

import type { NodeProps } from "@xyflow/react"
import {
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasNode,
} from "@/types/canvas"

/**
 * Basic renderer for the custom canvas node type.
 *
 * For this feature unit every shape renders as a simple bordered rectangle
 * with the label centered. Shape-specific visuals (diamond, hexagon, and
 * cylinder SVGs, connection handles) are added by a later unit.
 */
export function CanvasNodeView({ data, width, height }: NodeProps<CanvasNode>) {
  const color =
    NODE_COLORS.find((entry) => entry.id === data.color) ?? NODE_COLORS[0]
  const size = SHAPE_DEFAULT_SIZES[data.shape]

  return (
    <div
      className="flex items-center justify-center rounded-xl border border-surface-border px-3 text-center text-sm"
      style={{
        width: width ?? size.width,
        height: height ?? size.height,
        backgroundColor: color.fill,
        color: color.text,
      }}
    >
      {data.label}
    </div>
  )
}
