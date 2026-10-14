import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { dispatchPendingPushes, pushConfigured } from "@/lib/push/dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.PUSH_DISPATCH_SECRET;
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || secret.length < 32) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Called by Postgres (pg_net) whenever notifications are created, and by a
 * 1-minute cron sweep. Only that caller knows the shared secret.
 */
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: "push_not_configured" }, { status: 503 });
  try {
    const result = await dispatchPendingPushes();
    return NextResponse.json(result);
  } catch (e) {
    console.error("push dispatch failed:", e);
    return NextResponse.json({ error: "dispatch_failed" }, { status: 500 });
  }
}
