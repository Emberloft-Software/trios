/**
 * Canonical site origin for building auth redirect URLs.
 *
 * Prefers NEXT_PUBLIC_SITE_URL (set this in Vercel to your production domain,
 * and in .env.local to http://localhost:3000 for dev), then Vercel's auto
 * NEXT_PUBLIC_VERCEL_URL, then the browser origin. This is what makes magic
 * links land on the right domain instead of falling back to localhost.
 *
 * NOTE: the redirect target must also be allow-listed in the Supabase dashboard
 * (Authentication → URL Configuration → Redirect URLs). If it isn't, Supabase
 * ignores redirect_to and falls back to the Site URL.
 */
export function getSiteURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "http://localhost:3000";

  if (!url.startsWith("http")) url = `https://${url}`;
  return url.replace(/\/$/, ""); // no trailing slash
}
