-- Run in a transaction after the NFC migration, then roll back. Synthetic data only.
do $$
declare report jsonb; card jsonb;
begin
 if has_function_privilege('anon','public.admin_nfc_report(date,date)','execute') or has_function_privilege('authenticated','public.admin_nfc_report(date,date)','execute') then raise exception 'report is exposed'; end if;
 if not has_function_privilege('service_role','public.admin_nfc_report(date,date)','execute') then raise exception 'service cannot report'; end if;
 insert into public.site_analytics_sessions(id,visitor_id,created_at,source,medium,campaign,landing_page,device,language) values
 ('aa000001-0000-4000-8000-000000000001','bb000001-0000-4000-8000-000000000001','2020-03-28 23:00Z','direct','none','','kartya/ujvari-lili','mobile','hu'),
 ('aa000001-0000-4000-8000-000000000002','bb000001-0000-4000-8000-000000000001','2020-03-29 09:00Z','direct','none','','kartya/ujvari-lili','mobile','hu');
 insert into public.site_analytics_events(id,session_id,created_at,event,page) values
 ('cc000001-0000-4000-8000-000000000001','aa000001-0000-4000-8000-000000000001','2020-03-28 23:00Z','page_view','kartya/ujvari-lili'),
 ('cc000001-0000-4000-8000-000000000002','aa000001-0000-4000-8000-000000000001','2020-03-29 08:00Z','page_view','kartya/ujvari-lili'),
 ('cc000001-0000-4000-8000-000000000003','aa000001-0000-4000-8000-000000000001','2020-03-29 08:01Z','booking_start','kartya/ujvari-lili'),
 ('cc000001-0000-4000-8000-000000000004','aa000001-0000-4000-8000-000000000002','2020-03-29 09:00Z','page_view','kartya/ujvari-lili'),
 ('cc000001-0000-4000-8000-000000000005','aa000001-0000-4000-8000-000000000001','2020-03-29 22:00Z','page_view','kartya/ujvari-lili');
 insert into public.appointments(name,email,phone,city,treatment,created_at,status,is_hidden,nfc_card_id,requested_hygienist_id,requested_clinic_id,hygiene_treatment_id,analytics_session_id)
 select 'NFC rollback fixture','fixture@example.invalid','+36123456789','Esztergom','Fogfehérítés',t.at,t.status,t.hidden,'ujvari-lili','ujvari-lili','belvaros','fogfeherites',t.session_id::uuid from (values
 ('2020-03-29 08:30Z'::timestamptz,'processed',false,'aa000001-0000-4000-8000-000000000001'),
 ('2020-03-29 08:40Z'::timestamptz,'special',false,'aa000001-0000-4000-8000-000000000001'),
 ('2020-03-29 08:50Z'::timestamptz,'new',false,null),
 ('2020-03-29 08:55Z'::timestamptz,'processed',true,null),
 ('2020-03-29 22:00Z'::timestamptz,'new',false,null)
 )t(at,status,hidden,session_id);
 report:=public.admin_nfc_report('2020-03-29','2020-03-29');
 select value into card from jsonb_array_elements(report->'cards') where value->>'id'='ujvari-lili';
 if (card->>'views')::int<>3 or (card->>'visitors')::int<>1 or (card->>'sessions')::int<>2 or (card->>'starts')::int<>1
 or (card->>'requests')::int<>3 or (card->>'confirmed')::int<>2 or (card->>'bookedSessions')::int<>1 then raise exception 'incorrect NFC metrics: %',card; end if;
 if jsonb_array_length(report->'cards')<>5 then raise exception 'missing empty cards'; end if;
 begin
  insert into public.appointments(name,email,phone,city,treatment,nfc_card_id,requested_hygienist_id,requested_clinic_id,hygiene_treatment_id)
  values('Invalid fixture','fixture@example.invalid','+36123456789','Esztergom','Fogfehérítés','ujvari-lili','berber-waller-oxana','primas-sziget','fogfeherites');
  raise exception 'cross-clinic request accepted';
 exception when check_violation then null; end;
 begin
  insert into public.appointments(name,email,phone,city,treatment,nfc_card_id,requested_hygienist_id,requested_clinic_id,hygiene_treatment_id)
  values('Invalid fixture','fixture@example.invalid','+36123456789','Esztergom','Fogfehérítés','ujvari-lili',null,'belvaros','fogfeherites');
  raise exception 'personal card without professional accepted';
 exception when check_violation then null; end;
end $$;
set local role service_role;
select jsonb_array_length(public.admin_nfc_report('2020-03-29','2020-03-29')->'cards') as verified_card_count;
reset role;
