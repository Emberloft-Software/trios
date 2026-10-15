import { createClient } from "@supabase/supabase-js";
import fs from "fs";
const env = Object.fromEntries(fs.readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l && !l.startsWith("#") && l.includes("=")).map(l=>[l.slice(0,l.indexOf("=")), l.slice(l.indexOf("=")+1)]));
const cr = JSON.parse(fs.readFileSync(process.argv[2]));
const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const { data } = await c.auth.signInWithPassword({ email: cr.users[3].email, password: cr.pw });
c.realtime.setAuth(data.session.access_token);
c.channel("t").on("postgres_changes", { event: "*", schema: "public", table: "gig_messages", filter: `gig_id=eq.${cr.gig}` }, (p) => {
  console.log("C got", p.eventType, JSON.stringify({ body: p.new.body, system_kind: p.new.system_kind, deleted: !!p.new.deleted_at }));
}).subscribe((s) => console.log("C channel", s));
setTimeout(() => process.exit(0), 70000);
