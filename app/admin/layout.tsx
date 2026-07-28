import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { brand } from "@/lib/brand";

/**
 * Admin gate #2 (docs/07). Gate #1 is middleware (redirects unauthenticated).
 * Here we fetch the profile server-side and 404 — not 403 — if is_admin is
 * false, so the route's existence isn't confirmed. This is NOT authorisation on
 * its own: every admin server action re-checks is_admin itself.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) notFound();

  const links: [string, string][] = [
    ["/admin", "Dashboard"],
    ["/admin/verifications", "Verifications"],
    ["/admin/reports", "Reports"],
    ["/admin/flags", "Flags"],
    ["/admin/users", "Users"],
    ["/admin/gigs", "Gigs"],
    ["/admin/venues", "Venues"],
    ["/admin/partners", "Partners"],
  ];

  return (
    <div className="min-h-dvh">
      <header className="border-b-2 border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-chalk)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 text-[0.875rem]">
          <span className="font-display text-lg font-800">{brand.name} admin</span>
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="hover:underline">
              {label}
            </Link>
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-6">{children}</main>
    </div>
  );
}
