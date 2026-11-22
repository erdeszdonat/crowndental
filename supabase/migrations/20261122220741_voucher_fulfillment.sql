-- Only the voucher server may access these records. Existing staff and patient
-- policies remain separate. Admin operations go through verified staff sessions.
create table public.voucher_orders (
  id uuid primary key,
  amount integer not null check (amount between 10000 and 500000 and amount % 5000 = 0),
  delivery text not null check (delivery in ('email','pickup')),
  session_id text unique check (session_id ~ '^cs_live_.+$'),
  payment_id text unique,
  code text unique check (code ~ '^[A-HJ-NP-Z2-9]{20}$'),
  issued_at timestamptz, expiry date, pickup_from date,
  billing jsonb, created_at timestamptz not null default now(),
  recipient_name text check (length(recipient_name) between 1 and 60),
  collected_at timestamptz, collected_by uuid,
  redeemed_at timestamptz, redeemed_by uuid,
  refunded boolean not null default false
);
create table public.voucher_reversals (payment_id text primary key);
create table public.voucher_jobs (
  order_id uuid references public.voucher_orders(id),
  kind text check (kind in ('resend','invoice')),
  state text not null default 'pending' check(state in ('pending','working','done','review')),
  first_attempt timestamptz, lease_until timestamptz, claim uuid,
  provider_id text, issue text,
  primary key (order_id,kind), unique(kind,provider_id)
);
alter table public.voucher_orders enable row level security;
alter table public.voucher_jobs enable row level security;
alter table public.voucher_reversals enable row level security;
revoke all on public.voucher_orders,public.voucher_jobs,public.voucher_reversals from public,anon,authenticated;
grant select,insert,update on public.voucher_orders,public.voucher_jobs,public.voucher_reversals to service_role;

create function public.voucher_issue(p_order uuid,p_session text,p_amount integer,p_payment text,
  p_code text,p_paid_at timestamptz,p_billing jsonb) returns boolean
language plpgsql set search_path='' as $$
declare v public.voucher_orders; d date := (p_paid_at at time zone 'Europe/Budapest')::date;
begin
  if p_session is null or p_payment is null or p_paid_at is null or p_code is null or p_billing is null then
    raise exception 'voucher_payment_incomplete';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_payment,0));
  select * into strict v from public.voucher_orders where id=p_order for update;
  if v.session_id is distinct from p_session or v.amount is distinct from p_amount or
     (v.payment_id is not null and v.payment_id<>p_payment) then raise exception 'voucher_order_mismatch'; end if;
  if v.refunded or exists(select 1 from public.voucher_reversals where payment_id=p_payment) then
    update public.voucher_orders set refunded=true,payment_id=p_payment,billing=coalesce(billing,p_billing) where id=p_order;
    insert into public.voucher_jobs(order_id,kind,state,issue) values(p_order,'invoice','review','refund_review')
      on conflict (order_id,kind) do nothing;
    return false;
  end if;
  if v.code is null then
    update public.voucher_orders set code=p_code, payment_id=p_payment,issued_at=p_paid_at,
      expiry=(d+interval '1 year')::date,pickup_from=case when delivery='pickup' then d+3 end,billing=p_billing
      where id=p_order;
    insert into public.voucher_jobs(order_id,kind) values(p_order,'resend'),(p_order,'invoice');
  end if;
  return true;
end $$;

create function public.voucher_refund(p_payment text) returns void language plpgsql set search_path='' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_payment,0));
  insert into public.voucher_reversals values(p_payment) on conflict do nothing;
  update public.voucher_orders set refunded=true where payment_id=p_payment;
  update public.voucher_jobs j set state='review', issue='refund_review',claim=null,lease_until=null
    from public.voucher_orders o where j.order_id=o.id and o.payment_id=p_payment;
end $$;

create function public.voucher_claim(p_order uuid,p_kind text,p_claim uuid) returns boolean
language plpgsql set search_path='' as $$
declare j public.voucher_jobs;
begin
  perform 1 from public.voucher_orders where id=p_order and not refunded for update;
  if not found then return false; end if;
  select * into j from public.voucher_jobs where order_id=p_order and kind=p_kind for update;
  if not found or j.state in ('done','review') or (j.state='working' and j.lease_until>now()) then return false; end if;
  -- An interrupted invoice request may already have issued a legal document.
  -- Resend retains its key for 24 hours; leave a margin before that boundary.
  if (p_kind='invoice' and j.state='working') or (p_kind='resend' and j.first_attempt<=now()-interval '23 hours') then
    update public.voucher_jobs set state='review',issue='verify_provider',claim=null,lease_until=null where order_id=p_order and kind=p_kind;
    return false;
  end if;
  update public.voucher_jobs set state='working',first_attempt=coalesce(first_attempt,now()),claim=p_claim,
    lease_until=now()+interval '2 minutes',issue=null where order_id=p_order and kind=p_kind;
  return true;
end $$;

create function public.voucher_staff_action(p_order uuid,p_actor uuid,p_action text) returns boolean
language plpgsql set search_path='' as $$
declare today date := (now() at time zone 'Europe/Budapest')::date;
begin
  if p_actor is null then return false; end if;
  if p_action='collect' then
    update public.voucher_orders set collected_at=now(),collected_by=p_actor where id=p_order and delivery='pickup'
      and code is not null and collected_at is null and redeemed_at is null and not refunded and today between pickup_from and expiry;
  elsif p_action='redeem' then
    update public.voucher_orders set redeemed_at=now(),redeemed_by=p_actor where id=p_order
      and code is not null and redeemed_at is null and not refunded and today<=expiry;
  else return false; end if;
  return found;
end $$;

revoke all on function public.voucher_issue(uuid,text,integer,text,text,timestamptz,jsonb),
  public.voucher_refund(text),public.voucher_claim(uuid,text,uuid),public.voucher_staff_action(uuid,uuid,text)
  from public,anon,authenticated;
grant execute on function public.voucher_issue(uuid,text,integer,text,text,timestamptz,jsonb),
  public.voucher_refund(text),public.voucher_claim(uuid,text,uuid),public.voucher_staff_action(uuid,uuid,text)
  to service_role;
