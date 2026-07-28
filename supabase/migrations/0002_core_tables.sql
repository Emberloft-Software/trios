-- 0002 — Core tables: profiles, activities, venues, gigs, gig_crew,
--        gig_messages, checkins.  Source: docs/02-data-model.md
-- RLS is enabled here; policies are defined in 0006_rls.sql.

-- ── profiles ─────────────────────────────────────────────────────────────────
-- One row per auth.users. Created by a trigger on signup (see 0005).
create table profiles (
  id                  uuid primary key references auth.users on delete cascade,
  handle              citext unique not null,
  display_name        text not null,
  bio                 text check (char_length(bio) <= 280),
  avatar_path         text,                 -- storage path in 'avatars'
  face_visible        boolean not null default true,
  city                text not null default 'Colombo',
  birth_year          int check (birth_year between 1930 and extract(year from now())::int - 18),
  interests           text[] not null default '{}',
  verification_status verification_status not null default 'unverified',
  verified_at         timestamptz,
  reliability_band    reliability_band not null default 'new',
  is_admin            boolean not null default false,
  suspended_until     timestamptz,
  created_at          timestamptz not null default now()
);
-- Note: store birth_year, not DOB. Age band is all the product needs.
alter table profiles enable row level security;

-- ── activities ───────────────────────────────────────────────────────────────
-- Seeded reference table (docs/01 § taxonomy). Not user-created in v1.
create table activities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  emoji text not null,
  category text not null,
  default_capacity int not null check (default_capacity between 3 and 12),
  is_sport boolean not null default false,
  sort_order int not null default 0,
  active boolean not null default true
);
alter table activities enable row level security;

-- ── venues ───────────────────────────────────────────────────────────────────
create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  google_place_id text unique,
  google_types text[] not null default '{}',      -- drives the residential check
  photo_refs text[] not null default '{}',         -- Google photo references, NOT bytes
  photo_attribution text[] not null default '{}',
  photos_refreshed_at timestamptz,
  maps_url text,
  price_level int,
  active_hours jsonb,
  activity_tags text[] not null default '{}',
  is_partner boolean not null default false,
  partner_perk text,                               -- "15% off for Trio crews"
  partner_since date,
  verified_public boolean not null default false,  -- confirmed a public place
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table venues enable row level security;

-- ── gigs ─────────────────────────────────────────────────────────────────────
create table gigs (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,             -- short human code, e.g. 'BDM-4KQ2'
  host_id uuid not null references profiles on delete cascade,
  activity_id uuid not null references activities,
  title text not null check (char_length(title) between 4 and 80),
  notes text check (char_length(notes) <= 600),
  venue_id uuid references venues,
  place_label text not null,             -- denormalised for display
  lat double precision not null,
  lng double precision not null,
  starts_at timestamptz not null,
  duration_min int not null default 90 check (duration_min between 30 and 480),
  capacity int not null check (capacity between 3 and 12),
  claimed_count int not null default 0,  -- maintained by trigger, never written by app
  min_to_confirm int not null default 3 check (min_to_confirm >= 3),
  cost_note text,                        -- "court fee ~LKR 800 split"
  status gig_status not null default 'open',
  locks_at timestamptz not null,         -- default starts_at - 2 hours
  cancelled_reason text,
  created_at timestamptz not null default now(),
  constraint capacity_gte_min check (capacity >= min_to_confirm),
  constraint starts_in_future check (starts_at > created_at)
);
create index on gigs (status, starts_at);
create index on gigs (activity_id, starts_at) where status = 'open';
alter table gigs enable row level security;

-- ── gig_crew ─────────────────────────────────────────────────────────────────
-- The slot table. One row per claimed slot. There is deliberately NO insert
-- policy — slots are only created through claim_slot()/create_gig() (0005),
-- which are security definer. This makes R2 (first-come-first-served)
-- structurally true rather than a UI convention.
create table gig_crew (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  position int not null,                 -- 1 = host
  state crew_state not null default 'claimed',
  claimed_at timestamptz not null default now(),
  left_at timestamptz,
  unique (gig_id, user_id),
  unique (gig_id, position)
);
create index on gig_crew (user_id, state);
alter table gig_crew enable row level security;

-- ── gig_messages ─────────────────────────────────────────────────────────────
create table gig_messages (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  user_id uuid references profiles on delete set null,
  body text not null check (char_length(body) between 1 and 1000),
  system_kind text,                      -- non-null for system messages
  created_at timestamptz not null default now()
);
create index on gig_messages (gig_id, created_at);
alter table gig_messages enable row level security;

-- ── checkins ─────────────────────────────────────────────────────────────────
-- Who confirms they saw whom. Attendance: a member is 'attended' when at least
-- 2 OTHER crew confirm them. This is exactly why minimum crew is 3.
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
