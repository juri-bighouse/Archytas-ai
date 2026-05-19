"use client"

import { useMemo, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-context"
import { AiSidebar } from "@/components/editor/ai-sidebar"
import {
  WorkspaceProvider,
  type WorkspaceContextValue,
} from "@/components/editor/workspace-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { ProjectSummary } from "@/lib/projects/data"

interface EditorShellProps {
  readonly children: ReactNode
  readonly ownedProjects: readonly ProjectSummary[]
  readonly sharedProjects: readonly ProjectSummary[]
  readonly userInitial: string
  readonly userImageUrl: string | null
}

const EDITOR_PATH_PATTERN = /^\/editor\/([^/]+)/

function getActiveProjectId(pathname: string | null): string | null {
  if (!pathname) return null
  const match = EDITOR_PATH_PATTERN.exec(pathname)
  return match ? decodeURIComponent(match[1]) : null
}

export function EditorShell({
  children,
  ownedProjects,
  sharedProjects,
  userInitial,
  userImageUrl,
}: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)
  const actions = useProjectActions()
  const pathname = usePathname()
  const activeProjectId = getActiveProjectId(pathname)

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null
    return (
      ownedProjects.find((p) => p.id === activeProjectId) ??
      sharedProjects.find((p) => p.id === activeProjectId) ??
      null
    )
  }, [activeProjectId, ownedProjects, sharedProjects])

  const workspaceValue = useMemo<WorkspaceContextValue | null>(() => {
    if (!activeProject) return null
    return {
      projectId: activeProject.id,
      projectName: activeProject.name,
      aiSidebarOpen,
      toggleAiSidebar: () => setAiSidebarOpen((prev) => !prev),
      closeAiSidebar: () => setAiSidebarOpen(false),
    }
  }, [activeProject, aiSidebarOpen])

  return (
    <ProjectDialogsProvider
      value={{
        openCreate: actions.openCreate,
        openRename: actions.openRename,
        openDelete: actions.openDelete,
      }}
    >
      <WorkspaceProvider value={workspaceValue}>
        <div className="flex h-screen flex-col">
          <EditorNavbar
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          />
          <ProjectSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            activeProjectId={activeProjectId}
            userInitial={userInitial}
            userImageUrl={userImageUrl}
            onCreate={actions.openCreate}
            onRename={actions.openRename}
            onDelete={actions.openDelete}
          />
          <main className="flex-1 overflow-hidden pt-12">{children}</main>
          {workspaceValue && <AiSidebar isOpen={aiSidebarOpen} />}
          <ProjectDialogs controller={actions} />
        </div>
      </WorkspaceProvider>
    </ProjectDialogsProvider>
  )
}
