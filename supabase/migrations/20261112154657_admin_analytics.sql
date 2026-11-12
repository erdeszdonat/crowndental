-- Private, first-party analytics. No names, contact details, IP addresses or form contents.
create table public.site_analytics_sessions (
  id uuid primary key, visitor_id uuid not null, created_at timestamptz not null default now(),
  source text not null, medium text not null, campaign text not null default '',
  landing_page text not null, device text not null, language text not null,
  check (length(source)<=80 and length(medium)<=80 and length(campaign)<=80 and length(landing_page)<=100)
);
create table public.site_analytics_events (
  id uuid primary key, session_id uuid not null references public.site_analytics_sessions(id) on delete cascade,
  created_at timestamptz not null default now(), event text not null, page text not null,
  engagement_ms integer not null default 0 check (engagement_ms between 0 and 30000),
  step smallint not null default 0 check (step between 0 and 2), placement text not null default '',
  check(event in ('page_view','engagement','booking_cta_click','phone_click','booking_form_view','booking_start','booking_step_view','booking_step_complete','booking_submit','booking_error','booking_validation_error'))
);
create table public.site_analytics_settings (
  id boolean primary key default true check(id), installed_at timestamptz not null default now(),
  ga_imported_at timestamptz, ga_through date
);
insert into public.site_analytics_settings(id) values(true);
create table public.site_analytics_ga_history (
  day date not null, source text not null, medium text not null,
  sessions bigint not null, views bigint not null, engagement_seconds numeric not null,
  booking_events bigint not null default 0, primary key(day,source,medium)
);
alter table public.appointments add column analytics_session_id uuid references public.site_analytics_sessions(id) on delete set null;
create index appointments_analytics_date_idx on public.appointments(created_at);
create index appointments_analytics_session_idx on public.appointments(analytics_session_id) where analytics_session_id is not null;
create index site_analytics_sessions_created_idx on public.site_analytics_sessions(created_at);
create index site_analytics_events_created_idx on public.site_analytics_events(created_at);
create index site_analytics_events_session_idx on public.site_analytics_events(session_id,created_at);
alter table public.site_analytics_sessions enable row level security;
alter table public.site_analytics_events enable row level security;
alter table public.site_analytics_settings enable row level security;
alter table public.site_analytics_ga_history enable row level security;
revoke all on public.site_analytics_sessions,public.site_analytics_events,public.site_analytics_settings,public.site_analytics_ga_history from public,anon,authenticated;
grant select,insert,update,delete on public.site_analytics_sessions,public.site_analytics_events,public.site_analytics_settings,public.site_analytics_ga_history to service_role;

create function public.admin_analytics_report(p_from date,p_to date) returns jsonb
language plpgsql security invoker set search_path = '' set statement_timeout = '15s'
as $$
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
    select kind,name,count(*) requests,count(*) filter(where status='processed') confirmed,count(distinct analytics_session_id) booked_sessions from booking_dimensions group by 1,2
  ), dimensions as (
    select coalesce(td.kind,bd.kind) kind,coalesce(td.name,bd.name) name,coalesce(td.sessions,0) sessions,coalesce(td.visitors,0) visitors,
      coalesce(bd.requests,0) requests,coalesce(bd.confirmed,0) confirmed,coalesce(bd.booked_sessions,0) booked_sessions
    from td full join bd on td.kind=bd.kind and td.name=bd.name
  ), days as (
    select p_from+i as day from generate_series(0,p_to-p_from) i
  ), daily_a as (
    select (created_at at time zone 'Europe/Budapest')::date as day,count(*) requests,count(*) filter(where status='processed') confirmed from a group by 1
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
      'requests',(select count(*) from a),'confirmed',(select count(*) from a where status='processed'),
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
    'treatments',(select coalesce(jsonb_agg(to_jsonb(t) order by requests desc),'[]') from (select left(split_part(treatment,':',1),80) name,count(*) requests,count(*) filter(where status='processed') confirmed from a group by 1) t),
    'clinics',(select coalesce(jsonb_agg(to_jsonb(t) order by requests desc),'[]') from (select coalesce(confirmed_clinic_id,city,'Ismeretlen') name,count(*) requests,count(*) filter(where status='processed') confirmed from a group by 1) t),
    'pages',(select coalesce(jsonb_agg(to_jsonb(t) order by views desc),'[]') from (select page name,count(*) filter(where event='page_view') views,count(distinct session_id) sessions,sum(engagement_ms) engagement_ms,count(*) filter(where event='booking_cta_click') cta_clicks from e group by page) t),
    'hours',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from (select extract(isodow from created_at at time zone 'Europe/Budapest')::int weekday,extract(hour from created_at at time zone 'Europe/Budapest')::int as hour,count(*) requests from a group by 1,2) t),
    'funnel',jsonb_build_object('views',(select count(*) from funnel_views),'starts',(select count(*) from funnel_starts),'submits',(select count(*) from funnel_submits),'saved',(select count(distinct a.analytics_session_id) from a join funnel_submits f on a.analytics_session_id=f.session_id and a.created_at>=f.event_at)),
    'ga',jsonb_build_object('sessions',(select coalesce(sum(sessions),0) from ga),'views',(select coalesce(sum(views),0) from ga),
      'engagementSeconds',(select coalesce(sum(engagement_seconds),0) from ga),'bookingEvents',(select coalesce(sum(booking_events),0) from ga),
      'series',(select coalesce(jsonb_agg(to_jsonb(t) order by day),'[]') from (select day,sum(sessions) sessions,sum(views) views,sum(booking_events) booking_events from ga group by day) t),
      'sources',(select coalesce(jsonb_agg(to_jsonb(t) order by sessions desc),'[]') from (select source || ' / ' || medium name,sum(sessions) sessions,sum(booking_events) booking_events from ga group by 1) t))
  ) into result;
  return result;
end $$;
revoke all on function public.admin_analytics_report(date,date) from public,anon,authenticated;
grant execute on function public.admin_analytics_report(date,date) to service_role;

-- Data lifecycle: anonymous event-level data stays for 25 months, visitor IDs rotate after 90 days.
-- Run by pg_cron daily, at most once per day.
alter table public.site_analytics_settings add column last_cleanup_at timestamptz;
create function public.cleanup_site_analytics() returns void language plpgsql security invoker set search_path='' as $$
begin
  update public.site_analytics_settings set last_cleanup_at=now() where id and (last_cleanup_at is null or last_cleanup_at<now()-interval '1 day');
  if found then delete from public.site_analytics_sessions where created_at<now()-interval '25 months'; end if;
end $$;
revoke all on function public.cleanup_site_analytics() from public,anon,authenticated;
grant execute on function public.cleanup_site_analytics() to service_role;
select cron.schedule('crown-analytics-retention','25 3 * * *','select public.cleanup_site_analytics()');
