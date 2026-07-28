-- 0014 — Venue slugs for the /spot/[slug] redemption page + a redeem-by-code
-- path that works without a login (venue staff). Source: docs/08, docs/03.

-- ── slug column ──────────────────────────────────────────────────────────────
alter table venues add column if not exists slug text;

-- Generate a URL-safe slug from a venue name + a short unique suffix.
create or replace function gen_venue_slug(p_name text)
returns text language plpgsql security definer set search_path = public as $$
declare v_base text; v_slug text;
begin
  v_base := regexp_replace(lower(coalesce(p_name, 'spot')), '[^a-z0-9]+', '-', 'g');
  v_base := trim(both '-' from v_base);
  if char_length(v_base) < 2 then v_base := 'spot'; end if;
  loop
    v_slug := v_base || '-' || substr(md5(gen_random_uuid()::text), 1, 4);
    exit when not exists (select 1 from venues where slug = v_slug);
  end loop;
  return v_slug;
end;
$$;

-- Auto-assign a slug on insert when one isn't provided.
create or replace function set_venue_slug()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.slug is null then new.slug := gen_venue_slug(new.name); end if;
  return new;
end;
$$;

drop trigger if exists trg_set_venue_slug on venues;
create trigger trg_set_venue_slug
  before insert on venues
  for each row execute function set_venue_slug();

-- Backfill any existing rows, then enforce uniqueness.
update venues set slug = gen_venue_slug(name) where slug is null;
create unique index if not exists venues_slug_key on venues (slug);

-- ── redeem_perk_by_code ──────────────────────────────────────────────────────
-- Used by the no-login /spot/[slug] page: staff type the gig code. Validates
-- the gig belongs to this venue and is locked/completed, then writes exactly
-- one perk_redemptions row (unique(gig_id) holds under a double submit).
-- security definer with no auth.uid() dependency — but NOT granted to anon;
-- it's invoked from a server route using the service role.
create or replace function redeem_perk_by_code(p_slug text, p_code text)
returns perk_redemptions
language plpgsql security definer set search_path = public as $$
declare v_venue venues; v_gig gigs; v_size int; v_row perk_redemptions;
begin
  select * into v_venue from venues where slug = p_slug and is_partner;
  if not found then raise exception 'venue_not_found'; end if;

  select * into v_gig from gigs
  where upper(code) = upper(p_code) and venue_id = v_venue.id
    and status in ('locked','completed');
  if not found then raise exception 'gig_not_found'; end if;

  select count(*) into v_size from gig_crew
  where gig_id = v_gig.id and state in ('claimed','attended');

  insert into perk_redemptions (venue_id, gig_id, crew_size)
  values (v_venue.id, v_gig.id, greatest(v_size, 1))
  on conflict (gig_id) do nothing
  returning * into v_row;
  if v_row.id is null then raise exception 'already_redeemed'; end if;
  return v_row;
end;
$$;
-- Not granted to anon/authenticated — server-side (service role) only.

-- ── perk_redemptions: let crew read their own gig's redemption ───────────────
-- So the lobby can show "redeemed" state. Writes still go only through the
-- security-definer functions.
create policy "crew reads perk redemption" on perk_redemptions for select
  using (
    exists (
      select 1 from gig_crew c
      where c.gig_id = perk_redemptions.gig_id
        and c.user_id = auth.uid()
        and c.state in ('claimed','attended','no_show')
    )
  );
