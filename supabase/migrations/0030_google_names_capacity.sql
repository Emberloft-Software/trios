-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos 0030: Google sign-in names + hosts can add spots to their gig.
-- ═════════════════════════════════════════════════════════════════════════════

-- 1. Google accounts arrive with full_name/name, not display_name. They still
--    land on /onboarding for date of birth, gender and Terms (none of that
--    comes from Google), so nothing else changes.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- Google sign-ups carry full_name / name instead of display_name
  v_name := left(coalesce(nullif(trim(v_meta->>'display_name'), ''), nullif(trim(v_meta->>'full_name'), ''), nullif(trim(v_meta->>'name'), ''), initcap(v_base)), 40);

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
$function$;

-- 2. Host makes room for more people. Increase only (never squeezes anyone
--    out), only while the gig is open, max 16. On private gigs every new spot
--    is a held seat with its own single-use invite link, like at creation.
create or replace function increase_gig_capacity(p_gig_id uuid, p_capacity int)
returns gigs language plpgsql security definer set search_path = public as $$
declare v_gig gigs; v_add int; v_label int; i int;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select * into v_gig from gigs where id = p_gig_id for update;
  if not found then raise exception 'gig_not_found'; end if;
  if v_gig.host_id <> auth.uid() then raise exception 'not_host'; end if;
  if v_gig.status <> 'open' then raise exception 'gig_not_open'; end if;
  if p_capacity is null or p_capacity <= v_gig.capacity then raise exception 'capacity_not_increased'; end if;
  if p_capacity > 16 then raise exception 'capacity_too_high'; end if;

  v_add := p_capacity - v_gig.capacity;
  if v_gig.is_private then
    select coalesce(max(label), 0) into v_label from gig_invites where gig_id = v_gig.id;
    for i in 1..v_add loop
      insert into gig_invites (gig_id, code, label) values (v_gig.id, gen_invite_code(), v_label + i);
    end loop;
    update gigs set capacity = p_capacity, host_guests = host_guests + v_add, reserved_slots = reserved_slots + v_add
    where id = v_gig.id returning * into v_gig;
  else
    update gigs set capacity = p_capacity where id = v_gig.id returning * into v_gig;
  end if;
  return v_gig;
end;
$$;

revoke execute on function increase_gig_capacity(uuid, int) from public, anon;
grant execute on function increase_gig_capacity(uuid, int) to authenticated;
