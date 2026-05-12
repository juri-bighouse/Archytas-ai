# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Project Dialogs and Editor Home (Feature Unit 04) — complete.

## Current Goal

- Move on to Feature 05 (next feature unit).

## Completed

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

- Feature 05 (TBD — check feature-specs directory for next spec).

## Open Questions

- None yet.

## Architecture Decisions

- Dark-only theme. No light mode. All color tokens are CSS custom properties in globals.css, exposed to Tailwind utilities via @theme inline.
- shadcn primitives are the foundation component layer and must remain unmodified after generation.
- Next.js 16 uses `proxy.ts` (not `middleware.ts`); the exported function must be named `proxy`. `NextProxy = NextMiddleware` so `clerkMiddleware` output is compatible.

## Session Notes

- Tailwind v4 uses @import "tailwindcss" and @theme inline, not tailwind.config.js.
- shadcn variables (--background, --primary, etc.) are aliased to design tokens (--bg-base, --accent-primary, etc.) inside :root so a single source of truth drives both shadcn and app components.
- Geist Sans / Geist Mono are wired through next/font in app/layout.tsx and exposed as --font-geist-sans / --font-geist-mono, which @theme inline maps to --font-sans / --font-mono.
- Clerk packages (@clerk/nextjs, @clerk/ui, @clerk/backend, @clerk/react, @clerk/shared) were pre-installed in node_modules but missing from package.json — added in Feature 03.
- ClerkProvider must wrap the <html> element, so it sits outside the html tag in layout.tsx.
- Clerk appearance variables accept CSS var() references, enabling full design-token integration without hardcoded colors.
- Dialog/form/loading state lives in a single `useProjectDialogs()` hook owned by `app/editor/layout.tsx`; openers are surfaced to descendants via `ProjectDialogsContext` so the editor home and sidebar share one controller.
- Mock projects live in `lib/projects/mock-data.ts` and are imported directly by the layout — Feature 04 has no API or persistence layer yet.
- Sidebar mobile dismissal uses a fixed `<button>` backdrop scrim hidden at `md:` and above; tapping it calls `onClose`.
