import { forwardRef } from "react";

export const fieldClass =
  "w-full rounded-2xl bg-white/80 px-4 py-3 text-[1rem] text-ink ring-1 ring-line placeholder:text-muted/70 transition-shadow outline-none focus:bg-white focus:ring-2 focus:ring-coral/50 disabled:opacity-60";

export function Label({ htmlFor, children, optional }: { htmlFor?: string; children: React.ReactNode; optional?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-[0.875rem] font-semibold text-plum">
      <span>{children}</span>
      {optional && <span className="text-[0.75rem] font-medium text-muted">{optional}</span>}
    </label>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted">{children}</p>;
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-[0.8125rem] font-medium text-coral-600">
      {children}
    </p>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => <input ref={ref} className={`${fieldClass} ${className}`} {...props} />,
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea ref={ref} className={`${fieldClass} min-h-24 resize-y ${className}`} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select ref={ref} className={`${fieldClass} appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10 ${className}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236e6280'%3E%3Cpath d='M5.5 7.5 10 12l4.5-4.5'/%3E%3C/svg%3E\")" }}
      {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

/** Pill-style single choice (gender, audience, filters). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  name,
  size = "md",
}: {
  value: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
  name: string;
  size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-full font-semibold transition-all ${size === "sm" ? "px-3.5 py-1.5 text-[0.8125rem]" : "px-4 py-2.5 text-[0.9375rem]"} ${
              active
                ? "bg-plum text-white shadow-[0_6px_16px_rgba(54,2,83,0.25)]"
                : "bg-white/80 text-plum ring-1 ring-line hover:bg-white"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  children,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-snug">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md accent-[var(--color-coral)]"
      />
      <span>{children}</span>
    </label>
  );
}
