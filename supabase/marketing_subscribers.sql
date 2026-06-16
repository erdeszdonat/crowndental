create extension if not exists pgcrypto;

create table if not exists public.marketing_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  nickname text,
  phone text,
  clinic text,
  source text not null default 'unknown',
  locale text not null default 'hu',
  consent_status text not null default 'subscribed',
  consented_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint marketing_subscribers_email_unique unique (email),
  constraint marketing_subscribers_email_format check (position('@' in email) > 1),
  constraint marketing_subscribers_consent_status_check check (consent_status in ('subscribed', 'unsubscribed'))
);

create index if not exists marketing_subscribers_created_at_idx
  on public.marketing_subscribers (created_at desc);

create index if not exists marketing_subscribers_clinic_idx
  on public.marketing_subscribers (clinic)
  where clinic is not null;

create index if not exists marketing_subscribers_locale_idx
  on public.marketing_subscribers (locale);

alter table public.marketing_subscribers enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'marketing_subscribers'
      and policyname = 'Service role can manage marketing subscribers'
  ) then
    create policy "Service role can manage marketing subscribers"
      on public.marketing_subscribers
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;
