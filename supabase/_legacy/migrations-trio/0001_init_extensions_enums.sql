-- 0001 — Extensions and enums
-- Source: docs/02-data-model.md
-- Migrations are additive and numbered. Never edit an applied migration.

-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "citext";       -- case-insensitive handles
create extension if not exists "pgcrypto";      -- gen_random_uuid()
-- pg_cron / pg_net are enabled from the dashboard (Database → Extensions);
-- see 0009_cron.sql. On Supabase they live in the `extensions` schema.

-- ── Enums ────────────────────────────────────────────────────────────────────
create type verification_status as enum ('unverified','pending','verified','rejected');
create type reliability_band    as enum ('new','reliable','mixed','restricted');
create type gig_status          as enum ('open','locked','completed','cancelled','expired');
create type crew_state          as enum ('claimed','left','removed','no_show','attended');
create type report_status       as enum ('open','reviewing','actioned','dismissed');
create type mod_action          as enum ('warn','restrict_posting','restrict_joining','suspend','ban','clear');
create type reliability_kind    as enum ('attended','no_show','late_leave','host_cancel','early_leave_ok');
