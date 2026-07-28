// send-emails — drains the notification_outbox and sends transactional email.
// Runs every couple of minutes. Only the events docs/03 § Notifications lists:
// gig confirmed, gig locked, gig cancelled, someone removed you, check-in
// window open, verification approved/rejected. Never "someone joined".
//
// Deploy:  supabase functions deploy send-emails
// Requires RESEND_API_KEY (or swap for Supabase Auth's provider).

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUBJECTS: Record<string, string> = {
  gig_confirmed: "That's three. It's happening.",
  gig_locked: "Crew's final — here's the address",
  gig_cancelled: "A gig you were in is off",
  removed: "You were removed from a gig",
  checkin_open: "Who's here? Check in for your gig",
  verification_approved: "You're verified",
  verification_rejected: "About your verification",
};

Deno.serve(async (req) => {
  if (req.headers.get("authorization") !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response("forbidden", { status: 403 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const resendKey = Deno.env.get("RESEND_API_KEY");

  const { data: rows } = await admin
    .from("notification_outbox")
    .select("id, user_id, kind, gig_id, payload")
    .is("sent_at", null)
    .order("created_at", { ascending: true })
    .limit(50);

  let sent = 0;
  for (const n of rows ?? []) {
    // Look up the recipient's email via the auth admin API.
    const { data: u } = await admin.auth.admin.getUserById(n.user_id);
    const email = u.user?.email;
    if (!email) continue;

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Trio <hello@trio.lk>",
          to: email,
          subject: SUBJECTS[n.kind] ?? "Trio",
          text: `Open Trio to see the details.`,
        }),
      });
    }

    await admin
      .from("notification_outbox")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", n.id);
    sent++;
  }

  return Response.json({ sent });
});
