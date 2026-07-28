import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ReliabilityMark, VerifiedBadge } from "@/components/gig/Badges";
import { firstName } from "@/lib/avatar";
import { copy } from "@/lib/copy";

export const metadata = { title: "You — Trio" };

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("profiles")
    .select("display_name, handle, bio, reliability_band, verification_status, face_visible")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: hosted } = await supabase
    .from("gigs")
    .select("id, title, code, status, starts_at")
    .eq("host_id", user!.id)
    .order("starts_at", { ascending: false })
    .limit(10);

  if (!me) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-[2rem] font-700">{firstName(me.display_name)}</h1>
        <p className="font-data text-[0.9375rem] text-[var(--color-dust)]">@{me.handle}</p>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3">
          <ReliabilityMark band={me.reliability_band} />
          {me.verification_status === "verified" ? (
            <VerifiedBadge />
          ) : me.verification_status === "pending" ? (
            <span className="text-[0.875rem] text-[var(--color-dust)]">{copy.verification.pendingStatus}</span>
          ) : (
            <span className="text-[0.875rem] text-[var(--color-dust)]">Not verified yet</span>
          )}
        </div>
        {me.bio && <p className="mt-3 text-[0.9375rem]">{me.bio}</p>}
        {me.verification_status !== "verified" && me.verification_status !== "pending" && (
          <div className="mt-4">
            <ButtonLink href="/me/verify" variant="secondary">
              {copy.verification.verifyCta}
            </ButtonLink>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 font-display text-[1.125rem] font-600">Your face setting</h2>
        <p className="text-[0.875rem] text-[var(--color-dust)]">{copy.faceSetting}</p>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-[1.25rem] font-700">Gigs you host</h2>
        {(hosted ?? []).length === 0 ? (
          <Card className="p-5 text-[0.9375rem] text-[var(--color-dust)]">
            You haven&apos;t posted a gig yet.
          </Card>
        ) : (
          <ul className="space-y-2">
            {(hosted ?? []).map((g) => (
              <li key={g.id}>
                <Card hover className="flex items-center justify-between p-4 text-[0.9375rem]">
                  <span>{g.title}</span>
                  <span className="font-data text-[0.8125rem] text-[var(--color-dust)] uppercase">
                    {g.status}
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
