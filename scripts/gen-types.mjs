// Generates lib/database.types.ts from the linked Supabase project, then
// tightens view Row types. Postgres reports every view column as nullable,
// which would force `?? ""` noise everywhere; columns we know are NOT NULL in
// the underlying tables get their `| null` removed here.
//
//   npm run gen:types
import { execSync } from "node:child_process";
import fs from "node:fs";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "swvbgmoljmvkvihxtakp";
const out = "lib/database.types.ts";

// Per view: the columns that genuinely CAN be null. Everything else is tightened.
const NULLABLE = {
  gig_feed: ["cost_note", "venue_name", "venue_photo_ref", "venue_photo_attribution", "venue_rating", "venue_rating_count", "venue_maps_url"],
  friend_hosted_gigs: ["cost_note", "venue_name", "venue_photo_ref", "venue_photo_attribution", "venue_rating", "venue_rating_count", "venue_maps_url", "host_avatar"],
  profiles_public: ["bio", "avatar_path", "age", "gender", "verified_at"],
  verification_requests_public: ["review_note", "reviewed_at", "submitted_at"],
};

let src = execSync(`supabase gen types typescript --project-id ${PROJECT} --schema public`, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});

const lines = src.split("\n");
let view = null;
let inRow = false;
let field = null;
const result = [];
for (const line of lines) {
  const viewMatch = line.match(/^ {6}(\w+): \{$/);
  if (viewMatch && NULLABLE[viewMatch[1]] !== undefined) view = viewMatch[1];
  else if (viewMatch) view = null;

  if (view && /^ {8}Row: \{$/.test(line)) inRow = true;
  else if (inRow && /^ {8}\}$/.test(line)) inRow = false;

  if (view && inRow) {
    const f = line.match(/^ {10}(\w+):/);
    if (f) field = f[1];
    const keepNull = NULLABLE[view].includes(field);
    if (!keepNull) {
      if (/^\s+\| null$/.test(line)) continue; // multi-line union tail
      result.push(line.replace(/ \| null$/, ""));
      continue;
    }
  }
  result.push(line);
}
src = result.join("\n");

src += `
// ── Convenience aliases ─────────────────────────────────────────────────────
type E = Database["public"]["Enums"];
export type VerificationStatus = E["verification_status"];
export type ReliabilityBand = E["reliability_band"];
export type GigStatus = E["gig_status"];
export type CrewState = E["crew_state"];
export type ModAction = E["mod_action"];
export type GenderIdentity = E["gender_identity"];
export type GigGender = E["gig_gender"];
export type PhotoStatus = E["photo_status"];
export type JoinRoute = E["join_route"];
export type FeedGig = Database["public"]["Views"]["gig_feed"]["Row"];
export type FriendGig = Database["public"]["Views"]["friend_hosted_gigs"]["Row"];
export type PublicProfile = Database["public"]["Views"]["profiles_public"]["Row"];
`;

fs.writeFileSync(out, src);
console.log(`wrote ${out}`);
