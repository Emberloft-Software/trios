import { redirect } from "next/navigation";
import { CalendarClock, MapPin, UserPlus } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { SlotStrip } from "@/components/ui/SlotStrip";
import { formatGigTime } from "@/lib/time";
import { copy } from "@/lib/copy";
import { JoinInviteButton } from "./JoinInviteButton";

export const metadata = { title: "You're invited" };

type Preview = {
  id: string;
  title: string;
  status: string;
  starts_at: string;
  duration_min: number;
  place_label: string;
  capacity: number;
  claimed_count: number;
  reserved_slots: number;
  host_guests: number;
  activity_name: string;
  activity_emoji: string;
  host_name: string;
  locks_at: string;
};

export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { supabase, user, profile } = await getViewer();
  const { data } = await supabase.rpc("invite_preview", { p_code: code });
  const g = data as Preview | null;

  if (g && user) {
    const { data: mine } = await supabase.from("gig_crew").select("state").eq("gig_id", g.id).eq("user_id", user.id).maybeSingle();
    if (mine && ["claimed", "attended", "no_show"].includes(mine.state)) redirect(`/gigs/${g.id}`);
    if (!profile?.birth_date || !profile.gender) redirect(`/onboarding?next=/join/${code}`);
  }

  const used = g?.status === "used";
  const open = g && g.status === "open" && new Date(g.locks_at).getTime() > Date.now();

  return (
    <div className="min-h-dvh px-4 pb-10 pt-[calc(1.25rem+var(--safe-top))]">
      <div className="mx-auto max-w-md">
        <Logo href={user ? "/feed" : "/"} />
        {!g ? (
          <div className="mt-10">
            <Notice tone="danger">{copy.invite.notFound}</Notice>
            <ButtonLink href="/" variant="secondary" className="mt-4">{copy.nav.feed}</ButtonLink>
          </div>
        ) : (
          <div className="mt-8 animate-rise">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-sun-100 px-3 py-1 text-[0.8125rem] font-bold text-[#6b4400]">
              <UserPlus className="h-4 w-4" /> {copy.invite.landingTitle(g.host_name)}
            </p>
            <h1 className="mt-3 text-[2rem] font-extrabold">{g.title}</h1>
            <p className="mt-1 text-[0.9375rem] text-muted">{copy.invite.landingSub}</p>

            <div className="glass mt-6 space-y-4 rounded-[1.75rem] p-5">
              <p className="flex items-center gap-2 font-semibold text-plum">
                <span className="text-xl" aria-hidden>{g.activity_emoji}</span> {g.activity_name}
              </p>
              <p className="flex items-center gap-2 text-[0.9375rem]"><CalendarClock className="h-4 w-4 text-muted" /> <span className="tabular">{formatGigTime(g.starts_at)}</span></p>
              <p className="flex items-center gap-2 text-[0.9375rem]"><MapPin className="h-4 w-4 text-muted" /> {g.place_label}</p>
              <SlotStrip capacity={g.capacity} claimed={g.claimed_count} reserved={g.reserved_slots} minToConfirm={3} />
            </div>

            <Notice tone="warn" className="mt-4">{copy.disclaimers.chatShort} {copy.disclaimers.meetPublic}</Notice>

            <div className="mt-5">
              {used ? (
                <Notice tone="warn">{copy.invite.used}</Notice>
              ) : !open ? (
                <Notice tone="info">{copy.errors.gig_not_open}</Notice>
              ) : user ? (
                <JoinInviteButton code={code} />
              ) : (
                <ButtonLink href={`/sign-in?next=/join/${code}`} size="lg" block>{copy.invite.signInToJoin}</ButtonLink>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
