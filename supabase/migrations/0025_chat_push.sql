-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos 0025: push notifications for group chat messages.
-- Chat doesn't go through notification_outbox (it would flood Activity).
-- Instead each message bumps a per-person, per-gig counter. The dispatcher
-- turns pending counters into one collapsed push ("3 new messages"), skipping
-- anyone who is looking at the chat right now and throttling to one push per
-- gig every 2 minutes. Payloads never include message text or sender names.
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists chat_push_state (
  user_id uuid not null references profiles(id) on delete cascade,
  gig_id uuid not null references gigs(id) on delete cascade,
  pending int not null default 0,
  first_pending_at timestamptz,
  last_pushed_at timestamptz,
  last_seen_at timestamptz,
  primary key (user_id, gig_id)
);
create index if not exists chat_push_state_pending on chat_push_state (first_pending_at) where pending > 0;
alter table chat_push_state enable row level security;
revoke all on chat_push_state from public, anon, authenticated;
-- no client policies: only the security-definer functions below touch it

-- "I'm looking at this chat": clears anything pending and suppresses pushes.
create or replace function mark_chat_seen(p_gig_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not am_gig_crew(p_gig_id) then return; end if;
  insert into chat_push_state (user_id, gig_id, last_seen_at)
  values (auth.uid(), p_gig_id, now())
  on conflict (user_id, gig_id) do update
    set last_seen_at = now(), pending = 0, first_pending_at = null;
end;
$$;

-- Each human message counts for every other current member who has push on.
create or replace function gig_message_chat_push()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.user_id is null or new.system_kind is not null then return null; end if;
  insert into chat_push_state (user_id, gig_id, pending, first_pending_at)
  select c.user_id, new.gig_id, 1, now()
  from gig_crew c
  where c.gig_id = new.gig_id and c.state = 'claimed' and c.user_id <> new.user_id
    and exists (select 1 from push_subscriptions s where s.user_id = c.user_id)
  on conflict (user_id, gig_id) do update
    set pending = chat_push_state.pending + 1,
        first_pending_at = coalesce(chat_push_state.first_pending_at, now());
  return null;
end;
$$;

create or replace function gig_messages_push_ping()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform ping_push_dispatch();
  return null;
end;
$$;

drop trigger if exists chat_push_count on gig_messages;
create trigger chat_push_count after insert on gig_messages
  for each row execute function gig_message_chat_push();
drop trigger if exists chat_push_ping on gig_messages;
create trigger chat_push_ping after insert on gig_messages
  for each statement execute function gig_messages_push_ping();

-- Rows ready to push: something pending, the person isn't in the chat, not
-- pushed for this gig in the last 2 minutes, still a member of a live gig.
create or replace function claim_chat_push_batch(p_limit int default 200)
returns table (user_id uuid, gig_id uuid, pending int, gig_title text)
language sql security definer set search_path = public as $$
  with ready as (
    select s.user_id, s.gig_id, s.pending
    from chat_push_state s
    join gigs g on g.id = s.gig_id and g.status in ('open', 'locked', 'completed')
    join gig_crew c on c.gig_id = s.gig_id and c.user_id = s.user_id and c.state in ('claimed', 'attended')
    where s.pending > 0
      and s.first_pending_at > now() - interval '1 day'
      and (s.last_seen_at is null or s.last_seen_at < now() - interval '45 seconds')
      and (s.last_pushed_at is null or s.last_pushed_at < now() - interval '2 minutes')
    order by s.first_pending_at
    limit greatest(1, least(p_limit, 500))
    for update of s skip locked
  ), done as (
    update chat_push_state s
    set pending = 0, first_pending_at = null, last_pushed_at = now()
    from ready r
    where s.user_id = r.user_id and s.gig_id = r.gig_id
    returning s.user_id, s.gig_id
  )
  select r.user_id, r.gig_id, r.pending, g.title
  from ready r join done d on d.user_id = r.user_id and d.gig_id = r.gig_id
  join gigs g on g.id = r.gig_id;
$$;

-- The sweep also wakes up for throttled chat pushes whose window has passed.
create or replace function push_sweep_job()
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from notification_outbox where pushed_at is null and created_at > now() - interval '1 day')
     or exists (select 1 from chat_push_state
                where pending > 0 and first_pending_at > now() - interval '1 day'
                  and (last_pushed_at is null or last_pushed_at < now() - interval '2 minutes')
                  and (last_seen_at is null or last_seen_at < now() - interval '45 seconds')) then
    perform ping_push_dispatch();
  end if;
end;
$$;

revoke execute on function mark_chat_seen(uuid), gig_message_chat_push(), gig_messages_push_ping(),
  claim_chat_push_batch(int), push_sweep_job() from public, anon, authenticated;
grant execute on function mark_chat_seen(uuid) to authenticated;
grant execute on function claim_chat_push_batch(int) to service_role;
