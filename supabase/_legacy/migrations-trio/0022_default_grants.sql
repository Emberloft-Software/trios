-- 0022 — Base table grants for anon/authenticated.
-- A freshly-provisioned Supabase project grants anon/authenticated broad
-- table-level access by default and relies entirely on RLS (hard rule #1) to
-- gate actual row access. None of the earlier migrations issue explicit
-- table grants because they never needed to — that platform default was
-- always there. A `drop schema public cascade` rebuild (used to recover this
-- project after migrations were applied out of order by hand) recreates the
-- schema without that platform default, so every direct table query from the
-- client fails with 42501 "permission denied" before RLS is ever evaluated,
-- even though the RLS policies themselves are all correct.
--
-- Idempotent — just re-asserts the grants either way.

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated, anon;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, anon;
