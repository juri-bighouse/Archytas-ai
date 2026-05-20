import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { enrichCollaborators, enrichUserById } from "@/lib/clerk-users";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

async function loadProjectWithAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      ownerId: true,
      collaborators: { select: { email: true } },
    },
  });
  if (!project) return { project: null, isOwner: false, isCollaborator: false };

  let isCollaborator = false;
  if (project.ownerId !== userId) {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;
    isCollaborator = email
      ? project.collaborators.some((c) => c.email.toLowerCase() === email)
      : false;
  }

  return {
    project,
    isOwner: project.ownerId === userId,
    isCollaborator,
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const access = await loadProjectWithAccess(projectId, userId);
  if (!access.project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  if (!access.isOwner && !access.isCollaborator) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const emails = access.project.collaborators.map((c) => c.email);
  const [owner, collaborators] = await Promise.all([
    enrichUserById(access.project.ownerId),
    enrichCollaborators(emails),
  ]);
  return Response.json({ owner, collaborators });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawEmail =
    body && typeof body === "object" && "email" in body
      ? body.email
      : undefined;

  if (!isValidEmail(rawEmail)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();

  const access = await loadProjectWithAccess(projectId, userId);
  if (!access.project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  if (!access.isOwner) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const owner = await currentUser();
  const ownerEmail =
    owner?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;
  if (ownerEmail && ownerEmail === email) {
    return Response.json(
      { error: "You are already the owner of this project" },
      { status: 400 }
    );
  }

  const existing = access.project.collaborators.find(
    (c) => c.email.toLowerCase() === email
  );
  if (existing) {
    return Response.json(
      { error: "This collaborator is already invited" },
      { status: 409 }
    );
  }

  await prisma.projectCollaborator.create({
    data: { projectId, email },
  });

  const [collaborator] = await enrichCollaborators([email]);
  return Response.json({ collaborator }, { status: 201 });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawEmail =
    body && typeof body === "object" && "email" in body
      ? body.email
      : undefined;

  if (typeof rawEmail !== "string" || rawEmail.trim().length === 0) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();

  const access = await loadProjectWithAccess(projectId, userId);
  if (!access.project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  if (!access.isOwner) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.projectCollaborator.deleteMany({
    where: { projectId, email },
  });

  return new Response(null, { status: 204 });
}
