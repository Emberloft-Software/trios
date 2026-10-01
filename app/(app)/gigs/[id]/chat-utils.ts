export interface Msg {
  id: string;
  user_id: string | null;
  body: string;
  system_kind: string | null;
  created_at: string;
}

// A run of digits/separators counts as a phone number once it holds 9+ digits
// (so dates and prices don't trip it).
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|lk|net|org|io|me|app|link|ly|co|gg|xyz|info|biz)\b|wa\.me|t\.me|bit\.ly)/i;

export function flagsFor(body: string) {
  const phone = (body.match(PHONE_RE) ?? []).some((m) => m.replace(/\D/g, "").length >= 9);
  return { phone, link: LINK_RE.test(body) };
}

/** System messages that change who's in the gig → refresh the page data. */
export const MEMBERSHIP_EVENTS = ["left", "removed", "vote_removed", "locked", "cancelled", "guest_joined", "confirmed"];

/** Merge a realtime insert, replacing our own optimistic placeholder. */
export function mergeIncoming(list: Msg[], incoming: Msg): Msg[] {
  if (list.some((x) => x.id === incoming.id)) return list;
  const tmp = list.findIndex((x) => x.id.startsWith("tmp-") && x.user_id === incoming.user_id && x.body === incoming.body);
  if (tmp === -1) return [...list, incoming];
  const next = [...list];
  next[tmp] = incoming;
  return next;
}
