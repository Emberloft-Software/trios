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

