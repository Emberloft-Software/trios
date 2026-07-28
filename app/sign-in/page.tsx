import { SignInForm } from "./SignInForm";
import { brand } from "@/lib/brand";
import { copy } from "@/lib/copy";
import Link from "next/link";

export const metadata = { title: "Sign in — Trio" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // only allow internal redirect targets
  const safeNext = next && next.startsWith("/") ? next : "/feed";

  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl font-800 tracking-[-0.03em]">
          {brand.name}
        </Link>
        <p className="mt-2 mb-6 text-[0.9375rem] text-[var(--color-dust)]">
          {copy.productLine}
        </p>
        <SignInForm next={safeNext} />
      </div>
    </div>
  );
}
