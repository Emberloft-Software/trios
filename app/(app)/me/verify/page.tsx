import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { VerifiedBadge } from "@/components/gig/Badges";
import { VerifyFlow } from "./VerifyFlow";
import { copy } from "@/lib/copy";

export const metadata = { title: "Get verified — Trio" };

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", user!.id)
    .maybeSingle();

  const v = copy.verification;
  const status = me?.verification_status ?? "unverified";

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-700">{v.title}</h1>
      <p className="mb-6 text-[0.9375rem] text-[var(--color-dust)]">{v.meaning}</p>

      {status === "verified" ? (
        <Card className="p-6">
          <div className="mb-2">
            <VerifiedBadge />
          </div>
          <p className="text-[0.9375rem]">{v.approved}</p>
        </Card>
      ) : status === "pending" ? (
        <Card className="p-6">
          <p className="text-[0.9375rem]">{v.pendingStatus}</p>
        </Card>
      ) : (
        <>
          {status === "rejected" && (
            <Card className="mb-4 p-4">
              <p className="text-[0.9375rem]">{v.rejectedStatus}</p>
            </Card>
          )}
          <VerifyFlow userId={user!.id} />
        </>
      )}
    </div>
  );
}
