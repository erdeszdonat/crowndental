alter table public.appointments
  drop constraint appointments_nfc_request_check,
  add constraint appointments_nfc_request_check check (
    (nfc_card_id is null and requested_hygienist_id is null and hygiene_treatment_id is null
      and (requested_clinic_id is null or (city = 'Esztergom' and requested_clinic_id in ('belvaros', 'primas-sziget')) is true))
    or (
      hygiene_treatment_id in ('fogfeherites', 'fogkoleszedes', 'air-polishing', 'premium-biofilm-terapia', 'fogekszer', 'konzultacio')
      and (
        (nfc_card_id in ('belvaros', 'primas-sziget') and requested_clinic_id = nfc_card_id
          and (requested_hygienist_id is null
            or (nfc_card_id = 'belvaros' and requested_hygienist_id in ('ujvari-lili', 'wierl-eva'))
            or (nfc_card_id = 'primas-sziget' and requested_hygienist_id = 'berber-waller-oxana')))
        or (nfc_card_id in ('ujvari-lili', 'wierl-eva', 'berber-waller-oxana')
          and requested_hygienist_id = nfc_card_id
          and (requested_clinic_id is null or requested_clinic_id = case
            when nfc_card_id = 'berber-waller-oxana' then 'primas-sziget' else 'belvaros' end))
      )
    ) is true
    or (
      hygiene_treatment_id in ('itop', 'itop-kontroll')
      and requested_hygienist_id = 'berber-waller-oxana'
      and city = 'Esztergom' and requested_clinic_id is null
      and (nfc_card_id is null or nfc_card_id = 'berber-waller-oxana')
    ) is true
  );
