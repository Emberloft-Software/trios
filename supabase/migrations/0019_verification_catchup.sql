-- 0019 — Verification catch-up. A single idempotent script that fully sets up
-- verification (bucket + storage policies + functions), safe to run regardless
-- of what's already applied. Exists because migrations were applied by hand and
-- 0010 was missed. Consolidates the verification-critical parts of 0008 + 0010
-- + 0018, all guarded.

-- ── 1. private bucket ────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('verification', 'verification', false)
on conflict (id) do nothing;

-- ── 2. storage policies (guarded so re-running never errors) ─────────────────
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects'
                 and policyname='users write own verification media') then
    create policy "users write own verification media" on storage.objects for insert
      with check (bucket_id='verification' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects'
                 and policyname='users update own verification media') then
    create policy "users update own verification media" on storage.objects for update
      using (bucket_id='verification' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id='verification' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects'
                 and policyname='users delete own verification media') then
    create policy "users delete own verification media" on storage.objects for delete
      using (bucket_id='verification' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end
$$;

-- ── 3. functions (create or replace = always safe) ───────────────────────────
create or replace function gen_challenge()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_all text[] := array[
    'turn_head_left','turn_head_right','look_up',
    'smile','blink_twice',
    'show_fingers_2','show_fingers_3','show_fingers_5',
    'touch_left_ear','touch_right_ear'
  ];
  v_actions text[];
  v_code text;
begin
  select array_agg(a) into v_actions from (
    select a from unnest(v_all) a order by random() limit 2
  ) s;
  v_code := lpad((floor(random() * 10000))::int::text, 4, '0');
  return jsonb_build_object(
    'code', v_code,
    'actions', to_jsonb(v_actions),
    'issuedAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'expiresAt', to_char((now() + interval '10 minutes') at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );
end;
$$;

create or replace function start_verification()
returns verification_requests
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_existing verification_requests;
  v_count int;
  v_row verification_requests;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  select * into v_existing from verification_requests
  where user_id = v_user and media_path is null and status = 'pending'
    and (challenge->>'expiresAt')::timestamptz > now()
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
  if v_count >= 3 then
    raise exception 'verification_rate_limited' using errcode = 'P0001';
  end if;

  insert into verification_requests (user_id, challenge)
  values (v_user, gen_challenge())
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function submit_verification(
  p_request_id uuid, p_media_path text, p_media_mime text
)
returns verification_requests
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_row verification_requests;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode = '42501'; end if;

  select * into v_row from verification_requests where id = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if v_row.user_id <> v_user then raise exception 'not_owner'; end if;
  if v_row.media_path is not null then raise exception 'already_submitted'; end if;
  if (v_row.challenge->>'expiresAt')::timestamptz <= now() then
    raise exception 'challenge_expired' using errcode = 'P0001';
  end if;
  if split_part(p_media_path, '/', 1) <> v_user::text then
    raise exception 'bad_media_path';
  end if;

  update verification_requests
  set media_path = p_media_path, media_mime = p_media_mime, status = 'pending'
  where id = p_request_id
  returning * into v_row;

  update profiles set verification_status = 'pending'
  where id = v_user and verification_status <> 'verified';

  return v_row;
end;
$$;

grant execute on function start_verification() to authenticated;
grant execute on function submit_verification(uuid,text,text) to authenticated;
grant execute on function gen_challenge() to authenticated;
