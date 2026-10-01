"use client";

import { useState, useTransition } from "react";
import { Ban, Flag, UserMinus, Vote } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import { blockAction, castVoteAction, removeCrewAction, reportAction, retractVoteAction } from "./_actions";
import type { CrewRow } from "./CrewList";

export type Mode = "menu" | "report" | "block" | "vote" | "remove";

/** The per-member sheet: vote to remove, host remove, report, block. */
export function MemberActions({
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
