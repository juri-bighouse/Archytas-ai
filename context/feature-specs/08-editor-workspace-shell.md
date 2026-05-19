Build the `/editor/[roomId]` workspace shell with server-side access checks. No canvas logic yet — the shell ships as a designed placeholder that communicates what will land here next.

## Access

`/editor/[roomId]` must be a server component.

Before rendering:

- unauthenticated users redirect to `/sign-in`
- users without project access see `AccessDenied`
- non-existent projects also show `AccessDenied`

Create `components/editor/access-denied.tsx` with:

- centered layout
- lock icon
- short message
- link back to `/editor`

## Access Helpers

Create `lib/project-access.ts` with helpers for:

- getting current Clerk identity: `userId` + primary email
- checking project access by owner or collaborator

## Layout

Build a full-viewport workspace layout:

- top navbar (shared with the rest of `/editor`) — shows the project name with a small `Workspace` eyebrow underneath when the user is inside a room
- navbar right-side actions:
  - `Share` button — ghost / glass style, cyan share icon, text label. No behavior wired yet.
  - AI sidebar toggle — pill button labeled `AI` with a sparkles icon, painted in the brand cyan when the AI sidebar is open
- existing `ProjectSidebar` on the left, with the current room highlighted (cyan dot + tinted background)
- sidebar footer shows a circular user-avatar chip to the left of the `New Project` button
- central canvas placeholder fills the remaining space
- right sidebar placeholder for the future AI surface

## Canvas Placeholder

The center area must clearly read as "shell only — the canvas lands here next".

- Background: page base color overlaid with a subtle grid pattern and a soft radial cyan glow near the top-center.
- Center stack (vertically and horizontally centered, capped to a readable max width):
  1. A rounded square chip (subtle border, elevated surface) containing a `Compass` icon in brand cyan.
  2. Uppercase eyebrow text `WORKSPACE SHELL` (muted, letter-spaced).
  3. H1 heading: `Canvas and collaboration tooling land here next.`
  4. Subcopy: `This room is ready for the shared architecture canvas, durable AI workflows, and real-time presence. For now, the shell is wired with project context and navigation only.`

## AI Sidebar Placeholder

The right sidebar must communicate what the AI surface will do, not just say "coming soon".

- Fixed right slide-over, mirrors the left sidebar metrics (sits below the navbar, full remaining height).
- Header row: title `AI Copilot` with small subtitle `Placeholder panel` underneath, and a sparkles icon on the right.
- First card (top of the body):
  - subtle bordered card on the elevated surface
  - small bot icon on the left
  - heading `Chat surface pending`
  - body copy `The toggle is wired. Messaging and generation are intentionally out of scope here.`
- Bottom card pinned to the lower part of the sidebar:
  - eyebrow `FUTURE HOOKS` (uppercase, letter-spaced, muted)
  - body copy `Prompt composer, run status, and architecture guidance will attach to this sidebar.`

## Scope

Do not add real canvas logic, Liveblocks, AI chat, or sharing behavior yet. The Share button, AI toggle visual styling, and the avatar chip must render correctly but trigger no business behavior beyond toggling the AI sidebar visibility.

## Check When Done

- `/editor/[roomId]` builds successfully
- access helper exists outside the page component
- `AccessDenied` is used for missing or unauthorized projects
- workspace layout renders with current project context
- canvas placeholder shows the compass chip, eyebrow, headline, and subcopy
- AI sidebar shows the `AI Copilot` header, the `Chat surface pending` card, and the `FUTURE HOOKS` card
- navbar shows project name + `Workspace` eyebrow, styled `Share` button, AI pill toggle
- sidebar footer shows the avatar chip beside `New Project`
- no TypeScript errors
