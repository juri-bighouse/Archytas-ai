import { redirect } from "next/navigation"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "@/components/editor/workspace-shell"
import { getCurrentIdentity, getProjectAccess } from "@/lib/project-access"

interface WorkspacePageProps {
  readonly params: Promise<{ projectId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const identity = await getCurrentIdentity()
  if (!identity) redirect("/sign-in")

  const { projectId } = await params
  const access = await getProjectAccess(projectId, identity)
  if (!access?.hasAccess) return <AccessDenied />

  return <WorkspaceShell />
}
