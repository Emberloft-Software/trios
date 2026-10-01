import { getViewer } from "@/lib/auth";
import { PageHeader } from "@/components/ui/Card";
import { NewGigForm } from "./NewGigForm";
import { ageFrom } from "@/lib/time";
import { copy } from "@/lib/copy";

export const metadata = { title: "Post a gig" };

export default async function NewGigPage() {
  const { supabase, profile } = await getViewer();
  const { data: activities } = await supabase
    .from("activities")
    .select("id, slug, name, emoji, category, default_capacity")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={copy.newGig.heading} sub={copy.newGig.sub} />
      <NewGigForm
        activities={activities ?? []}
        hostAge={profile?.birth_date ? ageFrom(profile.birth_date) : 18}
        hostGender={profile?.gender ?? "nonbinary"}
      />
    </div>
  );
}
