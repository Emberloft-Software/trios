"use client";

import { useState } from "react";
import { Crown, MoreHorizontal, UserPlus, Vote } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Sheet } from "@/components/ui/Sheet";
import { Notice } from "@/components/ui/Notice";
import { ReliabilityMark, VerifiedBadge } from "@/components/gig/Badges";
import { copy } from "@/lib/copy";
import { MemberActions, type Mode } from "./MemberActions";
import { AddFriend } from "./AddFriend";
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

