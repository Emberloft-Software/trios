-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0019 realtime on gigs.
-- Lobbies listen for their gig row changing (someone joins, the crew fills and
-- chat unlocks, the gig locks or is cancelled) so every open phone updates at
-- once instead of polling. Realtime respects RLS: only people who can already
-- read the gig get its updates.
-- ═════════════════════════════════════════════════════════════════════════════
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'gigs') then
    alter publication supabase_realtime add table gigs;
  end if;
end $$;
