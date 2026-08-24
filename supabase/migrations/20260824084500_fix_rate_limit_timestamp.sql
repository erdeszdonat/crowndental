-- Avoid the PostgreSQL CURRENT_TIME keyword shadowing the PL/pgSQL variable.
-- CURRENT_TIME is a time-with-time-zone value; the rate-limit window stores timestamptz.
create or replace function public.consume_api_rate_limit(
  p_scope text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_count integer;
  v_current_window timestamptz;
  v_now timestamptz := clock_timestamp();
begin
  if length(p_scope) < 1 or length(p_scope) > 100
    or p_key_hash !~ '^[a-f0-9]{16}$'
    or p_limit < 1 or p_limit > 10000
    or p_window_seconds < 1 or p_window_seconds > 604800 then
    return query select false, 60;
    return;
  end if;

  insert into public.api_rate_limits as rate_limit (
    scope, key_hash, window_started_at, request_count, updated_at
  ) values (
    p_scope, p_key_hash, v_now, 1, v_now
  )
  on conflict (scope, key_hash) do update set
    request_count = case
      when rate_limit.window_started_at <= v_now - make_interval(secs => p_window_seconds) then 1
      else rate_limit.request_count + 1
    end,
    window_started_at = case
      when rate_limit.window_started_at <= v_now - make_interval(secs => p_window_seconds) then v_now
      else rate_limit.window_started_at
    end,
    updated_at = v_now
  returning request_count, window_started_at into v_current_count, v_current_window;

  if random() < 0.01 then
    delete from public.api_rate_limits
      where updated_at < v_now - interval '8 days';
  end if;

  return query select
    v_current_count <= p_limit,
    greatest(
      1,
      ceil(extract(epoch from (v_current_window + make_interval(secs => p_window_seconds) - v_now)))::integer
    );
end;
$$;

revoke all on function public.consume_api_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, text, integer, integer) to service_role;
