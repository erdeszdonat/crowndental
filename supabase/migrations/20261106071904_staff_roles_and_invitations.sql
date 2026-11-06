create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  name text not null default '',
  role text not null check (role in ('admin', 'assistant')),
  status text not null default 'invited' check (status in ('invited', 'active', 'disabled')),
  auth_valid_after timestamptz not null default now(),
  invited_at timestamptz not null default now(),
  activated_at timestamptz,
  updated_at timestamptz not null default now()
);
create table public.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.staff_members(user_id) on delete cascade,
  token_hash text not null unique,
  kind text not null check (kind in ('invite', 'reset')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index staff_invitations_user_id_idx on public.staff_invitations(user_id);
create table public.staff_audit_log (
  id bigint generated always as identity primary key,
  actor text not null,
  action text not null,
  target_user_id uuid,
  created_at timestamptz not null default now()
);
alter table public.staff_members enable row level security;
alter table public.staff_invitations enable row level security;
alter table public.staff_audit_log enable row level security;
revoke all on public.staff_members, public.staff_invitations, public.staff_audit_log from public, anon, authenticated;
grant all on public.staff_members, public.staff_invitations, public.staff_audit_log to service_role;
grant usage, select on sequence public.staff_audit_log_id_seq to service_role;

-- This narrowly scoped private lookup must see its own membership table and
-- auth.sessions without recursive RLS. It returns no patient or account data.
-- Membership and live session checks make revocation effective before JWT expiry.
create function private.current_staff_role() returns text
language sql stable security definer set search_path = '' as $$
  select m.role from public.staff_members m
  join auth.sessions s on s.user_id = m.user_id
    and s.id::text = (select auth.jwt()->>'session_id')
  where m.user_id = (select auth.uid()) and m.status = 'active'
    and s.created_at >= m.auth_valid_after
    and s.created_at > now() - interval '8 hours'
    and (s.not_after is null or s.not_after > now())
  limit 1
$$;
revoke all on function private.current_staff_role() from public, anon;
grant execute on function private.current_staff_role() to authenticated;

grant select on public.staff_members to authenticated;
create policy staff_own_identity on public.staff_members for select to authenticated
  using (user_id = (select auth.uid()) and (select private.current_staff_role()) is not null);

grant select on public.appointments to authenticated;
grant update (status, is_hidden, confirmed_appointment_local, confirmed_clinic_id,
  confirmation_email_sent_at, confirmation_email_idempotency_key, special_note,
  special_note_updated_at, no_answer_email_sent_at, no_answer_email_idempotency_key,
  cancellation_email_sent_at, cancellation_email_idempotency_key,
  confirmation_sending_token, confirmation_sending_started_at)
  on public.appointments to authenticated;
create policy staff_patient_read on public.appointments for select to authenticated
  using ((select private.current_staff_role()) in ('admin', 'assistant'));
create policy staff_patient_update on public.appointments for update to authenticated
  using ((select private.current_staff_role()) in ('admin', 'assistant'))
  with check ((select private.current_staff_role()) in ('admin', 'assistant'));

-- All other private datasets are administrator-only, even over the Data API.
do $$ declare t text; begin
  foreach t in array array['career_applications','quote_leads','marketing_subscribers',
    'hidfutas_campaigns','hidfutas_entries','hidfutas_draws'] loop
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, update on public.%I to authenticated', t);
    execute format('create policy staff_admin_read on public.%I for select to authenticated using ((select private.current_staff_role()) = ''admin'')', t);
    execute format('create policy staff_admin_update on public.%I for update to authenticated using ((select private.current_staff_role()) = ''admin'') with check ((select private.current_staff_role()) = ''admin'')', t);
  end loop;
end $$;
-- Event draws are privileged side effects; their route also requires admin.
grant execute on function public.draw_hidfutas_winner() to authenticated;
grant insert on public.hidfutas_draws to authenticated;
create policy staff_admin_draw_insert on public.hidfutas_draws for insert to authenticated
  with check ((select private.current_staff_role()) = 'admin');

-- Serialize reset/resend requests so only the newest link remains usable.
create function public.issue_staff_invitation(p_user_id uuid, p_token_hash text, p_kind text, p_actor text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.staff_members where user_id = p_user_id for update;
  if not found then raise exception 'member_not_found'; end if;
  update public.staff_members set status = 'invited', auth_valid_after = now(), updated_at = now() where user_id = p_user_id;
  update public.staff_invitations set used_at = now() where user_id = p_user_id and used_at is null;
  insert into public.staff_invitations(user_id,token_hash,kind,expires_at)
    values(p_user_id,p_token_hash,p_kind,now() + interval '24 hours');
  insert into public.staff_audit_log(actor,action,target_user_id)
    values(p_actor,case when p_kind = 'reset' then 'password_reset_requested' else 'invitation_created' end,p_user_id);
end $$;
revoke all on function public.issue_staff_invitation(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.issue_staff_invitation(uuid,text,text,text) to service_role;
