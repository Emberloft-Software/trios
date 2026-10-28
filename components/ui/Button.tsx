"use client";

import { forwardRef } from "react";
import Link, { useLinkStatus } from "next/link";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "dark" | "ghost" | "danger" | "glass";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-xl border-2 font-mono font-bold tracking-tight whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-100 disabled:pointer-events-none disabled:opacity-50";

// Outlined "retro window" button: plum border + hard shadow that presses in.
const pressable =
  "border-plum shadow-[3px_3px_0_var(--color-plum)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--color-plum)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-plum)]";

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.75rem]",
  md: "h-11 px-5 text-[0.8125rem]",
  lg: "h-13 px-6 text-[0.875rem]",
};

const variants: Record<Variant, string> = {
  primary: `${pressable} bg-coral text-white hover:bg-coral-600`,
  secondary: `${pressable} bg-[var(--color-paper)] text-plum hover:bg-sun-100`,
  dark: "border-plum bg-plum text-white shadow-[3px_3px_0_var(--color-coral)] hover:-translate-x-px hover:-translate-y-px hover:bg-plum-700 hover:shadow-[4px_4px_0_var(--color-coral)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-coral)]",
  ghost: "border-transparent text-plum hover:bg-plum/5", // plain text button
  danger: `${pressable} bg-[var(--color-paper)] text-coral-600 hover:bg-coral-50`,
  glass: `${pressable} bg-[var(--color-paper)] text-plum hover:bg-sun-100`,
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
