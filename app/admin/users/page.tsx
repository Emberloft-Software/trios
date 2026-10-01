import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Field";
import { publicAvatarUrl } from "@/lib/avatar";
import { ageFrom, timeAgo } from "@/lib/time";

export const metadata = { title: "Users · Admin" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const db = createAdminClient();
  let query = db
    .from("profiles")
    .select("id, display_name, handle, birth_date, gender, avatar_path, verification_status, reliability_band, is_admin, suspended_until, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  const term = q?.trim().replace(/[%,()]/g, "");
  if (term && term.length >= 2) query = query.or(`display_name.ilike.%${term}%,handle.ilike.%${term}%`);
  const { data: users } = await query;

  return (
    <div>
      <PageHeader title="Users" sub={term ? `Results for “${term}”` : "Newest first. Search by name or @handle."} />
      <form method="get" className="relative mb-5 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
        <Input name="q" defaultValue={q ?? ""} placeholder="Search by name or @handle" className="pl-11" />
      </form>
      <ul className="glass divide-y divide-line overflow-hidden rounded-[1.5rem]">
        {(users ?? []).length === 0 && <li className="p-5 text-[0.875rem] text-muted">No matches.</li>}
        {(users ?? []).map((u) => {
          const suspended = u.suspended_until && new Date(u.suspended_until) > new Date();
          return (
            <li key={u.id}>
              <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/60">
                <Avatar name={u.display_name} src={publicAvatarUrl(u.avatar_path)} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-plum">{u.display_name} <span className="font-medium text-muted">@{u.handle}</span></span>
                  <span className="text-[0.75rem] text-muted">
                    {u.birth_date ? `${ageFrom(u.birth_date)} · ` : ""}{u.gender ?? "n/a"} · joined {timeAgo(u.created_at)}
                  </span>
                </span>
                <span className="hidden flex-wrap justify-end gap-1.5 sm:flex">
                  {u.is_admin && <Badge tone="plum">admin</Badge>}
                  {suspended && <Badge tone="coral">suspended</Badge>}
                  <Badge tone={u.verification_status === "verified" ? "mint" : "muted"}>{u.verification_status}</Badge>
                  <Badge tone="white">{u.reliability_band}</Badge>
                </span>
                <ChevronRight className="h-4.5 w-4.5 text-muted" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
