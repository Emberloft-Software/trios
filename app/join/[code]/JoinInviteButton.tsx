"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { copy } from "@/lib/copy";
import { joinByInviteAction } from "./_actions";

export function JoinInviteButton({ code }: { code: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <Button
        size="lg"
        block
        loading={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await joinByInviteAction(code);
            if (res && !res.ok) setError(res.error);
          })
        }
      >
        {copy.invite.joinCta}
      </Button>
      {error && <Notice tone="danger" compact className="mt-3">{error}</Notice>}
    </>
  );
}
