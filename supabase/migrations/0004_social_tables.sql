-- 0004 — Social tables: friend_requests, friendships, blocks, perk_redemptions.
-- Source: docs/02-data-model.md, docs/06, docs/08.

-- ── friend_requests ──────────────────────────────────────────────────────────
-- Requests expire after 14 days. The sender is never told a request was
-- declined — declined and expired look identical to them. Re-requesting the
-- same person is blocked for 90 days after any terminal state (enforced in
-- send_friend_request(), 0005).
create table friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles on delete cascade,
  recipient_id uuid not null references profiles on delete cascade,
  gig_id uuid not null references gigs,        -- the gig they attended together
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','expired')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);
-- one live request per direction per pair
create unique index on friend_requests (sender_id, recipient_id)
  where status = 'pending';
create index on friend_requests (recipient_id, status);
alter table friend_requests enable row level security;

-- ── friendships ──────────────────────────────────────────────────────────────
-- Stored once per pair, not twice. Always insert with the lower UUID first.
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

-- ── blocks ───────────────────────────────────────────────────────────────────
-- Directional in creation, symmetric in effect. Never disclosed to the blocked
-- person. claim_slot() returns gig_full (not a block-specific error) when a
-- block exists either way.
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
-- Proof-of-value for partner venues (docs/08). Exactly one row per gig — the
-- unique constraint holds under a double submit.
create table perk_redemptions (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues,
  gig_id uuid not null references gigs,
  crew_size int not null,
  redeemed_at timestamptz not null default now(),
  unique (gig_id)
);
create index on perk_redemptions (venue_id, redeemed_at);
alter table perk_redemptions enable row level security;
