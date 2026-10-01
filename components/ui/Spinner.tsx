/** Three bouncing dots in currentColor. Reduced motion is handled globally. */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span role="status" aria-label="Loading" className={`inline-flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current"
          style={{ animation: `tm-bounce 0.9s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </span>
  );
}
