/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { brand } from "@/lib/brand";

/** The app mark (three amigos) + the wordmark, cut from the brand artwork. */
export function Logo({
  href = "/",
  tone = "plum",
  size = "md",
  markOnly = false,
}: {
  href?: string | null;
  tone?: "plum" | "white";
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
}) {
  const mark = size === "lg" ? 44 : size === "sm" ? 30 : 36;
  const word = size === "lg" ? 30 : size === "sm" ? 20 : 24;
  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <img src="/brand/mark-64.png" alt="" width={mark} height={mark} className="rounded-[28%] shadow-[0_4px_12px_rgba(255,52,80,0.3)]" />
      {!markOnly && (
        <img
          src={tone === "white" ? "/brand/wordmark-white.png" : "/brand/wordmark-plum.png"}
          alt={brand.name}
          height={word}
          style={{ height: word, width: "auto" }}
          className="translate-y-[2px]"
        />
      )}
      {markOnly && <span className="sr-only">{brand.name}</span>}
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} aria-label={`${brand.name} home`} className="inline-flex">
      {inner}
    </Link>
  );
}
