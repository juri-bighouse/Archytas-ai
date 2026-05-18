import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_PROJECT_NAME = "Untitled Project";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const rawName =
    body && typeof body === "object" && "name" in body ? body.name : undefined;

  const rawId =
    body && typeof body === "object" && "id" in body ? body.id : undefined;

  const name =
    typeof rawName === "string" && rawName.trim().length > 0
      ? rawName.trim()
      : DEFAULT_PROJECT_NAME;

  const id =
    typeof rawId === "string" && rawId.trim().length > 0
      ? rawId.trim()
      : undefined;

  const project = await prisma.project.create({
    data: { ownerId: userId, name, ...(id ? { id } : {}) },
  });

  return Response.json({ project }, { status: 201 });
}
