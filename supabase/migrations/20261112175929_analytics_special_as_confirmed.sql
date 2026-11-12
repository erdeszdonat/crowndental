-- Count special consultations as confirmed in every analytics aggregate.
CREATE OR REPLACE FUNCTION public.admin_analytics_report(p_from date, p_to date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
 SET statement_timeout TO '15s'
AS $function$
declare result jsonb; t_from timestamptz; t_to timestamptz;
begin
  if p_from is null or p_to is null or p_to < p_from or p_to-p_from > 3660 then raise exception 'invalid_range'; end if;
  t_from := p_from::timestamp at time zone 'Europe/Budapest';
  t_to := (p_to+1)::timestamp at time zone 'Europe/Budapest';
  with a as materialized (
    select a.created_at,a.status,a.analytics_session_id,a.treatment,a.city,a.confirmed_clinic_id
    from public.appointments a where a.created_at>=t_from and a.created_at<t_to and not coalesce(a.is_hidden,false)
  ), e as materialized (
    select e.* from public.site_analytics_events e where e.created_at>=t_from and e.created_at<t_to
  ), s as materialized (
    select s.* from public.site_analytics_sessions s where s.id in (select session_id from e union select analytics_session_id from a where analytics_session_id is not null)
  ), traffic_dimensions as (
    select s.id,s.visitor_id,d.kind,d.name from s cross join lateral (values
      ('sources',s.source || ' / ' || s.medium),('campaigns',nullif(s.campaign,'')),('landingPages',s.landing_page),('devices',s.device),('languages',s.language)
    ) d(kind,name)
  ), booking_dimensions as (
    select a.*,d.kind,coalesce(d.name,'Ismeretlen / nem mért') name from a left join public.site_analytics_sessions s on s.id=a.analytics_session_id
    cross join lateral (values ('sources',s.source || ' / ' || s.medium),('campaigns',case when s.id is not null then coalesce(nullif(s.campaign,''),'Nincs kampány') end),('landingPages',s.landing_page),('devices',s.device),('languages',s.language)) d(kind,name)
  ), td as (
    select kind,coalesce(name,'Nincs kampány') name,count(*) sessions,count(distinct visitor_id) visitors from traffic_dimensions group by 1,2
  ), bd as (
    select kind,name,count(*) requests,count(*) filter(where status in ('processed','special')) confirmed,count(distinct analytics_session_id) booked_sessions from booking_dimensions group by 1,2
  ), dimensions as (
    select coalesce(td.kind,bd.kind) kind,coalesce(td.name,bd.name) name,coalesce(td.sessions,0) sessions,coalesce(td.visitors,0) visitors,
      coalesce(bd.requests,0) requests,coalesce(bd.confirmed,0) confirmed,coalesce(bd.booked_sessions,0) booked_sessions
    from td full join bd on td.kind=bd.kind and td.name=bd.name
  ), days as (
    select p_from+i as day from generate_series(0,p_to-p_from) i
  ), daily_a as (
    select (created_at at time zone 'Europe/Budapest')::date as day,count(*) requests,count(*) filter(where status in ('processed','special')) confirmed from a group by 1
  ), daily_e as (
    select (created_at at time zone 'Europe/Budapest')::date as day,count(distinct session_id) sessions,count(*) filter(where event='page_view') views,sum(engagement_ms) engagement_ms from e group by 1
  ), funnel_views as (
    select session_id,min(created_at) as event_at from e where event='booking_form_view' group by 1
  ), funnel_starts as (
    select e.session_id,min(e.created_at) as event_at from e join funnel_views v on v.session_id=e.session_id and e.created_at>=v.event_at where e.event='booking_start' group by 1
  ), funnel_submits as (
    select e.session_id,min(e.created_at) as event_at from e join funnel_starts v on v.session_id=e.session_id and e.created_at>=v.event_at where e.event='booking_submit' group by 1
  ), ga as materialized (
    select * from public.site_analytics_ga_history where day between p_from and p_to
  )
  select jsonb_build_object(
    'summary',jsonb_build_object(
      'requests',(select count(*) from a),'confirmed',(select count(*) from a where status in ('processed','special')),
      'special',(select count(*) from a where status='special'),'cancelled',(select count(*) from a where status='cancelled'),
      'noAnswer',(select count(*) from a where status='no_answer'),'pending',(select count(*) from a where status='new' or status is null),
      'attributed',(select count(*) from a where analytics_session_id is not null),
      'sessions',(select count(*) from s),'visitors',(select count(distinct visitor_id) from s),
      'bookedSessions',(select count(distinct analytics_session_id) from a),
      'bookedVisitors',(select count(distinct s.visitor_id) from s join a on a.analytics_session_id=s.id),
      'views',(select count(*) from e where event='page_view'),'engagementMs',(select coalesce(sum(engagement_ms),0) from e),
      'phoneClicks',(select count(*) from e where event='phone_click'),'ctaClicks',(select count(*) from e where event='booking_cta_click'),
      'errors',(select count(*) from e where event in ('booking_error','booking_validation_error'))),
    'series',(select coalesce(jsonb_agg(jsonb_build_object('day',d.day,'requests',coalesce(a.requests,0),'confirmed',coalesce(a.confirmed,0),'sessions',coalesce(e.sessions,0),'views',coalesce(e.views,0)) order by d.day),'[]') from days d left join daily_a a using(day) left join daily_e e using(day)),
    'breakdowns',(select coalesce(jsonb_object_agg(kind,items),'{}') from (select kind,jsonb_agg(to_jsonb(d)-'kind' order by requests desc,sessions desc,name) items from dimensions d group by kind) groups),
    'treatments',(select coalesce(jsonb_agg(to_jsonb(t) order by requests desc),'[]') from (select left(split_part(treatment,':',1),80) name,count(*) requests,count(*) filter(where status in ('processed','special')) confirmed from a group by 1) t),
    'clinics',(select coalesce(jsonb_agg(to_jsonb(t) order by requests desc),'[]') from (select coalesce(confirmed_clinic_id,city,'Ismeretlen') name,count(*) requests,count(*) filter(where status in ('processed','special')) confirmed from a group by 1) t),
    'pages',(select coalesce(jsonb_agg(to_jsonb(t) order by views desc),'[]') from (select page name,count(*) filter(where event='page_view') views,count(distinct session_id) sessions,sum(engagement_ms) engagement_ms,count(*) filter(where event='booking_cta_click') cta_clicks from e group by page) t),
    'hours',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from (select extract(isodow from created_at at time zone 'Europe/Budapest')::int weekday,extract(hour from created_at at time zone 'Europe/Budapest')::int as hour,count(*) requests from a group by 1,2) t),
    'funnel',jsonb_build_object('views',(select count(*) from funnel_views),'starts',(select count(*) from funnel_starts),'submits',(select count(*) from funnel_submits),'saved',(select count(distinct a.analytics_session_id) from a join funnel_submits f on a.analytics_session_id=f.session_id and a.created_at>=f.event_at)),
    'ga',jsonb_build_object('sessions',(select coalesce(sum(sessions),0) from ga),'views',(select coalesce(sum(views),0) from ga),
      'engagementSeconds',(select coalesce(sum(engagement_seconds),0) from ga),'bookingEvents',(select coalesce(sum(booking_events),0) from ga),
      'series',(select coalesce(jsonb_agg(to_jsonb(t) order by day),'[]') from (select day,sum(sessions) sessions,sum(views) views,sum(booking_events) booking_events from ga group by day) t),
      'sources',(select coalesce(jsonb_agg(to_jsonb(t) order by sessions desc),'[]') from (select source || ' / ' || medium name,sum(sessions) sessions,sum(booking_events) booking_events from ga group by 1) t))
  ) into result;
  return result;
end $function$
;
REVOKE ALL ON FUNCTION public.admin_analytics_report(date,date) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analytics_report(date,date) TO service_role;
