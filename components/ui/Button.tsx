import { forwardRef } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-btn)] border-2 border-[var(--color-ink)] px-5 py-2.5 font-body font-600 transition-transform disabled:cursor-not-allowed disabled:opacity-60";

// Exactly one --color-tape (primary) element per screen region — see docs/04.
const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-tape)] text-[var(--color-chalk)] shadow-[var(--shadow-hard)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[var(--shadow-lift)]",
  secondary:
    "bg-[var(--color-chalk)] text-[var(--color-ink)] shadow-[var(--shadow-hard)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[var(--shadow-lift)]",
  ghost: "border-transparent bg-transparent text-[var(--color-ink)] hover:underline",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
}

export function ButtonLink({ variant = "primary", className = "", ...props }: ButtonLinkProps) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
