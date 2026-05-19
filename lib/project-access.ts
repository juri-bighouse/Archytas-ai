import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface ClerkIdentity {
  userId: string;
  email: string | null;
  initial: string;
  imageUrl: string | null;
}

function computeInitial(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const trimmed = candidate.trim();
    if (trimmed.length > 0) return trimmed.charAt(0).toUpperCase();
  }
  return "?";
}

export async function getCurrentIdentity(): Promise<ClerkIdentity | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  return {
    userId,
    email,
    initial: computeInitial(user?.firstName, user?.username, email),
    imageUrl: user?.imageUrl ?? null,
  };
}

export interface AccessibleProject {
  id: string;
  name: string;
  ownerId: string;
}

export interface ProjectAccessResult {
  project: AccessibleProject;
  hasAccess: boolean;
  role: "owner" | "collaborator" | "none";
}

export async function getProjectAccess(
  projectId: string,
  identity: ClerkIdentity
): Promise<ProjectAccessResult | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: { select: { email: true } },
    },
  });
  if (!project) return null;

  const isOwner = project.ownerId === identity.userId;
  const isCollaborator =
    !isOwner && identity.email
      ? project.collaborators.some((c) => c.email === identity.email)
      : false;

  let role: ProjectAccessResult["role"] = "none";
  if (isOwner) role = "owner";
  else if (isCollaborator) role = "collaborator";

  return {
    project: { id: project.id, name: project.name, ownerId: project.ownerId },
    hasAccess: isOwner || isCollaborator,
    role,
  };
}
