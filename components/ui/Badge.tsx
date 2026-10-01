type Tone = "plum" | "coral" | "sun" | "mint" | "muted" | "white";

const tones: Record<Tone, string> = {
  plum: "bg-plum-100 text-plum",
  coral: "bg-coral-50 text-coral-600 ring-1 ring-coral/15",
  sun: "bg-sun-100 text-[#8a5a00]",
  mint: "bg-mint-50 text-mint",
  muted: "bg-plum/5 text-muted",
  white: "bg-white/85 text-plum ring-1 ring-line",
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold leading-none ${tones[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
