import { forwardRef } from "react";

type Tone = "glass" | "solid" | "plum" | "tint";

const tones: Record<Tone, string> = {
  glass: "glass",
  solid: "bg-white ring-1 ring-line shadow-[var(--shadow-soft)]",
  plum: "bg-hero text-white",
  tint: "bg-plum-50 ring-1 ring-plum-100",
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
      <h2 className="text-[1.0625rem] font-bold">{children}</h2>
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
