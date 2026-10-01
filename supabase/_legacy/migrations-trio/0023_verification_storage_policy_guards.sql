-- 0023 — Make the verification bucket's storage policies idempotent the same
-- way 0021 fixed the avatars/venues ones. 0018/0019 only create these
-- `if not exists`, so a stale/broken definition left over from an earlier
-- partial run of the tangled migration history survives untouched instead of
-- being refreshed — which is exactly what caused uploads to fail with
-- "new row violates row-level security policy" even though the intended
-- policy logic (bucket_id = 'verification' and the folder matches auth.uid())
-- was correct all along.

drop policy if exists "users write own verification media" on storage.objects;
create policy "users write own verification media" on storage.objects for insert
  with check (
    bucket_id = 'verification'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update own verification media" on storage.objects;
create policy "users update own verification media" on storage.objects for update
  using (
    bucket_id = 'verification'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'verification'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own verification media" on storage.objects;
create policy "users delete own verification media" on storage.objects for delete
  using (
    bucket_id = 'verification'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
