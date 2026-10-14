import { copy } from "@/lib/copy";

/** Where tapping a notification (in Activity or a push) takes you. */
export function notificationHref(kind: string, gigId: string | null): string {
  if (kind === "friend_invite" && gigId) return `/gigs/${gigId}`;
  if (kind.startsWith("friend_")) return "/me/friends";
  if (kind.startsWith("verification_") || kind.startsWith("photo_")) return "/me";
  if (kind === "admin_priority_report") return "/admin/reports";
  if (gigId) return `/gigs/${gigId}`;
  return "/me";
}

/** One-line text for a notification kind. */
export function notificationText(kind: string): string {
  return copy.notifications.kinds[kind] ?? copy.notifications.fallback;
}
