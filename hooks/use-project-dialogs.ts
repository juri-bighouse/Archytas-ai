"use client"

import { useCallback, useState } from "react"
import type { MockProject } from "@/lib/projects/mock-data"

export type ProjectDialogMode = "create" | "rename" | "delete" | null

export interface UseProjectDialogsResult {
  mode: ProjectDialogMode
  target: MockProject | null
  name: string
  loading: boolean
  setName: (value: string) => void
  setLoading: (value: boolean) => void
  openCreate: () => void
  openRename: (project: MockProject) => void
  openDelete: (project: MockProject) => void
  close: () => void
  submit: () => void
}

export function useProjectDialogs(): UseProjectDialogsResult {
  const [mode, setMode] = useState<ProjectDialogMode>(null)
  const [target, setTarget] = useState<MockProject | null>(null)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const reset = useCallback(() => {
    setMode(null)
    setTarget(null)
    setName("")
    setLoading(false)
  }, [])

  const openCreate = useCallback(() => {
    setMode("create")
    setTarget(null)
    setName("")
    setLoading(false)
  }, [])

  const openRename = useCallback((project: MockProject) => {
    setMode("rename")
    setTarget(project)
    setName(project.name)
    setLoading(false)
  }, [])

  const openDelete = useCallback((project: MockProject) => {
    setMode("delete")
    setTarget(project)
    setName("")
    setLoading(false)
  }, [])

  const close = useCallback(() => {
    if (loading) return
    reset()
  }, [loading, reset])

  const submit = useCallback(() => {
    reset()
  }, [reset])

  return {
    mode,
    target,
    name,
    loading,
    setName,
    setLoading,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  }
}
