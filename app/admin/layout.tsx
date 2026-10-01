import { notFound, redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "./AdminNav";

/**
 * Admin gate. Middleware bounces signed-out users; here non-admins get a 404
 * (not 403) so the route's existence isn't confirmed. NOT authorisation on its
 * own — every admin action and route handler re-checks is_admin itself.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getViewer();
  if (!user) redirect("/sign-in");
  if (!profile?.is_admin) notFound();

  const admin = createAdminClient();
  const [v, p, r] = await Promise.all([
    admin.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending").not("media_path", "is", null),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("avatar_status", "pending"),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[250px_1fr]">
      <AdminNav counts={{ verifications: v.count ?? 0, photos: p.count ?? 0, reports: r.count ?? 0 }} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
