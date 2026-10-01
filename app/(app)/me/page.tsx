import Link from "next/link";
import { ChevronRight, FileText, Lock, ShieldCheck, Users } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { ReliabilityMark, VerifiedBadge } from "@/components/gig/Badges";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { publicAvatarUrl } from "@/lib/avatar";
import { ageFrom } from "@/lib/time";
import { copy } from "@/lib/copy";
import { PhotoUploader } from "./PhotoUploader";
import { ProfileEditor } from "./ProfileEditor";
import { AccountActions } from "./AccountActions";

export const metadata = { title: "Profile" };

export default async function MePage() {
  const { supabase, user, profile } = await getViewer();
  if (!profile) return null;

  const [{ count: hosted }, { count: joined }] = await Promise.all([
    supabase.from("gigs").select("id", { count: "exact", head: true }).eq("host_id", user!.id),
    supabase.from("gig_crew").select("id", { count: "exact", head: true }).eq("user_id", user!.id).neq("joined_via", "host").in("state", ["claimed", "attended"]),
  ]);

  const v = copy.verification;
  const age = profile.birth_date ? ageFrom(profile.birth_date) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="bg-hero h-24" />
        <div className="-mt-12 px-5 pb-5">
          <PhotoUploader
            name={profile.display_name}
            approvedUrl={publicAvatarUrl(profile.avatar_path)}
            pendingUrl={publicAvatarUrl(profile.avatar_pending_path)}
            status={profile.avatar_status}
            rejectReason={profile.avatar_reject_reason}
          />
          <div className="mt-4">
            <h1 className="text-[1.75rem] font-extrabold">
              {profile.display_name}
              {age && <span className="font-semibold text-muted">, {age}</span>}
            </h1>
            <p className="text-[0.9375rem] text-muted">
              @{profile.handle} · {profile.gender ? copy.auth.genders[profile.gender] : ""} · {profile.city}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.verification_status === "verified" ? <VerifiedBadge /> : <Badge tone="muted">{copy.profile.notVerified}</Badge>}
              <ReliabilityMark band={profile.reliability_band} />
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <Stat label={copy.profile.hostedCount} value={hosted ?? 0} />
            <Stat label={copy.profile.joinedCount} value={joined ?? 0} />
          </dl>
        </div>
      </Card>

      {/* Verification */}
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-50 text-mint"><ShieldCheck className="h-6 w-6" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-plum">{v.title}</p>
            <p className="mt-0.5 text-[0.8125rem] text-muted">
              {profile.verification_status === "verified"
                ? v.approved
                : profile.verification_status === "pending"
                  ? v.pendingStatus
                  : profile.verification_status === "rejected"
                    ? v.rejectedStatus
                    : v.meaning}
            </p>
            {(profile.verification_status === "unverified" || profile.verification_status === "rejected") && (
              <ButtonLink href="/me/verify" size="sm" className="mt-3">{v.verifyCta}</ButtonLink>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle>{copy.profile.edit}</SectionTitle>
        <ProfileEditor displayName={profile.display_name} bio={profile.bio ?? ""} />
        <p className="mt-3 flex items-center gap-1.5 text-[0.75rem] text-muted">
          <Lock className="h-3.5 w-3.5" /> {copy.auth.birthDate} · {copy.auth.gender}: {copy.profile.lockedField}
        </p>
      </Card>

      <Card className="p-5">
        <SectionTitle>{copy.profile.installApp}</SectionTitle>
        <InstallPrompt variant="card" />
      </Card>

      <Card className="divide-y divide-line p-2">
        <NavRow href="/me/friends" icon={<Users className="h-5 w-5" />} label={copy.nav.friends} />
        <NavRow href="/safety" icon={<ShieldCheck className="h-5 w-5" />} label={copy.safety.title} />
        <NavRow href="/terms" icon={<FileText className="h-5 w-5" />} label={copy.auth.termsLink} />
        <NavRow href="/privacy" icon={<Lock className="h-5 w-5" />} label={copy.auth.privacyLink} />
      </Card>

      <Card className="p-5">
        <SectionTitle>{copy.profile.settings}</SectionTitle>
        <AccountActions />
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 text-center ring-1 ring-line">
      <dd className="text-[1.5rem] font-extrabold text-plum tabular">{value}</dd>
      <dt className="text-[0.75rem] font-semibold text-muted">{label}</dt>
    </div>
  );
}

function NavRow({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl px-3 py-3.5 font-semibold text-plum hover:bg-white/60">
      <span className="text-muted">{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4.5 w-4.5 text-muted" />
    </Link>
  );
}
