"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return data?.is_admin ? user.id : null;
}

const schema = z.object({
  reportId: z.string().uuid(),
  resolution: z.enum(["actioned", "dismissed"]),
  note: z.string().min(1).max(1000),
});

export type AdminResult = { ok: true } | { ok: false; error: string };

/** Resolve a report. Both outcomes write reports.resolution and are permanent
 *  (docs/07). Dismissal requires a note. Re-checks admin server-side. */
export async function resolveReportAction(input: unknown): Promise<AdminResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Add a note explaining the outcome." };
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not allowed." };

  const admin = createAdminClient();
  const { data: report } = await admin
    .from("reports")
    .select("id, target_id, status")
    .eq("id", parsed.data.reportId)
    .maybeSingle();
  if (!report) return { ok: false, error: "Report not found." };

  await admin
    .from("reports")
    .update({
      status: parsed.data.resolution,
      resolution: parsed.data.note,
      handled_by: adminId,
    })
    .eq("id", parsed.data.reportId);

  await admin.from("admin_audit").insert({
    admin_id: adminId,
    action: `report.${parsed.data.resolution}`,
    target_type: "user",
    target_id: report.target_id,
    reason: parsed.data.note,
    meta: { report_id: report.id },
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return { ok: true };
}
