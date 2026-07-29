"use client";

import { forwardRef } from "react";
import Link, { useLinkStatus } from "next/link";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-[var(--radius-btn)] border-2 border-[var(--color-ink)] px-5 py-2.5 font-body font-600 transition-transform disabled:cursor-not-allowed disabled:opacity-60";

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
  /** Shows a spinner over the label and disables the button — pass the same
   * `pending` flag you already track for the click handler (docs: every
   * action needs visible click feedback). */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className={loading ? "invisible" : "contents"}>{children}</span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      )}
    </button>
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
}

export function ButtonLink({ variant = "primary", className = "", children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      <LinkLabel>{children}</LinkLabel>
    </Link>
  );
}

// Split out so useLinkStatus (only valid inside a Link's subtree) doesn't
// force the whole ButtonLink call site to think about pending state.
function LinkLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span className={pending ? "invisible" : "contents"}>{children}</span>
      {pending && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      )}
    </>
  );
}
