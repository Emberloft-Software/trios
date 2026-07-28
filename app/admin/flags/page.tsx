import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { formatDay } from "@/lib/time";

export const metadata = { title: "Flags — Trio admin" };

const KIND_LABEL: Record<string, string> = {
  host_removals: "Removing a lot of people",
  blocks_received: "Being blocked by others",
  friend_spam: "Friend-request spray",
};

/**
 * Behavioural red flags (docs/06). Surface, don't sentence — every row links to
 * the user view so a human decides. Built from the admin_flags view over
 * existing tables. Read via the service role.
 */
export default async function FlagsPage() {
  const admin = createAdminClient();
  const { data: flags } = await admin
    .from("admin_flags")
    .select("*")
    .order("count", { ascending: false });

  const rows = flags ?? [];
  const ids = [...new Set(rows.map((f) => f.subject_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name, handle")
    .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="mb-2 font-display text-[2rem] font-700">Flags</h1>
      <p className="mb-6 text-[0.875rem] text-[var(--color-dust)]">
        Cross-gig patterns worth a look. Nothing here is a punishment — a human decides.
      </p>

      {rows.length === 0 ? (
        <Card className="p-6 text-[0.9375rem] text-[var(--color-dust)]">No patterns flagged.</Card>
      ) : (
        <ul className="space-y-2">
          {rows.map((f) => {
            const p = byId.get(f.subject_id);
            return (
              <li key={`${f.kind}-${f.subject_id}`}>
                <Link href={`/admin/users/${f.subject_id}`}>
                  <Card hover className="flex flex-wrap items-center justify-between gap-2 p-4">
                    <span>
                      <span className="font-500">{p?.display_name ?? "Unknown"}</span>
                      <span className="font-data ml-2 text-[0.75rem] text-[var(--color-dust)]">
                        {KIND_LABEL[f.kind] ?? f.kind}
                      </span>
                    </span>
                    <span className="text-[0.875rem] text-[var(--color-dust)]">
                      {f.detail} · {formatDay(f.last_at)}
                    </span>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
