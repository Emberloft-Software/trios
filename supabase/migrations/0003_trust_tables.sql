-- 0003 — Trust & safety + verification tables.
-- Source: docs/02-data-model.md, docs/05, docs/06, docs/07.
-- These are insert-only or admin-read; all reads happen server-side via the
-- service role. RLS enabled here, policies in 0006_rls.sql.

-- ── crew_removals ────────────────────────────────────────────────────────────
-- Audit log. Every host removal, permanently. Never deletable.
create table crew_removals (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  actor_id uuid not null references profiles,   -- host or admin
  target_id uuid not null references profiles,
  reason text not null check (char_length(reason) >= 10),
  created_at timestamptz not null default now()
);
create index on crew_removals (actor_id, created_at);
alter table crew_removals enable row level security;

-- ── reports ──────────────────────────────────────────────────────────────────
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles,
  target_id uuid not null references profiles,
  gig_id uuid references gigs on delete set null,
  category text not null,                -- see docs/06
  details text not null,
  status report_status not null default 'open',
  resolution text,
  handled_by uuid references profiles,
  created_at timestamptz not null default now()
);
create index on reports (status, created_at);
alter table reports enable row level security;

-- ── moderation_actions ───────────────────────────────────────────────────────
create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles,
  target_id uuid not null references profiles,
  action mod_action not null,
  reason text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index on moderation_actions (target_id, created_at);
alter table moderation_actions enable row level security;

-- ── reliability_events ───────────────────────────────────────────────────────
-- Bands compute from the last 10 events only (docs/06). No numeric score is
-- ever exposed.
create table reliability_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  gig_id uuid references gigs on delete set null,
  kind reliability_kind not null,
  weight int not null default 1,
  created_at timestamptz not null default now()
);
create index on reliability_events (user_id, created_at);
alter table reliability_events enable row level security;

-- ── verification_requests ────────────────────────────────────────────────────
-- Liveness capture. media_path points at the PRIVATE 'verification' bucket and
-- is never exposed to the client (a view hides it — see 0007). Media is
-- auto-purged 7 days post-review (see 0009).
create table verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  challenge jsonb not null,              -- { code, actions, issuedAt, expiresAt }
  media_path text,                       -- private bucket path
  media_mime text,
  status verification_status not null default 'pending',
  reviewer_id uuid references profiles,
  review_note text,
  reviewed_at timestamptz,
  media_purged_at timestamptz,
  created_at timestamptz not null default now()
);
create index on verification_requests (status, created_at);
create index on verification_requests (user_id, created_at);
alter table verification_requests enable row level security;

-- ── admin_audit ──────────────────────────────────────────────────────────────
-- Every state change from /admin that isn't already covered by
-- moderation_actions (verification decisions, gig cancellations, venue edits).
-- docs/07 § "Everything an admin does is logged".
create table admin_audit (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles,
  action text not null,                  -- e.g. 'verification.approve'
  target_type text not null,             -- 'user' | 'gig' | 'venue' | 'verification'
  target_id uuid,
  reason text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index on admin_audit (admin_id, created_at);
alter table admin_audit enable row level security;
