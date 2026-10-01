-- Tremigos 0020: invite preview also returns the activity slug, so the
-- invite page can show the activity's icon (emojis are no longer displayed).
create or replace function invite_preview(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', g.id,
    'title', g.title,
    'status', case when i.used_at is not null or i.revoked_at is not null then 'used' else g.status::text end,
    'starts_at', g.starts_at,
    'duration_min', g.duration_min,
    'place_label', g.place_label,
    'capacity', g.capacity,
    'claimed_count', g.claimed_count,
    'reserved_slots', g.reserved_slots,
    'host_guests', g.host_guests,
    'activity_name', a.name,
    'activity_emoji', a.emoji,
    'activity_slug', a.slug,
    'host_name', split_part(p.display_name, ' ', 1),
    'locks_at', g.locks_at
  )
  from gig_invites i
  join gigs g on g.id = i.gig_id
  join activities a on a.id = g.activity_id
  join profiles p on p.id = g.host_id
  where i.code = lower(trim(p_code));
$$;
