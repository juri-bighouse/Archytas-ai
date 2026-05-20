import type { NodeShape } from "@/types/canvas"

/** Border tokens — subtle at rest, brand accent when the node is selected. */
const REST_BORDER = "var(--border-default)"
const SELECTED_BORDER = "var(--accent-primary)"

/** Stroke width for SVG-rendered shapes, in canvas pixels. */
const STROKE_WIDTH = 1.5

/** Shapes drawn as inline SVG rather than CSS borders. */
type SvgShape = Exclude<NodeShape, "rectangle" | "pill" | "circle">

interface NodeShapeGraphicProps {
  /** Shape to render. */
  shape: NodeShape
  /** Rendered width in pixels. */
  width: number
  /** Rendered height in pixels. */
  height: number
  /** Node fill color (hex, from NODE_COLORS). */
  fill: string
  /** Label text color (hex, from NODE_COLORS). */
  textColor: string
  /** Node label text. */
  label: string
  /** Whether the node is selected — brightens the border. */
  selected?: boolean
}

/**
 * Visual body of a canvas node.
 *
 * Simple shapes (rectangle, pill, circle) render as bordered CSS boxes.
 * Complex shapes (diamond, hexagon, cylinder) render as inline SVG so they
 * scale cleanly with the node bounds. The component is purely presentational,
 * so it is shared by rendered canvas nodes and the shape drag preview.
 */
export function NodeShapeGraphic({
  shape,
  width,
  height,
  fill,
  textColor,
  label,
  selected = false,
}: NodeShapeGraphicProps) {
  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    return (
      <div
        className={`flex items-center justify-center border px-3 text-center text-sm leading-tight ${
          shape === "rectangle" ? "rounded-xl" : "rounded-full"
        } ${selected ? "border-brand" : "border-surface-border"}`}
        style={{ width, height, backgroundColor: fill, color: textColor }}
      >
        {label}
      </div>
    )
  }

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        className="block"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden
      >
        <ShapeOutline
          shape={shape}
          width={width}
          height={height}
          fill={fill}
          stroke={selected ? SELECTED_BORDER : REST_BORDER}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm leading-tight"
        style={{ color: textColor }}
      >
        {label}
      </div>
    </div>
  )
}

interface ShapeOutlineProps {
  shape: SvgShape
  width: number
  height: number
  fill: string
  stroke: string
}

/**
 * Inline SVG outline for a complex shape. Geometry is computed in pixel units
 * from the node bounds, so the shape scales with the node while the stroke
 * stays a uniform width.
 */
function ShapeOutline({ shape, width, height, fill, stroke }: ShapeOutlineProps) {
  // Inset the geometry by the stroke width so the stroke is not clipped at
  // the edges of the SVG viewport.
  const inset = STROKE_WIDTH
  // `var()` border tokens only resolve through the `style` property, not the
  // `stroke` presentation attribute.
  const paint = {
    fill,
    strokeWidth: STROKE_WIDTH,
    strokeLinejoin: "round" as const,
    style: { stroke },
  }

  if (shape === "diamond") {
    return (
      <polygon
        points={toPoints([
          [width / 2, inset],
          [width - inset, height / 2],
          [width / 2, height - inset],
          [inset, height / 2],
        ])}
        {...paint}
      />
    )
  }

  if (shape === "hexagon") {
    const corner = Math.min(width * 0.22, height / 2)
    return (
      <polygon
        points={toPoints([
          [corner, inset],
          [width - corner, inset],
          [width - inset, height / 2],
          [width - corner, height - inset],
          [corner, height - inset],
          [inset, height / 2],
        ])}
        {...paint}
      />
    )
  }

  // Cylinder: a body path closed by elliptical top and bottom curves, plus a
  // separate top ellipse that draws the visible rim.
  const rx = width / 2 - inset
  const ry = Math.min(height * 0.18, 22)
  const topCy = inset + ry
  const bottomCy = height - inset - ry
  const body = [
    `M ${inset},${topCy}`,
    `L ${inset},${bottomCy}`,
    `A ${rx},${ry} 0 0 0 ${width - inset},${bottomCy}`,
    `L ${width - inset},${topCy}`,
    `A ${rx},${ry} 0 0 0 ${inset},${topCy}`,
    "Z",
  ].join(" ")

  return (
    <>
      <path d={body} {...paint} />
      <ellipse cx={width / 2} cy={topCy} rx={rx} ry={ry} {...paint} />
    </>
  )
}

/** Formats `[x, y]` pairs into an SVG polygon `points` string. */
function toPoints(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ")
}
