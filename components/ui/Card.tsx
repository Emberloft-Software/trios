import { forwardRef } from "react";

/**
 * Card — a physical, hand-pinned object. 2px ink border + hard offset shadow.
 * No blur, no soft drop shadows (docs/04 § Shape and depth).
 * `pinned` gives it a small alternating rotation and a tape/pin element — use
 * on the feed and landing, never on form fields.
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  pinned?: boolean;
  /** alternate the tilt direction by index for a hand-tacked board look */
  tiltIndex?: number;
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ pinned = false, tiltIndex = 0, hover = false, className = "", style, children, ...props }, ref) => {
    const tilt = pinned ? (tiltIndex % 2 === 0 ? "-0.6deg" : "0.5deg") : "0deg";
    return (
      <div
        ref={ref}
        style={{ transform: `rotate(${tilt})`, ...style }}
        className={[
          "relative rounded-[var(--radius-card)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] shadow-[var(--shadow-hard)]",
          hover
            ? "transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[var(--shadow-lift)]"
            : "",
          className,
        ].join(" ")}
        {...props}
      >
        {pinned && (
          // the pin — a small ink disc tacking the card to the board
          <span
            aria-hidden
            className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-line)] shadow-[2px_2px_0_var(--color-ink)]"
          />
        )}
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";
