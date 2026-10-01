-- 0015 — Email+password signup. The signup form now collects a name and a
-- username, passed as auth metadata (display_name, handle). This replaces the
-- email-derived handle logic from 0005. Source: 03-lifecycle, 09-copy.

-- ── handle_new_user: prefer the chosen username + name ───────────────────────
-- Uses raw_user_meta_data.handle / .display_name when present, normalizes the
-- handle, and falls back to a suffixed variant on conflict so signup can never
-- hard-fail on a taken username (the form pre-checks with check_handle()).
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_req text;
  v_base text;
  v_handle citext;
  v_name text;
  v_try int := 0;
begin
  v_req := regexp_replace(lower(coalesce(new.raw_user_meta_data->>'handle', '')), '[^a-z0-9_]', '', 'g');
  v_base := coalesce(
    nullif(v_req, ''),
    regexp_replace(lower(coalesce(split_part(new.email, '@', 1), 'trio')), '[^a-z0-9_]', '', 'g')
  );
  if char_length(v_base) < 3 then v_base := v_base || 'user'; end if;

  v_name := coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), initcap(v_base));

  -- try the requested handle as-is, then suffix on conflict
  v_handle := v_base::citext;
  while exists (select 1 from profiles where handle = v_handle) loop
    v_try := v_try + 1;
    v_handle := (v_base || '_' || substr(md5(gen_random_uuid()::text), 1, 3))::citext;
    if v_try > 5 then
      v_handle := ('trio_' || substr(gen_random_uuid()::text, 1, 8))::citext;
      exit;
    end if;
  end loop;

  insert into profiles (id, handle, display_name)
  values (new.id, v_handle, v_name);
  return new;
end;
$$;

-- ── check_handle: is this username free? ─────────────────────────────────────
-- Callable before signup (anon), so the form can say "that's taken" up front.
-- Returns true when available.
create or replace function check_handle(p_handle text)
returns boolean language sql security definer set search_path = public as $$
  select not exists (
    select 1 from profiles
    where handle = regexp_replace(lower(p_handle), '[^a-z0-9_]', '', 'g')::citext
  );
$$;
grant execute on function check_handle(text) to anon, authenticated;
