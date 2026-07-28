import { createClient } from "@/lib/supabase/server";
import { NewGigForm } from "./NewGigForm";

export const metadata = { title: "Post a gig — Trio" };

export default async function NewGigPage() {
  const supabase = await createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("id, slug, name, emoji, category, default_capacity")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-700">Post a gig</h1>
      <NewGigForm activities={activities ?? []} />
    </div>
  );
}
