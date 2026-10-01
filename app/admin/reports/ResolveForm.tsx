"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { resolveReportAction } from "./_actions";

export function ResolveForm({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<"actioned" | "dismissed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function resolve(resolution: "actioned" | "dismissed") {
    setError(null);
    setWhich(resolution);
    start(async () => {
      const res = await resolveReportAction({ reportId, resolution, note });
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-2 border-t border-line pt-4">
      <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Resolution note (required) — what you did and why" className="text-[0.875rem]" />
      {error && <p className="text-[0.8125rem] font-semibold text-coral-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="dark" onClick={() => resolve("actioned")} disabled={pending || !note.trim()} loading={pending && which === "actioned"}>Mark actioned</Button>
        <Button size="sm" variant="secondary" onClick={() => resolve("dismissed")} disabled={pending || !note.trim()} loading={pending && which === "dismissed"}>Dismiss</Button>
      </div>
    </div>
  );
}
