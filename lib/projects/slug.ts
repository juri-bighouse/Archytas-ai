export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateRoomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function buildRoomId(name: string): string {
  const slug = slugify(name);
  const suffix = generateRoomSuffix();
  return slug ? `${slug}-${suffix}` : suffix;
}
