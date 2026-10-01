-- 0010 — Verification: server-side challenge generation, rate limiting, submit.
-- Source: docs/05-verification.md.
-- The challenge is generated server-side, stored on the request row, and
-- expires in 10 minutes. Randomness is the whole security model. Rate limit is
-- enforced HERE (security definer), never in the client.

-- ── gen_challenge ────────────────────────────────────────────────────────────
-- 2 distinct random actions from 10, ordered, plus a 4-digit code the user
-- reads aloud. Shape: { code, actions, issuedAt, expiresAt }.
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
  -- two distinct actions, random order
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

-- ── start_verification ───────────────────────────────────────────────────────
-- Issues a challenge. Rate limit: 3 attempts per 24h; a rejected request must
-- wait 1 hour. Reuses an existing un-submitted, un-expired challenge so a page
-- remount doesn't burn an attempt.
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

  -- reuse an in-flight challenge that hasn't been submitted or expired
  select * into v_existing from verification_requests
  where user_id = v_user and media_path is null and status = 'pending'
    and (challenge->>'expiresAt')::timestamptz > now()
  order by created_at desc limit 1;
  if found then return v_existing; end if;

  -- 1-hour cooldown after a genuine rejection. An admin "ask for a retake"
  -- writes review_note like 'retake:%' and is exempt — it's not a penalty.
  if exists (
    select 1 from verification_requests
    where user_id = v_user and status = 'rejected'
      and coalesce(reviewed_at, created_at) > now() - interval '1 hour'
      and coalesce(review_note, '') not like 'retake:%'
  ) then
    raise exception 'verification_cooldown' using errcode = 'P0001';
  end if;

  -- 3 attempts per 24h
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

-- ── submit_verification ──────────────────────────────────────────────────────
-- Called after the media blob is uploaded to verification/{uid}/{req}.{ext}.
-- Records media_path + media_mime; leaves status 'pending' for admin review.
-- Refuses if the challenge has expired or the request was already submitted.
create or replace function submit_verification(
  p_request_id uuid,
  p_media_path text,
  p_media_mime text
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
  -- the uploaded object must live under the caller's own prefix
  if split_part(p_media_path, '/', 1) <> v_user::text then
    raise exception 'bad_media_path';
  end if;

  update verification_requests
  set media_path = p_media_path, media_mime = p_media_mime, status = 'pending'
  where id = p_request_id
  returning * into v_row;

  -- reflect "pending review" on the profile so the badge/UI can show it
  update profiles set verification_status = 'pending'
  where id = v_user and verification_status <> 'verified';

  return v_row;
end;
$$;

grant execute on function start_verification() to authenticated;
grant execute on function submit_verification(uuid,text,text) to authenticated;
