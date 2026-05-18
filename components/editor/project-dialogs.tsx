"use client"

import { useMemo, type ChangeEvent, type ComponentProps } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { slugify } from "@/lib/projects/slug"
import type { UseProjectActionsResult } from "@/hooks/use-project-actions"

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0]

interface ProjectDialogsProps {
  readonly controller: UseProjectActionsResult
}

const dialogClassName =
  "rounded-2xl bg-elevated text-copy-primary ring-1 ring-surface-border sm:max-w-md"

const footerClassName = "flex flex-row justify-end gap-2"

export function ProjectDialogs({ controller }: ProjectDialogsProps) {
  const { mode, target, name, loading, error, setName, close, submit } = controller

  const slugPreview = useMemo(() => (mode === "create" ? slugify(name) : ""), [mode, name])

  const handleOpenChange = (open: boolean) => {
    if (!open) close()
  }

  const handleSubmit = (event: FormSubmitEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    void submit()
  }

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const handleDeleteClick = () => {
    void submit()
  }

  return (
    <>
      <Dialog open={mode === "create"} onOpenChange={handleOpenChange}>
        <DialogContent className={dialogClassName}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-copy-primary">
                New Project
              </DialogTitle>
              <DialogDescription className="text-copy-secondary">
                Give your project a name to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Input
                value={name}
                onChange={handleNameChange}
                placeholder="My new project"
                autoFocus
                disabled={loading}
                className="text-copy-primary"
              />
              <p className="text-xs text-copy-muted">
                Room ID:{" "}
                <span className="font-mono text-copy-secondary">
                  {slugPreview ? `${slugPreview}-…` : "—"}
                </span>
              </p>
              {error && (
                <p className="text-xs text-state-error">{error}</p>
              )}
            </div>
            <div className={footerClassName}>
              <Button type="button" variant="secondary" onClick={close} disabled={loading}>
                Close
              </Button>
              <Button type="submit" disabled={!name.trim() || loading}>
                {loading ? "Creating…" : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={mode === "rename"} onOpenChange={handleOpenChange}>
        <DialogContent className={dialogClassName}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-copy-primary">
                Rename Project
              </DialogTitle>
              <DialogDescription className="text-copy-secondary">
                Renaming &ldquo;{target?.name ?? ""}&rdquo;.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={name}
              onChange={handleNameChange}
              autoFocus
              disabled={loading}
              className="text-copy-primary"
            />
            {error && (
              <p className="text-xs text-state-error">{error}</p>
            )}
            <div className={footerClassName}>
              <Button type="button" variant="secondary" onClick={close} disabled={loading}>
                Close
              </Button>
              <Button type="submit" disabled={!name.trim() || loading}>
                {loading ? "Renaming…" : "Rename Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={mode === "delete"} onOpenChange={handleOpenChange}>
        <DialogContent className={dialogClassName}>
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-copy-primary">
                Delete Project
              </DialogTitle>
              <DialogDescription className="text-copy-secondary">
                Delete &ldquo;{target?.name ?? ""}&rdquo;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <p className="text-xs text-state-error">{error}</p>
            )}
            <div className={footerClassName}>
              <Button type="button" variant="secondary" onClick={close} disabled={loading}>
                Close
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={loading}
              >
                {loading ? "Deleting…" : "Delete Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
