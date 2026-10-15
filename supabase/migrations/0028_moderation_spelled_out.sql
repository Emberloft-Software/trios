-- 0028: also catch words spelled out letter by letter ("f.u.c.k", "k y s"):
-- runs of 3+ single letters are rejoined and searched for any term inside.
create or replace function mod_join_singles(p text)
returns text language plpgsql immutable set search_path = public as $$
declare w text; out text := ''; run text := '';
begin
  foreach w in array regexp_split_to_array(coalesce(p, ''), ' ') loop
    if length(w) = 1 then
      run := run || w;
    else
      if length(run) >= 3 then out := out || ' ' || run; end if;
      run := '';
    end if;
  end loop;
  if length(run) >= 3 then out := out || ' ' || run; end if;
  return trim(out);
end;
$$;

create or replace function mod_matches(p_body text)
returns table (term text, category text, severity int)
language sql stable security definer set search_path = public as $$
  with n as (select mod_normalize(p_body) as t), v as (select t, mod_join_singles(t) as j from n)
  select m.term, m.category, m.severity
  from moderation_terms m, v
  where v.t ~ ('(^| )' || m.term || '(s|es|ing|er|ers|ed)?( |$)')
     or (v.j <> '' and length(replace(m.term, ' ', '')) >= 3 and v.j like '%' || replace(m.term, ' ', '') || '%')
     or (length(replace(m.term, ' ', '')) >= 6 and replace(v.t, ' ', '') like '%' || replace(m.term, ' ', '') || '%');
$$;

revoke execute on function mod_join_singles(text), mod_matches(text) from public, anon, authenticated;
grant execute on function mod_matches(text) to service_role;
