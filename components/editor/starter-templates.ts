// Starter template library.
//
// A small set of prebuilt canvas diagrams users can import instead of starting
// from a blank canvas. Templates are static canvas snapshots built from the
// shared canvas node/edge schema (architecture-context.md invariant 5), so
// importing one is just adding regular nodes and edges to the room.
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type NodeColorId,
  type NodeShape,
} from "@/types/canvas"

/** A prebuilt canvas diagram that can be imported into the editor. */
export interface CanvasTemplate {
  /** Stable template identifier. */
  id: string
  /** Display name shown on the template card. */
  name: string
  /** Short description of what the template contains. */
  description: string
  /** Canvas nodes that make up the template diagram. */
  nodes: CanvasNode[]
  /** Canvas edges connecting the template nodes. */
  edges: CanvasEdge[]
}

/**
 * Builds a template node. Dimensions come from the shared per-shape defaults,
 * so template nodes match user-created nodes exactly.
 */
function node(
  id: string,
  shape: NodeShape,
  color: NodeColorId,
  label: string,
  x: number,
  y: number,
): CanvasNode {
  const size = SHAPE_DEFAULT_SIZES[shape]
  return {
    id,
    type: CANVAS_NODE_TYPE,
    position: { x, y },
    width: size.width,
    height: size.height,
    data: { label, color, shape },
  }
}

/**
 * Builds a template edge. The arrowhead is supplied by the canvas
 * `defaultEdgeOptions` at render time, so only the type and label are stored.
 */
function edge(
  id: string,
  source: string,
  target: string,
  label = "",
): CanvasEdge {
  return {
    id,
    type: CANVAS_EDGE_TYPE,
    source,
    target,
    data: { label },
  }
}

/** Microservices architecture — an API gateway fronting independent services. */
const MICROSERVICES: CanvasTemplate = {
  id: "microservices",
  name: "Microservices Architecture",
  description:
    "An API gateway routes traffic to independent auth, orders, and payments services, each backed by its own database.",
  nodes: [
    node("ms-client", "rectangle", "neutral", "Web Client", 0, 210),
    node("ms-gateway", "hexagon", "teal", "API Gateway", 280, 195),
    node("ms-auth", "pill", "purple", "Auth Service", 560, 40),
    node("ms-orders", "pill", "blue", "Orders Service", 560, 220),
    node("ms-payments", "pill", "green", "Payments Service", 560, 400),
    node("ms-orders-db", "cylinder", "orange", "Orders DB", 840, 195),
    node("ms-payments-db", "cylinder", "orange", "Payments DB", 840, 375),
  ],
  edges: [
    edge("ms-e-client-gateway", "ms-client", "ms-gateway"),
    edge("ms-e-gateway-auth", "ms-gateway", "ms-auth", "authenticate"),
    edge("ms-e-gateway-orders", "ms-gateway", "ms-orders"),
    edge("ms-e-gateway-payments", "ms-gateway", "ms-payments"),
    edge("ms-e-orders-db", "ms-orders", "ms-orders-db"),
    edge("ms-e-payments-db", "ms-payments", "ms-payments-db"),
    edge("ms-e-orders-payments", "ms-orders", "ms-payments", "checkout"),
  ],
}

/** CI/CD pipeline — commit through build, test, gate, and deploy stages. */
const CI_CD_PIPELINE: CanvasTemplate = {
  id: "ci-cd-pipeline",
  name: "CI/CD Pipeline",
  description:
    "A continuous delivery pipeline runs commits through build, test, and a quality gate into staging and production deploys.",
  nodes: [
    node("cicd-commit", "circle", "blue", "Commit", 30, 180),
    node("cicd-build", "rectangle", "neutral", "Build", 300, 195),
    node("cicd-test", "rectangle", "neutral", "Test", 570, 195),
    node("cicd-gate", "diamond", "orange", "Quality Gate", 860, 175),
    node("cicd-staging", "pill", "purple", "Deploy Staging", 1170, 85),
    node("cicd-prod", "pill", "green", "Deploy Prod", 1170, 325),
    node("cicd-registry", "cylinder", "teal", "Artifact Registry", 315, 410),
  ],
  edges: [
    edge("cicd-e-commit-build", "cicd-commit", "cicd-build"),
    edge("cicd-e-build-test", "cicd-build", "cicd-test"),
    edge("cicd-e-build-registry", "cicd-build", "cicd-registry", "publish"),
    edge("cicd-e-test-gate", "cicd-test", "cicd-gate"),
    edge("cicd-e-gate-staging", "cicd-gate", "cicd-staging", "pass"),
    edge("cicd-e-staging-prod", "cicd-staging", "cicd-prod", "promote"),
  ],
}

/** Event-driven system — a broker fans events out to multiple consumers. */
const EVENT_DRIVEN: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description:
    "An order service publishes events to a broker that fans them out to inventory, notification, and analytics consumers.",
  nodes: [
    node("eda-producer", "rectangle", "blue", "Order Service", 0, 210),
    node("eda-broker", "hexagon", "teal", "Event Broker", 310, 195),
    node("eda-inventory", "pill", "purple", "Inventory", 610, 55),
    node("eda-notifications", "pill", "orange", "Notifications", 610, 220),
    node("eda-analytics", "pill", "green", "Analytics", 610, 385),
    node("eda-store", "cylinder", "neutral", "Event Store", 325, 410),
    node("eda-dashboard", "circle", "pink", "Dashboard", 930, 360),
  ],
  edges: [
    edge("eda-e-producer-broker", "eda-producer", "eda-broker", "publish"),
    edge("eda-e-broker-inventory", "eda-broker", "eda-inventory"),
    edge("eda-e-broker-notifications", "eda-broker", "eda-notifications"),
    edge("eda-e-broker-analytics", "eda-broker", "eda-analytics"),
    edge("eda-e-broker-store", "eda-broker", "eda-store", "persist"),
    edge("eda-e-analytics-dashboard", "eda-analytics", "eda-dashboard"),
  ],
}

/** The curated set of starter templates shown in the import modal. */
export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  MICROSERVICES,
  CI_CD_PIPELINE,
  EVENT_DRIVEN,
]
