"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { resolveReportAction } from "./_actions";

const FIELD =
  "w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2 text-[0.875rem] outline-none";

/** Resolve a report: actioned (took a moderation step) or dismissed (needs a
 *  note). Both are permanent. */
export function ResolveForm({ reportId, targetId }: { reportId: string; targetId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<"actioned" | "dismissed" | null>(null);

  function resolve(resolution: "actioned" | "dismissed") {
    setError(null);
    setResolving(resolution);
    start(async () => {
      const res = await resolveReportAction({ reportId, resolution, note });
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 space-y-2 border-t-2 border-[var(--color-ink)] pt-3">
      <textarea
        className={FIELD}
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Resolution note (required for both outcomes)"
      />
      {error && <p className="text-[0.8125rem] text-[var(--color-tape)]">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => resolve("actioned")}
          disabled={pending || !note.trim()}
          loading={resolving === "actioned"}
        >
          Actioned
        </Button>
        <Button
          variant="secondary"
          onClick={() => resolve("dismissed")}
          disabled={pending || !note.trim()}
          loading={resolving === "dismissed"}
        >
          Dismiss
        </Button>
        <a href={`/admin/users/${targetId}`} className="self-center text-[0.875rem] text-[var(--color-net)] hover:underline">
          View target →
        </a>
      </div>
    </div>
  );
}
