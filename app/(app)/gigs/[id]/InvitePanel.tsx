"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Link2, RotateCcw, Share2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { copy } from "@/lib/copy";
import { revokeInviteAction } from "./_actions";
import { inviteFriendAction } from "@/app/(app)/me/friends/_actions";

export interface GuestInvite {
  id: string;
  label: number;
  url: string;
  usedBy: string | null; // first name of whoever joined with it
  used: boolean;
  revoked: boolean;
}

/**
 * Host-only. One single-use link per guest the host said they're bringing —
 * each link seats exactly one person, once. Only rendered when the host
 * declared guests (or has Tremigos friends to nudge).
 */
export function InvitePanel({
  gigId,
  title,
  isPrivate,
  invites,
  friends,
  highlight,
}: {
  gigId: string;
  title: string;
  isPrivate: boolean;
  invites: GuestInvite[];
  friends: { id: string; name: string }[];
  highlight: boolean;
}) {
  if (invites.length === 0 && friends.length === 0) return null;
  return (
    <>
      {invites.length > 0 && (
        <GuestLinks gigId={gigId} title={title} isPrivate={isPrivate} highlight={highlight}
          invites={isPrivate ? invites.filter((i) => !i.revoked) : invites} />
      )}
      {friends.length > 0 && <FriendNudges gigId={gigId} friends={friends} />}
    </>
  );
}

type LinksProps = { gigId: string; title: string; isPrivate: boolean; invites: GuestInvite[]; highlight: boolean };

function GuestLinks({ gigId, title, isPrivate, invites, highlight }: LinksProps) {
  const v = copy.invite;
  const p = copy.privacy;
  return (
    <section className={`glass rounded-[1.75rem] p-5 ${highlight ? "ring-2 ring-sun" : ""}`}>
      <div className="mb-1 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-plum" />
        <h2 className="text-[1.0625rem] font-bold">{isPrivate ? p.linksTitle : v.title}</h2>
      </div>
      <p className="mb-4 text-[0.8125rem] text-muted">{isPrivate ? p.linksSub : v.sub}</p>
      <ul className="space-y-2.5">
        {invites.map((inv) => (
          <InviteRow key={inv.id} gigId={gigId} title={title} inv={inv} isPrivate={isPrivate} />
        ))}
      </ul>
    </section>
  );
}

function InviteRow({ gigId, title, inv, isPrivate }: { gigId: string; title: string; inv: GuestInvite; isPrivate: boolean }) {
  const v = copy.invite;
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const live = !inv.used && !inv.revoked;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inv.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(v.copy, inv.url);
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: v.shareText(title), url: inv.url });
        return;
      } catch {
        return; // cancelled
      }
    }
    copyLink();
  }

  return (
    <li className={`rounded-2xl p-3 ring-1 ring-line ${live ? "bg-white/80" : "bg-plum/5"}`}>
      <div className="flex items-center gap-2">
        <span className="font-bold text-plum">{v.guest(inv.label)}</span>
        {inv.used ? (
          <Badge tone="mint" icon={<Check className="h-3 w-3" />}>{v.joined(inv.usedBy ?? "")}</Badge>
        ) : inv.revoked ? (
          <Badge tone="muted">{v.revoked}</Badge>
        ) : (
          <Badge tone="sun">{v.unused}</Badge>
        )}
      </div>
      {live && (
        <>
          <p className="mt-1.5 truncate text-[0.8125rem] text-muted">{inv.url.replace(/^https?:\/\//, "")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="dark" onClick={share}>
              <Share2 className="h-4 w-4" /> {v.share}
            </Button>
            <Button size="sm" variant="secondary" onClick={copyLink} aria-live="polite">
              {copied ? <Check className="h-4 w-4 text-mint" /> : <Copy className="h-4 w-4" />}
              {copied ? v.copied : v.copy}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted"
              loading={pending}
              onClick={() => {
                if (!confirm(isPrivate ? copy.privacy.resetConfirm : v.revokeConfirm)) return;
                start(async () => {
                  const r = await revokeInviteAction(gigId, inv.id);
                  if (!r.ok) return setError(r.error);
                });
              }}
            >
              {isPrivate ? <RotateCcw className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {isPrivate ? copy.privacy.reset : v.revoke}
            </Button>
          </div>
          {error && <p className="mt-1 text-[0.8125rem] text-coral-600">{error}</p>}
        </>
      )}
    </li>
  );
}

function FriendNudges({ gigId, friends }: { gigId: string; friends: { id: string; name: string }[] }) {
  const v = copy.invite;
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  return (
    <section className="glass rounded-[1.75rem] p-5">
      <p className="font-bold text-plum">{v.friendsFeature}</p>
      <p className="mb-3 text-[0.8125rem] text-muted">{v.friendsHint}</p>
      <ul className="space-y-1.5">
        {friends.map((f) => (
          <li key={f.id} className="flex items-center justify-between text-[0.9375rem]">
            <span className="font-semibold text-plum">{f.name}</span>
            {invited.has(f.id) ? (
              <Badge tone="mint">{copy.friends.inviteSent}</Badge>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                loading={busyId === f.id}
                onClick={async () => {
                  setBusyId(f.id);
                  const r = await inviteFriendAction(gigId, f.id);
                  setBusyId(null);
                  if (r.ok) setInvited((s) => new Set(s).add(f.id));
                }}
              >
                <UserPlus className="h-4 w-4" /> {copy.friends.invite}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
