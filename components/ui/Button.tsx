"use client";

import { forwardRef } from "react";
import Link, { useLinkStatus } from "next/link";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "dark" | "ghost" | "danger" | "glass";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-coral text-white shadow-[var(--shadow-coral)] hover:bg-coral-600 hover:-translate-y-px",
  secondary:
    "bg-white text-plum ring-1 ring-line shadow-[var(--shadow-soft)] hover:-translate-y-px hover:shadow-[var(--shadow-lift)]",
  dark: "bg-plum text-white shadow-[0_8px_22px_rgba(54,2,83,0.28)] hover:bg-plum-700 hover:-translate-y-px",
  ghost: "text-plum hover:bg-plum/5",
  danger: "bg-white text-coral-600 ring-1 ring-coral/30 hover:bg-coral-50",
  glass: "glass text-plum hover:bg-white/80",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", className = "", loading = false, block, disabled, children, type = "button", ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${sizes[size]} ${variants[variant]} ${block ? "w-full" : ""} ${className}`}
      {...props}
    >
      <span className={`inline-flex items-center gap-2 ${loading ? "invisible" : ""}`}>{children}</span>
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
  size?: Size;
  block?: boolean;
}

export function ButtonLink({ variant = "primary", size = "md", block, className = "", children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${base} ${sizes[size]} ${variants[variant]} ${block ? "w-full" : ""} ${className}`} {...props}>
      <LinkLabel>{children}</LinkLabel>
    </Link>
  );
}

function LinkLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span className={`inline-flex items-center gap-2 ${pending ? "invisible" : ""}`}>{children}</span>
      {pending && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      )}
    </>
  );
}
