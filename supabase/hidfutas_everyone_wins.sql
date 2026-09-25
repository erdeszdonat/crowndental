-- Apply after hidfutas_giveaway. The event has not opened and has no entries.
-- Refuse to rewrite any already-issued prize or accepted terms.
lock table public.hidfutas_entries in access exclusive mode;
do $$ begin
  if exists (select 1 from public.hidfutas_entries) then
    raise exception 'Expected no entries before updating the Hídfutás prizes';
  end if;
end $$;
alter table public.hidfutas_entries
  drop constraint hidfutas_entries_prize_check,
  drop constraint hidfutas_entries_check,
  drop constraint hidfutas_entries_check1,
  add constraint hidfutas_entries_prize_check check (prize in ('strip','powder','floss','toothbrush')),
  add constraint hidfutas_entries_sector_prize_check check (
    (sector=0 and prize='strip') or (sector in (1,4) and prize='powder') or
    (sector=2 and prize='floss') or (sector=3 and prize='toothbrush')
  );
update public.hidfutas_campaigns set rules_version='2026-09-25-v2' where id='hidfutas-2026';

create or replace function public.register_hidfutas_entry(
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
      case p_sector when 0 then 'strip' when 2 then 'floss' when 3 then 'toothbrush' else 'powder' end)
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

