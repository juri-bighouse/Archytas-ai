import { Liveblocks } from "@liveblocks/node";

/**
 * Cached Liveblocks node client.
 *
 * The instance is stashed on `globalThis` so it is reused across hot reloads
 * in development, mirroring the Prisma client pattern.
 *
 * Construction is deferred behind `getLiveblocks()` rather than created at
 * module scope: the Liveblocks constructor validates `LIVEBLOCKS_SECRET_KEY`
 * immediately, so eager creation would crash any build or import that happens
 * before the key is configured.
 */
const globalForLiveblocks = globalThis as unknown as {
  liveblocks?: Liveblocks;
};

export function getLiveblocks(): Liveblocks {
  if (!globalForLiveblocks.liveblocks) {
    globalForLiveblocks.liveblocks = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY ?? "",
    });
  }
  return globalForLiveblocks.liveblocks;
}

/**
 * Fixed palette of cursor colors. Bright, saturated hues that read clearly
 * against the dark canvas. These are presence data (applied as inline colors
 * on other users' cursors), not component styling, so concrete values are
 * intentional here.
 */
const CURSOR_COLORS = [
  "#F87171", // red
  "#FB923C", // orange
  "#FACC15", // amber
  "#4ADE80", // green
  "#2DD4BF", // teal
  "#38BDF8", // sky
  "#818CF8", // indigo
  "#C084FC", // violet
  "#F472B6", // pink
  "#A3E635", // lime
] as const;

/**
 * Deterministically maps a user ID to a consistent color from the fixed
 * palette. The same user ID always yields the same color across sessions.
 */
export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  const index =
    ((hash % CURSOR_COLORS.length) + CURSOR_COLORS.length) %
    CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}
