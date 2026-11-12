-- Read-only integration assertions against the existing October 2026 data.
do $$
declare r jsonb; expected bigint; ordinary bigint; special bigint; dimension record; total bigint;
begin
  select count(*) filter(where status in ('processed','special')),count(*) filter(where status='processed'),count(*) filter(where status='special')
    into expected,ordinary,special
    from public.appointments
    where created_at >= timestamp '2026-10-01' at time zone 'Europe/Budapest'
      and created_at < timestamp '2026-11-01' at time zone 'Europe/Budapest'
      and not coalesce(is_hidden,false);
  r:=public.admin_analytics_report('2026-10-01','2026-10-31');
  if special=0 then raise exception 'Fixture period must contain special consultations'; end if;
  if (r#>>'{summary,confirmed}')::bigint<>expected then raise exception 'summary mismatch'; end if;
  if (r#>>'{summary,confirmed}')::bigint-(r#>>'{summary,special}')::bigint<>ordinary then raise exception 'status breakdown would double count'; end if;
  for dimension in select key,value from jsonb_each(r->'breakdowns') loop
    select sum((value->>'confirmed')::bigint) into total from jsonb_array_elements(dimension.value);
    if total<>expected then raise exception 'breakdown mismatch: %',dimension.key; end if;
  end loop;
  for dimension in select name from (values ('series'),('treatments'),('clinics')) names(name) loop
    select sum((value->>'confirmed')::bigint) into total from jsonb_array_elements(r->dimension.name);
    if total<>expected then raise exception 'aggregate mismatch: %',dimension.name; end if;
  end loop;
  if has_function_privilege('anon','public.admin_analytics_report(date,date)','execute') or has_function_privilege('authenticated','public.admin_analytics_report(date,date)','execute') then raise exception 'report must remain private'; end if;
end $$;
select public.admin_analytics_report('2026-10-01','2026-10-31')->'summary' as verified_summary;
