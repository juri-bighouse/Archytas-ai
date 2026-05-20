"use client"

import { useMemo, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-context"
import { AiSidebar } from "@/components/editor/ai-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import {
  WorkspaceProvider,
  type WorkspaceContextValue,
  type WorkspaceRole,
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const actions = useProjectActions()
  const pathname = usePathname()
  const activeProjectId = getActiveProjectId(pathname)

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null
    const owned = ownedProjects.find((p) => p.id === activeProjectId)
    if (owned) return { project: owned, role: "owner" as WorkspaceRole }
    const shared = sharedProjects.find((p) => p.id === activeProjectId)
    if (shared) return { project: shared, role: "collaborator" as WorkspaceRole }
    return null
  }, [activeProjectId, ownedProjects, sharedProjects])

  const workspaceValue = useMemo<WorkspaceContextValue | null>(() => {
    if (!activeProject) return null
    return {
      projectId: activeProject.project.id,
      projectName: activeProject.project.name,
      role: activeProject.role,
      aiSidebarOpen,
      toggleAiSidebar: () => setAiSidebarOpen((prev) => !prev),
      closeAiSidebar: () => setAiSidebarOpen(false),
      shareDialogOpen,
      openShareDialog: () => setShareDialogOpen(true),
      closeShareDialog: () => setShareDialogOpen(false),
    }
  }, [activeProject, aiSidebarOpen, shareDialogOpen])

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
          <main className="flex flex-1 flex-col overflow-hidden pt-12">{children}</main>
          {workspaceValue && <AiSidebar isOpen={aiSidebarOpen} />}
          {workspaceValue && <ShareDialog />}
          <ProjectDialogs controller={actions} />
        </div>
      </WorkspaceProvider>
    </ProjectDialogsProvider>
  )
}
