import { getCurrentIdentity, getProjectAccess } from "@/lib/project-access";
import { getCursorColor, getLiveblocks } from "@/lib/liveblocks";

/**
 * Liveblocks authentication endpoint.
 *
 * The Liveblocks client posts `{ room }` here when joining a room. The room ID
 * is the project ID, so access is verified against that project before a
 * room-scoped session token is issued.
 */
export async function POST(request: Request) {
  // 1. Require Clerk authentication.
  const identity = await getCurrentIdentity();
  if (!identity) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The room ID the client wants to join — equal to the project ID.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const room =
    body && typeof body === "object" && "room" in body ? body.room : undefined;
  if (typeof room !== "string" || room.length === 0) {
    return Response.json({ error: "Missing room" }, { status: 400 });
  }

  // 2. Verify project access using the existing access helper.
  const access = await getProjectAccess(room, identity);
  if (!access || !access.hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const liveblocks = getLiveblocks();

    // 3. Ensure the Liveblocks room exists (created only if needed).
    await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] });

    // 4. Issue a session token scoped to this room, carrying user metadata.
    const session = liveblocks.prepareSession(identity.userId, {
      userInfo: {
        name: identity.name,
        avatar: identity.imageUrl ?? "",
        color: getCursorColor(identity.userId),
      },
    });
    session.allow(room, session.FULL_ACCESS);

    const { status, body: token } = await session.authorize();
    return new Response(token, { status });
  } catch (error) {
    console.error("Liveblocks authorization failed", error);
    return Response.json(
      { error: "Failed to authorize Liveblocks session" },
      { status: 500 },
    );
  }
}
