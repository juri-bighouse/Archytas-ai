# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor Chrome (Feature Unit 02) — complete.

## Current Goal

- Move on to authentication and route protection (Feature 03).

## Completed

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

## In Progress

- None.

## Next Up

- Feature 03: Authentication and route protection (Clerk).

## Open Questions

- None yet.

## Architecture Decisions

- Dark-only theme. No light mode. All color tokens are CSS custom properties in globals.css, exposed to Tailwind utilities via @theme inline.
- shadcn primitives are the foundation component layer and must remain unmodified after generation.

## Session Notes

- Tailwind v4 uses @import "tailwindcss" and @theme inline, not tailwind.config.js.
- shadcn variables (--background, --primary, etc.) are aliased to design tokens (--bg-base, --accent-primary, etc.) inside :root so a single source of truth drives both shadcn and app components.
- Geist Sans / Geist Mono are wired through next/font in app/layout.tsx and exposed as --font-geist-sans / --font-geist-mono, which @theme inline maps to --font-sans / --font-mono.
