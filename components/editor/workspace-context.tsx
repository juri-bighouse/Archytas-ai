"use client"

import { createContext, useContext, type ReactNode } from "react"

export type WorkspaceRole = "owner" | "collaborator"

export interface WorkspaceContextValue {
  projectId: string
  projectName: string
  role: WorkspaceRole
  aiSidebarOpen: boolean
  toggleAiSidebar: () => void
  closeAiSidebar: () => void
  shareDialogOpen: boolean
  openShareDialog: () => void
  closeShareDialog: () => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

interface WorkspaceProviderProps {
  readonly value: WorkspaceContextValue | null
  readonly children: ReactNode
}

export function WorkspaceProvider({ value, children }: WorkspaceProviderProps) {
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspaceContext(): WorkspaceContextValue | null {
  return useContext(WorkspaceContext)
}
