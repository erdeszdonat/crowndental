-- Public forms use server-side credentials; patient records are never public.
drop policy if exists "Enable read for all" on public.appointments;
drop policy if exists "Enable read for all" on public.career_applications;
drop policy if exists "Enable read for all" on public.quote_leads;
revoke all on public.appointments, public.career_applications, public.quote_leads from anon, authenticated;
