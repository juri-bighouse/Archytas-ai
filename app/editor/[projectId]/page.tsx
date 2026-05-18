import { auth, currentUser } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

interface WorkspacePageProps {
  readonly params: Promise<{ projectId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: { select: { email: true } },
    },
  })
  if (!project) notFound()

  if (project.ownerId !== userId) {
    const user = await currentUser()
    const email = user?.primaryEmailAddress?.emailAddress ?? null
    const isCollaborator = email
      ? project.collaborators.some((c) => c.email === email)
      : false
    if (!isCollaborator) notFound()
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-xl font-medium text-copy-primary">{project.name}</h1>
      <p className="font-mono text-xs text-copy-muted">{project.id}</p>
    </div>
  )
}
