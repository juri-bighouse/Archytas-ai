import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface ClerkIdentity {
  userId: string;
  email: string | null;
  name: string;
  initial: string;
  imageUrl: string | null;
}

function computeInitial(
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const trimmed = candidate.trim();
    if (trimmed.length > 0) return trimmed.charAt(0).toUpperCase();
  }
  return "?";
}

function computeName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  username: string | null | undefined,
  email: string | null | undefined,
): string {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (full.length > 0) return full;
  if (username && username.trim().length > 0) return username.trim();
  if (email && email.trim().length > 0) return email.trim();
  return "Anonymous";
}

export async function getCurrentIdentity(): Promise<ClerkIdentity | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  return {
    userId,
    email,
    name: computeName(user?.firstName, user?.lastName, user?.username, email),
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
  identity: ClerkIdentity,
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
      ? project.collaborators.some(
          (c) => c.email?.toLowerCase() === identity.email?.toLowerCase(),
        )
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
