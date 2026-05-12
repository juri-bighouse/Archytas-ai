"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MockProject } from "@/lib/projects/mock-data"

interface ProjectListItemProps {
  readonly project: MockProject
  readonly showActions: boolean
  readonly onRename?: (project: MockProject) => void
  readonly onDelete?: (project: MockProject) => void
}

export function ProjectListItem({
  project,
  showActions,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  return (
    <div className="group/project flex h-9 items-center gap-1 rounded-lg px-2 text-sm text-copy-secondary hover:bg-elevated">
      <span className="flex-1 truncate">{project.name}</span>
      {showActions && (
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/project:opacity-100 focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRename?.(project)}
            aria-label={`Rename ${project.name}`}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete?.(project)}
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  )
}
