# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Shape Panel (Feature Unit 12) — complete.

## Current Goal

- Move on to the next feature unit — check `context/feature-specs/` for the next spec.

## Completed

- Sidebar, Canvas, and Drag & Drop Polish (Post-Feature 12):
  - `components/editor/editor-shell.tsx`: added `overflow-hidden` to prevent layout scrolling and off-screen shadow leaks.
  - `components/editor/project-sidebar.tsx`: changed sidebar to floating `bg-surface/80 backdrop-blur shadow-2xl` styling and off-screen translation `translate-x-[calc(-100%-3rem)]` to hide the shadow when toggled off.
  - `components/editor/ai-sidebar.tsx`: added `shadow-2xl` and changed closed translation to `translate-x-[calc(100%+4rem)]`.
  - `components/canvas/canvas.tsx`: explicitly cleared borders, shadows, margins, and padding on React Flow and its container; customized `<Background>` dots using design token `var(--border-default)`; added fallback parsing in `onDrop` for simplified drag-and-drop actions.
  - `components/canvas/shape-drag.ts`: updated `writeShapeDragPayload` to write generic fallback keys `application/reactflow` and `text/plain` to `dataTransfer` to ensure node type is explicitly set.

- Feature 12 — Shape Panel:
  - `types/canvas.ts`: added `NodeSize` interface (`width`/`height`) and `SHAPE_DEFAULT_SIZES` — a `Record<NodeShape, NodeSize>` of default node dimensions per shape. Rectangles are wider than tall (`180×90`), circles are square (`120×120`), and diamonds are slightly larger so labels have room (`200×130`); pill `180×70`, cylinder `150×120`, hexagon `180×120`.
  - `components/canvas/shape-drag.ts`: the drag-and-drop contract shared by the shape panel and the canvas. `SHAPE_DRAG_MIME` (`"application/archytas-shape"`), the `ShapeDragPayload` interface (`shape`, `width`, `height`), `writeShapeDragPayload` (serializes onto a `DataTransfer`, sets `effectAllowed = "move"`), and `readShapeDragPayload` (reads + validates on drop — JSON-parses in a try/catch, checks `shape` is a known `NODE_SHAPES` value and `width`/`height` are numbers; returns `null` on any malformed/absent payload). Plain `.ts` module (no JSX, no `"use client"`).
  - `components/canvas/canvas-node.tsx`: `CanvasNodeView` — the renderer registered for the custom `canvasNode` React Flow type. Renders every shape as a simple bordered rectangle with the label centered, sized from the node's `width`/`height` (falling back to `SHAPE_DEFAULT_SIZES[shape]`) and colored from `NODE_COLORS` (`fill` background, `text` color). Shape-specific visuals (diamond/hexagon/cylinder SVGs, connection handles) are deferred to a later unit per the spec.
  - `components/canvas/shape-panel.tsx`: `ShapePanel` — a floating pill-shaped (`rounded-full`) toolbar pinned bottom-center of the canvas (`absolute bottom-6 left-1/2 -translate-x-1/2 z-10`, glass `bg-surface/90 backdrop-blur` + `border-surface-border`). Renders one draggable icon button per `NODE_SHAPES` entry (rectangle/diamond/circle/pill/cylinder/hexagon → Lucide `RectangleHorizontal`/`Diamond`/`Circle`/`Pill`/`Cylinder`/`Hexagon`). `onDragStart` writes the shape + default size into the drag payload via `writeShapeDragPayload`.
  - `components/canvas/canvas.tsx`: split into `Canvas` (wraps `<ReactFlowProvider>`) and an inner `CanvasFlow`. `ReactFlowProvider` is required so `CanvasFlow` can call `useReactFlow().screenToFlowPosition` — `useReactFlow` only works for a component inside the provider, and the component that renders `<ReactFlow>` is its parent, not a child. `CanvasFlow` registers `nodeTypes = { canvasNode: CanvasNodeView }` (module-scoped for stable identity), and adds `onDragOver`/`onDrop` to the canvas wrapper div (`relative h-full w-full`). On drop: reads the payload, converts the screen point to canvas coordinates via `screenToFlowPosition`, and adds a node through `onNodesChange([{ type: "add", item }])` (`useLiveblocksFlow` exposes no `setNodes`; its `onNodesChange` handles `"add"` changes by inserting into Storage). New nodes use an empty label, `DEFAULT_NODE_COLOR`, the dragged shape, and the dragged size; the node ID is `${shape}-${Date.now()}-${counter}` where `counter` is a `useRef` incremented per drop to disambiguate same-millisecond drops. Renders `<ShapePanel>` inside `<ReactFlow>` wrapped in React Flow's `<Panel position="bottom-center">` to ensure correct stacking context, z-index layering, and viewport centering.
  - Verified: `npm run build` passes (TypeScript + Next.js production build); `/editor/[projectId]` compiles.

- Feature 11 — Base Canvas:
  - `types/canvas.ts`: shared canvas schema. `NODE_COLORS` — 8 `{ id, fill, text }` color pairs (`as const`), with derived `NodeColor` / `NodeColorId` types and `DEFAULT_NODE_COLOR = "neutral"`. `NODE_SHAPES` — 6 shapes (`as const`), with derived `NodeShape` type and `DEFAULT_NODE_SHAPE = "rectangle"`. `CanvasNodeData` interface (`label`, `color`, `shape`) extends `Record<string, unknown>` to satisfy the React Flow `Node` data constraint. `CANVAS_NODE_TYPE`/`CANVAS_EDGE_TYPE` string constants (`"canvasNode"`, `"canvasEdge"`) and the `CanvasNode` / `CanvasEdge` React Flow types built from them.
  - `components/canvas/canvas-room.tsx`: client wrapper. `LiveblocksProvider authEndpoint="/api/liveblocks-auth"` → `RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}` → `ErrorBoundary` (react-error-boundary) → `ClientSideSuspense` → `Canvas`. Takes `roomId` (always the project ID).
  - `components/canvas/canvas.tsx`: the React Flow canvas. `useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true, nodes: { initial: [] }, edges: { initial: [] } })` syncs nodes/edges through Liveblocks Storage. Renders `<ReactFlow>` with the synced state + change handlers, `connectionMode={ConnectionMode.Loose}` (loose connections), `colorMode="dark"`, `fitView`, base-background style, plus `<Background variant={BackgroundVariant.Dots}>` (dot pattern) and `<MiniMap>`.
  - `components/canvas/canvas-fallbacks.tsx`: `CanvasLoading` (spinner + "Connecting…") and `CanvasError` (`FallbackProps`; unplug icon, message, `Retry` button calling `resetErrorBoundary`) — both share a centered `CanvasFrame`.
  - `app/editor/[projectId]/page.tsx`: still server-side (auth + `getProjectAccess`); now renders `<CanvasRoom roomId={projectId} />` instead of the placeholder.
  - Removed `components/editor/workspace-shell.tsx` — it was the canvas placeholder this feature replaces.
  - `react-error-boundary@6.1.1` installed (the Liveblocks-recommended error fallback primitive; supports React 19).
  - Verified: `npm run build` passes (TypeScript + Next.js production build); `/editor/[projectId]` compiles.

- Feature 10 — Liveblocks Setup:
  - `liveblocks.config.ts`: global `Liveblocks` interface. `Presence` = `{ cursor: { x: number; y: number } | null; isThinking: boolean }` (cursor is `null` when off-canvas). `UserMeta` = `{ id: string; info: { name: string; avatar: string; color: string } }`. `Storage`, `RoomEvent`, `ThreadMetadata`, `RoomInfo` left as empty `{}` placeholders for later features.
  - `lib/liveblocks.ts`: cached Liveblocks node client exposed via `getLiveblocks()` — a lazily-constructed, `globalThis`-cached singleton. Construction is lazy (not module-scoped like the Prisma client) because the `@liveblocks/node` `Liveblocks` constructor calls `assertSecretKey` synchronously; eager creation would crash `next build`/any import when `LIVEBLOCKS_SECRET_KEY` is unset. Also exports `getCursorColor(userId)` — a deterministic 31-multiplier string hash mapped into a fixed 10-color palette, so a user ID always yields the same cursor color.
  - `app/api/liveblocks-auth/route.ts`: `POST` handler. (1) `getCurrentIdentity()` → `401` if unauthenticated. (2) Parses `room` from the JSON body the Liveblocks client posts; room ID === project ID. (3) `getProjectAccess(room, identity)` → `403` if no access (or project missing). (4) `getOrCreateRoom(room, { defaultAccesses: [] })` ensures the room exists (created only if needed). (5) `prepareSession(userId, { userInfo: { name, avatar, color } })` + `session.allow(room, FULL_ACCESS)` + `session.authorize()` → returns the access-token body/status. The Liveblocks calls are wrapped in try/catch → `500` on failure.
  - `lib/project-access.ts`: `ClerkIdentity` gained a `name: string` field (display name) so the auth route attaches the user's name to the session without a second Clerk lookup — `getCurrentIdentity()` already calls `currentUser()`. New `computeName` helper resolves `firstName + lastName` → `username` → `email` → `"Anonymous"`.
  - `@liveblocks/node@3.19.1` installed — it was missing from `node_modules` and `package.json` despite the spec stating all Liveblocks packages were installed; pinned to match the other `@liveblocks/*` packages at 3.19.1.
  - Verified: `npm run build` passes (TypeScript + Next.js production build); `/api/liveblocks-auth` appears in the route summary as a dynamic route.

- Feature 09 — Share Dialog:
  - `lib/clerk-users.ts`: `enrichCollaborators(emails)` calls Clerk Backend (`clerkClient().users.getUserList({ emailAddress })`) once for the entire batch, normalizes emails to lowercase, maps each Clerk user's `firstName + lastName` (fallback `username`) to `displayName` and uses `imageUrl` as-is. Emails with no Clerk match come back as `{ email, displayName: null, imageUrl: null }`. Output order mirrors the unique-emails input so the UI list is stable.
  - `app/api/projects/[projectId]/collaborators/route.ts`: three handlers, all enforcing auth + project access server-side.
    - `GET` — owner OR collaborator may list. Returns the enriched array.
    - `POST` — owner only. Validates email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), 400 on invalid; 400 when inviting the owner's own primary email; 409 on duplicate. Creates the `ProjectCollaborator` row, returns the enriched collaborator with `201`.
    - `DELETE` — owner only. Email in JSON body. Uses `deleteMany` so it's idempotent (no 404 noise if already gone). Returns `204`.
    - Internal `loadProjectWithAccess` helper folds the membership check; only calls `currentUser()` when the requester is not the owner (the common case skips the extra Clerk roundtrip).
  - `components/editor/workspace-context.tsx`: `WorkspaceContextValue` now carries `role: "owner" | "collaborator"`, `shareDialogOpen`, `openShareDialog`, `closeShareDialog` alongside the existing AI-sidebar fields. Exported `WorkspaceRole` type.
  - `components/editor/share-dialog.tsx`: client dialog. Top-level `ShareDialog` reads `useWorkspaceContext()` and renders nothing outside a workspace; inner `ShareDialogContent` owns all hooks. Layout:
    - Header — `Share "<project>"` + role-aware description.
    - Project link row — `LinkIcon` + monospace URL + `Copy` button that swaps to `Check` + `Copied!` for 2s (timeout cleaned up on close/unmount via a `useRef`).
    - Invite form (owner only) — email `Input` + `UserPlus` button, surfaces server error text in `text-state-error`. Optimistically appends the returned enriched collaborator on success.
    - Collaborator list — fetched on open via `useEffect`. Empty state, loading state, error state. Each row shows avatar (image or initial), name + email (if both), and a trash button (owner only) that calls `DELETE` and removes the row on success.
    - Dialog state is fully reset on close (invite field, errors, copied flag, pending timeout).
  - `components/editor/editor-shell.tsx`: now also owns `shareDialogOpen` and computes the `WorkspaceRole` from whether the active project is in `ownedProjects` (owner) or `sharedProjects` (collaborator). Renders `<ShareDialog>` alongside the AI sidebar when a workspace is active.
  - `components/editor/editor-navbar.tsx`: the `Share` button now calls `workspace.openShareDialog` (was a no-op placeholder).
  - Verified: `npm run build` passes; the new route `/api/projects/[projectId]/collaborators` appears in the route summary.

- Feature 08 — Editor Workspace Shell:
  - Spec `context/feature-specs/08-editor-workspace-shell.md` was expanded after the first pass to capture the full designed placeholder (compass hero, grid + radial glow, AI Copilot panel with two cards, `Workspace` eyebrow, Share + AI pill, sidebar avatar chip). The first implementation followed the original minimal wording literally; second pass matches the richer design.
  - Third pass fixed a context-tree bug: `WorkspaceProvider` had been placed inside `WorkspaceShell` (page level), but `EditorNavbar` lives in `EditorShell` (layout level) — above the provider in the React tree. The navbar therefore always read `useWorkspaceContext()` as `null`, so project name, Share button, and AI pill never rendered, and the AI sidebar could not be toggled. Provider, AI sidebar render, and `aiSidebarOpen` state were lifted into `EditorShell`, which derives the active project from `usePathname()` + the `ownedProjects` / `sharedProjects` lists already fetched by the layout. `WorkspaceShell` is now a pure server component (just the canvas placeholder).
  - `lib/project-access.ts`: shared server-side helpers. `getCurrentIdentity()` returns `{ userId, email, initial, imageUrl }` via `auth()` + `currentUser()` (or `null` if unauthenticated). Initial falls back firstName → username → email, uppercased. `getProjectAccess(projectId, identity)` loads the project + collaborator emails and returns `{ project, hasAccess, role }` where role is `"owner" | "collaborator" | "none"`. Returns `null` for non-existent projects so the page can render `AccessDenied`.
  - `components/editor/access-denied.tsx`: centered empty state — lock icon in a rounded `bg-elevated` chip, heading, short message, and a `text-brand` link back to `/editor`. Server component (no `"use client"`).
  - `components/editor/workspace-context.tsx`: client `WorkspaceProvider` + `useWorkspaceContext()` exposing `{ projectId, projectName, aiSidebarOpen, toggleAiSidebar, closeAiSidebar }` or `null`. Provider value is nullable: rendered always, but value is `null` when there is no active project so the navbar can branch on presence.
  - `components/editor/ai-sidebar.tsx`: floating right slide-over card (`top-14 right-3 bottom-3`, `rounded-2xl`, glass `bg-surface/80 backdrop-blur`). Header: `AI Copilot` + `Placeholder panel` subtitle, sparkles icon. Body: `Chat surface pending` card (bot icon, body copy). Footer pinned card: `FUTURE HOOKS` eyebrow + paragraph. No interactivity beyond the toggle. Rendered by `EditorShell` (not the page) so it lives in the same provider scope as the navbar that toggles it.
  - `components/editor/workspace-shell.tsx`: server component rendering only the canvas placeholder — subtle grid pattern (linear gradients with radial mask) + a top-centered cyan radial glow, and a centered hero: compass-icon chip → `WORKSPACE SHELL` eyebrow → `Canvas and collaboration tooling land here next.` headline → multi-line subcopy. No state, no provider — those live in `EditorShell`.
  - `components/editor/editor-navbar.tsx`: reads `useWorkspaceContext()`. When inside a workspace, left shows project name + `Workspace` eyebrow underneath; right shows a glass-bordered `Share` button with cyan share icon (no behavior yet) and a pill-shaped `AI` toggle that paints brand cyan + `border-brand/40` + `bg-accent-dim` when open. Outside a workspace only `UserButton` is shown on the right.
  - `components/editor/project-list-item.tsx`: rows are `next/link` anchors so clicks navigate to `/editor/{id}`. Active row uses `bg-accent-dim text-copy-primary` with `aria-current="page"`; inactive rows use `text-copy-secondary` + `hover:bg-elevated`. Rename/Delete buttons live alongside the link (no nested interactive elements).
  - `components/editor/project-sidebar.tsx`: accepts `activeProjectId`, `userInitial`, `userImageUrl`. Per-row `isActive` is passed to both lists. Footer now renders a circular user-avatar chip (image or initial fallback, `border-surface-border bg-elevated text-brand`) to the left of the `New Project` button.
  - `components/editor/editor-shell.tsx`: derives `activeProjectId` from `usePathname()` via `/^\/editor\/([^/]+)/`, looks up `activeProject` in `ownedProjects` then `sharedProjects`, owns `aiSidebarOpen`, builds the `WorkspaceContextValue` (or `null`) inside `useMemo`, wraps the whole shell in `WorkspaceProvider`, and renders `<AiSidebar>` only when there is an active workspace. Accepts `userInitial` + `userImageUrl` and forwards them to `ProjectSidebar`.
  - `app/editor/layout.tsx`: uses `getCurrentIdentity()` and forwards `identity.initial` + `identity.imageUrl` into `EditorShell` alongside the owned + shared projects.
  - `app/editor/[projectId]/page.tsx`: `getCurrentIdentity()` → redirect to `/sign-in` if missing. `getProjectAccess()` → `AccessDenied` if project not found or user is neither owner nor collaborator. Otherwise renders `<WorkspaceShell />` (no props — chrome state is driven by `EditorShell` via pathname + project lists). Missing and unauthorized both show `AccessDenied` per spec (replaces the prior `notFound()` flow).
  - Verified: `npm run build` passes (TypeScript + Next.js production build, all routes compile).

- Feature 07 — Wire Editor Home:
  - `lib/projects/data.ts`: `ProjectSummary` type and server-side helpers `getOwnedProjects(userId)` (where `ownerId === userId`, `orderBy createdAt desc`, select `id + name`) / `getSharedProjects(userEmail)` (where `collaborators.some.email === userEmail`, same select; returns `[]` when no email).
  - `lib/projects/slug.ts`: replaces the old `mock-data` slug helper. Exports `slugify`, `generateRoomSuffix` (6-char base36), and `buildRoomId(name)` = `slug-suffix` (or just suffix if name produces no slug).
  - `hooks/use-project-actions.ts`: replaces `use-project-dialogs`. Owns dialog state + project name input + loading/error and the three mutations. `create` builds the room ID via `buildRoomId`, POSTs `{ id, name }`, navigates to `/editor/{project.id}`. `rename` PATCHes name then `router.refresh()`. `remove` DELETEs, then `router.push("/editor")` if the user was on the active workspace (`pathname === "/editor/{id}"`), else `router.refresh()`. Errors surface via the controller; close is blocked while loading.
  - `app/api/projects/route.ts` (POST): now also accepts an optional client-provided `id`. Required so the client-generated room ID becomes the project ID, keeping project ID and Liveblocks room ID aligned (spec invariant). Name handling unchanged.
  - `app/editor/layout.tsx`: converted to a server component. Calls `auth()` (redirects to `/sign-in` if missing — Feature 03 proxy already enforces this, but the redirect makes `userId` non-null for typing), reads the user's primary email via `currentUser()`, fetches owned + shared projects in parallel, and passes them to a new client `EditorShell`.
  - `components/editor/editor-shell.tsx`: new client wrapper that owns sidebar open state + the `useProjectActions` controller, provides `ProjectDialogsProvider`, and renders `EditorNavbar`, `ProjectSidebar`, `<main>{children}</main>`, and `<ProjectDialogs>`.
  - `components/editor/project-dialogs.tsx`: now consumes `UseProjectActionsResult`. Create dialog shows `Room ID: {slug}-…` preview (using `slugify` for the live portion; the random suffix is generated only at submit time). Rename dialog already pre-fills current name. All three dialogs disable inputs/buttons while `loading`, show button text "Creating…/Renaming…/Deleting…", and render `error` text in `text-state-error`.
  - `components/editor/project-dialogs-context.tsx`, `project-sidebar.tsx`, `project-list-item.tsx`: swapped `MockProject` for `ProjectSummary`.
  - `app/editor/[projectId]/page.tsx`: minimal placeholder workspace page so create-navigation has a real destination and delete-from-active-workspace can be detected. Validates auth + ownership-or-collaborator access; renders project name + ID. (The real workspace UI is a later feature.)
  - Removed: `lib/projects/mock-data.ts`, `hooks/use-project-dialogs.ts`.
  - Verified: `npm run build` passes (TypeScript + Next.js production build) — all six routes including new `/editor/[projectId]` compile.

- Feature 06 — Project APIs (backend only):
  - `app/api/projects/route.ts`: `GET` lists current user's owned projects (`ownerId === userId`, ordered by `createdAt desc`). `POST` creates a project — accepts optional `{ name }`, trims it, defaults to `"Untitled Project"` if missing or empty. Returns `401` if unauthenticated. ID strategy delegates to schema `@default(cuid())`.
  - `app/api/projects/[projectId]/route.ts`: `PATCH` renames (requires non-empty `name`); `DELETE` removes. Both: `401` if unauthenticated, `404` if project does not exist, `403` if exists but `ownerId !== userId`. PATCH returns updated project; DELETE returns `204`.
  - `proxy.ts`: added `isApiRoute` matcher and made the proxy skip `auth.protect()` for `/api/(.*)`. Necessary because Clerk's `auth.protect()` returns `404` (not `401`) for non-document requests, which would conflict with the spec's `401` requirement. API handlers now own their auth checks via `auth()` from `@clerk/nextjs/server`.
  - `lib/prisma.ts`: replaced unsupported `datasourceUrl` option with `accelerateUrl` (Prisma 7 dropped `datasourceUrl` from `PrismaClientOptions`; the `prisma+postgres://` scheme corresponds to Accelerate).
  - `prisma.config.ts`: removed `engine: "classic"` (not a valid field on `PrismaConfig` in current `@prisma/config`).
  - Verified: `npm run build` passes (TypeScript + Next.js production build).

- Feature 04 — Project Dialogs and Editor Home:
  - `lib/projects/mock-data.ts`: `MockProject` type, `MOCK_OWNED_PROJECTS`/`MOCK_SHARED_PROJECTS` arrays, `slugify()` helper. Mock-only — no API calls or persistence.
  - `hooks/use-project-dialogs.ts`: `useProjectDialogs()` returns dialog state (`mode`: create/rename/delete/null), target project, name field, loading flag, plus `openCreate`/`openRename`/`openDelete`/`close`/`submit` actions. Centralizes dialog + form + loading state per spec.
  - `components/editor/project-dialogs-context.tsx`: `ProjectDialogsProvider` + `useProjectDialogActions()` so the home page button and any nested children can trigger openers without prop drilling.
  - `components/editor/project-dialogs.tsx`: renders all three dialogs from controller state — Create (name input + live slug preview via `slugify`), Rename (prefilled, current name in description, autoFocus, Enter submits), Delete (no input, destructive button). Uses `FormEvent<HTMLFormElement>` for submit typing.
  - `components/editor/editor-home.tsx`: centered heading "Create a project or open an existing one" + description + `New Project` button (Plus icon) that opens the Create dialog. No card wrappers (per spec).
  - `components/editor/project-list-item.tsx`: sidebar row with hover-revealed Pencil (rename) / Trash2 (delete) icon buttons, gated by `showActions`.
  - `components/editor/project-sidebar.tsx`: now renders owned + shared project lists from props; owned items show actions, shared items hide them. Added mobile-only backdrop scrim (`md:hidden`, `top-12`, `z-30`) that closes the sidebar when tapped. Footer `New Project` button now wired to `onCreate`.
  - `app/editor/layout.tsx`: owns `useProjectDialogs()` controller, wraps tree in `ProjectDialogsProvider`, passes mock projects + handlers to sidebar, renders `<ProjectDialogs>` portals.
  - `app/editor/page.tsx`: simplified to `<EditorHome />`.
  - Verified: `tsc --noEmit` clean, `eslint` clean, IDE diagnostics clean.

- Boilerplate cleanup: stripped globals.css, removed SVGs, replaced page.tsx with minimal placeholder.
- Feature 02 — Editor Chrome:
  - `components/editor/editor-navbar.tsx`: fixed-height navbar, sidebar toggle (PanelLeftOpen/PanelLeftClose), left/center/right sections, dark bg + bottom border.
  - `components/editor/project-sidebar.tsx`: floating overlay sidebar (position fixed, no layout push), slides from left via transform, isOpen/onClose props, Project header + close button, shadcn Tabs (My Project / Shared) with empty placeholders, full-width New Project button with Plus icon.
  - Dialog pattern: existing `components/ui/dialog.tsx` exports DialogTitle, DialogDescription, DialogHeader, DialogFooter — ready for use.
  - Verified: tsc --noEmit clean.
- Feature 01 — Design system:
  - shadcn/ui initialized (Tailwind v4, "base-nova" style, neutral base, RSC, lucide icons).
  - Components added: button, card, dialog, input, tabs, textarea, scroll-area.
  - lucide-react installed.
  - lib/utils.ts created with cn() helper (clsx + tailwind-merge).
  - globals.css populated with dark-only design tokens from ui-context.md (bg/text/border/accent/state) and shadcn variables remapped to those tokens, so components render dark by default with no light fallback.
  - Verified via tsc --noEmit and next build (both clean).
- Feature 03 — Authentication and Route Protection:
  - `@clerk/nextjs` (^7.3.2) and `@clerk/ui` (^1.9.0) added to package.json.
  - `proxy.ts` at project root: `clerkMiddleware` with `createRouteMatcher` using NEXT_PUBLIC_CLERK_SIGN_IN_URL / NEXT_PUBLIC_CLERK_SIGN_UP_URL env vars; all routes protected by default.
  - `app/layout.tsx`: wrapped with `ClerkProvider` using Clerk `dark` base theme from `@clerk/ui/themes`; appearance variables overridden with app CSS custom properties (no hardcoded colors).
  - `app/sign-in/[[...sign-in]]/page.tsx`: two-panel layout (left panel hidden on small screens), left: logo, tagline, text-only feature list; right: Clerk `<SignIn />`. No gradients or heavy layouts.
  - `app/sign-up/[[...sign-up]]/page.tsx`: same two-panel structure with Clerk `<SignUp />`.
  - `app/page.tsx`: server component that redirects authenticated users to `/editor`, unauthenticated users to `/sign-in`.
  - `components/editor/editor-navbar.tsx`: `<UserButton />` added to right section.

## In Progress

- None.

## Next Up

- Next feature unit (TBD — check `context/feature-specs/` for the next spec). Likely candidates: shape-specific node visuals (diamond/hexagon/cylinder SVGs) and connection handles, canvas controls, live cursors/presence, or the starter template library.

## Open Questions

- `LIVEBLOCKS_SECRET_KEY` is not yet set in `.env.local`. The build passes without it (the client is constructed lazily), but `/api/liveblocks-auth` will return `500` at runtime — and the canvas will therefore hit the `CanvasError` fallback — until a real Liveblocks secret key (`sk_...`) is added.

## Architecture Decisions

- Dark-only theme. No light mode. All color tokens are CSS custom properties in globals.css, exposed to Tailwind utilities via @theme inline.
- shadcn primitives are the foundation component layer and must remain unmodified after generation.
- Next.js 16 uses `proxy.ts` (not `middleware.ts`); the exported function must be named `proxy`. `NextProxy = NextMiddleware` so `clerkMiddleware` output is compatible.
- API routes are exempt from the proxy's `auth.protect()` and own their own auth via `auth()` from `@clerk/nextjs/server`. This is required because `auth.protect()` returns `404` to non-document/API requests, which would prevent handlers from returning the spec-mandated `401`.
- Project ID === Liveblocks room ID. The client builds the ID (`slug-suffix`) at create time and POSTs it; the server stores it as `project.id`. POST `/api/projects` therefore accepts an optional `id` in addition to the schema's `@default(cuid())`.
- Editor data flow: `app/editor/layout.tsx` is a server component and is the single fetch point for the user's owned + shared projects. Data flows down to a client `EditorShell` which holds sidebar state + the `useProjectActions` controller. Mutations call the API and use `router.refresh()` / `router.push()` to re-sync the server-rendered lists.
- Workspace context: per-room workspace state (project name, AI sidebar open/close) lives in a client `WorkspaceContext` populated by `EditorShell` (the provider and `aiSidebarOpen` state were lifted into `EditorShell`). The shared `EditorNavbar` consumes the context and renders workspace-only chrome (project name, Share, AI toggle) only when the provider from `EditorShell` is mounted and has an active project. This keeps the layout-level navbar generic while letting it read room-specific state.
- Access control surface: server-side identity + project access is centralized in `lib/project-access.ts` (`getCurrentIdentity`, `getProjectAccess`). Workspace routes call both; missing-or-unauthorized renders `AccessDenied` (spec) rather than `notFound()`. Layout reuses `getCurrentIdentity()` so identity is fetched the same way in both places.
- Active room highlighting: the `EditorShell` derives the active project ID from `usePathname()` (matching `/editor/{id}`) and the sidebar applies `bg-accent-dim` + `aria-current="page"` to the matching `ProjectListItem`. Sidebar rows are now `next/link` anchors, so project switching is a normal navigation.
- Collaborator identity is stored only by email in `ProjectCollaborator`. Display name + avatar are looked up on demand from Clerk Backend via `clerkClient().users.getUserList({ emailAddress })`. There is no local users table and there should not be one — collaborators are identified by email alone, and emails with no Clerk match fall back to email-only display.
- Workspace role detection: the role passed into `WorkspaceContext` is derived purely from which list the active project lives in (`ownedProjects` → `owner`, `sharedProjects` → `collaborator`). API endpoints still re-check ownership server-side; the client role is for UI affordances only.
- Liveblocks auth uses **access tokens**, not ID tokens. `/api/liveblocks-auth` verifies project access itself via `getProjectAccess`, then issues a room-scoped session token (`prepareSession` + `session.allow(roomId, FULL_ACCESS)` + `session.authorize()`). The token is scoped to a single room, so access control stays in the route handler — consistent with the rest of `app/api` — and no Liveblocks-side room permission state needs maintaining. Rooms are created with `defaultAccesses: []` (private); access is granted solely by the access token.
- Liveblocks room ID === project ID (already an invariant from Feature 07). The auth route reads the room ID from the `{ room }` body the Liveblocks client posts to the auth endpoint.
- Canvas component tree: the workspace page (`app/editor/[projectId]/page.tsx`) stays a server component (auth + access check) and renders a single client wrapper, `CanvasRoom`. Room setup (`LiveblocksProvider` + `RoomProvider` + `ErrorBoundary` + `ClientSideSuspense`) is isolated in `CanvasRoom`; the actual React Flow surface is a separate `Canvas` component below the Suspense boundary so it only mounts once Storage is ready. Canvas components live in `components/canvas/`, kept separate from the `components/editor/` chrome.
- React Flow ↔ Liveblocks binding goes through `useLiveblocksFlow` from `@liveblocks/react-flow`. The hook self-manages a `flow` `LiveObject` (`{ nodes, edges }` as `LiveMap`s) under a single Storage key and seeds it from `nodes.initial` / `edges.initial`. The global `Liveblocks["Storage"]` type stays `{}` — the hook is generic and self-typed via `CanvasNode`/`CanvasEdge`, so the `flow` key does not need to be declared on the global Storage interface.
- The custom node type `canvasNode` is registered as a React Flow `nodeType` (`CanvasNodeView`, Feature 12). The renderer is intentionally basic — a bordered rectangle with a centered label — with shape-specific visuals deferred. The `canvasEdge` type is still not registered as an `edgeType`; custom edge rendering is a later feature unit.
- Shape drag-and-drop (Feature 12): the `Canvas` component is wrapped in `ReactFlowProvider` so the inner `CanvasFlow` can call `useReactFlow().screenToFlowPosition`. `useReactFlow` only resolves the store for a component rendered *inside* the provider, and the component rendering `<ReactFlow>` is the provider's sibling-parent, not a descendant — hence the explicit `ReactFlowProvider` wrapper. New nodes are added through `useLiveblocksFlow`'s `onNodesChange` with a `{ type: "add" }` change (the hook exposes no `setNodes`), so creation flows through Liveblocks Storage and is shared with collaborators. Default per-shape node sizes live in `types/canvas.ts` (`SHAPE_DEFAULT_SIZES`); the DnD payload contract (MIME type, payload shape, serialize/validate helpers) lives in `components/canvas/shape-drag.ts` and validates the dropped payload as untrusted input.

## Session Notes

- Tailwind v4 uses @import "tailwindcss" and @theme inline, not tailwind.config.js.
- shadcn variables (--background, --primary, etc.) are aliased to design tokens (--bg-base, --accent-primary, etc.) inside :root so a single source of truth drives both shadcn and app components.
- Geist Sans / Geist Mono are wired through next/font in app/layout.tsx and exposed as --font-geist-sans / --font-geist-mono, which @theme inline maps to --font-sans / --font-mono.
- Clerk packages (@clerk/nextjs, @clerk/ui, @clerk/backend, @clerk/react, @clerk/shared) were pre-installed in node_modules but missing from package.json — added in Feature 03.
- ClerkProvider must wrap the <html> element, so it sits outside the html tag in layout.tsx.
- Clerk appearance variables accept CSS var() references, enabling full design-token integration without hardcoded colors.
- Dialog/form/loading/mutation state now lives in `useProjectActions()` (replaces the Feature-04 `useProjectDialogs`). The hook is owned by the client `EditorShell`; openers are surfaced to descendants via `ProjectDialogsContext` so the editor home button and sidebar share one controller.
- Sidebar mobile dismissal uses a fixed `<button>` backdrop scrim hidden at `md:` and above; tapping it calls `onClose`.
- Delete-from-active-workspace detection compares `usePathname()` to `/editor/{target.id}` — works because the workspace route is `app/editor/[projectId]/page.tsx`.
- `@liveblocks/node`'s `Liveblocks` constructor validates the secret key synchronously (`assertSecretKey`, throws if it does not start with `sk_`). The node client must therefore be constructed lazily (`getLiveblocks()`), not at module scope like the Prisma client — otherwise `next build` crashes when `LIVEBLOCKS_SECRET_KEY` is unset.
- `@liveblocks/node` was not actually installed despite Feature 10's spec claiming all Liveblocks packages were present (only `client`, `react`, `react-flow`, `react-ui` were). Added at 3.19.1.
- `useLiveblocksFlow({ suspense: true })` calls `useSuspendUntilStorageReady()` internally, so a `ClientSideSuspense` boundary (with a `fallback`) handles the connection wait; with suspense on, the hook's `nodes`/`edges` are always arrays.
- React Flow's stylesheet (`@xyflow/react/dist/style.css`) is imported at the top of `components/canvas/canvas.tsx`. `@liveblocks/react-flow/styles.css` is only needed for the `<Cursors>` component, which the base canvas does not yet render.
- React Flow node `data` must extend `Record<string, unknown>` (`Node<NodeData extends Record<string, unknown>>`). `CanvasNodeData` is declared as `interface … extends Record<string, unknown>` so it satisfies the constraint while still following the "use interface for object contracts" standard.
- `react-error-boundary` is the Liveblocks-recommended error fallback primitive; its `ErrorBoundary` wraps `ClientSideSuspense` so a failed room connection renders `CanvasError` (with a retry) instead of an unhandled throw.
