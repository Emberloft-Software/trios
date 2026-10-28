/**
 * Retro "desktop app" window: plum outline, hard shadow, a title bar with two
 * dots and a mono path-style title. Purely presentational.
 */
export function Window({
  title,
  children,
  className = "",
  bodyClassName = "",
  dark = false,
  style,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`overflow-hidden rounded-2xl border-2 border-plum shadow-[5px_5px_0_var(--color-plum)] ${dark ? "bg-plum text-white" : "bg-[var(--color-paper)]"} ${className}`}
    >
      <div className={`window-bar ${dark ? "border-white/25 !text-white" : "bg-cream"}`}>
        <span aria-hidden className={`h-3 w-3 rounded-full border-2 ${dark ? "border-white/70" : "border-plum"}`} />
        <span aria-hidden className={`h-3 w-3 rounded-full border-2 ${dark ? "border-white/70" : "border-plum"}`} />
        <span className="ml-1 min-w-0 flex-1 truncate text-center">{title ?? ""}</span>
        <span aria-hidden className="w-8" />
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

/** Desktop-style icon: outlined tile with a mono caption underneath. */
export function DesktopIcon({ icon, label, tone = "paper" }: { icon: React.ReactNode; label: string; tone?: "paper" | "sun" | "coral" | "plum" }) {
  const tones = {
    paper: "bg-[var(--color-paper)] text-plum",
    sun: "bg-sun text-plum",
    coral: "bg-coral text-white",
    plum: "bg-plum text-white",
  } as const;
  return (
    <span className="flex w-20 flex-col items-center gap-1.5 text-center">
      <span className={`grid h-14 w-14 place-items-center rounded-xl border-2 border-plum shadow-[3px_3px_0_var(--color-plum)] ${tones[tone]}`}>{icon}</span>
      <span className="font-mono text-[0.6875rem] font-bold leading-tight text-plum">{label}</span>
    </span>
  );
}
