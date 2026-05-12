"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { MockProject } from "@/lib/projects/mock-data"

interface ProjectDialogActions {
  openCreate: () => void
  openRename: (project: MockProject) => void
  openDelete: (project: MockProject) => void
}

const ProjectDialogsContext = createContext<ProjectDialogActions | null>(null)

interface ProjectDialogsProviderProps {
  value: ProjectDialogActions
  children: ReactNode
}

export function ProjectDialogsProvider({ value, children }: ProjectDialogsProviderProps) {
  return <ProjectDialogsContext.Provider value={value}>{children}</ProjectDialogsContext.Provider>
}

export function useProjectDialogActions(): ProjectDialogActions {
  const ctx = useContext(ProjectDialogsContext)
  if (!ctx) {
    throw new Error("useProjectDialogActions must be used within a ProjectDialogsProvider")
  }
  return ctx
}
