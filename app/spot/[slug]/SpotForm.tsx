"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { redeemBySpotAction } from "./_actions";

export function SpotForm({ slug }: { slug: string }) {
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Card className="p-6">
        <p className="text-[1rem]">{copy.spot.done}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          start(async () => {
            const res = await redeemBySpotAction({ slug, code });
            if (!res.ok) setError(res.error);
            else setDone(true);
          });
        }}
      >
        <label htmlFor="code" className="mb-1 block text-[0.875rem] font-500">
          {copy.spot.codeLabel}
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="BDM-4KQ2"
          className="w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2.5 font-data text-lg tracking-[0.1em] outline-none"
        />
        {error && <p className="mt-2 text-[0.875rem] text-[var(--color-tape)]">{error}</p>}
        <Button type="submit" disabled={pending || code.trim().length < 3} className="mt-4 w-full">
          {copy.spot.submit}
        </Button>
      </form>
    </Card>
  );
}
