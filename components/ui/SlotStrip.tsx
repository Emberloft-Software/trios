"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

/**
 * SlotStrip — the one thing this product is remembered by (docs/04).
 * A horizontal strip of sockets, one per slot, that fills in real time.
 *
 *   variant "blind"  feed view: filled sockets are solid ink circles, anonymous
 *   variant "crew"   lobby view: filled sockets are faces
 *
 * The empty sockets are real <button>s when `onClaim` is passed.
 * Motion: a socket springs in on fill (scale 0 → 1.15 → 1, ~380ms). Reduced
 * motion disables the spring — the socket just appears.
 */

export interface CrewMember {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  isHost?: boolean;
}

interface SlotStripProps {
  capacity: number;
  minToConfirm: number;
  /** blind view: how many slots are filled */
  filled?: number;
  /** crew view: the actual members (index 0 should be the host) */
  crew?: CrewMember[];
  variant?: "blind" | "crew";
  locked?: boolean;
  /** when provided, empty sockets become claim buttons */
  onClaim?: () => void;
  claimDisabled?: boolean;
}

const SPRING = { type: "spring" as const, stiffness: 600, damping: 18 };

export function SlotStrip({
  capacity,
  minToConfirm,
  filled = 0,
  crew,
  variant = "blind",
  locked = false,
  onClaim,
  claimDisabled = false,
}: SlotStripProps) {
  const reduce = useReducedMotion();
  const filledCount = variant === "crew" && crew ? crew.length : filled;
  const confirmed = filledCount >= minToConfirm;
  const remainingToConfirm = Math.max(0, minToConfirm - filledCount);

  const sockets = Array.from({ length: capacity }, (_, i) => {
    const isFilled = i < filledCount;
    const isHost = i === 0;
    const member = variant === "crew" && crew ? crew[i] : undefined;
    return { i, isFilled, isHost, member };
  });

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2" role="list" aria-label="Slots">
        {sockets.map(({ i, isFilled, isHost, member }) => {
          const key = `${i}`;

          if (isFilled) {
            return (
              <motion.div
                key={key}
                role="listitem"
                initial={reduce ? false : { scale: 0 }}
                animate={reduce ? {} : { scale: [0, 1.15, 1] }}
                transition={reduce ? undefined : { ...SPRING, duration: 0.38 }}
                className="relative"
              >
                {isHost && (
                  // host flag notch — a small --color-line flag on position 1
                  <span
                    aria-hidden
                    className="absolute -top-1 -left-1 z-10 h-3 w-3 rounded-[2px] border-2 border-[var(--color-ink)] bg-[var(--color-line)]"
                  />
                )}
                <Socket
                  filled
                  crew={variant === "crew"}
                  member={member}
                  label={member ? member.name : "Taken"}
                />
              </motion.div>
            );
          }

          // Empty socket — a real button when joinable
          const showTape = locked;
          if (onClaim && !locked) {
            return (
              <button
                key={key}
                role="listitem"
                type="button"
                onClick={onClaim}
                disabled={claimDisabled}
                aria-label="Take this slot"
                className="group relative grid h-11 w-11 place-items-center rounded-full border-2 border-dashed border-[var(--color-dust)] text-[var(--color-dust)] transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlusIcon />
              </button>
            );
          }

          return (
            <div
              key={key}
              role="listitem"
              aria-label="Empty slot"
              className="relative grid h-11 w-11 place-items-center rounded-full border-2 border-dashed border-[var(--color-dust)] text-[var(--color-dust)]"
            >
              <PlusIcon />
              {showTape && (
                // locked: a diagonal tape strip across the remaining empties
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 h-[3px] w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--color-tape)]"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mono counter under the strip */}
      <p className="font-data mt-3 text-[0.8125rem] uppercase tracking-[0.06em]">
        {confirmed ? (
          <span className="text-[var(--color-net)]">Confirmed</span>
        ) : (
          <>
            <span>
              {filledCount} of {capacity}
            </span>
            <span className="text-[var(--color-dust)]">
              {" · "}
              {remainingToConfirm} more to confirm
            </span>
          </>
        )}
      </p>
    </div>
  );
}

function Socket({
  filled,
  crew,
  member,
  label,
}: {
  filled: boolean;
  crew: boolean;
  member?: CrewMember;
  label: string;
}) {
  if (!filled) return null;

  // Crew view with a face
  if (crew && member?.avatarUrl) {
    return (
      <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-[var(--color-ink)] shadow-[var(--shadow-hard)]">
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={44}
          height={44}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Crew view, no avatar → initial on a chalk disc
  if (crew && member) {
    return (
      <div
        aria-label={label}
        className="grid h-11 w-11 place-items-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] font-display text-lg font-700 shadow-[var(--shadow-hard)]"
      >
        {member.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  // Blind view → solid, deliberately anonymous ink circle
  return (
    <div
      aria-label={label}
      className="h-11 w-11 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-ink)] shadow-[var(--shadow-hard)]"
    />
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="none">
      <path
        d="M7 1v12M1 7h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
