"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { reportAction, blockAction, removeCrewAction } from "./_actions";

type Mode = null | "menu" | "report" | "block" | "remove";

const SELECT =
  "w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2 text-[0.9375rem]";
const FIELD =
  "w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-chalk)] px-3 py-2 text-[0.9375rem] outline-none";

/**
 * Report / Block / (host) Remove for one crew member. Report is always one tap
 * from the lobby (docs/06). Block needs no reason. Remove is host-only, needs a
 * category + a 10-char reason, and says plainly that removals are logged.
 */
export function CrewActions({
  gigId,
  targetId,
  targetName,
  canRemove,
}: {
  gigId: string;
  targetId: string;
  targetName: string;
  canRemove: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const t = copy.trust;
  const [reportCat, setReportCat] = useState("harassment");
  const [reportDetails, setReportDetails] = useState("");
  const [removeCat, setRemoveCat] = useState("no_show_pattern");
  const [removeReason, setRemoveReason] = useState("");

  function close() {
    setMode(null);
    setError(null);
  }

  function submitReport() {
    setError(null);
    start(async () => {
      const res = await reportAction({ gigId, targetId, category: reportCat, details: reportDetails });
      if (!res.ok) return setError(res.error);
      setNote(t.report.sent);
      setMode(null);
    });
  }
  function submitBlock() {
    setError(null);
    start(async () => {
      const res = await blockAction(targetId, gigId);
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  }
  function submitRemove() {
    setError(null);
    start(async () => {
      const res = await removeCrewAction({ gigId, targetId, category: removeCat, reason: removeReason });
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  }

  if (note) {
    return <span className="text-[0.8125rem] text-[var(--color-net)]">{note}</span>;
  }

  if (mode === null) {
    return (
      <button
        onClick={() => setMode("menu")}
        aria-label={`Actions for ${targetName}`}
        className="rounded-[var(--radius-chip)] border-2 border-transparent px-2 text-[var(--color-dust)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
      >
        ⋯
      </button>
    );
  }

  return (
    <div className="mt-2 w-full rounded-[var(--radius-chip)] border-2 border-[var(--color-ink)] bg-[var(--color-court)] p-3">
      {mode === "menu" && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setMode("report")}>{t.report.title}</Button>
          <Button variant="secondary" onClick={() => setMode("block")}>{t.block.action}</Button>
          {canRemove && <Button variant="secondary" onClick={() => setMode("remove")}>{t.remove.action}</Button>}
          <Button variant="ghost" onClick={close}>Close</Button>
        </div>
      )}

      {mode === "report" && (
        <div className="space-y-2">
          <p className="text-[0.8125rem] text-[var(--color-dust)]">{t.report.intro}</p>
          <select className={SELECT} value={reportCat} onChange={(e) => setReportCat(e.target.value)}>
            {Object.entries(t.report.categories).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <textarea className={FIELD} rows={3} value={reportDetails} maxLength={2000}
            onChange={(e) => setReportDetails(e.target.value)} placeholder={t.report.detailsPlaceholder} />
          {error && <p className="text-[0.8125rem] text-[var(--color-tape)]">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={submitReport} disabled={pending || !reportDetails.trim()}>{t.report.submit}</Button>
            <Button variant="ghost" onClick={close}>Cancel</Button>
          </div>
        </div>
      )}

      {mode === "block" && (
        <div className="space-y-2">
          <p className="font-500">{t.block.confirmTitle}</p>
          <p className="text-[0.8125rem] text-[var(--color-dust)]">{t.block.confirmBody}</p>
          {error && <p className="text-[0.8125rem] text-[var(--color-tape)]">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={submitBlock} disabled={pending}>{t.block.confirm}</Button>
            <Button variant="ghost" onClick={close}>{t.block.cancel}</Button>
          </div>
        </div>
      )}

      {mode === "remove" && (
        <div className="space-y-2">
          <p className="text-[0.8125rem] text-[var(--color-dust)]">{t.remove.intro}</p>
          <select className={SELECT} value={removeCat} onChange={(e) => setRemoveCat(e.target.value)}>
            {Object.entries(t.remove.categories).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <textarea className={FIELD} rows={2} value={removeReason} maxLength={600}
            onChange={(e) => setRemoveReason(e.target.value)} placeholder={t.remove.reasonPlaceholder} />
          {error && <p className="text-[0.8125rem] text-[var(--color-tape)]">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={submitRemove} disabled={pending || removeReason.trim().length < 10}>{t.remove.submit}</Button>
            <Button variant="ghost" onClick={close}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
