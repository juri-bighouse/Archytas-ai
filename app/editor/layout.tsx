"use client"

import { useState } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-context"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import {
  MOCK_OWNED_PROJECTS,
  MOCK_SHARED_PROJECTS,
} from "@/lib/projects/mock-data"

export default function EditorLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dialogs = useProjectDialogs()

  return (
    <ProjectDialogsProvider
      value={{
        openCreate: dialogs.openCreate,
        openRename: dialogs.openRename,
        openDelete: dialogs.openDelete,
      }}
    >
      <div className="flex h-screen flex-col">
        <EditorNavbar
          isSidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ownedProjects={MOCK_OWNED_PROJECTS}
          sharedProjects={MOCK_SHARED_PROJECTS}
          onCreate={dialogs.openCreate}
          onRename={dialogs.openRename}
          onDelete={dialogs.openDelete}
        />
        <main className="flex-1 overflow-hidden pt-12">{children}</main>
        <ProjectDialogs controller={dialogs} />
      </div>
    </ProjectDialogsProvider>
  )
}
