"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminContext, audit } from "../_lib";

const schema = z.object({
  reportId: z.string().uuid(),
  resolution: z.enum(["actioned", "dismissed"]),
  note: z.string().trim().min(1).max(1000),
});

export type AdminResult = { ok: true } | { ok: false; error: string };

export async function resolveReportAction(input: unknown): Promise<AdminResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Add a note explaining the outcome." };
  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  const { adminId, db } = ctx;

  const { data: report } = await db.from("reports").select("id, target_id").eq("id", parsed.data.reportId).maybeSingle();
  if (!report) return { ok: false, error: "Report not found." };

  await db.from("reports").update({ status: parsed.data.resolution, resolution: parsed.data.note, handled_by: adminId }).eq("id", report.id);
  await audit(db, { admin_id: adminId, action: `report.${parsed.data.resolution}`, target_type: "user", target_id: report.target_id, reason: parsed.data.note, meta: { report_id: report.id } });

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return { ok: true };
}
