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

