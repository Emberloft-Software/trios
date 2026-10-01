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

