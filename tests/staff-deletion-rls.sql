-- All identities are disposable fixtures. No Auth HTTP API or mail is used.
begin;
do $$ declare a uuid := gen_random_uuid(); u uuid := gen_random_uuid(); s uuid := gen_random_uuid(); begin
  perform set_config('crown.delete_actor',a::text,true);
  perform set_config('crown.delete_user',u::text,true);
  perform set_config('crown.delete_email','delete-'||u||'@example.invalid',true);
  perform set_config('crown.delete_patients',(select count(*)::text from public.appointments),true);
  perform set_config('crown.delete_contacts',(select count(*)::text from public.marketing_subscribers),true);
  insert into auth.users(id,email,role,aud,created_at,updated_at) values
    (a,'actor-'||a||'@example.invalid','authenticated','authenticated',now(),now()),
    (u,current_setting('crown.delete_email'),'authenticated','authenticated',now(),now());
  insert into public.staff_members(user_id,email,role,status,auth_valid_after) values
    (a,'actor-'||a||'@example.invalid','admin','active',now()-interval '1 minute'),
    (u,current_setting('crown.delete_email'),'assistant','active',now()-interval '1 minute');
  insert into auth.sessions(id,user_id,created_at,updated_at,aal) values(s,u,now(),now(),'aal2');
  insert into auth.mfa_factors(id,user_id,factor_type,status,created_at,updated_at) values(gen_random_uuid(),u,'totp','verified',now(),now());
  insert into public.staff_invitations(user_id,token_hash,kind,expires_at) values(u,md5(gen_random_uuid()::text)||md5(gen_random_uuid()::text),'invite',now()+interval '1 day');
  insert into public.staff_recovery_codes(user_id,code_hash) values(u,repeat('e',64));
  perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',s,'aal','aal2','role','authenticated')::text,true);
end $$;
set local role authenticated;
do $$ begin
  if private.current_staff_role() is distinct from 'assistant' then raise exception 'Fixture not authenticated'; end if;
  begin perform public.begin_staff_deletion(auth.uid(),auth.uid(),current_setting('crown.delete_email')); raise exception 'User can call service deletion'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
do $$ begin
  begin
    perform public.begin_staff_deletion(current_setting('crown.delete_actor')::uuid,current_setting('crown.delete_actor')::uuid,'unused');
    raise exception 'Self deletion allowed';
  exception when raise_exception then if sqlerrm <> 'protected_account' then raise; end if; end;
  begin
    perform public.begin_staff_deletion(current_setting('crown.delete_user')::uuid,current_setting('crown.delete_actor')::uuid,'wrong@example.invalid');
    raise exception 'Stale confirmation allowed';
  exception when raise_exception then if sqlerrm <> 'target_changed' then raise; end if; end;
end $$;
select public.begin_staff_deletion(current_setting('crown.delete_user')::uuid,current_setting('crown.delete_actor')::uuid,current_setting('crown.delete_email')) is not null as deletion_started;
do $$ begin
  if not exists (select 1 from public.staff_members where user_id=current_setting('crown.delete_user')::uuid and status='deleting') then raise exception 'Access not revoked'; end if;
  if exists (select 1 from public.staff_invitations where user_id=current_setting('crown.delete_user')::uuid and used_at is null) then raise exception 'Invitation remains usable'; end if;
  if public.consume_staff_recovery_code(current_setting('crown.delete_user')::uuid,repeat('e',64)) then raise exception 'Recovery reactivated deleting user'; end if;
  begin
    perform public.issue_staff_invitation(current_setting('crown.delete_user')::uuid,md5(gen_random_uuid()::text)||md5(gen_random_uuid()::text),'reset','fixture');
    raise exception 'Reset reactivated deleting user';
  exception when raise_exception then if sqlerrm <> 'member_deleting' then raise; end if; end;
end $$;
reset role;
set local role authenticated;
do $$ begin
  if private.current_staff_role() is not null then raise exception 'Old AAL2 JWT survives deletion start'; end if;
  if (select count(*) from public.appointments) <> 0 then raise exception 'Deleting user sees patients'; end if;
end $$;
reset role;
-- Simulate the Auth deletion only for the synthetic user; verify FK cascades.
delete from auth.users where id=current_setting('crown.delete_user')::uuid;
do $$ begin
  if exists(select 1 from public.staff_members where user_id=current_setting('crown.delete_user')::uuid) then raise exception 'Staff profile remains'; end if;
  if exists(select 1 from public.staff_invitations where user_id=current_setting('crown.delete_user')::uuid) then raise exception 'Invitations remain'; end if;
  if exists(select 1 from public.staff_recovery_codes where user_id=current_setting('crown.delete_user')::uuid) then raise exception 'Recovery codes remain'; end if;
  if exists(select 1 from auth.sessions where user_id=current_setting('crown.delete_user')::uuid) then raise exception 'Sessions remain'; end if;
  if not exists(select 1 from public.staff_audit_log where target_user_id=current_setting('crown.delete_user')::uuid and target_email=current_setting('crown.delete_email') and action='access_deletion_requested') then raise exception 'Audit target lost'; end if;
  if (select count(*)::text from public.appointments) <> current_setting('crown.delete_patients') then raise exception 'Patient count changed'; end if;
  if (select count(*)::text from public.marketing_subscribers) <> current_setting('crown.delete_contacts') then raise exception 'Contact count changed'; end if;
end $$;
rollback;
select 'Staff deletion revocation, service permissions, cascades and audit retention passed; fixtures rolled back.' as result;
