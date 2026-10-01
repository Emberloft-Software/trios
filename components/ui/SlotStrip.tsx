/* eslint-disable @next/next/no-img-element */
import { Crown } from "lucide-react";
import { copy } from "@/lib/copy";

export interface CrewMember {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  isHost?: boolean;
}

/**
 * One socket per spot. Filled sockets are app members (faces once you're in
 * the crew, anonymous gradient dots on the feed), sun-tinted sockets are seats
 * the host is holding for people they're bringing, dashed sockets are open.
 */
export function SlotStrip({
  capacity,
  claimed,
  reserved = 0,
  minToConfirm,
  crew,
  locked = false,
  size = "md",
  showLabel = true,
}: {
  capacity: number;
  claimed: number;
  reserved?: number;
  minToConfirm: number;
  crew?: CrewMember[];
  locked?: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const headcount = claimed + reserved;
  const open = Math.max(0, capacity - headcount);
  const dim = size === "sm" ? 28 : 40;
  const overlap = size === "sm" ? "-ml-1.5" : "-ml-2";

  const sockets: ("member" | "reserved" | "open")[] = [
    ...Array.from({ length: claimed }, () => "member" as const),
    ...Array.from({ length: reserved }, () => "reserved" as const),
    ...Array.from({ length: open }, () => "open" as const),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-y-2 pl-2" role="list" aria-label={`${headcount} of ${capacity} spots taken`}>
        {sockets.map((kind, i) => {
          const member = kind === "member" ? crew?.[i] : undefined;
          const style = { width: dim, height: dim, animationDelay: `${i * 40}ms` };
          if (kind === "member") {
            return (
              <span key={i} role="listitem" className={`relative ${overlap} animate-pop`} style={style}>
                {member?.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="h-full w-full rounded-full object-cover ring-[2.5px] ring-white" />
                ) : member ? (
                  <span className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-coral to-[#ff7a59] font-bold text-white ring-[2.5px] ring-white" style={{ fontSize: dim * 0.4 }}>
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span className="block h-full w-full rounded-full bg-gradient-to-br from-plum-700 to-plum ring-[2.5px] ring-white" />
                )}
                {i === 0 && (
                  <span className="absolute -right-0.5 -top-1 grid h-4 w-4 place-items-center rounded-full bg-sun text-plum ring-2 ring-white" title={copy.slots.hostTitle}>
                    <Crown className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                )}
              </span>
            );
          }
          if (kind === "reserved") {
            return (
              <span
                key={i}
                role="listitem"
                title={copy.guests.reservedLeft(reserved)}
                className={`${overlap} grid place-items-center rounded-full bg-sun font-bold text-plum ring-[2.5px] ring-white animate-pop`}
                style={{ ...style, fontSize: dim * 0.32 }}
              >
                +1
              </span>
            );
          }
          return (
            <span
              key={i}
              role="listitem"
              aria-label="Open spot"
              className={`${overlap} rounded-full border-2 border-dashed ${locked ? "border-plum/10 bg-plum/5" : "border-plum/25 bg-white/70"}`}
              style={style}
            />
          );
        })}
      </div>
      {showLabel && (
        <p className="mt-2.5 flex justify-between gap-2 text-[0.8125rem] font-semibold tabular">
          <span className="text-plum">
            {locked ? copy.feed.locked : `${headcount}/${capacity}`}
            {!locked && headcount < minToConfirm && (
              <span className="font-medium text-muted"> · {copy.slots.needMore(minToConfirm - headcount)}</span>
            )}
          </span>
          {!locked && (open > 0 ? (
            <span className="font-medium text-muted">{copy.feed.spotsLeft(open)}</span>
          ) : (
            <span className="font-medium text-coral-600">{copy.feed.full}</span>
          ))}
        </p>
      )}
    </div>
  );
}
