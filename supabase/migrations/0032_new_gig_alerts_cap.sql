-- ═════════════════════════════════════════════════════════════════════════════
-- Trimegos 0032: enforce the 3-per-day new-gig alert cap inside one batch too.
-- 0031 only counted alerts already sent, so several new gigs landing in the
-- same batch could all go out. Now each person's pending alerts are ranked and
-- anything past the daily 3 is dropped. An advisory lock serialises claims so
-- two concurrent dispatches can't both slip past the cap.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace function claim_new_gig_push_batch(p_limit int default 200)
returns table (user_id uuid, gig_id uuid, title text, activity text, starts_at timestamptz, place text)
language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext('claim_new_gig_push_batch'));

  -- stale or no-longer-open gigs: drop
  update new_gig_pushes q set pushed_at = now(), skipped = true
  from gigs g
  where q.pushed_at is null and g.id = q.gig_id
    and (g.status <> 'open' or q.created_at < now() - interval '6 hours');

  -- over the daily cap (already sent in the last 24h + earlier pending ones): drop
  with ranked as (
    select q.user_id, q.gig_id,
           row_number() over (partition by q.user_id order by q.created_at) as rn,
           (select count(*) from new_gig_pushes r
            where r.user_id = q.user_id and not r.skipped and r.pushed_at > now() - interval '24 hours') as sent
    from new_gig_pushes q
    where q.pushed_at is null
  )
  update new_gig_pushes q set pushed_at = now(), skipped = true
  from ranked k
  where q.user_id = k.user_id and q.gig_id = k.gig_id and k.rn + k.sent > 3;

  return query
  with pick as (
    select q.user_id, q.gig_id from new_gig_pushes q
    where q.pushed_at is null
    order by q.created_at
    limit greatest(1, least(p_limit, 500))
  ), done as (
    update new_gig_pushes q set pushed_at = now()
    from pick where q.user_id = pick.user_id and q.gig_id = pick.gig_id
    returning q.user_id, q.gig_id
  )
  select d.user_id, d.gig_id, g.title, a.name, g.starts_at, g.place_label
  from done d join gigs g on g.id = d.gig_id left join activities a on a.id = g.activity_id;
end;
$$;

revoke execute on function claim_new_gig_push_batch(int) from public, anon, authenticated;
grant execute on function claim_new_gig_push_batch(int) to service_role;
