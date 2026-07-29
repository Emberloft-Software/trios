/** Three bouncing dots, colour-matched to whatever text colour it's dropped
 * into via `currentColor`. Used inside Button/ButtonLink while an action or
 * navigation is pending, so a click always gets visible feedback. Reduced
 * motion is handled globally in globals.css (animation-duration collapses to
 * ~0), so the dots just sit static rather than looping. */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span role="status" aria-label="Loading" className={`inline-flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="h-[5px] w-[5px] rounded-full bg-current"
          style={{ animation: `trio-bounce 0.9s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </span>
  );
}
