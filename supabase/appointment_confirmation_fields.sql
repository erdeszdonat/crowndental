alter table public.appointments
  add column if not exists confirmed_appointment_local text,
  add column if not exists confirmation_email_sent_at timestamptz;

create index if not exists appointments_confirmation_email_sent_at_idx
  on public.appointments (confirmation_email_sent_at desc)
  where confirmation_email_sent_at is not null;
