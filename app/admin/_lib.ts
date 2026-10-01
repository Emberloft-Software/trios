import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminId } from "@/lib/auth";

export const NONE_ID = "00000000-0000-0000-0000-000000000000";
export const ids = (xs: (string | null | undefined)[]) => {
  const u = [...new Set(xs.filter(Boolean) as string[])];
  return u.length ? u : [NONE_ID];
};

/** For server actions: re-check admin, hand back the service-role client. */
export async function adminContext() {
  const adminId = await requireAdminId();
  if (!adminId) return null;
  return { adminId, db: createAdminClient() };
}

export async function audit(
  db: ReturnType<typeof createAdminClient>,
  row: { admin_id: string; action: string; target_type: string; target_id?: string | null; reason?: string | null; meta?: Record<string, unknown> },
) {
  await db.from("admin_audit").insert({ ...row, meta: (row.meta ?? null) as never });
}
