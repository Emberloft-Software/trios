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

