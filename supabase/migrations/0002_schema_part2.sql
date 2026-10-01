-- ── checkins ─────────────────────────────────────────────────────────────────
create table checkins (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  confirmer_id uuid not null references profiles on delete cascade,
  subject_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  unique (gig_id, confirmer_id, subject_id),
  check (confirmer_id <> subject_id)
);
alter table checkins enable row level security;

-- ── kick_votes ───────────────────────────────────────────────────────────────
-- Crew vote someone out of an open chat for bad behaviour. A majority of the
-- other members (and never fewer than 2 votes) removes them. Every vote
-- carries a reason and the outcome is auto-reported to admins.
create table kick_votes (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  target_id uuid not null references profiles on delete cascade,
  voter_id uuid not null references profiles on delete cascade,
  reason text not null check (char_length(reason) between 3 and 300),
  created_at timestamptz not null default now(),
  unique (gig_id, target_id, voter_id),
  check (target_id <> voter_id)
);
create index on kick_votes (gig_id, target_id);
alter table kick_votes enable row level security;

-- ── crew_removals (audit, never deletable) ───────────────────────────────────
create table crew_removals (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  actor_id uuid references profiles,          -- host; null for a crew vote
  target_id uuid not null references profiles,
  kind text not null default 'host' check (kind in ('host','vote','admin')),
  reason text not null check (char_length(reason) >= 3),
  created_at timestamptz not null default now()
);
create index on crew_removals (actor_id, created_at);
create index on crew_removals (target_id);
alter table crew_removals enable row level security;

-- ── reports ──────────────────────────────────────────────────────────────────
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles,
  target_id uuid not null references profiles,
  gig_id uuid references gigs on delete set null,
  category text not null,
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
-- Liveness capture. media_path is in the PRIVATE 'verification' bucket and is
-- never exposed to clients. Media is purged 7 days after review.
create table verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  challenge jsonb not null,
  media_path text,
  media_mime text,
  media_bytes int,
  device_hint text,
  status verification_status not null default 'pending',
  reviewer_id uuid references profiles,
  review_note text,
  reviewed_at timestamptz,
  media_purged_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);
create index on verification_requests (status, created_at);
create index on verification_requests (user_id, created_at);
alter table verification_requests enable row level security;

-- ── admin_audit ──────────────────────────────────────────────────────────────
create table admin_audit (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles,
  action text not null,
  target_type text not null,
  target_id uuid,
  reason text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index on admin_audit (created_at desc);
alter table admin_audit enable row level security;

-- ── friend_requests / friendships / blocks ───────────────────────────────────
create table friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles on delete cascade,
  recipient_id uuid not null references profiles on delete cascade,
  gig_id uuid not null references gigs on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','expired')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);
create unique index on friend_requests (sender_id, recipient_id) where status = 'pending';
create index on friend_requests (recipient_id, status);
alter table friend_requests enable row level security;

create table friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references profiles on delete cascade,
  user_b uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);
create index on friendships (user_b);
alter table friendships enable row level security;

create table blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references profiles on delete cascade,
  blocked_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index on blocks (blocked_id);
alter table blocks enable row level security;

-- ── perk_redemptions ─────────────────────────────────────────────────────────
create table perk_redemptions (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues,
  gig_id uuid not null references gigs on delete cascade,
  crew_size int not null,
  redeemed_at timestamptz not null default now(),
  unique (gig_id)
);
create index on perk_redemptions (venue_id, redeemed_at);
alter table perk_redemptions enable row level security;

-- ── notification_outbox ──────────────────────────────────────────────────────
-- Also the in-app notification feed: users read their own rows.
create table notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  kind text not null,
  gig_id uuid references gigs on delete set null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index on notification_outbox (user_id, created_at desc);
create index on notification_outbox (created_at) where sent_at is null;
alter table notification_outbox enable row level security;
