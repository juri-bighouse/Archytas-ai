"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { ProjectSummary } from "@/lib/projects/data"

interface ProjectDialogActions {
  openCreate: () => void
  openRename: (project: ProjectSummary) => void
  openDelete: (project: ProjectSummary) => void
}

const ProjectDialogsContext = createContext<ProjectDialogActions | null>(null)

interface ProjectDialogsProviderProps {
  readonly value: ProjectDialogActions
  readonly children: ReactNode
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
