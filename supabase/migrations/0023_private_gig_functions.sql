-- Tremigos 0023: private-gig behaviour in create_gig / claim_slot /
-- revoke_guest_invite / invite_preview (see 0022 for the column and policy).
drop function if exists create_gig(uuid, text, uuid, text, double precision, double precision, timestamptz, int, int, text, text, int, int, gig_gender, int);
CREATE OR REPLACE FUNCTION public.create_gig(p_activity_id uuid, p_title text, p_venue_id uuid, p_place_label text, p_lat double precision, p_lng double precision, p_starts_at timestamp with time zone, p_capacity integer, p_duration_min integer DEFAULT 90, p_notes text DEFAULT NULL::text, p_cost_note text DEFAULT NULL::text, p_age_min integer DEFAULT 18, p_age_max integer DEFAULT 99, p_gender_pref gig_gender DEFAULT 'everyone'::gig_gender, p_host_guests integer DEFAULT 0, p_is_private boolean DEFAULT false)
 RETURNS gigs
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user uuid := auth.uid();
  v_profile profiles;
  v_gig gigs;
  v_age int;
begin
  if coalesce(p_is_private, false) then
    p_host_guests := p_capacity - 1;
    p_age_min := 18;
    p_age_max := 99;
    p_gender_pref := 'everyone';
  end if;
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
  if coalesce(p_host_guests, 0) < 0 or (not coalesce(p_is_private, false) and coalesce(p_host_guests, 0) > p_capacity - 2) then
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
    age_min, age_max, gender_pref, host_guests, reserved_slots, is_private
  ) values (
    gen_gig_code(p_activity_id), gen_invite_code(), v_user, p_activity_id, p_title, p_notes,
    p_venue_id, p_place_label, p_lat, p_lng, p_starts_at, p_duration_min, p_capacity,
    p_cost_note, p_starts_at - interval '2 hours',
    p_age_min, p_age_max, p_gender_pref, coalesce(p_host_guests, 0), coalesce(p_host_guests, 0), coalesce(p_is_private, false)
  )
  returning * into v_gig;

  insert into gig_crew (gig_id, user_id, position, state, joined_via)
  values (v_gig.id, v_user, 1, 'claimed', 'host');

  select * into v_gig from gigs where id = v_gig.id;
  return v_gig;
end;
$function$;

CREATE OR REPLACE FUNCTION public.claim_slot(p_gig_id uuid)
 RETURNS gig_crew
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  if v_gig.is_private then raise exception 'private_gig'; end if;
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
$function$;

CREATE OR REPLACE FUNCTION public.revoke_guest_invite(p_invite_id uuid)
 RETURNS gigs
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_user uuid := auth.uid(); v_inv gig_invites; v_gig gigs;
begin
  select * into v_inv from gig_invites where id = p_invite_id for update;
  if not found then raise exception 'invite_not_found'; end if;
  select * into v_gig from gigs where id = v_inv.gig_id for update;
  if v_gig.host_id <> v_user then raise exception 'not_host'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if v_inv.used_at is not null or v_inv.revoked_at is not null then raise exception 'invite_used'; end if;

  update gig_invites set revoked_at = now() where id = p_invite_id;
  -- private gigs have no public seats: cancelling a link issues a fresh one
  if v_gig.is_private then
    insert into gig_invites (gig_id, code, label)
    values (v_gig.id, gen_invite_code(), (select coalesce(max(label), 0) + 1 from gig_invites where gig_id = v_gig.id));
    return v_gig;
  end if;
  update gigs set reserved_slots = greatest(reserved_slots - 1, 0), host_guests = greatest(host_guests - 1, 0)
  where id = v_gig.id returning * into v_gig;
  return v_gig;
end;
$function$;

grant execute on function create_gig(uuid, text, uuid, text, double precision, double precision, timestamptz, int, int, text, text, int, int, gig_gender, int, boolean) to authenticated;
revoke execute on function create_gig(uuid, text, uuid, text, double precision, double precision, timestamptz, int, int, text, text, int, int, gig_gender, int, boolean) from public, anon;

CREATE OR REPLACE FUNCTION public.invite_preview(p_code text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$

  select jsonb_build_object(

    'id', g.id,

    'title', g.title,

    'status', case when i.used_at is not null or i.revoked_at is not null then 'used' else g.status::text end,

    'starts_at', g.starts_at,

    'duration_min', g.duration_min,

    'place_label', g.place_label,

    'capacity', g.capacity,

    'claimed_count', g.claimed_count,

    'reserved_slots', g.reserved_slots,

    'host_guests', g.host_guests,

    'activity_name', a.name,

    'activity_emoji', a.emoji,

    'activity_slug', a.slug,
    'is_private', g.is_private,

    'host_name', split_part(p.display_name, ' ', 1),

    'locks_at', g.locks_at

  )

  from gig_invites i

  join gigs g on g.id = i.gig_id

  join activities a on a.id = g.activity_id

  join profiles p on p.id = g.host_id

  where i.code = lower(trim(p_code));

$function$;
