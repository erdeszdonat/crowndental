-- Preserve the original card and requested professional independently of the confirmed appointment.
alter table public.appointments
 add column nfc_card_id text,
 add column requested_hygienist_id text,
 add column requested_clinic_id text,
 add column hygiene_treatment_id text;

alter table public.appointments add constraint appointments_nfc_request_check check (
 (nfc_card_id is null and requested_hygienist_id is null and requested_clinic_id is null and hygiene_treatment_id is null)
 or ((
  nfc_card_id in ('belvaros','primas-sziget','ujvari-lili','berber-waller-oxana','wierl-eva')
  and hygiene_treatment_id in ('fogfeherites','fogkoleszedes','fogekszer','konzultacio')
  and requested_clinic_id = case when nfc_card_id in ('primas-sziget','berber-waller-oxana') then 'primas-sziget' else 'belvaros' end
  and (requested_hygienist_id is null or
    (requested_clinic_id='belvaros' and requested_hygienist_id in ('ujvari-lili','wierl-eva')) or
    (requested_clinic_id='primas-sziget' and requested_hygienist_id='berber-waller-oxana'))
  and (nfc_card_id in ('belvaros','primas-sziget') or requested_hygienist_id=nfc_card_id)
 ) is true)
);
create index appointments_nfc_created_idx on public.appointments(created_at,nfc_card_id) where nfc_card_id is not null;
create index analytics_card_events_idx on public.site_analytics_events(created_at,page,session_id) where page like 'kartya/%';

create function public.admin_nfc_report(p_from date,p_to date) returns jsonb
 language plpgsql security invoker set search_path='' set statement_timeout='10s' as $$
declare result jsonb; t_from timestamptz; t_to timestamptz;
begin
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>3660 then raise exception 'invalid_range'; end if;
 t_from:=p_from::timestamp at time zone 'Europe/Budapest';
 t_to:=(p_to+1)::timestamp at time zone 'Europe/Budapest';
 with cards(id) as (values ('belvaros'),('primas-sziget'),('ujvari-lili'),('berber-waller-oxana'),('wierl-eva')),
 e as materialized (
  select e.session_id,e.page,e.event,e.engagement_ms,e.created_at from public.site_analytics_events e
  where e.created_at>=t_from and e.created_at<t_to and e.page like 'kartya/%'
 ), a as materialized (
  select a.nfc_card_id,a.requested_hygienist_id,a.hygiene_treatment_id,a.status,a.analytics_session_id,a.created_at
  from public.appointments a where a.nfc_card_id is not null and a.created_at>=t_from and a.created_at<t_to and not coalesce(a.is_hidden,false)
 ), visits as (
  select substring(e.page from 8) card_id,e.session_id,min(e.created_at) first_view
  from e where e.event='page_view' group by 1,2
 ), traffic as (
  select c.id,count(*) filter(where e.event='page_view') views,
   count(distinct e.session_id) filter(where e.event='booking_start') starts,
   coalesce(sum(e.engagement_ms),0) engagement_ms,
   count(*) filter(where e.event='phone_click') phone_clicks
  from cards c left join e on e.page='kartya/'||c.id group by c.id
 ), visitors as (
  select v.card_id,count(*) sessions,count(distinct s.visitor_id) visitors from visits v
  join public.site_analytics_sessions s on s.id=v.session_id group by v.card_id
 ), bookings as (
  select nfc_card_id,count(*) requests,count(*) filter(where status in ('processed','special')) confirmed,
   count(*) filter(where status='cancelled') cancelled,
   count(*) filter(where analytics_session_id is not null) measured_requests from a group by nfc_card_id
 ), converted as (
  select v.card_id,count(distinct v.session_id) booked_sessions from visits v join a
   on a.analytics_session_id=v.session_id and a.nfc_card_id=v.card_id and a.created_at>=v.first_view group by v.card_id
 )
 select jsonb_build_object(
  'cards',(select jsonb_agg(jsonb_build_object('id',c.id,'views',coalesce(t.views,0),'visitors',coalesce(v.visitors,0),
   'sessions',coalesce(v.sessions,0),'starts',coalesce(t.starts,0),'requests',coalesce(b.requests,0),
   'confirmed',coalesce(b.confirmed,0),'cancelled',coalesce(b.cancelled,0),'measuredRequests',coalesce(b.measured_requests,0),
   'bookedSessions',coalesce(x.booked_sessions,0),'engagementMs',coalesce(t.engagement_ms,0),'phoneClicks',coalesce(t.phone_clicks,0)) order by c.id)
   from cards c left join traffic t on t.id=c.id left join visitors v on v.card_id=c.id left join bookings b on b.nfc_card_id=c.id left join converted x on x.card_id=c.id),
  'treatments',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from (
   select nfc_card_id card_id,hygiene_treatment_id treatment,count(*) requests,count(*) filter(where status in ('processed','special')) confirmed from a group by 1,2) t),
  'hygienists',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from (
   select requested_hygienist_id id,count(*) requests,count(*) filter(where status in ('processed','special')) confirmed from a group by 1) t)
 ) into result;
 return result;
end $$;
revoke all on function public.admin_nfc_report(date,date) from public,anon,authenticated;
grant execute on function public.admin_nfc_report(date,date) to service_role;
comment on column public.appointments.nfc_card_id is 'Original card landing page used for this request; independent of later appointment reassignment.';
