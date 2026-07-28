import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="font-data text-[4rem] leading-none">404</p>
        <h1 className="mt-2 font-display text-[1.5rem] font-700">Nothing here</h1>
        <p className="mt-2 text-[0.9375rem] text-[var(--color-dust)]">
          That page doesn&apos;t exist, or it&apos;s not yours to see.
        </p>
        <div className="mt-6">
          <ButtonLink href="/feed">Back to the feed</ButtonLink>
        </div>
        <Link href="/" className="mt-3 block text-[0.875rem] text-[var(--color-net)] hover:underline">
          Or the home page
        </Link>
      </div>
    </div>
  );
}
