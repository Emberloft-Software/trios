"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Crown, Flag, MoreHorizontal, UserMinus, UserPlus, Vote } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Label, Select, Textarea } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { ReliabilityMark, VerifiedBadge } from "@/components/gig/Badges";
import { copy } from "@/lib/copy";
import { blockAction, castVoteAction, removeCrewAction, reportAction, retractVoteAction } from "./_actions";
import { sendFriendRequestAction } from "@/app/(app)/me/friends/_actions";
import type { ReliabilityBand } from "@/lib/database.types";

export interface CrewRow {
  userId: string;
  name: string;
  age: number | null;
  avatarUrl: string | null;
  isHost: boolean;
  viaInvite: boolean;
  verified: boolean;
  band: ReliabilityBand;
  attended: boolean;
  votes: number;
  needed: number;
  iVoted: boolean;
}

type Mode = "menu" | "report" | "block" | "vote" | "remove";

export function CrewList({
  gigId,
  viewerId,
  viewerIsHost,
  crew,
  canVote,
  canRemove,
  isCompleted,
  viewerAttended,
}: {
  gigId: string;
  viewerId: string;
  viewerIsHost: boolean;
  crew: CrewRow[];
  canVote: boolean;
  canRemove: boolean;
  isCompleted: boolean;
  viewerAttended: boolean;
}) {
  const [target, setTarget] = useState<CrewRow | null>(null);
  const [mode, setMode] = useState<Mode>("menu");
  const [flash, setFlash] = useState<string | null>(null);

  function open(m: CrewRow) {
    setTarget(m);
    setMode("menu");
  }

  return (
    <Card className="p-5">
      <SectionTitle>{isCompleted ? copy.friends.summaryTitle : copy.lobby.crew}</SectionTitle>
      {isCompleted && viewerAttended && <p className="-mt-1 mb-3 text-[0.8125rem] text-muted">{copy.friends.summaryHint}</p>}
      {flash && <Notice tone="safe" compact className="mb-3">{flash}</Notice>}
      <ul className="divide-y divide-line">
        {crew.map((m) => {
          const self = m.userId === viewerId;
          return (
            <li key={m.userId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar name={m.name} src={m.avatarUrl} size={44} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-bold text-plum">
                  <span className="truncate">{self ? `${m.name} (${copy.lobby.you})` : m.name}</span>
                  {m.age && <span className="font-medium text-muted">{m.age}</span>}
                  {m.verified && <VerifiedBadge compact />}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {m.isHost && <Badge tone="sun" icon={<Crown className="h-3 w-3" />}>{copy.slots.hostTitle}</Badge>}
                  {m.viaInvite && <Badge tone="plum" icon={<UserPlus className="h-3 w-3" />}>{copy.lobby.invitedByHost}</Badge>}
                  <ReliabilityMark band={m.band} />
                  {canVote && m.votes > 0 && (
                    <Badge tone="coral" icon={<Vote className="h-3 w-3" />}>{copy.vote.tally(m.votes, m.needed)}</Badge>
                  )}
                </div>
              </div>
              {!self && (
                <div className="flex items-center gap-1">
                  {isCompleted && viewerAttended && m.attended && <AddFriend recipientId={m.userId} gigId={gigId} />}
                  <button
                    onClick={() => open(m)}
                    aria-label={`Options for ${m.name}`}
                    className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-plum/5 hover:text-plum"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Sheet
        open={!!target}
        onClose={() => setTarget(null)}
        title={target ? (mode === "vote" ? copy.vote.title(target.name) : target.name) : ""}
        closeLabel={copy.trust.close}
      >
        {target && (
          <MemberActions
            key={`${target.userId}-${mode}`}
            gigId={gigId}
            m={target}
            mode={mode}
            setMode={setMode}
            canVote={canVote && !target.isHost}
            hostCantBeVoted={canVote && target.isHost}
            canRemove={canRemove && viewerIsHost && !target.isHost}
            onDone={(msg) => {
              setTarget(null);
              setFlash(msg);
            }}
          />
        )}
      </Sheet>
    </Card>
  );
}

function MemberActions({
  gigId,
  m,
  mode,
  setMode,
  canVote,
  hostCantBeVoted,
  canRemove,
  onDone,
}: {
  gigId: string;
  m: CrewRow;
  mode: Mode;
  setMode: (m: Mode) => void;
  canVote: boolean;
  hostCantBeVoted: boolean;
  canRemove: boolean;
  onDone: (msg: string) => void;
}) {
  const router = useRouter();
  const t = copy.trust;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cat, setCat] = useState(mode === "remove" ? "abusive_in_chat" : "harassment");
  const [text, setText] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string, refresh = true) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) return setError(res.error ?? copy.errors.generic);
      onDone(msg);
      if (refresh) router.refresh();
    });

  if (mode === "menu") {
    return (
      <div className="space-y-2">
        {canVote && (
          <ActionRow icon={<Vote className="h-5 w-5" />} label={m.iVoted ? `${copy.vote.youVoted} · ${copy.vote.tally(m.votes, m.needed)}` : copy.vote.action}
            onClick={() => setMode("vote")} danger />
        )}
        {hostCantBeVoted && <Notice tone="info" compact>{copy.vote.hostNote}</Notice>}
        {canRemove && <ActionRow icon={<UserMinus className="h-5 w-5" />} label={t.remove.action} onClick={() => setMode("remove")} danger />}
        <ActionRow icon={<Flag className="h-5 w-5" />} label={t.report.title} onClick={() => setMode("report")} />
        <ActionRow icon={<Ban className="h-5 w-5" />} label={t.block.action} onClick={() => setMode("block")} />
      </div>
    );
  }

  if (mode === "vote") {
    return (
      <div className="space-y-3">
        <p className="text-[0.875rem] text-muted">{copy.vote.body}</p>
        <Badge tone="coral">{copy.vote.tally(m.votes, m.needed)}</Badge>
        <div>
          <Label htmlFor="vote-reason">{copy.vote.reason}</Label>
          <Textarea id="vote-reason" rows={2} maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder={copy.vote.reasonPlaceholder} />
        </div>
        {error && <Notice tone="danger" compact>{error}</Notice>}
        <Button variant="primary" block loading={pending} disabled={text.trim().length < 3}
          onClick={() =>
            start(async () => {
              setError(null);
              const res = await castVoteAction({ gigId, targetId: m.userId, reason: text });
              if (!res.ok) return setError(res.error);
              onDone(res.removed ? copy.vote.removed : copy.vote.recorded);
              router.refresh();
            })
          }>
          {copy.vote.submit}
        </Button>
        {m.iVoted && (
          <Button variant="ghost" block disabled={pending} onClick={() => run(() => retractVoteAction(gigId, m.userId), copy.vote.retracted)}>
            {copy.vote.retract}
          </Button>
        )}
      </div>
    );
  }

  if (mode === "report") {
    return (
      <div className="space-y-3">
        <p className="text-[0.8125rem] text-muted">{t.report.intro}</p>
        <div>
          <Label htmlFor="rep-cat">{t.report.category}</Label>
          <Select id="rep-cat" value={cat} onChange={(e) => setCat(e.target.value)}>
            {Object.entries(t.report.categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="rep-details">{t.report.details}</Label>
          <Textarea id="rep-details" rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.report.detailsPlaceholder} />
        </div>
        {error && <Notice tone="danger" compact>{error}</Notice>}
        <Button block loading={pending} disabled={!text.trim()}
          onClick={() => run(() => reportAction({ gigId, targetId: m.userId, category: cat, details: text }), t.report.sent, false)}>
          {t.report.submit}
        </Button>
      </div>
    );
  }

  if (mode === "block") {
    return (
      <div className="space-y-3">
        <p className="font-semibold text-plum">{t.block.confirmTitle}</p>
        <p className="text-[0.875rem] text-muted">{t.block.confirmBody}</p>
        {error && <Notice tone="danger" compact>{error}</Notice>}
        <Button variant="dark" block loading={pending} onClick={() => run(() => blockAction(m.userId, gigId), t.block.done)}>
          {t.block.confirm}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[0.8125rem] text-muted">{t.remove.intro}</p>
      <div>
        <Label htmlFor="rm-cat">{t.remove.category}</Label>
        <Select id="rm-cat" value={cat} onChange={(e) => setCat(e.target.value)}>
          {Object.entries(t.remove.categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>
      <Textarea rows={2} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.remove.reasonPlaceholder} aria-label={t.remove.category} />
      {error && <Notice tone="danger" compact>{error}</Notice>}
      <Button block loading={pending} disabled={text.trim().length < 10}
        onClick={() => run(() => removeCrewAction({ gigId, targetId: m.userId, category: cat, reason: text }), t.remove.title)}>
        {t.remove.submit}
      </Button>
    </div>
  );
}

function ActionRow({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl bg-white/70 px-4 py-3.5 text-left font-semibold ring-1 ring-line transition hover:bg-white ${danger ? "text-coral-600" : "text-plum"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function AddFriend({ recipientId, gigId }: { recipientId: string; gigId: string }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<"idle" | "sent" | string>("idle");
  if (state === "sent") return <Badge tone="mint">{copy.friends.added}</Badge>;
  return (
    <Button
      size="sm"
      variant="secondary"
      loading={pending}
      title={state !== "idle" ? state : undefined}
      onClick={() =>
        start(async () => {
          const res = await sendFriendRequestAction(recipientId, gigId);
          setState(res.ok ? "sent" : res.error);
        })
      }
    >
      <UserPlus className="h-4 w-4" /> {copy.friends.add}
    </Button>
  );
}
