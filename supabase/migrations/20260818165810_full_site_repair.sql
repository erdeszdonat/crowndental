-- Crown Dental public form hardening, localization and durable idempotency.
alter table public.appointments
  add column if not exists locale text not null default 'hu',
  add column if not exists idempotency_key text,
  add column if not exists request_receipt_email_sent_at timestamptz,
  add column if not exists request_receipt_email_idempotency_key text,
  add column if not exists confirmation_email_idempotency_key text,
  add column if not exists no_answer_email_sent_at timestamptz,
  add column if not exists no_answer_email_idempotency_key text,
  add column if not exists cancellation_email_sent_at timestamptz,
  add column if not exists cancellation_email_idempotency_key text;

alter table public.career_applications
  add column if not exists locale text not null default 'hu',
  add column if not exists idempotency_key text,
  add column if not exists receipt_email_sent_at timestamptz,
  add column if not exists receipt_email_idempotency_key text;

alter table public.quote_leads
  add column if not exists locale text not null default 'hu',
  add column if not exists idempotency_key text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists privacy_version text,
  add column if not exists ai_processing_consent boolean not null default false,
  add column if not exists receipt_email_sent_at timestamptz,
  add column if not exists receipt_email_idempotency_key text,
  add column if not exists crown_total_min bigint,
  add column if not exists crown_total_max bigint,
  add column if not exists savings_min bigint,
  add column if not exists savings_max bigint,
  add column if not exists requires_manual_review boolean not null default false;

alter table public.marketing_subscribers
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists unsubscribe_token_hash text,
  add column if not exists audience_synced_at timestamptz,
  add column if not exists automation_started_at timestamptz;

-- Existing subscribed contacts predate these markers; treat their historical
-- import/automation as completed so routine profile updates do not restart it.
update public.marketing_subscribers
set audience_synced_at = coalesce(audience_synced_at, consented_at, updated_at, now()),
    automation_started_at = coalesce(automation_started_at, consented_at, updated_at, now())
where consent_status = 'subscribed';

do $$
declare
  table_name text;
begin
  foreach table_name in array array['appointments', 'career_applications', 'quote_leads']
  loop
    if not exists (
      select 1 from pg_constraint
      where conname = table_name || '_locale_check'
        and conrelid = ('public.' || table_name)::regclass
    ) then
      execute format(
        'alter table public.%I add constraint %I check (locale in (''hu'', ''en'', ''sk'', ''de''))',
        table_name,
        table_name || '_locale_check'
      );
    end if;
  end loop;
end $$;

create unique index if not exists appointments_idempotency_key_uidx
  on public.appointments (idempotency_key)
  where idempotency_key is not null;

create unique index if not exists career_applications_idempotency_key_uidx
  on public.career_applications (idempotency_key)
  where idempotency_key is not null;

create unique index if not exists quote_leads_idempotency_key_uidx
  on public.quote_leads (idempotency_key)
  where idempotency_key is not null;

create index if not exists appointments_locale_created_at_idx
  on public.appointments (locale, created_at desc);

create index if not exists career_applications_locale_created_at_idx
  on public.career_applications (locale, created_at desc);

create index if not exists quote_leads_locale_created_at_idx
  on public.quote_leads (locale, created_at desc);

create unique index if not exists marketing_subscribers_unsubscribe_token_hash_uidx
  on public.marketing_subscribers (unsubscribe_token_hash)
  where unsubscribe_token_hash is not null;

create table if not exists public.api_rate_limits (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (scope, key_hash)
);

create index if not exists api_rate_limits_updated_at_idx
  on public.api_rate_limits (updated_at);

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
  current_count integer;
  current_window timestamptz;
  current_time timestamptz := clock_timestamp();
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
    p_scope, p_key_hash, current_time, 1, current_time
  )
  on conflict (scope, key_hash) do update set
    request_count = case
      when rate_limit.window_started_at <= current_time - make_interval(secs => p_window_seconds) then 1
      else rate_limit.request_count + 1
    end,
    window_started_at = case
      when rate_limit.window_started_at <= current_time - make_interval(secs => p_window_seconds) then current_time
      else rate_limit.window_started_at
    end,
    updated_at = current_time
  returning request_count, window_started_at into current_count, current_window;

  if random() < 0.01 then
    delete from public.api_rate_limits
      where updated_at < current_time - interval '8 days';
  end if;

  return query select
    current_count <= p_limit,
    greatest(1, ceil(extract(epoch from (current_window + make_interval(secs => p_window_seconds) - current_time)))::integer);
end;
$$;

-- These tables contain patient/contact data and are only accessed through server routes.
alter table public.appointments enable row level security;
alter table public.career_applications enable row level security;
alter table public.quote_leads enable row level security;
alter table public.marketing_subscribers enable row level security;
alter table public.api_rate_limits enable row level security;

revoke all on table public.appointments from anon, authenticated;
revoke all on table public.career_applications from anon, authenticated;
revoke all on table public.quote_leads from anon, authenticated;
revoke all on table public.marketing_subscribers from anon, authenticated;
revoke all on table public.api_rate_limits from anon, authenticated;
revoke all on function public.consume_api_rate_limit(text, text, integer, integer) from public, anon, authenticated;

grant select, insert, update, delete on table public.appointments to service_role;
grant select, insert, update, delete on table public.career_applications to service_role;
grant select, insert, update, delete on table public.quote_leads to service_role;
grant select, insert, update, delete on table public.marketing_subscribers to service_role;
grant select, insert, update, delete on table public.api_rate_limits to service_role;
grant execute on function public.consume_api_rate_limit(text, text, integer, integer) to service_role;
