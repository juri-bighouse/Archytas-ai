// Drag-and-drop contract shared between the shape panel (which writes the
// payload) and the canvas (which reads it on drop). The drop event's
// DataTransfer is treated as untrusted input and validated before use.
import { NODE_SHAPES, type NodeShape } from "@/types/canvas"

/** MIME type identifying a shape drag payload on a DataTransfer. */
export const SHAPE_DRAG_MIME = "application/archytas-shape"

/**
 * Payload carried while dragging a shape from the shape panel onto the canvas.
 * Includes the shape name and its default size.
 */
export interface ShapeDragPayload {
  /** The shape to create. */
  readonly shape: NodeShape
  /** Default node width in canvas units. */
  readonly width: number
  /** Default node height in canvas units. */
  readonly height: number
}

/** Serializes a shape drag payload onto a drag event's DataTransfer. */
export function writeShapeDragPayload(
  dataTransfer: DataTransfer,
  payload: ShapeDragPayload,
): void {
  dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload))
  dataTransfer.effectAllowed = "move"
}

/**
 * Reads and validates a shape drag payload from a drop event's DataTransfer.
 * Returns `null` when the payload is absent or malformed.
 */
export function readShapeDragPayload(
  dataTransfer: DataTransfer,
): ShapeDragPayload | null {
  const raw = dataTransfer.getData(SHAPE_DRAG_MIME)
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return null

    const { shape, width, height } = parsed as Record<string, unknown>
    if (
      typeof shape !== "string" ||
      !(NODE_SHAPES as readonly string[]).includes(shape)
    ) {
      return null
    }
    if (typeof width !== "number" || typeof height !== "number") return null

    return { shape: shape as NodeShape, width, height }
  } catch {
    return null
  }
}
