import "server-only";
import { headers } from "next/headers";
import { getSiteURL } from "@/lib/site-url";

/** Domains the app is served from. Email links may only ever point at these. */
const KNOWN_HOSTS = ["trimegos.vercel.app", "trimegos.com", "www.trimegos.com", "trios-smoky.vercel.app"];

function allowed(host: string): boolean {
  const configured = new URL(getSiteURL()).host;
  return host === configured || KNOWN_HOSTS.includes(host) || /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

/**
 * Origin of the current request, so email links (password reset, signup
 * confirmation, invites) come back to the domain the person is actually
 * using. Unknown hosts fall back to the configured site URL, so a forged
 * Host header can't point a reset link at someone else's site.
 */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim().toLowerCase();
  if (!host || !allowed(host)) return getSiteURL();
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const proto = (h.get("x-forwarded-proto") ?? (local ? "http" : "https")).split(",")[0].trim();
  return `${proto === "http" && local ? "http" : "https"}://${host}`;
}
