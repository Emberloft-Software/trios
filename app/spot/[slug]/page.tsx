import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SpotForm } from "./SpotForm";
import { brand } from "@/lib/brand";
import { copy } from "@/lib/copy";

export const metadata = { title: "Redeem — Trio" };

/**
 * Public, no-login redemption page for venue staff (docs/08). Just the venue's
 * slug and the gig code — no account needed. Venue lookup uses the service role
 * because this page is unauthenticated.
 */
export default async function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: venue } = await admin
    .from("venues")
    .select("name, is_partner")
    .eq("slug", slug)
    .maybeSingle();

  if (!venue || !venue.is_partner) notFound();

  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-5">
      <div className="w-full">
        <p className="font-display text-2xl font-800 tracking-[-0.03em]">{brand.name}</p>
        <h1 className="mt-4 font-display text-[1.5rem] font-700">{venue.name}</h1>
        <p className="mb-6 mt-1 text-[0.9375rem] text-[var(--color-dust)]">{copy.spot.intro}</p>
        <SpotForm slug={slug} />
      </div>
    </div>
  );
}
