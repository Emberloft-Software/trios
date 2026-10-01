"use client";

import { useState, useTransition } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Input, Label } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import { deleteAccountAction, signOutAction } from "./_actions";

export function AccountActions() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [signingOut, startSignOut] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <form action={() => startSignOut(() => signOutAction())}>
        <Button type="submit" variant="secondary" loading={signingOut}>
          <LogOut className="h-4 w-4" /> {copy.nav.signOut}
        </Button>
      </form>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" /> {copy.profile.deleteAccount}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={copy.profile.deleteAccount} closeLabel={copy.trust.close}>
        <Notice tone="danger">{copy.profile.deleteConfirm}</Notice>
        <div className="mt-4">
          <Label htmlFor="del">{copy.profile.deleteType}</Label>
          <Input id="del" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
        </div>
        {error && <p className="mt-2 text-[0.8125rem] text-coral-600">{error}</p>}
        <Button
          className="mt-4"
          block
          disabled={text.trim().toUpperCase() !== "DELETE"}
          loading={pending}
          onClick={() =>
            start(async () => {
              const res = await deleteAccountAction(text);
              if (!res.ok) return setError(res.error);
              window.location.href = "/";
            })
          }
        >
          {copy.profile.deleteDo}
        </Button>
      </Sheet>
    </div>
  );
}
