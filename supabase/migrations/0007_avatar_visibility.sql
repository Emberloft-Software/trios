-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0007 avatar visibility.
-- avatar_path is only ever written when an admin approves a photo, so show it
-- regardless of avatar_status. That way someone's last approved photo stays up
-- while a newer upload waits for review (or after a newer one is rejected).
-- ═════════════════════════════════════════════════════════════════════════════
create or replace view profiles_public as
  select
    id,
    handle,
    display_name,
    bio,
    avatar_path,
    city,
    interests,
    age_years(birth_date) as age,
    gender,
    verification_status,
    verified_at,
    reliability_band,
    created_at
  from profiles;

revoke all on profiles_public from anon;
grant select on profiles_public to authenticated;
