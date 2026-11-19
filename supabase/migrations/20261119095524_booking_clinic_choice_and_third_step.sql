alter table public.appointments
 drop constraint appointments_nfc_request_check,
 add constraint appointments_nfc_request_check check (
 (nfc_card_id is null and requested_hygienist_id is null and hygiene_treatment_id is null
  and (requested_clinic_id is null or (city = 'Esztergom' and requested_clinic_id in ('belvaros','primas-sziget')) is true))
 or ((
  nfc_card_id in ('belvaros','primas-sziget','ujvari-lili','berber-waller-oxana','wierl-eva')
  and hygiene_treatment_id in ('fogfeherites','fogkoleszedes','fogekszer','konzultacio')
  and requested_clinic_id = case when nfc_card_id in ('primas-sziget','berber-waller-oxana') then 'primas-sziget' else 'belvaros' end
  and (requested_hygienist_id is null or
    (requested_clinic_id='belvaros' and requested_hygienist_id in ('ujvari-lili','wierl-eva')) or
    (requested_clinic_id='primas-sziget' and requested_hygienist_id='berber-waller-oxana'))
  and (nfc_card_id in ('belvaros','primas-sziget') or requested_hygienist_id=nfc_card_id)
 ) is true)
);

alter table public.site_analytics_events
 drop constraint site_analytics_events_step_check,
 add constraint site_analytics_events_step_check check (step between 0 and 3);
