-- The requested city and the confirmed physical clinic are distinct fields.
-- Leave historical rows unknown; every new confirmation must choose a clinic.
alter table public.appointments
  add column confirmed_clinic_id text
  constraint appointments_confirmed_clinic_id_check
  check (confirmed_clinic_id in ('belvaros', 'primas-sziget'));

comment on column public.appointments.confirmed_clinic_id is
  'Clinic explicitly selected by staff for the confirmed appointment. NULL for unconfirmed and legacy appointments; no default.';
