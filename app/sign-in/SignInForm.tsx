"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const schema = z.object({ email: z.string().email("That doesn't look like an email.") });
type Values = z.infer<typeof schema>;

/**
 * Email OTP / magic link (docs/00, M0). We send a link; Supabase redirects back
 * through /auth/callback which exchanges the code and lands the user on /feed.
 */
export function SignInForm() {
  const [sent, setSent] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>();

  async function onSubmit(values: Values) {
    setErr(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErr(parsed.error.errors[0].message);
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/feed`,
      },
    });
    if (error) {
      setErr(error.message);
      return;
    }
    setSent(parsed.data.email);
  }

  if (sent) {
    return (
      <Card className="p-6">
        <h1 className="font-display text-[1.25rem] font-600">Check your email</h1>
        <p className="mt-2 text-[0.9375rem]">
          We sent a sign-in link to <span className="font-data">{sent}</span>. Open it on this
          device.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="email" className="mb-1 block text-[0.875rem] font-500">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2.5 text-[1rem] outline-none"
          {...register("email")}
        />
        {(errors.email || err) && (
          <p className="mt-2 text-[0.875rem] text-[var(--color-tape)]">
            {errors.email?.message ?? err}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
          {isSubmitting ? "Sending…" : "Send me a link"}
        </Button>
      </form>
    </Card>
  );
}
