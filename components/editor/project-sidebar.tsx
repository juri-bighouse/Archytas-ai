"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-12 z-40 flex h-[calc(100vh-3rem)] w-64 flex-col border-r border-surface-border bg-surface transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <span className="text-sm font-medium text-copy-primary">Project</span>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-3 py-3">
        <Tabs defaultValue="my-project" className="flex-1">
          <TabsList className="w-full">
            <TabsTrigger value="my-project" className="flex-1">
              My Project
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-project" className="flex items-center justify-center">
            <p className="text-sm text-copy-muted">No projects yet</p>
          </TabsContent>
          <TabsContent value="shared" className="flex items-center justify-center">
            <p className="text-sm text-copy-muted">No shared projects</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="shrink-0 border-t border-surface-border p-3">
        <Button variant="outline" size="sm" className="w-full gap-1.5">
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  )
}
