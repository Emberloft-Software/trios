"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { moderateUserAction, setAdminAction, setProfileFieldsAction, setVerificationAction } from "../_actions";
import { removeLivePhotoAction } from "../../photos/_actions";
import type { ModAction } from "@/lib/database.types";

const LADDER: { action: ModAction; label: string; needsDuration: boolean }[] = [
  { action: "warn", label: "Warn", needsDuration: false },
  { action: "restrict_posting", label: "Restrict posting (can't host)", needsDuration: true },
  { action: "restrict_joining", label: "Restrict joining", needsDuration: true },
  { action: "suspend", label: "Suspend", needsDuration: true },
  { action: "ban", label: "Ban (permanent)", needsDuration: false },
  { action: "clear", label: "Clear all restrictions", needsDuration: false },
];

export function ModerationForm({
  targetId,
  verified,
  isAdmin,
  hasLivePhoto,
  birthDate,
  gender,
}: {
  targetId: string;
  verified: boolean;
  isAdmin: boolean;
  hasLivePhoto: boolean;
  birthDate: string | null;
  gender: "woman" | "man" | "nonbinary" | null;
}) {
  const router = useRouter();
  const [action, setAction] = useState<ModAction>("warn");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(30);
  const [dob, setDob] = useState(birthDate ?? "");
  const [gen, setGen] = useState(gender ?? "nonbinary");
  const [fixReason, setFixReason] = useState("");
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "safe" | "danger"; text: string } | null>(null);
  const current = LADDER.find((l) => l.action === action)!;

  const run = (key: string, fn: () => Promise<{ ok: boolean; error?: string }>, okText: string) => {
    setWhich(key);
    setMsg(null);
    start(async () => {
      const res = await fn();
      setMsg(res.ok ? { tone: "safe", text: okText } : { tone: "danger", text: res.error ?? "Failed." });
      if (res.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <section className="glass space-y-3 rounded-[1.5rem] p-5">
        <h2 className="text-[1rem] font-bold">Moderation</h2>
        <Select value={action} onChange={(e) => setAction(e.target.value as ModAction)} aria-label="Action">
          {LADDER.map((l) => <option key={l.action} value={l.action}>{l.label}</option>)}
        </Select>
        {current.needsDuration && (
          <label className="flex items-center gap-2 text-[0.875rem] font-semibold text-plum">
            For <Input type="number" min={1} max={3650} value={days} onChange={(e) => setDays(Number(e.target.value))} className="!w-24 !py-2" /> days
          </label>
        )}
        <Textarea rows={2} value={reason} maxLength={1000} onChange={(e) => setReason(e.target.value)} placeholder="Reason (recorded and sent to the user)" />
        <Button block variant="dark" disabled={pending || reason.trim().length < 3} loading={pending && which === "mod"}
          onClick={() => run("mod", () => moderateUserAction({ targetId, action, reason, durationDays: current.needsDuration ? days : undefined }), "Applied.")}>
          Apply
        </Button>
      </section>

      <section className="glass space-y-2 rounded-[1.5rem] p-5">
        <h2 className="text-[1rem] font-bold">Quick actions</h2>
        <Button block variant="secondary" loading={pending && which === "verify"} disabled={pending}
          onClick={() => run("verify", () => setVerificationAction(targetId, !verified), verified ? "Verification revoked." : "Marked verified.")}>
          {verified ? "Revoke verification" : "Force-verify"}
        </Button>
        {hasLivePhoto && (
          <Button block variant="danger" loading={pending && which === "photo"} disabled={pending}
            onClick={() => run("photo", () => removeLivePhotoAction(targetId, "Removed from user page"), "Photo removed.")}>
            Take down profile photo
          </Button>
        )}
        <Button block variant="ghost" loading={pending && which === "admin"} disabled={pending}
          onClick={() => confirm(isAdmin ? "Remove admin access?" : "Give this person full admin access?") && run("admin", () => setAdminAction(targetId, !isAdmin), "Role updated.")}>
          {isAdmin ? "Revoke admin" : "Make admin"}
        </Button>
      </section>

      <section className="glass space-y-3 rounded-[1.5rem] p-5">
        <h2 className="text-[1rem] font-bold">Correct age / gender</h2>
        <div className="grid grid-cols-2 gap-2">
          <div><Label htmlFor="adob">Date of birth</Label><Input id="adob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="!py-2" /></div>
          <div>
            <Label htmlFor="agen">Gender</Label>
            <Select id="agen" value={gen} onChange={(e) => setGen(e.target.value as typeof gen)} className="!py-2">
              <option value="woman">Woman</option><option value="man">Man</option><option value="nonbinary">Non-binary</option>
            </Select>
          </div>
        </div>
        <Input value={fixReason} onChange={(e) => setFixReason(e.target.value)} placeholder="Why (e.g. user emailed with ID)" className="!py-2" />
        <Button block variant="secondary" disabled={pending || fixReason.trim().length < 3 || !dob} loading={pending && which === "fields"}
          onClick={() => run("fields", () => setProfileFieldsAction({ targetId, birthDate: dob, gender: gen, reason: fixReason }), "Profile corrected.")}>
          Save correction
        </Button>
      </section>

      {msg && <Notice tone={msg.tone} compact>{msg.text}</Notice>}
    </div>
  );
}
