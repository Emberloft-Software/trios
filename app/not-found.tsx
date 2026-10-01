/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { copy } from "@/lib/copy";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 text-center">
      <div className="glass max-w-sm rounded-[2rem] p-8">
        <img src="/brand/mark-256.png" alt="" width={88} height={88} className="mx-auto rounded-[28%]" />
        <p className="mt-5 text-[3rem] font-extrabold leading-none text-plum tabular">404</p>
        <h1 className="mt-2 text-[1.375rem] font-bold">{copy.notFound.title}</h1>
        <p className="mt-2 text-[0.9375rem] text-muted">{copy.notFound.body}</p>
        <ButtonLink href="/feed" className="mt-6">{copy.notFound.feed}</ButtonLink>
        <Link href="/" className="mt-3 block text-[0.875rem] font-semibold text-coral-600 hover:underline">{copy.notFound.home}</Link>
      </div>
    </div>
  );
}
