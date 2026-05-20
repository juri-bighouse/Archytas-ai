import { clerkClient } from "@clerk/nextjs/server";

export interface UserProfile {
  email: string;
  displayName: string | null;
  imageUrl: string | null;
}

function formatDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  username: string | null | undefined
): string | null {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (full.length > 0) return full;
  if (username && username.trim().length > 0) return username.trim();
  return null;
}

export async function enrichCollaborators(
  emails: readonly string[]
): Promise<UserProfile[]> {
  if (emails.length === 0) return [];

  const unique = Array.from(new Set(emails.map((e) => e.toLowerCase())));

  const client = await clerkClient();
  const response = await client.users.getUserList({
    emailAddress: [...unique],
    limit: Math.min(unique.length * 2, 500),
  });

  const users = Array.isArray(response) ? response : response.data;

  const byEmail = new Map<string, UserProfile>();

  for (const user of users) {
    const displayName = formatDisplayName(
      user.firstName,
      user.lastName,
      user.username
    );
    const imageUrl = user.imageUrl ?? null;
    for (const addr of user.emailAddresses) {
      const normalized = addr.emailAddress.toLowerCase();
      if (!byEmail.has(normalized)) {
        byEmail.set(normalized, {
          email: normalized,
          displayName,
          imageUrl,
        });
      }
    }
  }

  return unique.map(
    (email) =>
      byEmail.get(email) ?? {
        email,
        displayName: null,
        imageUrl: null,
      }
  );
}

export async function enrichUserById(
  userId: string
): Promise<UserProfile | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email =
      user.primaryEmailAddress?.emailAddress?.toLowerCase() ??
      user.emailAddresses[0]?.emailAddress.toLowerCase() ??
      "";
    return {
      email,
      displayName: formatDisplayName(
        user.firstName,
        user.lastName,
        user.username
      ),
      imageUrl: user.imageUrl ?? null,
    };
  } catch {
    return null;
  }
}
