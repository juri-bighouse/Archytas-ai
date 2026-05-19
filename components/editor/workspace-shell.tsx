import { Compass } from "lucide-react"

export function WorkspaceShell() {
  return (
    <div className="relative flex h-full w-full bg-base">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border-default) 1px, transparent 1px), linear-gradient(to bottom, var(--border-default) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
          style={{
            background:
              "radial-gradient(ellipse at 50% 25%, var(--accent-primary-dim), transparent 60%)",
          }}
        />
        <div className="relative flex max-w-xl flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-elevated shadow-[0_0_40px_-10px_var(--accent-primary-dim)]">
            <Compass className="h-6 w-6 text-brand" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-copy-muted">
            Workspace Shell
          </p>
          <h1 className="text-balance text-3xl font-semibold text-copy-primary">
            Canvas and collaboration tooling land here next.
          </h1>
          <p className="text-balance text-sm leading-relaxed text-copy-muted">
            This room is ready for the shared architecture canvas, durable AI
            workflows, and real-time presence. For now, the shell is wired with
            project context and navigation only.
          </p>
        </div>
      </div>
    </div>
  )
}
