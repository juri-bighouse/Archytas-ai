"use client"

import type { DragEvent } from "react"
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
  type LucideIcon,
} from "lucide-react"
import {
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  type NodeShape,
} from "@/types/canvas"
import { writeShapeDragPayload } from "./shape-drag"

/** Icon and human-readable label for each draggable shape. */
const SHAPE_ICONS: Record<NodeShape, { label: string; Icon: LucideIcon }> = {
  rectangle: { label: "Rectangle", Icon: RectangleHorizontal },
  diamond: { label: "Diamond", Icon: Diamond },
  circle: { label: "Circle", Icon: Circle },
  pill: { label: "Pill", Icon: Pill },
  cylinder: { label: "Cylinder", Icon: Cylinder },
  hexagon: { label: "Hexagon", Icon: Hexagon },
}

/**
 * Floating pill-shaped toolbar at the bottom-center of the canvas. Each button
 * is draggable; dragging one onto the canvas creates a new node of that shape.
 */
export function ShapePanel() {
  function handleDragStart(
    event: DragEvent<HTMLButtonElement>,
    shape: NodeShape,
  ) {
    const size = SHAPE_DEFAULT_SIZES[shape]
    writeShapeDragPayload(event.dataTransfer, {
      shape,
      width: size.width,
      height: size.height,
    })
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 px-2 py-2 backdrop-blur">
      {NODE_SHAPES.map((shape) => {
        const { label, Icon } = SHAPE_ICONS[shape]
        return (
          <button
            key={shape}
            type="button"
            draggable
            onDragStart={(event) => handleDragStart(event, shape)}
            title={`Drag to add ${label.toLowerCase()}`}
            aria-label={`Drag to add ${label.toLowerCase()}`}
            className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary active:cursor-grabbing"
          >
            <Icon className="h-5 w-5" />
          </button>
        )
      })}
    </div>
  )
}
