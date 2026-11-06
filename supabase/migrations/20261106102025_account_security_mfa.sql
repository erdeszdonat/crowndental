alter table public.staff_members add column is_owner boolean not null default false;
alter table public.staff_members add constraint owner_is_admin check (not is_owner or role = 'admin');
create unique index staff_single_owner on public.staff_members(is_owner) where is_owner;

-- AAL1 can read only its own profile to reach the MFA screen.
create function private.current_staff_session_role() returns text
language sql stable security definer set search_path = '' as $$
  select m.role from public.staff_members m
  join auth.sessions s on s.user_id = m.user_id and s.id::text = (select auth.jwt()->>'session_id')
  where m.user_id = (select auth.uid()) and m.status = 'active'
    and s.created_at >= m.auth_valid_after and s.created_at > now() - interval '8 hours'
    and (s.not_after is null or s.not_after > now()) limit 1
$$;
revoke all on function private.current_staff_session_role() from public, anon;
grant execute on function private.current_staff_session_role() to authenticated;
alter policy staff_own_identity on public.staff_members using (
  user_id = (select auth.uid()) and (select private.current_staff_session_role()) is not null
);

-- Every staff account needs a live AAL2 session and a verified authenticator.
-- Checking the server-side session/factor also defeats stale AAL2 JWTs after
-- recovery, factor removal, session revocation, or a password reset.
create or replace function private.current_staff_role() returns text
language sql stable security definer set search_path = '' as $$
  select private.current_staff_session_role()
  where (select auth.jwt()->>'aal') = 'aal2'
    and exists (select 1 from auth.sessions s where s.user_id = (select auth.uid())
      and s.id::text = (select auth.jwt()->>'session_id') and s.aal = 'aal2')
    and exists (select 1 from auth.mfa_factors f where f.user_id = (select auth.uid())
      and f.factor_type = 'totp' and f.status = 'verified')
$$;

create table public.staff_recovery_codes (
  user_id uuid not null references public.staff_members(user_id) on delete cascade,
  code_hash text not null check (code_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  primary key(user_id, code_hash)
);
create function public.staff_mfa_session_valid() returns boolean
language sql stable security invoker set search_path = '' as $$
  select private.current_staff_role() is not null
$$;
revoke all on function public.staff_mfa_session_valid() from public, anon;
grant execute on function public.staff_mfa_session_valid() to authenticated;
alter table public.staff_recovery_codes enable row level security;
revoke all on public.staff_recovery_codes from public, anon, authenticated;
grant all on public.staff_recovery_codes to service_role;

create function public.replace_staff_recovery_codes(p_user_id uuid, p_hashes text[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if cardinality(p_hashes) <> 10 then raise exception 'invalid_code_count'; end if;
  perform 1 from public.staff_members where user_id = p_user_id and status = 'active' for update;
  if not found then raise exception 'member_unavailable'; end if;
  delete from public.staff_recovery_codes where user_id = p_user_id;
  insert into public.staff_recovery_codes(user_id,code_hash) select p_user_id, unnest(p_hashes);
  insert into public.staff_audit_log(actor,action,target_user_id) values(p_user_id::text,'recovery_codes_created',p_user_id);
end $$;
create function public.consume_staff_recovery_code(p_user_id uuid, p_hash text) returns boolean
language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.staff_members where user_id = p_user_id and status = 'active' for update;
  if not found then return false; end if;
  update public.staff_recovery_codes set used_at = now() where user_id = p_user_id and code_hash = p_hash and used_at is null;
  if not found then return false; end if;
  update public.staff_members set auth_valid_after = clock_timestamp(), updated_at = clock_timestamp() where user_id = p_user_id;
  insert into public.staff_audit_log(actor,action,target_user_id) values(p_user_id::text,'mfa_recovery_started',p_user_id);
  return true;
end $$;
revoke all on function public.replace_staff_recovery_codes(uuid,text[]), public.consume_staff_recovery_code(uuid,text) from public, anon, authenticated;
grant execute on function public.replace_staff_recovery_codes(uuid,text[]), public.consume_staff_recovery_code(uuid,text) to service_role;
