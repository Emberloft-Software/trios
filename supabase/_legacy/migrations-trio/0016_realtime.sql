-- 0016 — Enable Supabase Realtime for lobby chat.
-- The LobbyChat subscribes to postgres_changes on gig_messages, but a table
-- only streams once it's in the `supabase_realtime` publication. Without this,
-- messages save and load on refresh but don't arrive live for other crew.
-- Realtime honours RLS, so an unconfirmed lobby still receives nothing (R8).
--
-- Idempotent — safe to re-run.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'gig_messages'
    ) then
      alter publication supabase_realtime add table gig_messages;
    end if;
  end if;
end
$$;
