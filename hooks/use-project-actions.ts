"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { buildRoomId } from "@/lib/projects/slug"
import type { ProjectSummary } from "@/lib/projects/data"

export type ProjectDialogMode = "create" | "rename" | "delete" | null

interface CreatedProjectResponse {
  project: { id: string }
}

export interface UseProjectActionsResult {
  mode: ProjectDialogMode
  target: ProjectSummary | null
  name: string
  loading: boolean
  error: string | null
  setName: (value: string) => void
  openCreate: () => void
  openRename: (project: ProjectSummary) => void
  openDelete: (project: ProjectSummary) => void
  close: () => void
  submit: () => Promise<void>
}

export function useProjectActions(): UseProjectActionsResult {
  const router = useRouter()
  const pathname = usePathname()

  const [mode, setMode] = useState<ProjectDialogMode>(null)
  const [target, setTarget] = useState<ProjectSummary | null>(null)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setMode(null)
    setTarget(null)
    setName("")
    setLoading(false)
    setError(null)
  }, [])

  const openCreate = useCallback(() => {
    setMode("create")
    setTarget(null)
    setName("")
    setLoading(false)
    setError(null)
  }, [])

  const openRename = useCallback((project: ProjectSummary) => {
    setMode("rename")
    setTarget(project)
    setName(project.name)
    setLoading(false)
    setError(null)
  }, [])

  const openDelete = useCallback((project: ProjectSummary) => {
    setMode("delete")
    setTarget(project)
    setName("")
    setLoading(false)
    setError(null)
  }, [])

  const close = useCallback(() => {
    if (loading) return
    reset()
  }, [loading, reset])

  const create = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = buildRoomId(trimmed)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: trimmed }),
      })
      if (!res.ok) throw new Error(`Failed to create project (${res.status})`)
      const data = (await res.json()) as CreatedProjectResponse
      reset()
      router.push(`/editor/${data.project.id}`)
      router.refresh()
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "Failed to create project")
    }
  }, [name, reset, router])

  const rename = useCallback(async () => {
    if (!target) return
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) throw new Error(`Failed to rename project (${res.status})`)
      reset()
      router.refresh()
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "Failed to rename project")
    }
  }, [name, reset, router, target])

  const remove = useCallback(async () => {
    if (!target) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${target.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`Failed to delete project (${res.status})`)
      const wasActive = pathname === `/editor/${target.id}`
      reset()
      if (wasActive) router.push("/editor")
      router.refresh()
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "Failed to delete project")
    }
  }, [pathname, reset, router, target])

  const submit = useCallback(async () => {
    if (loading) return
    if (mode === "create") await create()
    else if (mode === "rename") await rename()
    else if (mode === "delete") await remove()
  }, [create, loading, mode, remove, rename])

  return {
    mode,
    target,
    name,
    loading,
    error,
    setName,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  }
}
