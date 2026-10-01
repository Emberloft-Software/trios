-- 0021 — Make 0008's avatar/venue storage policies idempotent.
-- 0008_storage.sql's `create policy` statements aren't guarded, unlike the
-- verification ones 0018/0019 already patched. drop schema public cascade
-- (used when rebuilding the public schema from scratch) doesn't touch the
-- storage schema, so a full rebuild replay hits 42710 "policy already
-- exists" on these the moment they're left over from an earlier run.
-- Same fix as 0019: drop-if-exists, then recreate.

drop policy if exists "avatars are world readable" on storage.objects;
create policy "avatars are world readable" on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "users write own avatar" on storage.objects;
create policy "users write own avatar" on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update own avatar" on storage.objects;
create policy "users update own avatar" on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own avatar" on storage.objects;
create policy "users delete own avatar" on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "venue photos are world readable" on storage.objects;
create policy "venue photos are world readable" on storage.objects for select
  using (bucket_id = 'venues');

drop policy if exists "admins write venue photos" on storage.objects;
create policy "admins write venue photos" on storage.objects for insert
  with check (bucket_id = 'venues' and is_admin());

drop policy if exists "admins update venue photos" on storage.objects;
create policy "admins update venue photos" on storage.objects for update
  using (bucket_id = 'venues' and is_admin());

drop policy if exists "admins delete venue photos" on storage.objects;
create policy "admins delete venue photos" on storage.objects for delete
  using (bucket_id = 'venues' and is_admin());
