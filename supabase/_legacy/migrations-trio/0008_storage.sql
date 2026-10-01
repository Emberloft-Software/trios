-- 0008 — Storage buckets and policies.
-- Source: docs/02-data-model.md § Storage buckets, docs/05 § Media handling.
--
--   avatars       public   owner writes {user_id}/*, world reads
--   verification  PRIVATE  no client read/list; owner writes own prefix only;
--                          admin reads via short-lived signed URL (server)
--   venues        public   admin writes (partner photos are ours)

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('verification', 'verification', false),
  ('venues', 'venues', true)
on conflict (id) do nothing;

-- ── avatars ──────────────────────────────────────────────────────────────────
create policy "avatars are world readable" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users write own avatar" on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "users update own avatar" on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "users delete own avatar" on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── verification (PRIVATE) ───────────────────────────────────────────────────
-- No select policy at all → no client read, no list. Admin reads happen through
-- server-minted 60s signed URLs (service role). Users may write ONLY to their
-- own prefix.
create policy "users write own verification media" on storage.objects for insert
  with check (
    bucket_id = 'verification'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
-- Users may delete their own pending recording (docs/05: request deletion any
-- time; if pending, that cancels the request).
create policy "users delete own verification media" on storage.objects for delete
  using (
    bucket_id = 'verification'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── venues ───────────────────────────────────────────────────────────────────
create policy "venue photos are world readable" on storage.objects for select
  using (bucket_id = 'venues');
create policy "admins write venue photos" on storage.objects for insert
  with check (bucket_id = 'venues' and is_admin());
create policy "admins update venue photos" on storage.objects for update
  using (bucket_id = 'venues' and is_admin());
create policy "admins delete venue photos" on storage.objects for delete
  using (bucket_id = 'venues' and is_admin());
