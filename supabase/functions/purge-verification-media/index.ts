// purge-verification-media — daily Edge Function.
// Deletes liveness recordings 7 days after review and stamps media_purged_at.
// Also purges media for requests auto-rejected past 30 days. What persists is
// the verdict, reviewer, reason, timestamp — never the biometric artefact.
// Source: docs/05 § Media handling.
//
// Deploy:  supabase functions deploy purge-verification-media
// Schedule (pg_cron via pg_net) to run daily ~03:00 UTC.

import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Simple shared-secret guard so only the scheduler can invoke this.
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response("forbidden", { status: 403 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Requests reviewed > 7 days ago and not yet purged.
  const { data: rows, error } = await admin
    .from("verification_requests")
    .select("id, media_path")
    .not("media_path", "is", null)
    .is("media_purged_at", null)
    .lt("reviewed_at", new Date(Date.now() - 7 * 864e5).toISOString());

  if (error) return new Response(error.message, { status: 500 });

  let purged = 0;
  for (const r of rows ?? []) {
    if (!r.media_path) continue;
    const { error: delErr } = await admin.storage
      .from("verification")
      .remove([r.media_path]);
    if (delErr) continue;
    await admin
      .from("verification_requests")
      .update({ media_purged_at: new Date().toISOString() })
      .eq("id", r.id);
    purged++;
  }

  return Response.json({ purged });
});
