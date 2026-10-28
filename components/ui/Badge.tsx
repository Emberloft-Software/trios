type Tone = "plum" | "coral" | "sun" | "mint" | "muted" | "white";

const tones: Record<Tone, string> = {
  plum: "bg-plum-100 text-plum border-plum/40",
  coral: "bg-coral-50 text-coral-600 border-coral/50",
  sun: "bg-sun-100 text-[#7a4f00] border-sun-600/60",
  mint: "bg-mint-50 text-[#0b6b46] border-mint/50",
  muted: "bg-plum/5 text-muted border-plum/20",
  white: "bg-[var(--color-paper)] text-plum border-plum/40",
};

export function Badge({
  tone = "plum",
  children,
  className = "",
  icon,
  title,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-md border-[1.5px] px-2 py-1 font-mono text-[0.6875rem] font-bold leading-none ${tones[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
