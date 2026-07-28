# 02 — Data model

Postgres via Supabase. All tables in `public` unless noted. RLS enabled on every table.

## Enums

```sql
create type verification_status as enum ('unverified','pending','verified','rejected');
create type reliability_band    as enum ('new','reliable','mixed','restricted');
create type gig_status          as enum ('open','locked','completed','cancelled','expired');
create type crew_state          as enum ('claimed','left','removed','no_show','attended');
create type report_status       as enum ('open','reviewing','actioned','dismissed');
create type mod_action          as enum ('warn','restrict_posting','restrict_joining','suspend','ban','clear');
create type reliability_kind    as enum ('attended','no_show','late_leave','host_cancel','early_leave_ok');
```

## Tables

### `profiles`
One row per `auth.users`. Created by trigger on signup.

```sql
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
```

Note: store `birth_year`, not date of birth. Age band is all the product needs and DOB is unnecessary personal data.

### `activities`
Seeded reference table. See taxonomy in `01-product-spec.md`.

```sql
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
```

### `venues`

```sql
create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  google_place_id text unique,
  google_types text[] not null default '{}',   -- Places types; drives the residential check
  photo_refs text[] not null default '{}',     -- Google photo references, NOT image bytes
  photo_attribution text[] not null default '{}',
  photos_refreshed_at timestamptz,
  maps_url text,
  price_level int,
  active_hours jsonb,
  activity_tags text[] not null default '{}',
  is_partner boolean not null default false,
  partner_perk text,                     -- "15% off for Trio crews"
  partner_since date,
  verified_public boolean not null default false,  -- confirmed a public place
  active boolean not null default true,
  created_at timestamptz not null default now()
);
```

**Do not download and store Google's place photos.** Google's Places terms let you cache a `place_id` indefinitely, but other Place content — including photos — may only be cached temporarily, and required attribution must be displayed wherever a photo appears. So: store the photo *reference* and the attribution string, refresh both every 30 days via `photos_refreshed_at`, and render images through the Places Photo endpoint at request time. Partner venues are the exception — those photos are uploaded by us to the `venues` bucket and are ours to serve.

### `gigs`

```sql
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
```

### `gig_crew`
The slot table. One row per claimed slot.

```sql
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
```

### `gig_messages`
Lobby chat. Scoped to the gig, dies with it.

```sql
create table gig_messages (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  user_id uuid references profiles on delete set null,
  body text not null check (char_length(body) between 1 and 1000),
  system_kind text,                      -- non-null for system messages ('joined','left','locked')
  created_at timestamptz not null default now()
);
create index on gig_messages (gig_id, created_at);
```

### `checkins`
Who confirms they saw whom. Drives attendance.

```sql
create table checkins (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  confirmer_id uuid not null references profiles on delete cascade,
  subject_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  unique (gig_id, confirmer_id, subject_id),
  check (confirmer_id <> subject_id)
);
```

**Attendance rule:** a crew member is marked `attended` when **at least 2 other crew members** confirm them. This is exactly why minimum crew is 3 — the witness rule and the no-date rule are the same rule. With a crew of 3 that means unanimous, which is correct: at that size, one person's word shouldn't decide another's record.

### `crew_removals`
Audit log. Every host removal, permanently.

```sql
create table crew_removals (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs on delete cascade,
  actor_id uuid not null references profiles,   -- host or admin
  target_id uuid not null references profiles,
  reason text not null check (char_length(reason) >= 10),
  created_at timestamptz not null default now()
);
create index on crew_removals (actor_id, created_at);
```

### `reports`, `moderation_actions`, `reliability_events`

```sql
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles,
  target_id uuid not null references profiles,
  gig_id uuid references gigs on delete set null,
  category text not null,                -- see 06-trust-and-safety.md
  details text not null,
  status report_status not null default 'open',
  resolution text,
  handled_by uuid references profiles,
  created_at timestamptz not null default now()
);

create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles,
  target_id uuid not null references profiles,
  action mod_action not null,
  reason text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table reliability_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  gig_id uuid references gigs on delete set null,
  kind reliability_kind not null,
  weight int not null default 1,
  created_at timestamptz not null default now()
);
create index on reliability_events (user_id, created_at);
```

### `verification_requests`
See `05-verification.md` for the flow.

```sql
create table verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  challenge jsonb not null,              -- { code: '4821', actions: ['turn_left','show_fingers_3'] }
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
```

### `friend_requests`

```sql
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
```

Requests expire after 14 days. The sender is never told a request was *declined* — declined and expired look identical to them. Re-requesting the same person is blocked for 90 days after any terminal state, enforced in `send_friend_request()`.

### `friendships`

Stored once per pair, not twice. Always insert with the lower UUID first.

```sql
create table friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references profiles on delete cascade,
  user_b uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);
create index on friendships (user_b);
```

### `blocks`

Stronger than unfriending and directional in creation, symmetric in effect.

```sql
create table blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references profiles on delete cascade,
  blocked_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
```

A block: drops any friendship, cancels pending requests both ways, hides each user's gigs from the other's feed, and makes `claim_slot()` refuse if the other party is already crew. It is never disclosed to the blocked person — they simply stop seeing those gigs. Because the feed is blind (R5), nothing about who is in a gig leaks from a gig's absence.

### `perk_redemptions`
Proof-of-value for partner venues. See `08-monetization.md`.

```sql
create table perk_redemptions (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues,
  gig_id uuid not null references gigs,
  crew_size int not null,
  redeemed_at timestamptz not null default now(),
  unique (gig_id)
);
```

## Claiming a slot

**Never do this from the client, and never as a read-then-write.** Two people tapping join at the same moment on the last slot must not both succeed.

```sql
create or replace function claim_slot(p_gig_id uuid)
returns gig_crew
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gig gigs;
  v_user uuid := auth.uid();
  v_pos int;
  v_row gig_crew;
  v_profile profiles;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select * into v_profile from profiles where id = v_user;
  if v_profile.suspended_until is not null and v_profile.suspended_until > now() then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;

  -- lock the gig row for the duration of the transaction
  select * into v_gig from gigs where id = p_gig_id for update;

  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if now() >= v_gig.locks_at then raise exception 'gig_locked'; end if;
  if v_gig.claimed_count >= v_gig.capacity then raise exception 'gig_full'; end if;
  if v_gig.host_id = v_user then raise exception 'already_in_crew'; end if;
  if exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = v_user and state = 'claimed') then
    raise exception 'already_in_crew';
  end if;

  -- refuse if anyone already in the crew is on a block list either way
  if exists (
    select 1 from gig_crew c
    join blocks b
      on (b.blocker_id = v_user and b.blocked_id = c.user_id)
      or (b.blocker_id = c.user_id and b.blocked_id = v_user)
    where c.gig_id = p_gig_id and c.state = 'claimed'
  ) then
    -- deliberately indistinguishable from a full gig: never confirm a block to either party
    raise exception 'gig_full';
  end if;

  select coalesce(max(position), 0) + 1 into v_pos from gig_crew where gig_id = p_gig_id;

  insert into gig_crew (gig_id, user_id, position)
  values (p_gig_id, v_user, v_pos)
  returning * into v_row;

  return v_row;
end;
$$;
```

`claimed_count` is maintained by an `AFTER INSERT OR UPDATE OR DELETE` trigger on `gig_crew` counting rows with `state = 'claimed'`. The application never writes it.

Map exception messages to friendly copy in the server action. The copy strings live in `lib/copy.ts` — see `09-copy-and-legal.md` § Errors.

## RLS policies

The important ones. Write the rest by the same logic: default deny, grant narrowly.

**`profiles`** — everyone authenticated can read the public shape; a helper view handles field-level hiding.

```sql
alter table profiles enable row level security;

create policy "read own" on profiles for select
  using (id = auth.uid());

create policy "read others" on profiles for select
  using (auth.uid() is not null);

create policy "update own" on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
```

Field-level rules (`is_admin`, `suspended_until`, `verification_status` writes) are enforced by only exposing a `profiles_public` view to the client and keeping privileged column writes in server-side code. Never let a client update `verification_status`, `reliability_band`, `is_admin`, or `suspended_until`.

**`gigs`** — open gigs are readable by any authenticated user. This is safe because gigs carry no crew identity.

```sql
create policy "read open gigs" on gigs for select
  using (auth.uid() is not null and status in ('open','locked','completed'));

create policy "host creates" on gigs for insert
  with check (host_id = auth.uid());

create policy "host updates own open gig" on gigs for update
  using (host_id = auth.uid() and status = 'open');
```

**`gig_crew`** — this is the policy that implements the blind feed. Crew identity is visible only to crew.

```sql
create policy "crew reads crew" on gig_crew for select
  using (
    exists (
      select 1 from gig_crew me
      where me.gig_id = gig_crew.gig_id
        and me.user_id = auth.uid()
        and me.state in ('claimed','attended','no_show')
    )
  );

create policy "leave own slot" on gig_crew for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

There is deliberately **no insert policy** on `gig_crew`. Slots are only created through `claim_slot()`, which is `security definer`. This is what makes R2 (first-come-first-served) structurally true rather than a UI convention.

**`gig_messages`** — crew only, **and only once the gig has confirmed**. This is R8, and it belongs in the policy rather than the UI: with two people in a lobby, an open chat is a private one-to-one thread between strangers.

```sql
create or replace function gig_is_confirmed(p_gig_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select claimed_count >= min_to_confirm from gigs where id = p_gig_id;
$$;

create policy "crew reads messages" on gig_messages for select
  using (
    gig_is_confirmed(gig_messages.gig_id)
    and exists (select 1 from gig_crew c where c.gig_id = gig_messages.gig_id
                and c.user_id = auth.uid() and c.state in ('claimed','attended','no_show'))
  );

create policy "crew writes messages" on gig_messages for insert
  with check (
    user_id = auth.uid()
    and gig_is_confirmed(gig_messages.gig_id)
    and exists (select 1 from gig_crew c where c.gig_id = gig_messages.gig_id
                and c.user_id = auth.uid() and c.state = 'claimed')
  );
```

Realtime: subscribe to `postgres_changes` on `gig_messages` filtered by `gig_id`. Realtime respects RLS, so a pre-confirmation lobby receives nothing — but still hide the composer in the UI rather than letting people type into a void.

**`friend_requests` / `friendships` / `blocks`**

```sql
create policy "see own requests" on friend_requests for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "respond to own incoming" on friend_requests for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy "see own friendships" on friendships for select
  using (user_a = auth.uid() or user_b = auth.uid());

create policy "manage own blocks" on blocks for all
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());
```

No insert policy on `friend_requests` or `friendships` — both go through `security definer` functions, because the shared-attendance requirement (R9) and the 90-day re-request rule have to be enforced server-side:

```sql
create or replace function send_friend_request(p_recipient uuid, p_gig_id uuid)
returns friend_requests
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_row friend_requests;
begin
  -- R9: both must have ATTENDED the same completed gig
  if not exists (
    select 1 from gig_crew a join gig_crew b on a.gig_id = b.gig_id
    join gigs g on g.id = a.gig_id
    where a.gig_id = p_gig_id and g.status = 'completed'
      and a.user_id = v_user   and a.state = 'attended'
      and b.user_id = p_recipient and b.state = 'attended'
  ) then
    raise exception 'no_shared_attendance';
  end if;

  if exists (select 1 from blocks
             where (blocker_id = v_user and blocked_id = p_recipient)
                or (blocker_id = p_recipient and blocked_id = v_user)) then
    raise exception 'not_available';
  end if;

  if exists (select 1 from friend_requests
             where sender_id = v_user and recipient_id = p_recipient
               and created_at > now() - interval '90 days'
               and status in ('declined','expired')) then
    raise exception 'recently_asked';
  end if;

  if (select count(*) from friend_requests
      where sender_id = v_user and status = 'pending') >= 20 then
    raise exception 'too_many_pending';
  end if;

  insert into friend_requests (sender_id, recipient_id, gig_id)
  values (v_user, p_recipient, p_gig_id)
  returning * into v_row;
  return v_row;
end;
$$;
```

`accept_friend_request()` inserts into `friendships` with the pair ordered by UUID and stamps the request `accepted`. `block_user()` deletes the friendship, cancels pending requests both ways, and inserts the block — all in one transaction.

**Friend-hosted gigs in the feed** (the single exception to the blind feed, R5) comes from a view, not from relaxing the `gig_crew` policy:

```sql
create view friend_hosted_gigs as
  select g.*, p.display_name as host_name, p.avatar_path as host_avatar
  from gigs g
  join profiles p on p.id = g.host_id
  join friendships f
    on (f.user_a = auth.uid() and f.user_b = g.host_id)
    or (f.user_b = auth.uid() and f.user_a = g.host_id)
  where g.status = 'open';
```

Note it joins on `g.host_id` only. Gigs a friend has merely *joined* are not reachable through this view, by design.

**`verification_requests`** — the user can insert and read their own row's *status*. Nobody but an admin (service role) reads `media_path`.

```sql
create policy "insert own request" on verification_requests for insert
  with check (user_id = auth.uid());

create policy "read own request" on verification_requests for select
  using (user_id = auth.uid());
```

Expose only `id, status, created_at, review_note` to the client via a view. The client must never receive `media_path`.

**`reports`, `moderation_actions`, `crew_removals`, `reliability_events`** — insert-only where relevant, no client read at all. All reads are admin, server-side, via service role.

## Storage buckets

| Bucket | Public | Contents | Policy |
|---|---|---|---|
| `avatars` | yes | profile photos | owner writes `{user_id}/*`, world reads |
| `verification` | **no** | liveness recordings | no client read or list. Writes allowed to own prefix `{user_id}/*` only. Admin reads via short-lived signed URL from server. Auto-purged — see `05-verification.md` |
| `venues` | yes | partner venue photos | admin writes |

## Scheduled jobs (Edge Functions + `pg_cron`)

| Job | Cadence | Does |
|---|---|---|
| `lock-gigs` | every 5 min | Moves `open` → `locked` at `locks_at`. If `claimed_count < min_to_confirm`, moves to `cancelled` with reason `under_filled` and notifies crew. |
| `complete-gigs` | every 15 min | After `starts_at + duration + 3h`, resolves check-ins, writes `reliability_events`, sets `completed`. |
| `purge-verification-media` | daily | Deletes objects for requests reviewed more than 7 days ago; stamps `media_purged_at`. |
| `recompute-bands` | daily | Recomputes `reliability_band` from `reliability_events`. |
