-- ═════════════════════════════════════════════════════════════════════════════
-- Trimegos 0031: "new gig" push alerts.
-- When a PUBLIC gig is posted, everyone it's open to (same age/gender rule as
-- the feed) who has push on and hasn't switched alerts off gets one push.
-- Never the host, never people in a block relationship with the host, never
-- suspended accounts, never for private gigs. Max 3 alerts per person per day
-- (extras are dropped, not queued). Push-only: nothing is added to Activity.
-- ═════════════════════════════════════════════════════════════════════════════

alter table profiles add column if not exists notify_new_gigs boolean not null default true;

create table if not exists new_gig_pushes (
  user_id uuid not null references profiles(id) on delete cascade,
  gig_id uuid not null references gigs(id) on delete cascade,
  created_at timestamptz not null default now(),
  pushed_at timestamptz,
  skipped boolean not null default false,
  primary key (user_id, gig_id)
);
create index if not exists new_gig_pushes_pending on new_gig_pushes (created_at) where pushed_at is null;
create index if not exists new_gig_pushes_user_recent on new_gig_pushes (user_id, pushed_at) where not skipped;
alter table new_gig_pushes enable row level security;
revoke all on new_gig_pushes from public, anon, authenticated;

create or replace function set_new_gig_alerts(p_on boolean)
returns void language sql security definer set search_path = public as $$
  update profiles set notify_new_gigs = coalesce(p_on, true) where id = auth.uid();
$$;

-- Fan out to eligible people (only those with a push subscription, so the
-- table stays small), then ping the dispatcher.
create or replace function gig_new_alerts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_private or new.status <> 'open' or new.starts_at < now() + interval '1 hour' then return null; end if;
  insert into new_gig_pushes (user_id, gig_id)
  select p.id, new.id
  from profiles p
  where p.id <> new.host_id
    and p.notify_new_gigs
    and p.birth_date is not null and p.gender is not null
    and (p.suspended_until is null or p.suspended_until < now())
    and age_years(p.birth_date) between new.age_min and new.age_max
    and (new.gender_pref = 'everyone'
         or (new.gender_pref = 'women' and p.gender = 'woman')
         or (new.gender_pref = 'men' and p.gender = 'man'))
    and not is_blocked_pair(p.id, new.host_id)
    and exists (select 1 from push_subscriptions s where s.user_id = p.id)
  on conflict do nothing;
  perform ping_push_dispatch();
  return null;
exception when others then
  raise warning 'new gig alerts failed: %', sqlerrm; -- never block posting a gig
  return null;
end;
$$;

drop trigger if exists new_gig_alerts on gigs;
create trigger new_gig_alerts after insert on gigs for each row execute function gig_new_alerts();

-- Claims a batch for the dispatcher. People already at 3 alerts in the last
-- 24h have the rest dropped (marked skipped) instead of piling up.
create or replace function claim_new_gig_push_batch(p_limit int default 200)
returns table (user_id uuid, gig_id uuid, title text, activity text, starts_at timestamptz, place text)
language plpgsql security definer set search_path = public as $$
begin
  update new_gig_pushes q set pushed_at = now(), skipped = true
  from gigs g
  where q.pushed_at is null and g.id = q.gig_id
    and (g.status <> 'open' or q.created_at < now() - interval '6 hours'
         or (select count(*) from new_gig_pushes r
             where r.user_id = q.user_id and not r.skipped and r.pushed_at > now() - interval '24 hours') >= 3);

  return query
  with pick as (
    select q.user_id, q.gig_id from new_gig_pushes q
    where q.pushed_at is null
    order by q.created_at
    limit greatest(1, least(p_limit, 500))
    for update skip locked
  ), done as (
    update new_gig_pushes q set pushed_at = now()
    from pick where q.user_id = pick.user_id and q.gig_id = pick.gig_id
    returning q.user_id, q.gig_id
  )
  select d.user_id, d.gig_id, g.title, a.name, g.starts_at, g.place_label
  from done d join gigs g on g.id = d.gig_id left join activities a on a.id = g.activity_id;
end;
$$;

-- The 1-minute sweep also wakes for pending new-gig alerts.
create or replace function push_sweep_job()
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from notification_outbox where pushed_at is null and created_at > now() - interval '1 day')
     or exists (select 1 from chat_push_state
                where pending > 0 and first_pending_at > now() - interval '1 day'
                  and (last_pushed_at is null or last_pushed_at < now() - interval '2 minutes')
                  and (last_seen_at is null or last_seen_at < now() - interval '45 seconds'))
     or exists (select 1 from new_gig_pushes where pushed_at is null and created_at > now() - interval '6 hours') then
    perform ping_push_dispatch();
  end if;
end;
$$;

revoke execute on function set_new_gig_alerts(boolean), gig_new_alerts(), claim_new_gig_push_batch(int), push_sweep_job()
  from public, anon, authenticated;
grant execute on function set_new_gig_alerts(boolean) to authenticated;
grant execute on function claim_new_gig_push_batch(int) to service_role;
grant select (notify_new_gigs) on profiles to authenticated;
