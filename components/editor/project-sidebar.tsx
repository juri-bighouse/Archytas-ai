"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ProjectListItem } from "./project-list-item"
import type { ProjectSummary } from "@/lib/projects/data"

interface ProjectSidebarProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly ownedProjects: readonly ProjectSummary[]
  readonly sharedProjects: readonly ProjectSummary[]
  readonly onCreate: () => void
  readonly onRename: (project: ProjectSummary) => void
  readonly onDelete: (project: ProjectSummary) => void
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  onCreate,
  onRename,
  onDelete,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-x-0 bottom-0 top-12 z-30 bg-black/60 md:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-12 z-40 flex h-[calc(100vh-3rem)] w-64 flex-col border-r border-surface-border bg-surface transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border px-4">
          <span className="text-sm font-medium text-copy-primary">Projects</span>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden px-3 py-3">
          <Tabs defaultValue="my-project" className="flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="my-project" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-project" className="mt-3 flex-1">
              {ownedProjects.length === 0 ? (
                <p className="mt-6 text-center text-sm text-copy-muted">
                  No projects yet
                </p>
              ) : (
                <ul className="flex flex-col gap-0.5">
                  {ownedProjects.map((project) => (
                    <li key={project.id}>
                      <ProjectListItem
                        project={project}
                        showActions
                        onRename={onRename}
                        onDelete={onDelete}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            <TabsContent value="shared" className="mt-3 flex-1">
              {sharedProjects.length === 0 ? (
                <p className="mt-6 text-center text-sm text-copy-muted">
                  No shared projects
                </p>
              ) : (
                <ul className="flex flex-col gap-0.5">
                  {sharedProjects.map((project) => (
                    <li key={project.id}>
                      <ProjectListItem project={project} showActions={false} />
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="shrink-0 border-t border-surface-border p-3">
          <Button className="w-full gap-1.5" onClick={onCreate}>
            <Plus />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
