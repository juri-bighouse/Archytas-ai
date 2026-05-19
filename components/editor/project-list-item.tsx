"use client"

import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ProjectSummary } from "@/lib/projects/data"

interface ProjectListItemProps {
  readonly project: ProjectSummary
  readonly showActions: boolean
  readonly isActive: boolean
  readonly onRename?: (project: ProjectSummary) => void
  readonly onDelete?: (project: ProjectSummary) => void
}

export function ProjectListItem({
  project,
  showActions,
  isActive,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  return (
    <div
      className={cn(
        "group/project flex h-9 items-center gap-1 rounded-lg pr-1 pl-2 text-sm transition-colors",
        isActive
          ? "bg-accent-dim text-copy-primary"
          : "text-copy-secondary hover:bg-elevated"
      )}
    >
      <Link
        href={`/editor/${project.id}`}
        aria-current={isActive ? "page" : undefined}
        className="flex-1 truncate py-1.5 text-left outline-none focus-visible:underline"
      >
        {project.name}
      </Link>
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
