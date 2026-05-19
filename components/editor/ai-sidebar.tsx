"use client"

import { Bot, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AiSidebarProps {
  readonly isOpen: boolean
}

export function AiSidebar({ isOpen }: AiSidebarProps) {
  return (
    <aside
      aria-label="AI Copilot"
      aria-hidden={!isOpen}
      className={cn(
        "fixed bottom-3 right-3 top-14 z-40 flex w-80 flex-col rounded-2xl border border-surface-border bg-surface/80 backdrop-blur transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-surface-border px-4 py-3">
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-copy-primary">
            AI Copilot
          </span>
          <span className="text-xs text-copy-muted">Placeholder panel</span>
        </div>
        <Sparkles className="mt-0.5 h-4 w-4 text-ai-text" />
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="rounded-2xl border border-surface-border bg-elevated/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-subtle">
              <Bot className="h-4 w-4 text-ai-text" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-copy-primary">
                Chat surface pending
              </h3>
              <p className="text-xs leading-relaxed text-copy-muted">
                The toggle is wired. Messaging and generation are intentionally
                out of scope here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-b-2xl border-t border-surface-border bg-elevated/40 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-copy-muted">
          Future Hooks
        </p>
        <p className="mt-2 text-xs leading-relaxed text-copy-muted">
          Prompt composer, run status, and architecture guidance will attach to
          this sidebar.
        </p>
      </div>
    </aside>
  )
}
