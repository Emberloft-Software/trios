/** Public URL for a file in the public `avatars` bucket. */
export function publicAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/avatars/${path}`;
}

/** First name only — the feed and previews never show more. */
export function firstName(displayName: string | null | undefined): string {
  if (!displayName) return "Someone";
  return displayName.trim().split(/\s+/)[0] ?? displayName;
}
