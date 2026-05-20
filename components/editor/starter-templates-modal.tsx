"use client"

import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasNode,
} from "@/types/canvas"
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates"

interface StarterTemplatesModalProps {
  /** Whether the modal is open. */
  readonly open: boolean
  /** Called when the modal requests an open-state change. */
  readonly onOpenChange: (open: boolean) => void
  /** Called with the chosen template when a card's import button is pressed. */
  readonly onImport: (template: CanvasTemplate) => void
}

/**
 * Starter templates import modal.
 *
 * Shows the prebuilt {@link CANVAS_TEMPLATES} as a scrollable grid of cards,
 * each with a lightweight diagram preview. Importing a template hands it to
 * `onImport` and closes the modal.
 */
export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  const handleImport = (template: CanvasTemplate) => {
    onImport(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-elevated p-6 text-copy-primary ring-1 ring-surface-border sm:max-w-5xl">
        <div className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-copy-primary">
              Starter templates
            </DialogTitle>
            <DialogDescription className="text-sm text-copy-muted">
              Start from a prebuilt system design. Importing a template replaces
              everything currently on the canvas.
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onImport={handleImport}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface TemplateCardProps {
  readonly template: CanvasTemplate
  readonly onImport: (template: CanvasTemplate) => void
}

/** A single template card: diagram preview, name, description, import button. */
function TemplateCard({ template, onImport }: TemplateCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface/60 p-3">
      <div className="h-32 overflow-hidden rounded-xl border border-surface-border bg-base">
        <TemplatePreview template={template} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-medium text-copy-primary">
          {template.name}
        </span>
        <span className="text-xs leading-relaxed text-copy-muted">
          {template.description}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={() => onImport(template)}
        className="w-full justify-center gap-1.5"
      >
        <Download />
        Import template
      </Button>
    </div>
  )
}

/** Padding around the diagram bounds in the preview viewport, in canvas units. */
const PREVIEW_PADDING = 56

interface TemplatePreviewProps {
  readonly template: CanvasTemplate
}

/**
 * Lightweight diagram preview for a template card.
 *
 * Renders the template as a plain SVG — no React Flow instance. The SVG
 * `viewBox` is the template's node bounds, so `preserveAspectRatio` fits the
 * whole diagram into the fixed-size card viewport. Edges are simple lines
 * between node centers; nodes are drawn from their shape and color data.
 */
function TemplatePreview({ template }: TemplatePreviewProps) {
  const bounds = getTemplateBounds(template)
  const centers = new Map(
    template.nodes.map((node) => [node.id, nodeCenter(node)] as const),
  )
  const viewBox = [
    bounds.minX - PREVIEW_PADDING,
    bounds.minY - PREVIEW_PADDING,
    bounds.width + PREVIEW_PADDING * 2,
    bounds.height + PREVIEW_PADDING * 2,
  ].join(" ")

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-hidden
    >
      {template.edges.map((edge) => {
        const source = centers.get(edge.source)
        const target = centers.get(edge.target)
        if (!source || !target) return null
        return (
          <line
            key={edge.id}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            style={{ stroke: "var(--border-subtle)" }}
          />
        )
      })}
      {template.nodes.map((node) => (
        <PreviewNode key={node.id} node={node} />
      ))}
    </svg>
  )
}

interface PreviewNodeProps {
  readonly node: CanvasNode
}

/** Draws a single template node as an SVG shape filled with its node color. */
function PreviewNode({ node }: PreviewNodeProps) {
  const color =
    NODE_COLORS.find((c) => c.id === node.data.color) ?? NODE_COLORS[0]
  const size = SHAPE_DEFAULT_SIZES[node.data.shape]
  const w = node.width ?? size.width
  const h = node.height ?? size.height
  const { x, y } = node.position

  const paint = {
    fill: color.fill,
    stroke: color.text,
    strokeWidth: 2,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  }

  switch (node.data.shape) {
    case "circle":
      return (
        <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...paint} />
      )

    case "pill":
      return <rect x={x} y={y} width={w} height={h} rx={h / 2} {...paint} />

    case "diamond":
      return (
        <polygon
          points={toPoints([
            [x + w / 2, y],
            [x + w, y + h / 2],
            [x + w / 2, y + h],
            [x, y + h / 2],
          ])}
          {...paint}
        />
      )

    case "hexagon": {
      const corner = Math.min(w * 0.22, h / 2)
      return (
        <polygon
          points={toPoints([
            [x + corner, y],
            [x + w - corner, y],
            [x + w, y + h / 2],
            [x + w - corner, y + h],
            [x + corner, y + h],
            [x, y + h / 2],
          ])}
          {...paint}
        />
      )
    }

    case "cylinder": {
      const rx = w / 2
      const ry = Math.min(h * 0.18, 22)
      const topCy = y + ry
      const bottomCy = y + h - ry
      const body = [
        `M ${x},${topCy}`,
        `L ${x},${bottomCy}`,
        `A ${rx},${ry} 0 0 0 ${x + w},${bottomCy}`,
        `L ${x + w},${topCy}`,
        `A ${rx},${ry} 0 0 0 ${x},${topCy}`,
        "Z",
      ].join(" ")
      return (
        <>
          <path d={body} {...paint} />
          <ellipse cx={x + w / 2} cy={topCy} rx={rx} ry={ry} {...paint} />
        </>
      )
    }

    case "rectangle":
    default:
      return <rect x={x} y={y} width={w} height={h} rx={14} {...paint} />
  }
}

interface PreviewBounds {
  readonly minX: number
  readonly minY: number
  readonly width: number
  readonly height: number
}

/** Computes the bounding box of every node in a template, in canvas units. */
function getTemplateBounds(template: CanvasTemplate): PreviewBounds {
  if (template.nodes.length === 0) {
    return { minX: 0, minY: 0, width: 1, height: 1 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of template.nodes) {
    const size = SHAPE_DEFAULT_SIZES[node.data.shape]
    const w = node.width ?? size.width
    const h = node.height ?? size.height
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + w)
    maxY = Math.max(maxY, node.position.y + h)
  }

  return { minX, minY, width: maxX - minX, height: maxY - minY }
}

/** Returns the center point of a node, in canvas units. */
function nodeCenter(node: CanvasNode): { x: number; y: number } {
  const size = SHAPE_DEFAULT_SIZES[node.data.shape]
  const w = node.width ?? size.width
  const h = node.height ?? size.height
  return { x: node.position.x + w / 2, y: node.position.y + h / 2 }
}

/** Formats `[x, y]` pairs into an SVG polygon `points` string. */
function toPoints(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ")
}
