/* eslint-disable @next/next/no-img-element */
import { brand } from "@/lib/brand";
import { copy } from "@/lib/copy";

/** "A product by Emberloft" credit with the studio's mark. */
export function MadeBy({ className = "" }: { className?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 text-[0.75rem] font-semibold text-muted ${className}`}>
      <img src="/brand/emberloft.png" alt="" width={24} height={19} className="h-[19px] w-auto" />
      <span>
        {copy.madeBy}{" "}
        <span className="text-plum">{brand.studio}</span>
      </span>
    </p>
  );
}
