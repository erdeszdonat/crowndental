-- Run in a disposable database, or inside BEGIN/ROLLBACK after applying the
-- migration in the same transaction. Uses invalid test email; sends no HTTP.
do $test$
declare appt_id bigint; job jsonb; retry jsonb; date_text text := to_char((now() at time zone 'Europe/Budapest')::date+1,'YYYY.MM.DD.')||' 10:30';
begin
 if private.crown_parse_appointment_time('2026.02.30. 12:00') is not null then raise exception 'invalid date accepted'; end if;
 if private.crown_parse_appointment_time('2026.07.05. 10:30') <> timestamptz '2026-07-05 08:30Z' then raise exception 'summer timezone failed'; end if;
 if private.crown_parse_appointment_time('2026.12.05. 10:30') <> timestamptz '2026-12-05 09:30Z' then raise exception 'winter timezone failed'; end if;
 if has_function_privilege('anon','public.claim_appointment_reminder()','execute') or has_table_privilege('authenticated','public.appointment_reminders','select') then raise exception 'permissions failed'; end if;
 insert into public.appointments(name,email,phone,city,treatment,status,is_hidden,confirmed_clinic_id,confirmed_appointment_local,imaging_notice_enabled)
 values('Reminder Integration Fixture','fixture@example.invalid','+36000000000','Esztergom','Kontroll','cancelled',false,'primas-sziget',date_text,false) returning id into appt_id;
 if public.claim_appointment_reminder() is not null then raise exception 'cancelled was claimed or unexpected live due record'; end if;
 update public.appointments set status='special',is_hidden=true where id=appt_id;
 if public.claim_appointment_reminder() is not null then raise exception 'hidden was claimed'; end if;
 update public.appointments set is_hidden=false where id=appt_id;
 job := public.claim_appointment_reminder();
 if job is null or job->'snapshot'->>'name' <> 'Reminder Integration Fixture' then raise exception 'eligible special not claimed'; end if;
 if (job->'snapshot'->>'includeImagingNotice')::boolean then raise exception 'notice choice lost'; end if;
 if public.claim_appointment_reminder() is not null then raise exception 'double claim'; end if;
 if public.finish_appointment_reminder((job->>'id')::uuid,gen_random_uuid(),'test-id',null) then raise exception 'wrong owner acknowledged'; end if;
 perform public.finish_appointment_reminder((job->>'id')::uuid,(job->>'token')::uuid,null,'test_failure');
 if public.claim_appointment_reminder() is not null then raise exception 'retry backoff failed'; end if;
 update public.appointment_reminders set next_attempt_at=now()-interval '1 second' where id=(job->>'id')::uuid;
 retry := public.claim_appointment_reminder();
 if retry->>'id' <> job->>'id' or retry->'snapshot' <> job->'snapshot' then raise exception 'unstable retry'; end if;
 perform public.finish_appointment_reminder((retry->>'id')::uuid,(retry->>'token')::uuid,'fixture-provider-id',null);
 if public.claim_appointment_reminder() is not null then raise exception 'sent mail was reclaimed'; end if;
 if not exists(select 1 from public.appointments where id=appt_id and reminder_email_sent_at is not null and confirmation_sending_token is null) then raise exception 'acknowledgement missing'; end if;
 update public.appointments set confirmed_appointment_local=to_char((now() at time zone 'Europe/Budapest')::date+2,'YYYY.MM.DD.')||' 10:30' where id=appt_id;
 if public.claim_appointment_reminder() is not null then raise exception 'wrong day claimed'; end if;
 if exists(select 1 from public.appointments where id=appt_id and reminder_email_sent_at is not null) then raise exception 'reschedule did not clear badge'; end if;
end $test$;
