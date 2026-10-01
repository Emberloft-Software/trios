-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0001 schema (fresh start, consolidates the old Trio 0001–0023).
-- Extensions, enums, tables. RLS is ENABLED on every table here; policies live
-- in 0003. Migrations are additive from this point on — never edit an applied one.
-- ═════════════════════════════════════════════════════════════════════════════

create extension if not exists "citext";
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────────
create type verification_status as enum ('unverified','pending','verified','rejected');
create type reliability_band    as enum ('new','reliable','mixed','restricted');
create type gig_status          as enum ('open','locked','completed','cancelled','expired');
create type crew_state          as enum ('claimed','left','removed','no_show','attended');
create type report_status       as enum ('open','reviewing','actioned','dismissed');
create type mod_action          as enum ('warn','restrict_posting','restrict_joining','suspend','ban','clear');
create type reliability_kind    as enum ('attended','no_show','late_leave','host_cancel','early_leave_ok');
create type gender_identity     as enum ('man','woman','nonbinary');
create type gig_gender          as enum ('everyone','women','men');
create type photo_status        as enum ('none','pending','approved','rejected');
create type join_route          as enum ('host','public','invite');

-- ── admin_allowlist ──────────────────────────────────────────────────────────
-- Emails that are made admin automatically when they sign up. Lets a fresh
-- database bootstrap its first admin without hand-editing rows.
create table admin_allowlist (
  email citext primary key,
  created_at timestamptz not null default now()
);
alter table admin_allowlist enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- One row per auth.users, created by trigger on signup (0002). birth_date and
-- gender drive gig visibility; they are set at signup and only an admin can
-- change them afterwards (column grants in 0003).
create table profiles (
  id                       uuid primary key references auth.users on delete cascade,
  handle                   citext unique not null,
  display_name             text not null check (char_length(display_name) between 1 and 40),
  bio                      text check (char_length(bio) <= 280),
  birth_date               date,
  gender                   gender_identity,
  city                     text not null default 'Colombo',
  interests                text[] not null default '{}',

  -- profile photo: uploads land as *pending* and only show once an admin
  -- confirms it's a real face. face_score is the client-side detector's
  -- confidence, shown to the reviewer as a hint (never trusted on its own).
  avatar_path              text,            -- approved photo, storage path in 'avatars'
  avatar_pending_path      text,            -- awaiting review
  avatar_status            photo_status not null default 'none',
  avatar_face_score        real,
  avatar_faces_found       int,
  avatar_reject_reason     text,
  avatar_reviewed_at       timestamptz,

  verification_status      verification_status not null default 'unverified',
  verified_at              timestamptz,
  reliability_band         reliability_band not null default 'new',
  is_admin                 boolean not null default false,
  suspended_until          timestamptz,
  posting_restricted_until timestamptz,
  joining_restricted_until timestamptz,
  accepted_terms_at        timestamptz,
  created_at               timestamptz not null default now()
);
create index on profiles (avatar_status) where avatar_status = 'pending';
alter table profiles enable row level security;

-- ── activities ───────────────────────────────────────────────────────────────
create table activities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  emoji text not null,
  category text not null,
  default_capacity int not null check (default_capacity between 3 and 16),
  is_sport boolean not null default false,
  sort_order int not null default 0,
  active boolean not null default true
);
alter table activities enable row level security;

-- ── venues ───────────────────────────────────────────────────────────────────
create table venues (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  google_place_id text unique,
  google_types text[] not null default '{}',
  photo_refs text[] not null default '{}',
  photo_attribution text[] not null default '{}',
  photos_refreshed_at timestamptz,
  maps_url text,
  price_level int,
  rating numeric,
  user_rating_count int,
  active_hours jsonb,
  activity_tags text[] not null default '{}',
  is_partner boolean not null default false,
  partner_perk text,
  partner_since date,
  verified_public boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table venues enable row level security;

-- ── gigs ─────────────────────────────────────────────────────────────────────
-- Capacity maths:  headcount = claimed_count + reserved_slots.
--   claimed_count   people in the app holding a slot (trigger-maintained)
--   reserved_slots  seats the host is holding for people they're bringing who
--                   haven't joined through the invite link yet
--   host_guests     how many people the host said they're bringing (display:
--                   "host is bringing 2 friends — join at your own risk")
-- Audience filter: age_min/age_max + gender_pref. A gig whose filter the viewer
-- doesn't match is invisible to them (RLS, 0003) — except via the invite link.
create table gigs (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  invite_code text unique not null,
  host_id uuid not null references profiles on delete cascade,
  activity_id uuid not null references activities,
  title text not null check (char_length(title) between 4 and 80),
  notes text check (char_length(notes) <= 600),
  venue_id uuid references venues,
  place_label text not null,
  lat double precision not null,
  lng double precision not null,
  starts_at timestamptz not null,
  duration_min int not null default 90 check (duration_min between 30 and 480),
  capacity int not null check (capacity between 3 and 16),
  claimed_count int not null default 0,
  reserved_slots int not null default 0 check (reserved_slots >= 0),
  host_guests int not null default 0 check (host_guests >= 0),
  min_to_confirm int not null default 3 check (min_to_confirm >= 3),
  age_min int not null default 18 check (age_min between 18 and 99),
  age_max int not null default 99 check (age_max between 18 and 99),
  gender_pref gig_gender not null default 'everyone',
  cost_note text check (char_length(cost_note) <= 120),
  status gig_status not null default 'open',
  locks_at timestamptz not null,
  cancelled_reason text,
  created_at timestamptz not null default now(),
  constraint capacity_gte_min check (capacity >= min_to_confirm),
  constraint age_range_ok check (age_min <= age_max),
  constraint guests_leave_room check (host_guests <= capacity - 2),
  constraint starts_in_future check (starts_at > created_at)
);
create index on gigs (status, starts_at);
create index on gigs (host_id);
alter table gigs enable row level security;

-- ── gig_crew ─────────────────────────────────────────────────────────────────
-- One row per slot holder. NO insert policy: rows come only from the
-- security-definer functions (create_gig / claim_slot / join_by_invite).
create table gig_crew (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  position int not null,
  state crew_state not null default 'claimed',
  joined_via join_route not null default 'public',
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
  system_kind text,
  created_at timestamptz not null default now()
);
create index on gig_messages (gig_id, created_at);
alter table gig_messages enable row level security;

