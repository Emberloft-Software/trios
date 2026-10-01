-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0002 functions & triggers.
-- Every mutating helper is SECURITY DEFINER with a pinned search_path. This is
-- where the product rules become structurally true (capacity, audience filters,
-- invite seats, crew votes, chat-at-confirmation, blocks). Execute grants are
-- deliberately narrow — see the bottom of 0003.
-- ═════════════════════════════════════════════════════════════════════════════

-- ── small helpers ────────────────────────────────────────────────────────────
create or replace function age_years(p_birth date)
returns int language sql stable set search_path = public as $$
  select case when p_birth is null then null
              else extract(year from age(current_date, p_birth))::int end;
$$;

create or replace function is_admin(p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = p_user), false);
$$;

create or replace function is_gig_crew(p_gig_id uuid, p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from gig_crew
    where gig_id = p_gig_id and user_id = p_user
      and state in ('claimed','attended','no_show')
  );
$$;

create or replace function is_blocked_pair(p_a uuid, p_b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from blocks
    where (blocker_id = p_a and blocked_id = p_b)
       or (blocker_id = p_b and blocked_id = p_a)
  );
$$;

-- Does the CURRENT viewer fall inside a gig's audience? Unknown age/gender
-- never matches (the app routes those users through onboarding first).
create or replace function viewer_matches(p_age_min int, p_age_max int, p_pref gig_gender)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select age_years(p.birth_date) between p_age_min and p_age_max
       and (p_pref = 'everyone'
            or (p_pref = 'women' and p.gender = 'woman')
            or (p_pref = 'men'   and p.gender = 'man'))
    from profiles p where p.id = auth.uid()
  ), false);
$$;

create or replace function user_matches(p_user uuid, p_age_min int, p_age_max int, p_pref gig_gender)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select age_years(p.birth_date) between p_age_min and p_age_max
       and (p_pref = 'everyone'
            or (p_pref = 'women' and p.gender = 'woman')
            or (p_pref = 'men'   and p.gender = 'man'))
    from profiles p where p.id = p_user
  ), false);
$$;

-- Chat opens when the crew (app members + seats the host is holding) reaches
-- the minimum AND at least two app members are in — a host alone with their
-- reserved seats has nobody to talk to yet.
create or replace function gig_is_confirmed(p_gig_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select claimed_count + reserved_slots >= min_to_confirm and claimed_count >= 2
    from gigs where id = p_gig_id
  ), false);
$$;

create or replace function enqueue_notification(p_user uuid, p_kind text, p_gig uuid, p_payload jsonb default '{}')
returns void language sql security definer set search_path = public as $$
  insert into notification_outbox (user_id, kind, gig_id, payload)
  values (p_user, p_kind, p_gig, coalesce(p_payload, '{}'::jsonb));
$$;

-- ── profiles: create on signup ───────────────────────────────────────────────
-- Reads display_name / handle / birth_date / gender / accepted_terms from the
-- signup metadata. Under-18 signups are refused outright. Emails on the
-- admin_allowlist become admins.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_req text;
  v_base text;
  v_handle citext;
  v_name text;
  v_try int := 0;
  v_birth date;
  v_gender gender_identity;
begin
  v_req := regexp_replace(lower(coalesce(v_meta->>'handle', '')), '[^a-z0-9_]', '', 'g');
  v_base := coalesce(
    nullif(v_req, ''),
    regexp_replace(lower(coalesce(split_part(new.email, '@', 1), 'amigo')), '[^a-z0-9_]', '', 'g')
  );
  if char_length(v_base) < 3 then v_base := v_base || 'amigo'; end if;
  v_base := left(v_base, 20);
  v_name := left(coalesce(nullif(trim(v_meta->>'display_name'), ''), initcap(v_base)), 40);

  begin
    v_birth := nullif(v_meta->>'birth_date', '')::date;
  exception when others then v_birth := null;
  end;
  if v_birth is not null and age_years(v_birth) < 18 then
    raise exception 'underage' using errcode = 'P0001';
  end if;
  if v_birth is not null and age_years(v_birth) > 100 then v_birth := null; end if;

  begin
    v_gender := nullif(v_meta->>'gender', '')::gender_identity;
  exception when others then v_gender := null;
  end;

  v_handle := v_base::citext;
  while exists (select 1 from profiles where handle = v_handle) loop
    v_try := v_try + 1;
    v_handle := (left(v_base, 16) || '_' || substr(md5(gen_random_uuid()::text), 1, 3))::citext;
    if v_try > 6 then
      v_handle := ('amigo_' || substr(md5(gen_random_uuid()::text), 1, 8))::citext;
      exit;
    end if;
  end loop;

  insert into profiles (id, handle, display_name, birth_date, gender, is_admin, accepted_terms_at)
  values (
    new.id, v_handle, v_name, v_birth, v_gender,
    exists (select 1 from admin_allowlist where email = new.email::citext),
    case when v_meta->>'accepted_terms' = 'true' then now() end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Username availability, callable before signup.
create or replace function check_handle(p_handle text)
returns boolean language sql stable security definer set search_path = public as $$
  select not exists (
    select 1 from profiles
    where handle = regexp_replace(lower(p_handle), '[^a-z0-9_]', '', 'g')::citext
  );
$$;

-- Onboarding for accounts missing age/gender. Write-once: after it's set only
-- an admin can change it, so nobody edits their age to slip into a gig.
create or replace function complete_profile(p_birth_date date, p_gender gender_identity, p_accept_terms boolean default true)
returns profiles language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_row profiles;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if p_birth_date is null or p_gender is null then raise exception 'profile_incomplete'; end if;
  if age_years(p_birth_date) < 18 then raise exception 'underage'; end if;
  if age_years(p_birth_date) > 100 then raise exception 'bad_birth_date'; end if;

  update profiles
  set birth_date = coalesce(birth_date, p_birth_date),
      gender = coalesce(gender, p_gender),
      accepted_terms_at = case when p_accept_terms then coalesce(accepted_terms_at, now()) else accepted_terms_at end
  where id = v_user
  returning * into v_row;
  return v_row;
end;
$$;

-- ── codes ────────────────────────────────────────────────────────────────────
create or replace function gen_gig_code(p_activity_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_prefix text;
  v_code text;
  v_alpha text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_i int;
begin
  select upper(substr(regexp_replace(slug, '[^a-z]', '', 'g'), 1, 3))
    into v_prefix from activities where id = p_activity_id;
  v_prefix := coalesce(nullif(v_prefix, ''), 'GIG');
  loop
    v_code := v_prefix || '-';
    for v_i in 1..4 loop
      v_code := v_code || substr(v_alpha, 1 + floor(random() * length(v_alpha))::int, 1);
    end loop;
    exit when not exists (select 1 from gigs where code = v_code);
  end loop;
  return v_code;
end;
$$;

-- Long, unguessable code for the host's share link (/join/<code>).
create or replace function gen_invite_code()
returns text language plpgsql security definer set search_path = public as $$
declare
  v_alpha text := 'abcdefghjkmnpqrstuvwxyz23456789';
  v_code text;
  v_i int;
begin
  loop
    v_code := '';
    for v_i in 1..10 loop
      v_code := v_code || substr(v_alpha, 1 + floor(random() * length(v_alpha))::int, 1);
    end loop;
    exit when not exists (select 1 from gigs where invite_code = v_code);
  end loop;
  return v_code;
end;
$$;

-- ── claimed_count maintenance ────────────────────────────────────────────────
create or replace function sync_claimed_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_gig uuid;
begin
  v_gig := coalesce(new.gig_id, old.gig_id);
  update gigs g
    set claimed_count = (
      select count(*) from gig_crew c where c.gig_id = v_gig and c.state = 'claimed'
    )
  where g.id = v_gig;
  return null;
end;
$$;

create trigger trg_sync_claimed_count
  after insert or update or delete on gig_crew
  for each row execute function sync_claimed_count();

-- ── internal: restriction + block checks, crew insert, confirmation ──────────
create or replace function _assert_can_join(p_user uuid)
returns profiles language plpgsql stable security definer set search_path = public as $$
declare v_profile profiles;
begin
  select * into v_profile from profiles where id = p_user;
  if not found then raise exception 'profile_missing' using errcode = 'P0001'; end if;
  if v_profile.birth_date is null or v_profile.gender is null then
    raise exception 'profile_incomplete' using errcode = 'P0001';
  end if;
  if v_profile.suspended_until is not null and v_profile.suspended_until > now() then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;
  if v_profile.joining_restricted_until is not null and v_profile.joining_restricted_until > now() then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;
  if v_profile.reliability_band = 'restricted' then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;
  return v_profile;
end;
$$;

create or replace function _blocked_with_crew(p_gig_id uuid, p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from gig_crew c
    join blocks b
      on (b.blocker_id = p_user and b.blocked_id = c.user_id)
      or (b.blocker_id = c.user_id and b.blocked_id = p_user)
    where c.gig_id = p_gig_id and c.state = 'claimed'
  );
$$;

-- Adds (or re-adds after a voluntary leave) a crew row. A 'removed' row means
-- the host or crew voted them out — they can't come back to this gig.
create or replace function _crew_join(p_gig_id uuid, p_user uuid, p_via join_route)
returns gig_crew language plpgsql security definer set search_path = public as $$
declare v_existing gig_crew; v_pos int; v_row gig_crew;
begin
  select * into v_existing from gig_crew where gig_id = p_gig_id and user_id = p_user;
  select coalesce(max(position), 0) + 1 into v_pos from gig_crew where gig_id = p_gig_id;

  if v_existing.id is not null then
    if v_existing.state = 'claimed' then raise exception 'already_in_crew'; end if;
    if v_existing.state = 'removed' then raise exception 'removed_from_gig'; end if;
    update gig_crew
      set state = 'claimed', position = v_pos, joined_via = p_via, claimed_at = now(), left_at = null
      where id = v_existing.id
      returning * into v_row;
    return v_row;
  end if;

  insert into gig_crew (gig_id, user_id, position, joined_via)
  values (p_gig_id, p_user, v_pos, p_via)
  returning * into v_row;
  return v_row;
end;
$$;

-- Fires the one-time "it's on" moment when a join tips the gig over minimum.
create or replace function _maybe_confirm(p_gig_id uuid, p_was_confirmed boolean)
returns void language plpgsql security definer set search_path = public as $$
declare m record;
begin
  if p_was_confirmed or not gig_is_confirmed(p_gig_id) then return; end if;
  insert into gig_messages (gig_id, user_id, body, system_kind)
  values (p_gig_id, null, 'confirmed', 'confirmed');
  for m in select user_id from gig_crew where gig_id = p_gig_id and state = 'claimed' loop
    perform enqueue_notification(m.user_id, 'gig_confirmed', p_gig_id, '{}');
  end loop;
end;
$$;

-- ── create_gig ───────────────────────────────────────────────────────────────
create or replace function create_gig(
  p_activity_id  uuid,
  p_title        text,
  p_venue_id     uuid,
  p_place_label  text,
  p_lat          double precision,
  p_lng          double precision,
  p_starts_at    timestamptz,
  p_capacity     int,
  p_duration_min int        default 90,
  p_notes        text       default null,
  p_cost_note    text       default null,
  p_age_min      int        default 18,
  p_age_max      int        default 99,
  p_gender_pref  gig_gender default 'everyone',
  p_host_guests  int        default 0
)
returns gigs
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_profile profiles;
  v_gig gigs;
  v_age int;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  select * into v_profile from profiles where id = v_user;
  if not found then raise exception 'profile_missing' using errcode = 'P0001'; end if;
  if v_profile.birth_date is null or v_profile.gender is null then
    raise exception 'profile_incomplete' using errcode = 'P0001';
  end if;
  if v_profile.suspended_until is not null and v_profile.suspended_until > now() then
    raise exception 'account_restricted' using errcode = 'P0001';
  end if;
  if v_profile.posting_restricted_until is not null and v_profile.posting_restricted_until > now() then
    raise exception 'posting_restricted' using errcode = 'P0001';
  end if;

  if p_capacity < 3 then raise exception 'capacity_too_low' using errcode = 'P0001'; end if;
  if p_capacity > 16 then raise exception 'capacity_too_high' using errcode = 'P0001'; end if;
  if coalesce(p_host_guests, 0) < 0 or coalesce(p_host_guests, 0) > p_capacity - 2 then
    raise exception 'too_many_guests' using errcode = 'P0001';
  end if;
  if p_age_min < 18 or p_age_max > 99 or p_age_min > p_age_max then
    raise exception 'bad_age_range' using errcode = 'P0001';
  end if;

  -- The host is part of the group, so they must fit their own audience.
  v_age := age_years(v_profile.birth_date);
  if v_age < p_age_min or v_age > p_age_max then
    raise exception 'host_outside_age_range' using errcode = 'P0001';
  end if;
  if (p_gender_pref = 'women' and v_profile.gender <> 'woman')
     or (p_gender_pref = 'men' and v_profile.gender <> 'man') then
    raise exception 'host_gender_mismatch' using errcode = 'P0001';
  end if;

  if p_starts_at < now() + interval '3 hours' then raise exception 'starts_too_soon' using errcode = 'P0001'; end if;
  if p_starts_at > now() + interval '60 days' then raise exception 'starts_too_far' using errcode = 'P0001'; end if;

  if (select count(*) from gigs where host_id = v_user and status in ('open','locked') and starts_at > now()) >= 5 then
    raise exception 'too_many_open_gigs' using errcode = 'P0001';
  end if;

  insert into gigs (
    code, invite_code, host_id, activity_id, title, notes, venue_id, place_label,
    lat, lng, starts_at, duration_min, capacity, cost_note, locks_at,
    age_min, age_max, gender_pref, host_guests, reserved_slots
  ) values (
    gen_gig_code(p_activity_id), gen_invite_code(), v_user, p_activity_id, p_title, p_notes,
    p_venue_id, p_place_label, p_lat, p_lng, p_starts_at, p_duration_min, p_capacity,
    p_cost_note, p_starts_at - interval '2 hours',
    p_age_min, p_age_max, p_gender_pref, coalesce(p_host_guests, 0), coalesce(p_host_guests, 0)
  )
  returning * into v_gig;

  insert into gig_crew (gig_id, user_id, position, state, joined_via)
  values (v_gig.id, v_user, 1, 'claimed', 'host');

  select * into v_gig from gigs where id = v_gig.id;
  return v_gig;
end;
$$;

-- ── claim_slot (public join) ─────────────────────────────────────────────────
-- Row-locked. Two people tapping the last slot: exactly one wins. Enforces the
-- audience filter — the feed hides non-matching gigs, and this makes sure a
-- direct link can't sneak around it.
create or replace function claim_slot(p_gig_id uuid)
returns gig_crew
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_gig gigs;
  v_row gig_crew;
  v_was boolean;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  perform _assert_can_join(v_user);

  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if now() >= v_gig.locks_at then raise exception 'gig_locked'; end if;
  if v_gig.host_id = v_user then raise exception 'already_in_crew'; end if;
  if not user_matches(v_user, v_gig.age_min, v_gig.age_max, v_gig.gender_pref) then
    raise exception 'not_eligible';
  end if;
  if v_gig.claimed_count + v_gig.reserved_slots >= v_gig.capacity then raise exception 'gig_full'; end if;
  -- indistinguishable from a full gig: never confirm a block
  if _blocked_with_crew(p_gig_id, v_user) then raise exception 'gig_full'; end if;

  v_was := gig_is_confirmed(p_gig_id);
  v_row := _crew_join(p_gig_id, v_user, 'public');
  perform _maybe_confirm(p_gig_id, v_was);
  return v_row;
end;
$$;

-- ── invite link ──────────────────────────────────────────────────────────────
-- What someone sees when they open a host's share link. Callable signed-out
-- so the link preview works before they make an account.
create or replace function invite_preview(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', g.id,
    'title', g.title,
    'status', g.status,
    'starts_at', g.starts_at,
    'duration_min', g.duration_min,
    'place_label', g.place_label,
    'capacity', g.capacity,
    'claimed_count', g.claimed_count,
    'reserved_slots', g.reserved_slots,
    'host_guests', g.host_guests,
    'activity_name', a.name,
    'activity_emoji', a.emoji,
    'host_name', split_part(p.display_name, ' ', 1),
    'locks_at', g.locks_at
  )
  from gigs g
  join activities a on a.id = g.activity_id
  join profiles p on p.id = g.host_id
  where g.invite_code = lower(trim(p_code));
$$;

-- Join through the host's link. Skips the audience filter (the host is
-- vouching for this person) and takes one of the host's reserved seats if any
-- are left, otherwise an open slot. Every other rule still applies.
create or replace function join_by_invite(p_code text)
returns gigs
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_gig gigs;
  v_was boolean;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  perform _assert_can_join(v_user);

  select * into v_gig from gigs where invite_code = lower(trim(p_code)) for update;
  if not found then raise exception 'invite_not_found'; end if;
  if v_gig.host_id = v_user then raise exception 'already_in_crew'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if now() >= v_gig.locks_at then raise exception 'gig_locked'; end if;
  if is_blocked_pair(v_user, v_gig.host_id) or _blocked_with_crew(v_gig.id, v_user) then
    raise exception 'gig_full';
  end if;

  v_was := gig_is_confirmed(v_gig.id);
  if v_gig.reserved_slots > 0 then
    perform _crew_join(v_gig.id, v_user, 'invite');
    update gigs set reserved_slots = reserved_slots - 1 where id = v_gig.id;
  elsif v_gig.claimed_count + v_gig.reserved_slots < v_gig.capacity then
    perform _crew_join(v_gig.id, v_user, 'invite');
  else
    raise exception 'gig_full';
  end if;
  perform _maybe_confirm(v_gig.id, v_was);

  select * into v_gig from gigs where id = v_gig.id;
  return v_gig;
end;
$$;

-- Host can release reserved seats they no longer need (back to the public).
create or replace function release_reserved_slot(p_gig_id uuid)
returns gigs language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs;
begin
  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if v_gig.reserved_slots <= 0 then raise exception 'nothing_reserved'; end if;
  update gigs set reserved_slots = reserved_slots - 1,
                  host_guests = greatest(host_guests - 1, 0)
  where id = p_gig_id returning * into v_gig;
  return v_gig;
end;
$$;

-- ── leave_gig ────────────────────────────────────────────────────────────────
-- Two doors. p_uncomfortable = true never costs anything. A post-lock ordinary
-- leave records a late_leave.
create or replace function leave_gig(p_gig_id uuid, p_uncomfortable boolean default false)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_gig gigs;
  v_state crew_state;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id = v_user then raise exception 'host_cannot_leave'; end if;

  select state into v_state from gig_crew where gig_id = p_gig_id and user_id = v_user;
  if v_state is null or v_state <> 'claimed' then raise exception 'not_in_crew'; end if;

  update gig_crew set state = 'left', left_at = now()
  where gig_id = p_gig_id and user_id = v_user;

  -- their open votes no longer count
  delete from kick_votes where gig_id = p_gig_id and voter_id = v_user;

  if not p_uncomfortable and v_gig.status = 'locked' then
    insert into reliability_events (user_id, gig_id, kind, weight)
    values (v_user, p_gig_id, 'late_leave', 1);
  end if;

  insert into gig_messages (gig_id, user_id, body, system_kind)
  values (p_gig_id, null, 'left', 'left');
end;
$$;

-- ── remove_crew_member (host power) ──────────────────────────────────────────
-- Rate-limited: 1 per gig, 3 per host per rolling 30 days. Logged permanently.
create or replace function remove_crew_member(p_gig_id uuid, p_target uuid, p_reason text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if char_length(coalesce(p_reason, '')) < 10 then raise exception 'reason_too_short'; end if;

  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if p_target = v_user then raise exception 'cannot_remove_self'; end if;
  if v_gig.status not in ('open','locked') then raise exception 'gig_not_active'; end if;

  if exists (select 1 from crew_removals where gig_id = p_gig_id and actor_id = v_user and kind = 'host') then
    raise exception 'already_removed_from_gig';
  end if;
  if (select count(*) from crew_removals
      where actor_id = v_user and kind = 'host' and created_at > now() - interval '30 days') >= 3 then
    raise exception 'removal_limit_reached';
  end if;

  update gig_crew set state = 'removed', left_at = now()
  where gig_id = p_gig_id and user_id = p_target and state = 'claimed';
  if not found then raise exception 'target_not_in_crew'; end if;

  insert into crew_removals (gig_id, actor_id, target_id, kind, reason)
  values (p_gig_id, v_user, p_target, 'host', p_reason);

  delete from kick_votes where gig_id = p_gig_id and (target_id = p_target or voter_id = p_target);

  insert into gig_messages (gig_id, user_id, body, system_kind)
  values (p_gig_id, null, 'removed', 'removed');

  perform enqueue_notification(p_target, 'removed', p_gig_id, '{}');
end;
$$;

-- ── crew votes ───────────────────────────────────────────────────────────────
-- Once chat is open, any member can vote to remove another member (not the
-- host — report the host instead). A strict majority of the OTHER members,
-- and never fewer than 2 votes, removes them. Votes are anonymous to the crew;
-- the outcome becomes an admin report with every reason attached.
create or replace function cast_kick_vote(p_gig_id uuid, p_target uuid, p_reason text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_gig gigs;
  v_eligible int;
  v_votes int;
  v_needed int;
  v_reasons text;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if char_length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'reason_too_short'; end if;

  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.status not in ('open','locked') then raise exception 'gig_not_active'; end if;
  if not gig_is_confirmed(p_gig_id) then raise exception 'chat_not_open'; end if;
  if p_target = v_user then raise exception 'cannot_vote_self'; end if;
  if p_target = v_gig.host_id then raise exception 'cannot_kick_host'; end if;
  if not exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = v_user and state = 'claimed') then
    raise exception 'not_in_crew';
  end if;
  if not exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = p_target and state = 'claimed') then
    raise exception 'target_not_in_crew';
  end if;

  select count(*) into v_eligible from gig_crew
  where gig_id = p_gig_id and state = 'claimed' and user_id <> p_target;
  if v_eligible < 2 then raise exception 'not_enough_voters'; end if;

  insert into kick_votes (gig_id, target_id, voter_id, reason)
  values (p_gig_id, p_target, v_user, left(trim(p_reason), 300))
  on conflict (gig_id, target_id, voter_id) do update set reason = excluded.reason, created_at = now();

  select count(*) into v_votes
  from kick_votes k
  join gig_crew c on c.gig_id = k.gig_id and c.user_id = k.voter_id and c.state = 'claimed'
  where k.gig_id = p_gig_id and k.target_id = p_target;

  v_needed := greatest(2, (v_eligible / 2) + 1);

  if v_votes >= v_needed then
    select string_agg(reason, ' | ') into v_reasons
    from kick_votes where gig_id = p_gig_id and target_id = p_target;

    update gig_crew set state = 'removed', left_at = now()
    where gig_id = p_gig_id and user_id = p_target;

    insert into crew_removals (gig_id, actor_id, target_id, kind, reason)
    values (p_gig_id, null, p_target, 'vote', coalesce(v_reasons, 'crew vote'));

    delete from kick_votes where gig_id = p_gig_id and voter_id = p_target;

    insert into gig_messages (gig_id, user_id, body, system_kind)
    values (p_gig_id, null, 'vote_removed', 'vote_removed');

    insert into reports (reporter_id, target_id, gig_id, category, details)
    values (v_user, p_target, p_gig_id, 'crew_vote_removal',
            'Removed from the chat by a crew vote (' || v_votes || ' of ' || v_eligible || '). Reasons: ' || coalesce(v_reasons, '—'));

    perform enqueue_notification(p_target, 'removed_by_vote', p_gig_id, '{}');
    return jsonb_build_object('votes', v_votes, 'needed', v_needed, 'removed', true);
  end if;

  return jsonb_build_object('votes', v_votes, 'needed', v_needed, 'removed', false);
end;
$$;

create or replace function retract_kick_vote(p_gig_id uuid, p_target uuid)
returns void language sql security definer set search_path = public as $$
  delete from kick_votes where gig_id = p_gig_id and target_id = p_target and voter_id = auth.uid();
$$;

-- Anonymous tallies for the lobby: per member, how many votes and how many are
-- needed, plus whether *I* voted. Never who voted.
create or replace function kick_vote_tallies(p_gig_id uuid)
returns table (target_id uuid, votes int, needed int, i_voted boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_gig_crew(p_gig_id) then return; end if;
  return query
  select c.user_id,
         (select count(*)::int from kick_votes k
            join gig_crew v on v.gig_id = k.gig_id and v.user_id = k.voter_id and v.state = 'claimed'
           where k.gig_id = p_gig_id and k.target_id = c.user_id),
         greatest(2, ((select count(*)::int from gig_crew o
                        where o.gig_id = p_gig_id and o.state = 'claimed' and o.user_id <> c.user_id) / 2) + 1),
         exists (select 1 from kick_votes k where k.gig_id = p_gig_id and k.target_id = c.user_id and k.voter_id = auth.uid())
  from gig_crew c
  where c.gig_id = p_gig_id and c.state = 'claimed';
end;
$$;

-- ── check-ins ────────────────────────────────────────────────────────────────
create or replace function check_in(p_gig_id uuid, p_subject uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_gig from gigs where id = p_gig_id;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.status <> 'locked' then raise exception 'checkin_closed'; end if;
  if now() < v_gig.starts_at - interval '30 minutes'
     or now() > v_gig.starts_at + (v_gig.duration_min || ' minutes')::interval + interval '3 hours' then
    raise exception 'checkin_closed';
  end if;
  if not exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = v_user and state = 'claimed') then
    raise exception 'not_in_crew';
  end if;
  if not exists (select 1 from gig_crew where gig_id = p_gig_id and user_id = p_subject and state = 'claimed') then
    raise exception 'target_not_in_crew';
  end if;
  insert into checkins (gig_id, confirmer_id, subject_id)
  values (p_gig_id, v_user, p_subject)
  on conflict do nothing;
end;
$$;

-- ── reports ──────────────────────────────────────────────────────────────────
create or replace function file_report(
  p_target uuid, p_category text, p_details text, p_gig_id uuid default null
)
returns reports
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_row reports; a record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if p_target = v_user then raise exception 'cannot_report_self'; end if;
  if char_length(trim(coalesce(p_details, ''))) < 1 then raise exception 'details_required'; end if;
  if (select count(*) from reports where reporter_id = v_user and created_at > now() - interval '1 day') >= 15 then
    raise exception 'too_many_reports';
  end if;

  insert into reports (reporter_id, target_id, gig_id, category, details)
  values (v_user, p_target, p_gig_id, p_category, left(p_details, 2000))
  returning * into v_row;

  if p_category in ('threat_or_violence','underage','sexual_advance') then
    for a in select id from profiles where is_admin loop
      perform enqueue_notification(a.id, 'admin_priority_report', p_gig_id,
        jsonb_build_object('report_id', v_row.id, 'category', p_category));
    end loop;
  end if;
  return v_row;
end;
$$;

-- ── friends ──────────────────────────────────────────────────────────────────
create or replace function send_friend_request(p_recipient uuid, p_gig_id uuid)
returns friend_requests
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_row friend_requests;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  if not exists (
    select 1 from gig_crew a join gig_crew b on a.gig_id = b.gig_id
    join gigs g on g.id = a.gig_id
    where a.gig_id = p_gig_id and g.status = 'completed'
      and a.user_id = v_user and a.state = 'attended'
      and b.user_id = p_recipient and b.state = 'attended'
  ) then
    raise exception 'no_shared_attendance';
  end if;

  if is_blocked_pair(v_user, p_recipient) then raise exception 'not_available'; end if;
  if exists (select 1 from friendships
             where user_a = least(v_user, p_recipient) and user_b = greatest(v_user, p_recipient)) then
    raise exception 'not_available';
  end if;
  if exists (select 1 from friend_requests
             where sender_id = v_user and recipient_id = p_recipient
               and created_at > now() - interval '90 days'
               and status in ('declined','expired')) then
    raise exception 'recently_asked';
  end if;
  if (select count(*) from friend_requests where sender_id = v_user and status = 'pending') >= 20 then
    raise exception 'too_many_pending';
  end if;

  insert into friend_requests (sender_id, recipient_id, gig_id)
  values (v_user, p_recipient, p_gig_id)
  returning * into v_row;

  perform enqueue_notification(p_recipient, 'friend_request', p_gig_id, jsonb_build_object('from', v_user));
  return v_row;
end;
$$;

create or replace function accept_friend_request(p_request_id uuid)
returns friendships
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_req friend_requests; v_fr friendships;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_req from friend_requests where id = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if v_req.recipient_id <> v_user then raise exception 'not_recipient'; end if;
  if v_req.status <> 'pending' then raise exception 'not_pending'; end if;

  update friend_requests set status = 'accepted', responded_at = now() where id = p_request_id;

  insert into friendships (user_a, user_b)
  values (least(v_req.sender_id, v_req.recipient_id), greatest(v_req.sender_id, v_req.recipient_id))
  on conflict do nothing
  returning * into v_fr;
  if v_fr.id is null then
    select * into v_fr from friendships
    where user_a = least(v_req.sender_id, v_req.recipient_id)
      and user_b = greatest(v_req.sender_id, v_req.recipient_id);
  end if;

  perform enqueue_notification(v_req.sender_id, 'friend_accepted', null, jsonb_build_object('from', v_user));
  return v_fr;
end;
$$;

create or replace function invite_friend(p_gig_id uuid, p_friend uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_gig from gigs where id = p_gig_id;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if not exists (select 1 from friendships
                 where user_a = least(v_user, p_friend) and user_b = greatest(v_user, p_friend)) then
    raise exception 'not_friends';
  end if;
  perform enqueue_notification(p_friend, 'friend_invite', p_gig_id,
    jsonb_build_object('from', v_user, 'invite_code', v_gig.invite_code));
end;
$$;

-- ── block_user ───────────────────────────────────────────────────────────────
create or replace function block_user(p_blocked uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); r record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if p_blocked = v_user then raise exception 'cannot_block_self'; end if;

  delete from friendships where user_a = least(v_user, p_blocked) and user_b = greatest(v_user, p_blocked);
  update friend_requests set status = 'declined', responded_at = now()
  where status = 'pending'
    and ((sender_id = v_user and recipient_id = p_blocked) or (sender_id = p_blocked and recipient_id = v_user));

  insert into blocks (blocker_id, blocked_id) values (v_user, p_blocked) on conflict do nothing;

  -- shared upcoming gigs: the later joiner leaves (never the host)
  for r in
    select ca.gig_id, ca.user_id as a_user, cb.user_id as b_user,
           ca.claimed_at as a_at, cb.claimed_at as b_at, g.host_id
    from gig_crew ca
    join gig_crew cb on ca.gig_id = cb.gig_id
    join gigs g on g.id = ca.gig_id
    where ca.user_id = v_user and cb.user_id = p_blocked
      and ca.state = 'claimed' and cb.state = 'claimed'
      and g.status in ('open','locked')
  loop
    if r.host_id = r.a_user then
      update gig_crew set state = 'removed', left_at = now() where gig_id = r.gig_id and user_id = r.b_user;
    elsif r.host_id = r.b_user then
      update gig_crew set state = 'removed', left_at = now() where gig_id = r.gig_id and user_id = r.a_user;
    elsif r.a_at <= r.b_at then
      update gig_crew set state = 'removed', left_at = now() where gig_id = r.gig_id and user_id = r.b_user;
    else
      update gig_crew set state = 'removed', left_at = now() where gig_id = r.gig_id and user_id = r.a_user;
    end if;
  end loop;
end;
$$;

-- ── reliability ──────────────────────────────────────────────────────────────
create or replace function recompute_reliability_band(p_user uuid)
returns reliability_band
language plpgsql security definer set search_path = public as $$
declare v_total int; v_noshow int; v_rate numeric; v_band reliability_band; v_suspended boolean;
begin
  select (suspended_until is not null and suspended_until > now()) into v_suspended from profiles where id = p_user;
  with last10 as (
    select kind from reliability_events
    where user_id = p_user and kind in ('attended','no_show','late_leave')
    order by created_at desc limit 10
  )
  select count(*), count(*) filter (where kind = 'no_show') into v_total, v_noshow from last10;

  if v_suspended then v_band := 'restricted';
  elsif v_total < 3 then v_band := 'new';
  else
    v_rate := v_noshow::numeric / v_total;
    if v_rate > 0.35 then v_band := 'restricted';
    elsif v_rate >= 0.10 then v_band := 'mixed';
    else v_band := 'reliable';
    end if;
  end if;
  update profiles set reliability_band = v_band where id = p_user;
  return v_band;
end;
$$;

-- ── partner perks ────────────────────────────────────────────────────────────
create or replace function redeem_perk(p_gig_id uuid, p_venue_id uuid)
returns perk_redemptions
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs; v_row perk_redemptions; v_size int;
begin
  select * into v_gig from gigs where id = p_gig_id;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.venue_id is distinct from p_venue_id then raise exception 'gig_not_found'; end if;
  if v_gig.status not in ('locked','completed') then raise exception 'gig_not_open'; end if;

  select count(*) into v_size from gig_crew where gig_id = p_gig_id and state in ('claimed','attended');
  insert into perk_redemptions (venue_id, gig_id, crew_size)
  values (p_venue_id, p_gig_id, greatest(v_size + v_gig.reserved_slots, 1))
  on conflict (gig_id) do nothing
  returning * into v_row;
  if v_row.id is null then raise exception 'already_redeemed'; end if;
  return v_row;
end;
$$;

create or replace function redeem_perk_by_code(p_slug text, p_code text)
returns perk_redemptions
language plpgsql security definer set search_path = public as $$
declare v_venue venues; v_gig gigs; v_size int; v_row perk_redemptions;
begin
  select * into v_venue from venues where slug = p_slug and is_partner;
  if not found then raise exception 'venue_not_found'; end if;
  select * into v_gig from gigs
  where upper(code) = upper(trim(p_code)) and venue_id = v_venue.id and status in ('locked','completed');
  if not found then raise exception 'gig_not_found'; end if;
  select count(*) into v_size from gig_crew where gig_id = v_gig.id and state in ('claimed','attended');
  insert into perk_redemptions (venue_id, gig_id, crew_size)
  values (v_venue.id, v_gig.id, greatest(v_size + v_gig.reserved_slots, 1))
  on conflict (gig_id) do nothing
  returning * into v_row;
  if v_row.id is null then raise exception 'already_redeemed'; end if;
  return v_row;
end;
$$;

-- ── venue slugs ──────────────────────────────────────────────────────────────
create or replace function gen_venue_slug(p_name text)
returns text language plpgsql security definer set search_path = public as $$
declare v_base text; v_slug text;
begin
  v_base := trim(both '-' from regexp_replace(lower(coalesce(p_name, 'spot')), '[^a-z0-9]+', '-', 'g'));
  if char_length(v_base) < 2 then v_base := 'spot'; end if;
  loop
    v_slug := left(v_base, 40) || '-' || substr(md5(gen_random_uuid()::text), 1, 4);
    exit when not exists (select 1 from venues where slug = v_slug);
  end loop;
  return v_slug;
end;
$$;

create or replace function set_venue_slug()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.slug is null then new.slug := gen_venue_slug(new.name); end if;
  return new;
end;
$$;

create trigger trg_set_venue_slug before insert on venues
  for each row execute function set_venue_slug();

-- ── verification (liveness) ──────────────────────────────────────────────────
create or replace function gen_challenge()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_all text[] := array[
    'turn_head_left','turn_head_right','look_up','smile','blink_twice',
    'show_fingers_2','show_fingers_3','show_fingers_5','touch_left_ear','touch_right_ear'
  ];
  v_actions text[];
begin
  select array_agg(a) into v_actions from (select a from unnest(v_all) a order by random() limit 2) s;
  return jsonb_build_object(
    'code', lpad((floor(random() * 10000))::int::text, 4, '0'),
    'actions', to_jsonb(v_actions),
    'issuedAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'expiresAt', to_char((now() + interval '15 minutes') at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );
end;
$$;

-- Issues a challenge. 3 attempts / 24h; 1h cooldown after a genuine rejection
-- (an admin "retake" is exempt). Reuses a live, unsubmitted challenge.
create or replace function start_verification()
returns verification_requests
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_existing verification_requests; v_count int; v_row verification_requests;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  if exists (select 1 from profiles where id = v_user and verification_status = 'verified') then
    raise exception 'already_verified';
  end if;

  select * into v_existing from verification_requests
  where user_id = v_user and media_path is null and status = 'pending'
    and (challenge->>'expiresAt')::timestamptz > now() + interval '2 minutes'
  order by created_at desc limit 1;
  if found then return v_existing; end if;

  if exists (
    select 1 from verification_requests
    where user_id = v_user and status = 'rejected'
      and coalesce(reviewed_at, created_at) > now() - interval '1 hour'
      and coalesce(review_note, '') not like 'retake:%'
  ) then
    raise exception 'verification_cooldown' using errcode = 'P0001';
  end if;

  select count(*) into v_count from verification_requests
  where user_id = v_user and created_at > now() - interval '24 hours';
  if v_count >= 3 then raise exception 'verification_rate_limited' using errcode = 'P0001'; end if;

  insert into verification_requests (user_id, challenge)
  values (v_user, gen_challenge())
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function submit_verification(
  p_request_id uuid, p_media_path text, p_media_mime text,
  p_media_bytes int default null, p_device_hint text default null
)
returns verification_requests
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_row verification_requests;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_row from verification_requests where id = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if v_row.user_id <> v_user then raise exception 'not_owner'; end if;
  if v_row.media_path is not null then raise exception 'already_submitted'; end if;
  -- a little grace past expiry so a slow mobile upload doesn't fail at the line
  if (v_row.challenge->>'expiresAt')::timestamptz + interval '10 minutes' <= now() then
    raise exception 'challenge_expired' using errcode = 'P0001';
  end if;
  if split_part(p_media_path, '/', 1) <> v_user::text then raise exception 'bad_media_path'; end if;

  update verification_requests
  set media_path = p_media_path, media_mime = p_media_mime, media_bytes = p_media_bytes,
      device_hint = left(p_device_hint, 200), status = 'pending', submitted_at = now()
  where id = p_request_id
  returning * into v_row;

  update profiles set verification_status = 'pending'
  where id = v_user and verification_status <> 'verified';
  return v_row;
end;
$$;

-- ── notifications ────────────────────────────────────────────────────────────
create or replace function mark_notifications_read()
returns void language sql security definer set search_path = public as $$
  update notification_outbox set read_at = now() where user_id = auth.uid() and read_at is null;
$$;

-- ── scheduled jobs ───────────────────────────────────────────────────────────
-- lock: open → locked at locks_at, or cancelled(under_filled) below minimum.
create or replace function lock_gigs_job()
returns void language plpgsql security definer set search_path = public as $$
declare r record; m record;
begin
  for r in select * from gigs where status = 'open' and now() >= locks_at for update loop
    if r.claimed_count + r.reserved_slots < r.min_to_confirm or r.claimed_count < 2 then
      update gigs set status = 'cancelled', cancelled_reason = 'under_filled' where id = r.id;
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        perform enqueue_notification(m.user_id, 'gig_cancelled', r.id, jsonb_build_object('reason', 'under_filled'));
      end loop;
    else
      update gigs set status = 'locked' where id = r.id;
      insert into gig_messages (gig_id, user_id, body, system_kind) values (r.id, null, 'locked', 'locked');
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        perform enqueue_notification(m.user_id, 'gig_locked', r.id, '{}');
      end loop;
    end if;
  end loop;
  update gigs set status = 'expired' where status = 'open' and now() >= starts_at;
end;
$$;

-- complete: after start + duration + 3h. Attendance needs confirmations from
-- min(2, other app members) — a crew of 2 app members + the host's offline
-- friends can still mark each other attended.
create or replace function complete_gigs_job()
returns void language plpgsql security definer set search_path = public as $$
declare r record; m record; v_conf int; v_needed int; v_members int;
begin
  for r in
    select * from gigs
    where status = 'locked'
      and now() >= starts_at + (duration_min || ' minutes')::interval + interval '3 hours'
    for update
  loop
    if exists (select 1 from checkins where gig_id = r.id) then
      select count(*) into v_members from gig_crew where gig_id = r.id and state = 'claimed';
      v_needed := least(2, greatest(v_members - 1, 1));
      for m in select user_id from gig_crew where gig_id = r.id and state = 'claimed' loop
        select count(distinct confirmer_id) into v_conf from checkins where gig_id = r.id and subject_id = m.user_id;
        if v_conf >= v_needed then
          update gig_crew set state = 'attended' where gig_id = r.id and user_id = m.user_id;
          insert into reliability_events (user_id, gig_id, kind) values (m.user_id, r.id, 'attended');
        else
          update gig_crew set state = 'no_show' where gig_id = r.id and user_id = m.user_id;
          insert into reliability_events (user_id, gig_id, kind) values (m.user_id, r.id, 'no_show');
        end if;
      end loop;
    end if;
    update gigs set status = 'completed' where id = r.id;
  end loop;
end;
$$;

create or replace function cancel_gig(p_gig_id uuid, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_gig gigs; m record;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status not in ('open','locked') then raise exception 'gig_not_open'; end if;

  update gigs set status = 'cancelled', cancelled_reason = coalesce(nullif(trim(p_reason), ''), 'host_cancelled')
  where id = p_gig_id;
  if gig_is_confirmed(p_gig_id) then
    insert into reliability_events (user_id, gig_id, kind, weight) values (v_user, p_gig_id, 'host_cancel', 2);
  end if;
  insert into gig_messages (gig_id, user_id, body, system_kind) values (p_gig_id, null, 'cancelled', 'cancelled');
  for m in select user_id from gig_crew where gig_id = p_gig_id and state = 'claimed' and user_id <> v_user loop
    perform enqueue_notification(m.user_id, 'gig_cancelled', p_gig_id, jsonb_build_object('reason', 'host_cancelled'));
  end loop;
end;
$$;

create or replace function recompute_bands_job()
returns void language plpgsql security definer set search_path = public as $$
declare u record;
begin
  for u in
    select distinct user_id from reliability_events where created_at > now() - interval '120 days'
    union select id from profiles where suspended_until is not null
  loop
    perform recompute_reliability_band(u.user_id);
  end loop;
end;
$$;

create or replace function expire_stale_verifications_job()
returns void language sql security definer set search_path = public as $$
  update verification_requests
  set status = 'rejected', review_note = 'Auto-rejected: not reviewed within 30 days.', reviewed_at = now()
  where status = 'pending' and created_at < now() - interval '30 days';
  -- abandoned, never-submitted challenges
  delete from verification_requests
  where media_path is null and status = 'pending' and created_at < now() - interval '2 days';
$$;

create or replace function expire_friend_requests_job()
returns void language sql security definer set search_path = public as $$
  update friend_requests set status = 'expired', responded_at = now()
  where status = 'pending' and created_at < now() - interval '14 days';
$$;

-- Lobby chat is deleted 30 days after a gig completes (privacy policy).
create or replace function purge_old_chats_job()
returns void language sql security definer set search_path = public as $$
  delete from gig_messages m using gigs g
  where m.gig_id = g.id
    and g.status in ('completed','cancelled','expired')
    and g.starts_at < now() - interval '30 days';
$$;
