-- Acquire a conditional row update before any confirmation email is sent.
-- The token protects completion/release; the timestamp recovers interrupted sends.
alter table public.appointments
  add column confirmation_sending_token text,
  add column confirmation_sending_started_at timestamptz;
