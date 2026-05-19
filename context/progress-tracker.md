# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor Workspace Shell (Feature Unit 08) — complete.

## Current Goal

- Move on to Feature 09 (next feature unit — likely real canvas + Liveblocks room, or starter template library).

## Completed

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

- Feature 09 (TBD — check `context/feature-specs/` for next spec). Likely candidates: real canvas (React Flow + Liveblocks room), starter template library, or wiring the Share button to a collaborator invite flow.

## Open Questions

- None yet.

## Architecture Decisions

- Dark-only theme. No light mode. All color tokens are CSS custom properties in globals.css, exposed to Tailwind utilities via @theme inline.
- shadcn primitives are the foundation component layer and must remain unmodified after generation.
- Next.js 16 uses `proxy.ts` (not `middleware.ts`); the exported function must be named `proxy`. `NextProxy = NextMiddleware` so `clerkMiddleware` output is compatible.
- API routes are exempt from the proxy's `auth.protect()` and own their own auth via `auth()` from `@clerk/nextjs/server`. This is required because `auth.protect()` returns `404` to non-document/API requests, which would prevent handlers from returning the spec-mandated `401`.
- Project ID === Liveblocks room ID. The client builds the ID (`slug-suffix`) at create time and POSTs it; the server stores it as `project.id`. POST `/api/projects` therefore accepts an optional `id` in addition to the schema's `@default(cuid())`.
- Editor data flow: `app/editor/layout.tsx` is a server component and is the single fetch point for the user's owned + shared projects. Data flows down to a client `EditorShell` which holds sidebar state + the `useProjectActions` controller. Mutations call the API and use `router.refresh()` / `router.push()` to re-sync the server-rendered lists.
- Workspace context: per-room workspace state (project name, AI sidebar open/close) lives in a client `WorkspaceContext` populated by `WorkspaceShell` on the `/editor/[projectId]` route. The shared `EditorNavbar` consumes the context and renders workspace-only chrome (project name, Share, AI toggle) only when the provider is mounted. This keeps the layout-level navbar generic while letting the page own room-specific state.
- Access control surface: server-side identity + project access is centralized in `lib/project-access.ts` (`getCurrentIdentity`, `getProjectAccess`). Workspace routes call both; missing-or-unauthorized renders `AccessDenied` (spec) rather than `notFound()`. Layout reuses `getCurrentIdentity()` so identity is fetched the same way in both places.
- Active room highlighting: the `EditorShell` derives the active project ID from `usePathname()` (matching `/editor/{id}`) and the sidebar applies `bg-accent-dim` + `aria-current="page"` to the matching `ProjectListItem`. Sidebar rows are now `next/link` anchors, so project switching is a normal navigation.

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
