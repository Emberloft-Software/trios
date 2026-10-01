-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0004 storage.
--
--   avatars       public read by URL. Writes ONLY from the server (service role)
--                 after the upload passes the face check; photos show in the app
--                 only once an admin approves them.
--   verification  PRIVATE. The browser uploads through a short-lived signed
--                 upload URL minted server-side for exactly one path; admins
--                 watch through 60-second signed URLs. Purged 7 days post-review.
--   venues        public; admin-managed partner photos.
--
-- No client storage policies at all: every write is either service-role or a
-- one-shot signed URL. (This is what makes phone uploads reliable — no more
-- storage-RLS mismatches between the browser session and the bucket policy.)
-- ═════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('verification', 'verification', false, 52428800,
     array['video/webm','video/mp4','video/quicktime','video/x-matroska','image/jpeg','image/png']),
  ('venues', 'venues', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Clear any policies left behind by the old Trio schema.
drop policy if exists "avatars are world readable" on storage.objects;
drop policy if exists "users write own avatar" on storage.objects;
drop policy if exists "users update own avatar" on storage.objects;
drop policy if exists "users delete own avatar" on storage.objects;
drop policy if exists "users write own verification media" on storage.objects;
drop policy if exists "users update own verification media" on storage.objects;
drop policy if exists "users delete own verification media" on storage.objects;
drop policy if exists "venue photos are world readable" on storage.objects;
drop policy if exists "admins write venue photos" on storage.objects;
drop policy if exists "admins update venue photos" on storage.objects;
drop policy if exists "admins delete venue photos" on storage.objects;
