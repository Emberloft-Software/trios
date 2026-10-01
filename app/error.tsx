"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { copy } from "@/lib/copy";

/**
 * Catch-all for anything that throws while rendering or inside an action
 * (a dropped connection, a server hiccup). Without it a failed action leaves
 * the button spinning or the page blank.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[70dvh] place-items-center px-5 text-center">
      <div className="glass max-w-sm rounded-[2rem] p-8">
        <img src="/brand/mark-256.png" alt="" width={72} height={72} className="mx-auto rounded-[28%]" />
        <h1 className="mt-5 text-[1.375rem] font-bold">{copy.errorPage.title}</h1>
        <p className="mt-2 text-[0.9375rem] text-muted">{copy.errorPage.body}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4" /> {copy.errorPage.retry}
          </Button>
          <ButtonLink href="/feed" variant="secondary">{copy.notFound.feed}</ButtonLink>
        </div>
      </div>
    </div>
  );
}
