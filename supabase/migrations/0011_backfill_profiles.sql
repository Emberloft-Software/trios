-- 0011 — Backfill profiles for any auth.users created before the signup trigger
-- (0005) existed. Idempotent: inserts only the missing rows. This prevents the
-- foreign-key failure in create_gig()/claim_slot() where a user has no profile.
--
-- Safe to re-run. New signups are handled by the on_auth_user_created trigger;
-- this only catches accounts that predate it.

insert into profiles (id, handle, display_name)
select
  u.id,
  -- handle: slug of the email local-part + a short deterministic suffix
  (
    coalesce(
      nullif(regexp_replace(lower(split_part(u.email, '@', 1)), '[^a-z0-9_]', '', 'g'), ''),
      'trio'
    ) || '_' || substr(md5(u.id::text), 1, 4)
  )::citext,
  coalesce(
    u.raw_user_meta_data->>'display_name',
    initcap(coalesce(nullif(split_part(u.email, '@', 1), ''), 'Trio user'))
  )
from auth.users u
left join profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
