import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Users — Trio admin" };

/**
 * User search (docs/07). Handle or display-name lookup via the service role.
 * GET form so the query is shareable/bookmarkable.
 */
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const admin = createAdminClient();

  let results: { id: string; display_name: string; handle: string; reliability_band: string; verification_status: string }[] = [];
  if (q && q.trim().length >= 2) {
    const term = `%${q.trim()}%`;
    const { data } = await admin
      .from("profiles")
      .select("id, display_name, handle, reliability_band, verification_status")
      .or(`display_name.ilike.${term},handle.ilike.${term}`)
      .limit(30);
    results = data ?? [];
  }

  return (
    <div>
      <h1 className="mb-4 font-display text-[2rem] font-700">Users</h1>
      <form method="get" className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or @handle"
          className="flex-1 rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2 text-[0.9375rem] outline-none"
        />
        <button className="rounded-[var(--radius-btn)] border-2 border-[var(--color-ink)] bg-[var(--color-tape)] px-5 text-[var(--color-chalk)]">
          Search
        </button>
      </form>

      {q && results.length === 0 && (
        <Card className="p-5 text-[0.9375rem] text-[var(--color-dust)]">No matches.</Card>
      )}

      <ul className="space-y-2">
        {results.map((u) => (
          <li key={u.id}>
            <Link href={`/admin/users/${u.id}`}>
              <Card hover className="flex items-center justify-between p-4">
                <span>
                  <span className="font-500">{u.display_name}</span>
                  <span className="font-data ml-2 text-[0.8125rem] text-[var(--color-dust)]">@{u.handle}</span>
                </span>
                <span className="font-data text-[0.75rem] uppercase text-[var(--color-dust)]">
                  {u.reliability_band} · {u.verification_status}
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
