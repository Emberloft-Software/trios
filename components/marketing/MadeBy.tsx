/* eslint-disable @next/next/no-img-element */
import { brand } from "@/lib/brand";
import { copy } from "@/lib/copy";

/** "A product by Emberloft" credit with the studio's mark, linking to the studio's site. */
export function MadeBy({ className = "" }: { className?: string }) {
  return (
    <a
      href={brand.studioUrl}
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center gap-2 rounded-full text-[0.75rem] font-semibold text-muted hover:text-plum ${className}`}
    >
      <img src="/brand/emberloft.png" alt="" width={24} height={19} className="h-[19px] w-auto" />
      <span>
        {copy.madeBy}{" "}
        <span className="text-plum underline-offset-2 hover:underline">{brand.studio}</span>
      </span>
    </a>
  );
}
