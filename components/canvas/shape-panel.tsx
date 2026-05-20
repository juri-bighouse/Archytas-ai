"use client"

import type { DragEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
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
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  type NodeShape,
} from "@/types/canvas"
import { writeShapeDragPayload } from "./shape-drag"
import { NodeShapeGraphic } from "./node-shape-graphic"

/** Icon and human-readable label for each draggable shape. */
const SHAPE_ICONS: Record<NodeShape, { label: string; Icon: LucideIcon }> = {
  rectangle: { label: "Rectangle", Icon: RectangleHorizontal },
  diamond: { label: "Diamond", Icon: Diamond },
  circle: { label: "Circle", Icon: Circle },
  pill: { label: "Pill", Icon: Pill },
  cylinder: { label: "Cylinder", Icon: Cylinder },
  hexagon: { label: "Hexagon", Icon: Hexagon },
}

/** Color used for the drag preview — the same default a dropped node gets. */
const PREVIEW_COLOR =
  NODE_COLORS.find((color) => color.id === DEFAULT_NODE_COLOR) ?? NODE_COLORS[0]

/**
 * Floating pill-shaped toolbar at the bottom-center of the canvas. Each button
 * is draggable; dragging one onto the canvas creates a new node of that shape.
 *
 * While dragging, an off-screen shape preview is used as the drag image so the
 * cursor carries a ghost of the exact shape and size that will be dropped. The
 * browser hides the drag image automatically once the drag ends.
 */
export function ShapePanel() {
  // Off-screen preview elements, one per shape, used as the drag image.
  const previewRefs = useRef<Partial<Record<NodeShape, HTMLDivElement | null>>>(
    {},
  )
  // The previews are portaled to the document body; render them only after
  // mount so the portal target exists.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

    const preview = previewRefs.current[shape]
    if (preview) {
      // Anchor the cursor to the preview's top-left so the ghost footprint
      // matches where the dropped node's top-left will land.
      event.dataTransfer.setDragImage(preview, 0, 0)
    }
  }

  return (
    <>
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

      {mounted &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none fixed top-0"
            style={{ left: -9999 }}
          >
            {NODE_SHAPES.map((shape) => {
              const size = SHAPE_DEFAULT_SIZES[shape]
              return (
                <div
                  key={shape}
                  ref={(element) => {
                    previewRefs.current[shape] = element
                  }}
                >
                  <NodeShapeGraphic
                    shape={shape}
                    width={size.width}
                    height={size.height}
                    fill={PREVIEW_COLOR.fill}
                    textColor={PREVIEW_COLOR.text}
                    label=""
                  />
                </div>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}
