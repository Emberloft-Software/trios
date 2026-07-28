-- 0018 — Verification upload robustness.
-- The capture flow uploads with upsert:true, and start_verification() reuses the
-- same request (same object path) within the 10-minute window — so a retake is
-- an UPDATE on storage.objects, which 0008 never granted a policy for. Without
-- it, a retake upload fails. Add the missing owner-scoped UPDATE policy, and
-- re-assert the private bucket exists (idempotent) in case 0008 wasn't applied.

insert into storage.buckets (id, name, public)
values ('verification', 'verification', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'users update own verification media'
  ) then
    create policy "users update own verification media" on storage.objects for update
      using (
        bucket_id = 'verification'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
      with check (
        bucket_id = 'verification'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end
$$;
