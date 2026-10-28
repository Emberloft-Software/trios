import { forwardRef } from "react";

type Tone = "glass" | "solid" | "plum" | "tint";

const tones: Record<Tone, string> = {
  glass: "glass",
  solid: "bg-[var(--color-paper)] border-2 border-plum shadow-[var(--shadow-soft)]",
  plum: "bg-hero text-white",
  tint: "bg-plum-50 border-2 border-plum/30",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  hover?: boolean;
}

/** Rounded surface. Default is frosted glass over the ambient colour field. */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ tone = "glass", hover = false, className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        "relative rounded-[var(--radius-xl3)]",
        tones[tone],
        hover ? "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = "Card";

export function SectionTitle({
  children,
  action,
  className = "",
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-3 ${className}`}>
      <h2 className="eyebrow text-plum">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  sub,
  action,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.6rem,4vw,2.25rem)] font-extrabold">{title}</h1>
        {sub && <p className="mt-1 text-[0.9375rem] text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
