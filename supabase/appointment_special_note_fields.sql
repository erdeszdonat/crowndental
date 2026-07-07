alter table public.appointments
  add column if not exists special_note text,
  add column if not exists special_note_updated_at timestamptz;

create index if not exists appointments_special_note_updated_at_idx
  on public.appointments (special_note_updated_at desc)
  where special_note_updated_at is not null;
