// Shared canvas types for the collaborative React Flow canvas.
// The color palette and shape set are documented in context/ui-context.md.
// The same node/edge schema is reused for user-created content and imported
// starter templates (architecture-context.md invariant 5).
import type { Edge, Node } from "@xyflow/react"

/**
 * Node color pairs. Each pair is a dark fill plus a vivid contrasting text
 * color tuned for readability on the dark canvas. The first entry is the
 * default.
 */
export const NODE_COLORS = [
  { id: "neutral", fill: "#1F1F1F", text: "#EDEDED" },
  { id: "blue", fill: "#10233D", text: "#52A8FF" },
  { id: "purple", fill: "#2E1938", text: "#BF7AF0" },
  { id: "orange", fill: "#331B00", text: "#FF990A" },
  { id: "red", fill: "#3C1618", text: "#FF6166" },
  { id: "pink", fill: "#3A1726", text: "#F75F8F" },
  { id: "green", fill: "#0F2E18", text: "#62C073" },
  { id: "teal", fill: "#062822", text: "#0AC7B4" },
] as const

/** A single node color pair from {@link NODE_COLORS}. */
export type NodeColor = (typeof NODE_COLORS)[number]

/** Identifier for a node color, e.g. `"neutral"` or `"blue"`. */
export type NodeColorId = NodeColor["id"]

/** Default node color — neutral dark. */
export const DEFAULT_NODE_COLOR: NodeColorId = "neutral"

/**
 * Supported node shapes. Complex shapes (diamond, hexagon, cylinder) are
 * rendered as inline SVGs by a later feature unit.
 */
export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const

/** A supported node shape from {@link NODE_SHAPES}. */
export type NodeShape = (typeof NODE_SHAPES)[number]

/** Default node shape — general-purpose rectangle. */
export const DEFAULT_NODE_SHAPE: NodeShape = "rectangle"

/** Width and height of a canvas node, in canvas units. */
export interface NodeSize {
  /** Node width in canvas units. */
  width: number
  /** Node height in canvas units. */
  height: number
}

/**
 * Default node dimensions per shape, used when a shape is dropped onto the
 * canvas. Rectangles are wider than tall, circles are square, and diamonds
 * are slightly larger so their labels have room.
 */
export const SHAPE_DEFAULT_SIZES: Record<NodeShape, NodeSize> = {
  rectangle: { width: 180, height: 90 },
  diamond: { width: 200, height: 130 },
  circle: { width: 120, height: 120 },
  pill: { width: 180, height: 70 },
  cylinder: { width: 150, height: 120 },
  hexagon: { width: 180, height: 120 },
}

/**
 * Data carried by every canvas node. Extends `Record<string, unknown>` to
 * satisfy the React Flow `Node` data constraint.
 */
export interface CanvasNodeData extends Record<string, unknown> {
  /** Human-readable node label. */
  label: string
  /** Node color, keyed into {@link NODE_COLORS}. */
  color: NodeColorId
  /** Node shape. */
  shape: NodeShape
}

/** React Flow type identifier for canvas nodes. */
export const CANVAS_NODE_TYPE = "canvasNode"

/** React Flow type identifier for canvas edges. */
export const CANVAS_EDGE_TYPE = "canvasEdge"

/**
 * Default canvas edge color — a light, near-white stroke. Edges are visually
 * secondary to nodes, so the edge renderer dims this at rest. Canvas content
 * (documented in context/ui-context.md), kept here alongside NODE_COLORS
 * rather than as a globals.css theme token.
 */
export const EDGE_COLOR = "#f8fafc"

/**
 * Data carried by every canvas edge. Extends `Record<string, unknown>` to
 * satisfy the React Flow `Edge` data constraint.
 */
export interface CanvasEdgeData extends Record<string, unknown> {
  /** Inline edge label. Empty string when the edge has no label. */
  label: string
}

/** The custom React Flow node used on the canvas. */
export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>

/** The custom React Flow edge used on the canvas. */
export type CanvasEdge = Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE>
