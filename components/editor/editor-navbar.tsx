"use client"

import {
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useWorkspaceContext } from "./workspace-context"

interface EditorNavbarProps {
  readonly isSidebarOpen: boolean
  readonly onSidebarToggle: () => void
}

export function EditorNavbar({ isSidebarOpen, onSidebarToggle }: EditorNavbarProps) {
  const workspace = useWorkspaceContext()

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-12 items-center gap-3 border-b border-surface-border bg-surface px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onSidebarToggle}>
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        {workspace && (
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-copy-primary">
              {workspace.projectName}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-copy-muted">
              Workspace
            </span>
          </div>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {workspace && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={workspace.openTemplatesModal}
              className="gap-1.5 border border-surface-border bg-elevated/60 hover:bg-elevated"
            >
              <LayoutTemplate className="text-brand" />
              Templates
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={workspace.openShareDialog}
              className="gap-1.5 border border-surface-border bg-elevated/60 hover:bg-elevated"
            >
              <Share2 className="text-brand" />
              Share
            </Button>
            <button
              type="button"
              onClick={workspace.toggleAiSidebar}
              aria-pressed={workspace.aiSidebarOpen}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                workspace.aiSidebarOpen
                  ? "border-brand/40 bg-accent-dim text-brand"
                  : "border-surface-border bg-elevated/60 text-copy-secondary hover:text-copy-primary"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI
            </button>
          </>
        )}
        <UserButton />
      </div>
    </header>
  )
}
