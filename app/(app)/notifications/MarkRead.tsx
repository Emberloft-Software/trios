"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { markNotificationsReadAction } from "./_actions";

export function MarkRead() {
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="secondary" loading={pending}
      onClick={() => start(async () => { await markNotificationsReadAction(); })}>
      <CheckCheck className="h-4 w-4" /> {copy.notifications.markRead}
    </Button>
  );
}
