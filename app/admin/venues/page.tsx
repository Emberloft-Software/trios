import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { PartnerForm } from "./PartnerForm";

export const metadata = { title: "Venues · Admin" };

/**
 * Venue list + partner flags (docs/07). Venues are created automatically from
 * the Places picker when hosts post gigs; here an admin flips partner status
 * and sets the perk text. Search by name.
 */
export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("venues")
    .select("id, name, address, slug, is_partner, partner_perk")
    .order("is_partner", { ascending: false })
    .order("name")
    .limit(50);
  if (q && q.trim().length >= 2) query = query.ilike("name", `%${q.trim()}%`);

  const { data: venues } = await query;

  return (
    <div>
      <h1 className="mb-4 font-display text-[2rem] font-bold">Venues</h1>
      <form method="get" className="mb-6 flex gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder="Search venues"
          className="flex-1 rounded-2xl ring-1 ring-line bg-white px-3 py-2 text-[0.9375rem] outline-none" />
        <button className="rounded-full ring-1 ring-line bg-coral px-5 text-white">
          Search
        </button>
      </form>

      {(venues ?? []).length === 0 ? (
        <Card className="p-5 text-[0.9375rem] text-muted">No venues yet.</Card>
      ) : (
        <div className="space-y-3">
          {(venues ?? []).map((v) => (
            <Card key={v.id} className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{v.name}</span>
                {v.is_partner && (
                  <span className="tabular rounded-lg ring-1 ring-line bg-sun-100 px-2 text-[0.6875rem] uppercase">
                    Partner
                  </span>
                )}
              </div>
              <p className="text-[0.8125rem] text-muted">{v.address}</p>
              <PartnerForm venueId={v.id} isPartner={v.is_partner} perk={v.partner_perk} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
