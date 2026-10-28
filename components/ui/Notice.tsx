import { AlertTriangle, Info, ShieldCheck, ShieldAlert } from "lucide-react";

type Tone = "info" | "warn" | "danger" | "safe";

const styles: Record<Tone, { box: string; icon: React.ReactNode }> = {
  info: { box: "bg-plum-50 text-plum border-plum/30", icon: <Info className="h-4.5 w-4.5" /> },
  warn: { box: "bg-sun-100 text-[#6b4400] border-sun-600/50", icon: <AlertTriangle className="h-4.5 w-4.5" /> },
  danger: { box: "bg-coral-50 text-coral-600 border-coral/40", icon: <ShieldAlert className="h-4.5 w-4.5" /> },
  safe: { box: "bg-mint-50 text-[#0b6b46] border-mint/40", icon: <ShieldCheck className="h-4.5 w-4.5" /> },
};

export function Notice({
  tone = "info",
  title,
  children,
  className = "",
  compact = false,
}: {
  tone?: Tone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const s = styles[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "note"}
      className={`flex gap-2.5 rounded-xl border-2 ${compact ? "px-3 py-2 text-[0.8125rem]" : "px-4 py-3 text-[0.875rem]"} leading-snug ${s.box} ${className}`}
    >
      <span className="mt-px shrink-0">{s.icon}</span>
      <div className="min-w-0">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
      </div>
    </div>
  );
}
