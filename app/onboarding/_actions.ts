"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ageFrom } from "@/lib/time";

const schema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "birth_required"),
  gender: z.enum(["woman", "man", "nonbinary"], { message: "gender_required" }),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "terms_required" }) }),
});

export async function completeProfileAction(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "generic" };
  if (ageFrom(parsed.data.birthDate) < 18) return { ok: false, error: "underage" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_profile", {
    p_birth_date: parsed.data.birthDate,
    p_gender: parsed.data.gender,
    p_accept_terms: true,
  });
  if (error) return { ok: false, error: error.message === "underage" ? "underage" : "generic" };
  revalidatePath("/", "layout");
  return { ok: true };
}
