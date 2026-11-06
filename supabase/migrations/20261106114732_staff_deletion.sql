alter table public.staff_members drop constraint staff_members_status_check;
alter table public.staff_members add constraint staff_members_status_check
  check (status in ('invited','active','disabled','deleting'));
alter table public.staff_members add constraint owner_cannot_be_deleting check (not is_owner or status <> 'deleting');

-- Keep the audit target readable after Auth cascades remove the staff profile.
alter table public.staff_audit_log add column target_email text;
update public.staff_audit_log a set target_email = m.email
  from public.staff_members m where m.user_id = a.target_user_id;

create function public.begin_staff_deletion(p_user_id uuid, p_actor uuid, p_email text)
returns text language plpgsql security invoker set search_path = '' as $$
declare member public.staff_members%rowtype;
begin
  if not exists (select 1 from public.staff_members where user_id = p_actor and role = 'admin' and status = 'active') then
    raise exception 'admin_required';
  end if;
  select * into member from public.staff_members where user_id = p_user_id for update;
  if not found then return null; end if;
  if member.is_owner or p_user_id = p_actor then raise exception 'protected_account'; end if;
  if member.email is distinct from p_email then raise exception 'target_changed'; end if;
  -- Both RLS and server authentication require status=active. Revoke access
  -- before the external Auth deletion, including if that external call fails.
  update public.staff_members set status = 'deleting', auth_valid_after = clock_timestamp(), updated_at = clock_timestamp() where user_id = p_user_id;
  update public.staff_invitations set used_at = now() where user_id = p_user_id and used_at is null;
  insert into public.staff_audit_log(actor,action,target_user_id,target_email)
    values(p_actor::text,'access_deletion_requested',p_user_id,member.email);
  return member.email;
end $$;
revoke all on function public.begin_staff_deletion(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.begin_staff_deletion(uuid,uuid,text) to service_role;

-- The row lock serializes invitation replacement with deletion. A parallel
-- reset/resend must never re-enable a profile whose deletion is in progress.
create or replace function public.issue_staff_invitation(p_user_id uuid, p_token_hash text, p_kind text, p_actor text)
returns void language plpgsql security invoker set search_path = '' as $$
declare member public.staff_members%rowtype;
begin
  select * into member from public.staff_members where user_id = p_user_id for update;
  if not found then raise exception 'member_not_found'; end if;
  if member.status = 'deleting' then raise exception 'member_deleting'; end if;
  update public.staff_members set status = 'invited', auth_valid_after = now(), updated_at = now() where user_id = p_user_id;
  update public.staff_invitations set used_at = now() where user_id = p_user_id and used_at is null;
  insert into public.staff_invitations(user_id,token_hash,kind,expires_at)
    values(p_user_id,p_token_hash,p_kind,now() + interval '24 hours');
  insert into public.staff_audit_log(actor,action,target_user_id,target_email)
    values(p_actor,case when p_kind = 'reset' then 'password_reset_requested' else 'invitation_created' end,p_user_id,member.email);
end $$;
