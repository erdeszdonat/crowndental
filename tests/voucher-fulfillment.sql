-- Run only on a disposable database with the voucher migration installed.
begin;
do $$
declare
  id uuid:=gen_random_uuid(); reversed uuid:=gen_random_uuid(); actor uuid:=gen_random_uuid();
  paid timestamptz:='2028-02-28T23:20:00+00'; v public.voucher_orders;
  c text:='ABCDEFGHJKLMNPQRSTUV'; j public.voucher_jobs;
begin
  assert not has_table_privilege('anon','public.voucher_orders','select');
  assert not has_table_privilege('authenticated','public.voucher_jobs','update');
  assert not has_function_privilege('authenticated','public.voucher_staff_action(uuid,uuid,text)','execute');
  assert has_function_privilege('service_role','public.voucher_staff_action(uuid,uuid,text)','execute');
  insert into public.voucher_orders(id,amount,delivery,session_id) values
    (id,60000,'pickup','cs_live_first'),(reversed,30000,'email','cs_live_second');
  begin
    perform public.voucher_issue(id,'cs_live_first',65000,'pi_first',c,paid,'{}');
    raise exception 'wrong amount accepted';
  exception when raise_exception then assert sqlerrm='voucher_order_mismatch'; end;
  assert public.voucher_issue(id,'cs_live_first',60000,'pi_first',c,paid,'{}');
  assert public.voucher_issue(id,'cs_live_first',60000,'pi_first',repeat('X',20),now(),'{}');
  select * into v from public.voucher_orders where code=c;
  assert v.id=id and v.expiry='2029-02-28' and v.pickup_from='2028-03-03' and v.issued_at=paid;
  assert (select count(*)=2 from public.voucher_jobs where order_id=id);
  assert public.voucher_claim(id,'invoice',actor);
  assert not public.voucher_claim(id,'invoice',gen_random_uuid());
  update public.voucher_jobs set lease_until=now()-interval '1 second' where order_id=id and kind='invoice';
  assert not public.voucher_claim(id,'invoice',gen_random_uuid());
  select * into j from public.voucher_jobs where order_id=id and kind='invoice';
  assert j.state='review' and j.issue='verify_provider';
  assert public.voucher_claim(id,'resend',actor);
  update public.voucher_jobs set lease_until=now()-interval '1 second' where order_id=id and kind='resend';
  assert public.voucher_claim(id,'resend',gen_random_uuid());
  update public.voucher_jobs set first_attempt=now()-interval '24 hours',lease_until=now()-interval '1 second' where order_id=id and kind='resend';
  assert not public.voucher_claim(id,'resend',gen_random_uuid());
  assert (select state='review' from public.voucher_jobs where order_id=id and kind='resend');
  update public.voucher_orders set expiry=current_date+10,pickup_from=(now() at time zone 'Europe/Budapest')::date+1 where code=c;
  assert not public.voucher_staff_action(id,actor,'collect');
  update public.voucher_orders set pickup_from=(now() at time zone 'Europe/Budapest')::date where code=c;
  assert public.voucher_staff_action(id,actor,'collect');
  assert not public.voucher_staff_action(id,actor,'collect');
  assert public.voucher_staff_action(id,actor,'redeem');
  assert not public.voucher_staff_action(id,actor,'redeem');
  perform public.voucher_refund('pi_second');
  assert not public.voucher_issue(reversed,'cs_live_second',30000,'pi_second',repeat('Z',20),paid,'{}');
  assert (select count(*)=1 from public.voucher_jobs where order_id=reversed and kind='invoice' and state='review');
  assert not exists(select 1 from public.voucher_jobs where order_id=reversed and kind='resend');
  perform public.voucher_refund('pi_first');
  assert not public.voucher_staff_action(id,actor,'collect');
  assert not public.voucher_claim(id,'invoice',actor);
end $$;
rollback;
