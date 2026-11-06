-- Run against Supabase as a database administrator. Every fixture is rolled back.
-- No real patient row is returned or changed; no email or Auth API is invoked.
begin;
do $$ declare u uuid := gen_random_uuid(); s uuid := gen_random_uuid(); begin
  perform set_config('crown.test_user', u::text, true);
  perform set_config('crown.test_session', s::text, true);
  insert into auth.users(id,email,role,aud,created_at,updated_at)
    values(u,'rls-'||u||'@example.invalid','authenticated','authenticated',now(),now());
  insert into auth.sessions(id,user_id,created_at,updated_at,aal) values(s,u,now(),now(),'aal2');
  insert into auth.mfa_factors(id,user_id,factor_type,status,created_at,updated_at) values(gen_random_uuid(),u,'totp','verified',now(),now());
  insert into public.staff_members(user_id,email,role,status,auth_valid_after)
    values(u,'rls-'||u||'@example.invalid','assistant','active',now()-interval '1 minute');
  insert into public.appointments(id,name,email,phone,city,treatment,status,is_hidden)
    overriding system value values(-611060001,'RLS fixture','fixture@example.invalid','00000000','Fixture','Fixture','new',false);
  insert into public.career_applications(id,location,position,experience,name,email,phone)
    overriding system value values(-611060001,'Fixture','Fixture','0','RLS fixture','fixture@example.invalid','00000000');
  insert into public.quote_leads(id,name,email,phone)
    overriding system value values(-611060001,'RLS fixture','fixture@example.invalid','00000000');
  perform set_config('request.jwt.claims', jsonb_build_object('sub',u,'session_id',s,'role','authenticated','aal','aal2','user_metadata',jsonb_build_object('role','admin'),'app_metadata',jsonb_build_object('role','admin'))::text,true);
end $$;

-- AAL1 is sufficient only for the identity/setup screen, never patient data.
select set_config('request.jwt.claims', (current_setting('request.jwt.claims')::jsonb || '{"aal":"aal1"}'::jsonb)::text, true);
set local role authenticated;
do $$ begin
  if (select count(*) from public.staff_members where user_id=auth.uid()) <> 1 then raise exception 'MFA setup cannot read own identity'; end if;
  if private.current_staff_role() is not null then raise exception 'AAL1 authorized'; end if;
  if (select count(*) from public.appointments where id=-611060001) <> 0 then raise exception 'AAL1 sees patients'; end if;
  begin select count(*) from public.staff_recovery_codes; raise exception 'Recovery hashes readable'; exception when insufficient_privilege then null; end;
  begin perform public.consume_staff_recovery_code(auth.uid(),repeat('a',64)); raise exception 'Recovery RPC callable by user'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claims', (current_setting('request.jwt.claims')::jsonb || '{"aal":"aal2"}'::jsonb)::text, true);
update auth.sessions set aal='aal1' where id=current_setting('crown.test_session')::uuid;
set local role authenticated;
do $$ begin if private.current_staff_role() is not null then raise exception 'Stale AAL2 token authorized without live AAL2'; end if; end $$;
reset role;
update auth.sessions set aal='aal2' where id=current_setting('crown.test_session')::uuid;
update auth.mfa_factors set status='unverified' where user_id=current_setting('crown.test_user')::uuid;
set local role authenticated;
do $$ begin if private.current_staff_role() is not null then raise exception 'Missing verified factor authorized'; end if; end $$;
reset role;
update auth.mfa_factors set status='verified' where user_id=current_setting('crown.test_user')::uuid;

set local role authenticated;
do $$ begin
  if private.current_staff_role() is distinct from 'assistant' then raise exception 'Role is not taken from membership'; end if;
  if (select count(*) from public.appointments where id=-611060001) <> 1 then raise exception 'Assistant cannot read patients'; end if;
  if (select count(*) from public.career_applications where id=-611060001) <> 0 then raise exception 'Assistant can read HR'; end if;
  if (select count(*) from public.quote_leads where id=-611060001) <> 0 then raise exception 'Assistant can read financial leads'; end if;
  if (select count(*) from public.marketing_subscribers) <> 0 then raise exception 'Assistant can read marketing'; end if;
  if (select count(*) from public.hidfutas_entries) <> 0 then raise exception 'Assistant can read event data'; end if;
  update public.appointments set status='special' where id=-611060001;
  if not found then raise exception 'Assistant cannot manage patients'; end if;
  begin update public.staff_members set role='admin' where user_id=(select auth.uid()); raise exception 'Self promotion allowed'; exception when insufficient_privilege then null; end;
  begin select count(*) from public.staff_invitations; raise exception 'Invitation hashes readable'; exception when insufficient_privilege then null; end;
  begin update public.appointments set email='changed@example.invalid' where id=-611060001; raise exception 'Protected column writable'; exception when insufficient_privilege then null; end;
  begin delete from public.appointments where id=-611060001; raise exception 'Patient deletion allowed'; exception when insufficient_privilege then null; end;
  begin perform public.issue_staff_invitation((select auth.uid()),repeat('a',64),'invite','forged'); raise exception 'Privileged invitation function callable'; exception when insufficient_privilege then null; end;
end $$;
reset role;

update public.staff_members set role='admin' where user_id=current_setting('crown.test_user')::uuid;
set local role authenticated;
do $$ begin
  if private.current_staff_role() is distinct from 'admin' then raise exception 'Role promotion is stale'; end if;
  if (select count(*) from public.career_applications where id=-611060001) <> 1 then raise exception 'Admin cannot read HR'; end if;
  if (select count(*) from public.quote_leads where id=-611060001) <> 1 then raise exception 'Admin cannot read leads'; end if;
end $$;
reset role;

update public.staff_members set role='assistant' where user_id=current_setting('crown.test_user')::uuid;
set local role authenticated;
do $$ begin
  if (select count(*) from public.career_applications where id=-611060001) <> 0 then raise exception 'Demotion is stale'; end if;
end $$;
reset role;

update public.staff_members set status='disabled' where user_id=current_setting('crown.test_user')::uuid;
set local role authenticated;
do $$ begin
  if private.current_staff_role() is not null then raise exception 'Disabled user authorized'; end if;
  if (select count(*) from public.appointments where id=-611060001) <> 0 then raise exception 'Disabled user sees patients'; end if;
end $$;
reset role;

update public.staff_members set status='active',auth_valid_after=now()+interval '1 minute' where user_id=current_setting('crown.test_user')::uuid;
set local role authenticated;
do $$ begin if private.current_staff_role() is not null then raise exception 'Old session survives password reset'; end if; end $$;
reset role;
update public.staff_members set auth_valid_after=now()-interval '10 hours' where user_id=current_setting('crown.test_user')::uuid;
update auth.sessions set created_at=now()-interval '9 hours' where id=current_setting('crown.test_session')::uuid;
set local role authenticated;
do $$ begin if private.current_staff_role() is not null then raise exception 'Session exceeded eight hours'; end if; end $$;
reset role;
delete from auth.sessions where id=current_setting('crown.test_session')::uuid;
set local role authenticated;
do $$ begin if private.current_staff_role() is not null then raise exception 'Revoked session authorized'; end if; end $$;
reset role;

-- Recovery code consumption is single-use and invalidates every older session.
set local role service_role;
select public.replace_staff_recovery_codes(current_setting('crown.test_user')::uuid, array(select lpad(i::text,64,'0') from generate_series(1,10) i));
do $$ begin
  if not public.consume_staff_recovery_code(current_setting('crown.test_user')::uuid,lpad('1',64,'0')) then raise exception 'Valid recovery rejected'; end if;
  if public.consume_staff_recovery_code(current_setting('crown.test_user')::uuid,lpad('1',64,'0')) then raise exception 'Recovery replay succeeded'; end if;
  if (select auth_valid_after from public.staff_members where user_id=current_setting('crown.test_user')::uuid) <= transaction_timestamp() then raise exception 'Recovery did not advance revocation epoch'; end if;
end $$;
reset role;

-- Service-only invitation replacement is atomic; older links are invalidated.
set local role service_role;
select public.issue_staff_invitation(current_setting('crown.test_user')::uuid,repeat('a',64),'invite','fixture-admin');
select public.issue_staff_invitation(current_setting('crown.test_user')::uuid,repeat('b',64),'reset','fixture-admin');
do $$ begin
  if (select count(*) from public.staff_invitations where user_id=current_setting('crown.test_user')::uuid and used_at is null) <> 1 then raise exception 'Multiple live invitations'; end if;
  if not exists(select 1 from public.staff_invitations where token_hash=repeat('a',64) and used_at is not null) then raise exception 'Old link not revoked'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  begin select count(*) from public.appointments; raise exception 'Public patients readable'; exception when insufficient_privilege then null; end;
  begin select count(*) from public.career_applications; raise exception 'Public HR readable'; exception when insufficient_privilege then null; end;
  begin select count(*) from public.quote_leads; raise exception 'Public leads readable'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'Staff RLS, column permissions, live revocation, expiry and invitation replacement passed; fixtures rolled back.' as result;
