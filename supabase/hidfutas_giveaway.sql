-- Additive event schema. Apply as the hidfutas_giveaway migration.
create table public.hidfutas_campaigns (
  id text primary key,
  starts_at timestamptz not null,
  closes_at timestamptz not null,
  draw_at timestamptz not null,
  rules_version text not null,
  check (starts_at < closes_at and closes_at < draw_at)
);
insert into public.hidfutas_campaigns values (
  'hidfutas-2026', '2026-09-26T09:00:00+02:00', '2026-09-26T13:00:00+02:00',
  '2026-09-28T00:00:00+02:00', '2026-09-25-v1'
);

create table public.hidfutas_entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.hidfutas_campaigns(id),
  request_id uuid not null unique,
  code text not null unique default ('HF-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  name text not null check (length(name) between 3 and 120),
  email text not null check (length(email) <= 254 and email = lower(trim(email)) and position('@' in email) > 1),
  phone text not null check (phone ~ '^\+[0-9]{7,15}$'),
  rules_version text not null,
  adult_confirmed boolean not null check (adult_confirmed),
  marketing_consent boolean not null,
  marketing_synced_at timestamptz,
  marketing_attempted_at timestamptz,
  marketing_error text,
  sector smallint not null check (sector between 0 and 4),
  prize text not null check (prize in ('strip', 'powder', 'floss', 'none')),
  created_at timestamptz not null default now(),
  redeemed_at timestamptz,
  unique(campaign_id, email),
  unique(campaign_id, phone),
  check ((sector=0 and prize='strip') or (sector in (1,4) and prize='powder') or (sector=2 and prize='floss') or (sector=3 and prize='none')),
  check (redeemed_at is null or prize <> 'none')
);
create index hidfutas_entries_campaign_created on public.hidfutas_entries(campaign_id, created_at);
create table public.hidfutas_draws (
  campaign_id text primary key references public.hidfutas_campaigns(id),
  winner_id uuid not null references public.hidfutas_entries(id),
  entrant_count integer not null check (entrant_count > 0),
  drawn_at timestamptz not null default now(),
  email_sent_at timestamptz,
  email_provider_id text,
  email_attempted_at timestamptz,
  phone_contacted_at timestamptz,
  facebook_published_at timestamptz
);
alter table public.hidfutas_campaigns enable row level security;
alter table public.hidfutas_entries enable row level security;
alter table public.hidfutas_draws enable row level security;
revoke all on public.hidfutas_campaigns, public.hidfutas_entries, public.hidfutas_draws from public, anon, authenticated;
grant select, insert, update, delete on public.hidfutas_campaigns, public.hidfutas_entries, public.hidfutas_draws to service_role;

create function public.register_hidfutas_entry(
  p_request_id uuid, p_name text, p_email text, p_phone text,
  p_rules_version text, p_marketing boolean, p_sector integer
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  campaign public.hidfutas_campaigns%rowtype;
  entry public.hidfutas_entries%rowtype;
  inserted boolean := false;
begin
  -- Serialize requests for the same browser token; unique indexes additionally
  -- prevent different tokens from creating duplicates for an email or phone.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select * into entry from public.hidfutas_entries where request_id = p_request_id;
  if found then
    if entry.email <> p_email or entry.phone <> p_phone or entry.name <> p_name
      or entry.marketing_consent <> p_marketing or entry.rules_version <> p_rules_version then
      return jsonb_build_object('error', 'request_conflict');
    end if;
  else
    select * into campaign from public.hidfutas_campaigns where id = 'hidfutas-2026' for share;
    if not found then return jsonb_build_object('error', 'unavailable'); end if;
    if now() < campaign.starts_at then return jsonb_build_object('error', 'not_started'); end if;
    if now() >= campaign.closes_at then return jsonb_build_object('error', 'closed'); end if;
    if p_rules_version <> campaign.rules_version then return jsonb_build_object('error', 'rules_changed'); end if;
    if p_sector not between 0 and 4 then return jsonb_build_object('error', 'invalid_sector'); end if;
    insert into public.hidfutas_entries(campaign_id, request_id, name, email, phone, rules_version, adult_confirmed, marketing_consent, sector, prize)
    values(campaign.id, p_request_id, p_name, p_email, p_phone, p_rules_version, true, p_marketing, p_sector,
      case p_sector when 0 then 'strip' when 2 then 'floss' when 3 then 'none' else 'powder' end)
    on conflict do nothing returning * into entry;
    if not found then return jsonb_build_object('error', 'already_registered'); end if;
    inserted := true;
  end if;
  return jsonb_build_object('created', inserted, 'id', entry.id, 'receipt', jsonb_build_object(
    'code', entry.code, 'sector', entry.sector, 'prize', entry.prize,
    'marketing', case when not entry.marketing_consent then 'no' when entry.marketing_synced_at is not null then 'synced' else 'pending' end
  ));
end $$;
revoke all on function public.register_hidfutas_entry(uuid,text,text,text,text,boolean,integer) from public, anon, authenticated;
grant execute on function public.register_hidfutas_entry(uuid,text,text,text,text,boolean,integer) to service_role;

create function public.draw_hidfutas_winner() returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  campaign public.hidfutas_campaigns%rowtype;
  draw public.hidfutas_draws%rowtype;
  winner uuid;
  entrants integer;
begin
  select * into campaign from public.hidfutas_campaigns where id = 'hidfutas-2026' for update;
  if not found then return jsonb_build_object('error', 'unavailable'); end if;
  select * into draw from public.hidfutas_draws where campaign_id = campaign.id;
  if found then return to_jsonb(draw); end if;
  if now() < campaign.draw_at then return jsonb_build_object('error', 'too_early'); end if;
  select count(*) into entrants from public.hidfutas_entries where campaign_id = campaign.id;
  if entrants = 0 then return jsonb_build_object('error', 'no_entries'); end if;
  -- Independent cryptographically random UUIDv4 keys give every entry equal
  -- probability. Neither newsletter consent nor instant prize affects the draw.
  select id into winner from public.hidfutas_entries where campaign_id = campaign.id order by gen_random_uuid() limit 1;
  insert into public.hidfutas_draws(campaign_id, winner_id, entrant_count)
    values(campaign.id, winner, entrants) returning * into draw;
  return to_jsonb(draw);
end $$;
revoke all on function public.draw_hidfutas_winner() from public, anon, authenticated;
grant execute on function public.draw_hidfutas_winner() to service_role;
