-- Transactional reminders: Budapest calendar day before the confirmed visit.
-- No patient data or reusable dispatch credentials enter the HTTP request queue.
alter table public.appointments
  add column imaging_notice_enabled boolean not null default false,
  add column confirmed_start_at timestamptz,
  add column reminder_email_sent_at timestamptz;
grant update(imaging_notice_enabled) on public.appointments to authenticated;

create function private.crown_parse_appointment_time(value text) returns timestamptz
language plpgsql immutable strict set search_path=pg_catalog as $$
declare local_time timestamp;
begin
  if value !~ '^\d{4}\.\d{2}\.\d{2}\. \d{2}:\d{2}$' then return null; end if;
  local_time := make_timestamp(substring(value,1,4)::int,substring(value,6,2)::int,substring(value,9,2)::int,substring(value,13,2)::int,substring(value,16,2)::int,0);
  if to_char(local_time,'YYYY.MM.DD. HH24:MI') <> value then return null; end if;
  return local_time at time zone 'Europe/Budapest';
exception when others then return null;
end $$;
revoke all on function private.crown_parse_appointment_time(text) from public,anon;
grant execute on function private.crown_parse_appointment_time(text) to authenticated,service_role;

create function private.crown_sync_appointment_time() returns trigger
language plpgsql security invoker set search_path=pg_catalog as $$
begin
  new.reminder_email_sent_at := null;
  new.confirmed_start_at := private.crown_parse_appointment_time(new.confirmed_appointment_local);
  return new;
end $$;
revoke all on function private.crown_sync_appointment_time() from public,anon;
create trigger crown_sync_appointment_time before insert or update of confirmed_appointment_local on public.appointments
for each row execute function private.crown_sync_appointment_time();
update public.appointments set confirmed_start_at=private.crown_parse_appointment_time(confirmed_appointment_local)
where confirmed_appointment_local is not null;
create index appointments_reminder_due_idx on public.appointments(confirmed_start_at)
where status in ('processed','special') and is_hidden is not true;

create table public.appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  appointment_id bigint not null references public.appointments(id) on delete cascade,
  starts_at timestamptz not null,
  clinic_id text not null check(clinic_id in ('belvaros','primas-sziget')),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  lease_token uuid,
  lease_until timestamptz,
  sent_at timestamptz,
  provider_id text,
  last_error text,
  unique(appointment_id,starts_at,clinic_id)
);
alter table public.appointment_reminders enable row level security;
revoke all on public.appointment_reminders from public,anon,authenticated;
grant select,insert,update on public.appointment_reminders to service_role;

create table private.crown_reminder_settings (
  id boolean primary key default true check(id),
  dispatch_secret text not null,
  enabled boolean not null default false
);
alter table private.crown_reminder_settings enable row level security;
revoke all on private.crown_reminder_settings from public,anon,authenticated,service_role;
insert into private.crown_reminder_settings(dispatch_secret) values(encode(extensions.gen_random_bytes(32),'hex'));

-- Only the server's service role can verify the scheduler credential. The
-- secret never leaves this private table except over TLS to our fixed worker.
create function private.crown_reminder_authorized(token text) returns boolean
language sql stable security definer set search_path=pg_catalog as $$
  select coalesce((select enabled and length(token)=64 and
    extensions.digest(token,'sha256')=extensions.digest(dispatch_secret,'sha256')
    from private.crown_reminder_settings where id),false)
$$;
revoke all on function private.crown_reminder_authorized(text) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.crown_reminder_authorized(text) to service_role;
create function public.crown_reminder_authorized(token text) returns boolean
language sql stable security invoker set search_path=pg_catalog as $$
  select private.crown_reminder_authorized(token)
$$;
revoke all on function public.crown_reminder_authorized(text) from public,anon,authenticated;
grant execute on function public.crown_reminder_authorized(text) to service_role;

create function public.claim_appointment_reminder() returns jsonb
language plpgsql security invoker set search_path=pg_catalog as $$
declare
  local_now timestamp := now() at time zone 'Europe/Budapest';
  day_start timestamptz := ((local_now::date+1)::timestamp at time zone 'Europe/Budapest');
  day_end timestamptz := ((local_now::date+2)::timestamp at time zone 'Europe/Budapest');
  appt public.appointments%rowtype;
  job public.appointment_reminders%rowtype;
  token uuid := gen_random_uuid();
begin
  -- Every 15 minutes, 09:00–20:59 local; never retry on the appointment day.
  if local_now::time < time '09:00' or local_now::time >= time '21:00' then return null; end if;
  select a.* into appt from public.appointments a
  left join public.appointment_reminders r on r.appointment_id=a.id and r.starts_at=a.confirmed_start_at and r.clinic_id=a.confirmed_clinic_id
  where a.confirmed_start_at >= day_start and a.confirmed_start_at < day_end
    and a.status in ('processed','special') and a.is_hidden is not true
    and a.confirmed_clinic_id in ('belvaros','primas-sziget')
    and a.email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and (a.confirmation_sending_started_at is null or a.confirmation_sending_started_at < now()-interval '15 minutes')
    and (r.id is null or (r.sent_at is null and r.attempts<8 and r.next_attempt_at<=now() and (r.lease_until is null or r.lease_until<now())))
  order by a.confirmed_start_at,a.id limit 1 for update of a skip locked;
  if not found then return null; end if;
  insert into public.appointment_reminders(appointment_id,starts_at,clinic_id,snapshot)
  values(appt.id,appt.confirmed_start_at,appt.confirmed_clinic_id,jsonb_build_object(
    'name',appt.name,'email',trim(appt.email),'locale',appt.locale,'treatment',appt.treatment,
    'dateTime',appt.confirmed_appointment_local,'clinicId',appt.confirmed_clinic_id,
    'includeImagingNotice',appt.imaging_notice_enabled))
  on conflict(appointment_id,starts_at,clinic_id) do nothing;
  update public.appointment_reminders set attempts=attempts+1,lease_token=token,lease_until=now()+interval '15 minutes'
  where appointment_id=appt.id and starts_at=appt.confirmed_start_at and clinic_id=appt.confirmed_clinic_id
  returning * into job;
  -- Share the existing confirmation/status lock: cancellation cannot send a
  -- contradictory email while this reminder is being delivered.
  update public.appointments set confirmation_sending_token=token::text,confirmation_sending_started_at=now() where id=appt.id;
  return jsonb_build_object('id',job.id,'token',token,'snapshot',job.snapshot);
end $$;
revoke all on function public.claim_appointment_reminder() from public,anon,authenticated;
grant execute on function public.claim_appointment_reminder() to service_role;

create function public.finish_appointment_reminder(job_id uuid,token uuid,provider_message_id text default null,error_code text default null) returns boolean
language plpgsql security invoker set search_path=pg_catalog as $$
declare appt_id bigint;
begin
  update public.appointment_reminders set
    sent_at=case when provider_message_id is not null then now() else sent_at end,
    provider_id=provider_message_id,last_error=left(error_code,80),
    lease_token=null,lease_until=null,next_attempt_at=now()+interval '1 hour'
  where id=job_id and lease_token=token returning appointment_id into appt_id;
  if not found then return false; end if;
  update public.appointments set confirmation_sending_token=null,confirmation_sending_started_at=null,
    reminder_email_sent_at=case when provider_message_id is not null then now() else reminder_email_sent_at end
  where id=appt_id and confirmation_sending_token=token::text;
  return true;
end $$;
revoke all on function public.finish_appointment_reminder(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.finish_appointment_reminder(uuid,uuid,text,text) to service_role;

create function private.dispatch_crown_reminders(force_check boolean default false) returns integer
language plpgsql security invoker set search_path=pg_catalog as $$
declare token text; response_status integer; local_now timestamp := now() at time zone 'Europe/Budapest';
begin
  if not pg_try_advisory_xact_lock(428719904) then return 204; end if;
  select dispatch_secret into token from private.crown_reminder_settings where id and enabled;
  if token is null then return 204; end if;
  if not force_check then
    if local_now::time < time '09:00' or local_now::time >= time '21:00' then return 204; end if;
    if not exists(select 1 from public.appointments a left join public.appointment_reminders r
      on r.appointment_id=a.id and r.starts_at=a.confirmed_start_at and r.clinic_id=a.confirmed_clinic_id
      where a.confirmed_start_at >= ((local_now::date+1)::timestamp at time zone 'Europe/Budapest')
      and a.confirmed_start_at < ((local_now::date+2)::timestamp at time zone 'Europe/Budapest')
      and a.status in ('processed','special') and a.is_hidden is not true
      and a.confirmed_clinic_id in ('belvaros','primas-sziget')
      and a.email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      and (r.id is null or (r.sent_at is null and r.attempts<8 and r.next_attempt_at<=now() and (r.lease_until is null or r.lease_until<now())))) then return 204; end if;
  end if;
  perform extensions.http_set_curlopt('CURLOPT_CONNECTTIMEOUT_MS','5000');
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS','55000');
  select status into response_status from extensions.http((
    'POST','https://www.crowndental.hu/api/appointment-reminders'||case when force_check then '?check=1' else '' end,
    array[extensions.http_header('Authorization','Bearer '||token)],'application/json','{}'
  )::extensions.http_request);
  perform extensions.http_reset_curlopt();
  if response_status<>200 then raise exception 'Crown reminder worker returned HTTP %',response_status; end if;
  return response_status;
exception when others then
  perform extensions.http_reset_curlopt();
  raise exception 'Crown reminder dispatch failed; inspect appointment_reminders and application logs';
end $$;
revoke all on function private.dispatch_crown_reminders(boolean) from public,anon,authenticated,service_role;
-- Enable only after the worker has been deployed and its authentication checked.
select cron.schedule('crown-appointment-reminders','*/15 7-19 * * *','select private.dispatch_crown_reminders();');
