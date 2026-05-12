"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectDialogActions } from "./project-dialogs-context"

export function EditorHome() {
  const { openCreate } = useProjectDialogActions()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-medium text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-copy-muted">
          Start a new architecture workspace, or choose a project from the
          sidebar.
        </p>
      </div>
      <Button onClick={openCreate} className="gap-1.5">
        <Plus />
        New Project
      </Button>
    </div>
  )
}
