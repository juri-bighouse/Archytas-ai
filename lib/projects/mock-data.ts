export interface MockProject {
  id: string
  name: string
  slug: string
}

export const MOCK_OWNED_PROJECTS: MockProject[] = [
  { id: "p1", name: "Order Service Architecture", slug: "order-service-architecture" },
  { id: "p2", name: "Realtime Chat Backbone", slug: "realtime-chat-backbone" },
]

export const MOCK_SHARED_PROJECTS: MockProject[] = [
  { id: "p3", name: "Payments Platform", slug: "payments-platform" },
]

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}
