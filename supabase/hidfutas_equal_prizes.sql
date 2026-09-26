-- Keep all previous entries and awards; only new v3 entries use four sectors.
alter table public.hidfutas_entries add constraint hidfutas_entries_v3_sector_check
  check (rules_version <> '2026-09-26-v3' or sector between 0 and 3);
update public.hidfutas_campaigns set rules_version='2026-09-26-v3'
  where id='hidfutas-2026';
