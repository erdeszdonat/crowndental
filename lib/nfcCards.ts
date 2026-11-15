import {
  getAppointmentClinic,
  type AppointmentClinicId,
} from "./appointmentClinics";

export const HYGIENISTS = [
  { id: "ujvari-lili", name: "Ujvári Lili", clinicId: "belvaros" },
  {
    id: "berber-waller-oxana",
    name: "Berber-Waller Oxána",
    clinicId: "primas-sziget",
  },
  { id: "wierl-eva", name: "Wierl Éva", clinicId: "belvaros" },
] as const;
export type HygienistId = (typeof HYGIENISTS)[number]["id"];
export const NFC_CARDS = [
  { id: "belvaros", name: "Belváros", clinicId: "belvaros", hygienistId: null },
  {
    id: "primas-sziget",
    name: "Prímás Sziget",
    clinicId: "primas-sziget",
    hygienistId: null,
  },
  ...HYGIENISTS.map((person) => ({
    id: person.id,
    name: person.name,
    clinicId: person.clinicId,
    hygienistId: person.id,
  })),
] as const;
export type NfcCard = (typeof NFC_CARDS)[number];
export type NfcCardId = NfcCard["id"];
export const HYGIENE_TREATMENTS = {
  fogfeherites: {
    hu: "Fogfehérítés",
    en: "Teeth whitening",
    sk: "Bielenie zubov",
    de: "Zahnaufhellung",
  },
  fogkoleszedes: {
    hu: "Fogkőeltávolítás",
    en: "Professional teeth cleaning",
    sk: "Odstránenie zubného kameňa",
    de: "Professionelle Zahnreinigung",
  },
  fogekszer: {
    hu: "Fogékszer-felhelyezés",
    en: "Tooth gem placement",
    sk: "Aplikácia zubného šperku",
    de: "Anbringen von Zahnschmuck",
  },
  konzultacio: {
    hu: "Dentálhigiénés konzultáció",
    en: "Dental hygiene consultation",
    sk: "Konzultácia dentálnej hygieny",
    de: "Dentalhygiene-Beratung",
  },
} as const;
export type HygieneTreatmentId = keyof typeof HYGIENE_TREATMENTS;
export const getNfcCard = (id: unknown) =>
  NFC_CARDS.find((card) => card.id === id) ?? null;
export const getHygienist = (id: unknown) =>
  HYGIENISTS.find((person) => person.id === id) ?? null;
export function resolveNfcBooking(
  cardId: unknown,
  hygienistId: unknown,
  treatmentId: unknown,
) {
  const card = getNfcCard(cardId);
  if (
    !card ||
    typeof treatmentId !== "string" ||
    !Object.hasOwn(HYGIENE_TREATMENTS, treatmentId)
  )
    return null;
  const selected =
    hygienistId == null || hygienistId === ""
      ? null
      : getHygienist(hygienistId);
  if (hygienistId && (!selected || selected.clinicId !== card.clinicId))
    return null;
  if (card.hygienistId && selected && selected.id !== card.hygienistId)
    return null;
  return {
    nfc_card_id: card.id,
    requested_hygienist_id: card.hygienistId || selected?.id || null,
    requested_clinic_id: card.clinicId as AppointmentClinicId,
    hygiene_treatment_id: treatmentId as HygieneTreatmentId,
  };
}
export function nfcBookingLabel(record: {
  nfc_card_id?: unknown;
  requested_hygienist_id?: unknown;
  requested_clinic_id?: unknown;
}) {
  const card = getNfcCard(record.nfc_card_id);
  if (!card) return "";
  const person = getHygienist(record.requested_hygienist_id);
  const clinic = getAppointmentClinic(record.requested_clinic_id);
  return `${person ? `${person.name} páciense · ` : ""}${clinic?.name || card.name} · Kártya: ${card.name}`;
}

export function isNfcCardPath(pathname: string): boolean {
  const path = pathname
    .split(/[?#]/)[0]
    .replace(/^\/(?:hu|en|sk|de)(?=\/|$)/, "");
  const match = /^\/kartya\/([^/]+)\/?$/.exec(path);
  return !!match && !!getNfcCard(match[1]);
}
