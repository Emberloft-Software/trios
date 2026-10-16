"use client";

import { useTransition } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { confirmResetAction } from "./_actions";

/** The press that actually uses the emailed link (scanners never press it). */
export function ConfirmResetButton({ code, tokenHash }: { code: string | null; tokenHash: string | null }) {
  const [pending, start] = useTransition();
  return (
    <Button className="mt-6" size="lg" block loading={pending} onClick={() => start(() => confirmResetAction(code, tokenHash))}>
      <KeyRound className="h-4.5 w-4.5" /> {copy.auth.resetConfirmCta}
    </Button>
  );
}
