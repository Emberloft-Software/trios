"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Link2, Share2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { copy } from "@/lib/copy";
import { releaseSeatAction } from "./_actions";
import { inviteFriendAction } from "@/app/(app)/me/friends/_actions";

/**
 * Host-only: the private share link for people the host is bringing (they
 * take the held seats and skip the audience filter), plus in-app nudges for
 * Tremigos friends (which hold nothing).
 */
export function InvitePanel({
  gigId,
  inviteUrl,
  title,
  reserved,
  friends,
  highlight,
}: {
  gigId: string;
  inviteUrl: string;
  title: string;
  reserved: number;
  friends: { id: string; name: string }[];
  highlight: boolean;
}) {
  const router = useRouter();
  const v = copy.invite;
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(v.copy, inviteUrl);
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: v.shareText(title), url: inviteUrl });
        return;
      } catch {
        /* cancelled */
      }
    }
    copyLink();
  }

  return (
    <section className={`glass rounded-[1.75rem] p-5 ${highlight ? "ring-2 ring-sun" : ""}`}>
      <div className="mb-1 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-plum" />
        <h2 className="text-[1.0625rem] font-bold">{v.title}</h2>
        {reserved > 0 && <Badge tone="sun" className="ml-auto">{copy.guests.reservedLeft(reserved)}</Badge>}
      </div>
      <p className="mb-3 text-[0.8125rem] text-muted">{v.sub}</p>
      <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-1.5 pl-4 ring-1 ring-line">
        <span className="min-w-0 flex-1 truncate text-[0.875rem] font-medium text-plum">{inviteUrl.replace(/^https?:\/\//, "")}</span>
        <Button size="sm" variant="secondary" onClick={copyLink} aria-live="polite">
          {copied ? <Check className="h-4 w-4 text-mint" /> : <Copy className="h-4 w-4" />}
          {copied ? v.copied : v.copy}
        </Button>
      </div>
      <Button className="mt-3" block variant="dark" onClick={share}>
        <Share2 className="h-4 w-4" /> {v.share}
      </Button>

      {reserved > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p className="text-[0.8125rem] text-muted">{v.releaseHint}</p>
          <Button size="sm" variant="ghost" loading={pending}
            onClick={() => start(async () => { const r = await releaseSeatAction(gigId); if (r.ok) router.refresh(); })}>
            {v.release}
          </Button>
        </div>
      )}

      {friends.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[0.875rem] font-bold text-plum">{v.friendsFeature}</p>
          <p className="mb-2 text-[0.75rem] text-muted">{v.friendsHint}</p>
          <ul className="space-y-1.5">
            {friends.map((f) => (
              <li key={f.id} className="flex items-center justify-between text-[0.9375rem]">
                <span className="font-semibold text-plum">{f.name}</span>
                {invited.has(f.id) ? (
                  <Badge tone="mint">{copy.friends.inviteSent}</Badge>
                ) : (
                  <Button size="sm" variant="secondary" loading={busyId === f.id}
                    onClick={async () => {
                      setBusyId(f.id);
                      const r = await inviteFriendAction(gigId, f.id);
                      setBusyId(null);
                      if (r.ok) setInvited((s) => new Set(s).add(f.id));
                    }}>
                    <UserPlus className="h-4 w-4" /> {copy.friends.invite}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
