import { getViewer } from "@/lib/auth";
import { PageHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { VerifiedBadge } from "@/components/gig/Badges";
import { VerifyFlow } from "./VerifyFlow";
import { copy } from "@/lib/copy";

export const metadata = { title: "Get verified" };

export default async function VerifyPage() {
  const { profile } = await getViewer();
  const v = copy.verification;
  const status = profile?.verification_status ?? "unverified";
  const hasPhoto = profile?.avatar_status === "approved" || profile?.avatar_status === "pending";

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title={v.title} sub={v.meaning} />
      {status === "verified" ? (
        <div className="glass rounded-[1.75rem] p-6">
          <VerifiedBadge />
          <p className="mt-3 text-[0.9375rem]">{v.approved}</p>
        </div>
      ) : status === "pending" ? (
        <Notice tone="info" title={v.pendingStatus} />
      ) : !hasPhoto ? (
        <div className="glass rounded-[1.75rem] p-6">
          <Notice tone="warn">{v.needPhoto}</Notice>
          <ButtonLink href="/me" className="mt-4">{v.needPhotoCta}</ButtonLink>
        </div>
      ) : (
        <div className="space-y-4">
          {status === "rejected" && <Notice tone="danger">{v.rejectedStatus}</Notice>}
          <VerifyFlow />
        </div>
      )}
    </div>
  );
}
