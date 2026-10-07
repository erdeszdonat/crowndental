export type AppointmentClinicId = 'belvaros' | 'primas-sziget';

export const APPOINTMENT_CLINICS = [
  {
    id: 'belvaros',
    name: 'Crown Dental Belváros',
    address: '2500 Esztergom, Petőfi Sándor utca 11.',
    location: 'Crown Dental Belváros, 2500 Esztergom, Petőfi Sándor utca 11.',
  },
  {
    id: 'primas-sziget',
    name: 'Crown Dental Prímás Sziget',
    address: '2500 Esztergom, Helischer József út 6.',
    location: 'Crown Dental Prímás Sziget, 2500 Esztergom, Helischer József út 6.',
  },
] as const;

export function getAppointmentClinic(id: unknown) {
  return APPOINTMENT_CLINICS.find((clinic) => clinic.id === id) ?? null;
}

/** Shared by the assistant's review and the patient's localized email/calendar. */
export function getConsultationImagingNotice(
  clinicId: unknown,
  treatment: string | null | undefined,
  locale: string = 'hu',
): { title: string; body: string } | null {
  if (clinicId !== 'primas-sziget' || !/(konzult|consult|beratung)/i.test(treatment || '')) return null;

  const orthodontic = /(fogszab|orthodont|ortodont|kieferorthop)/i.test(treatment || '');
  const location = APPOINTMENT_CLINICS[0].location;
  const notices = {
    hu: {
      title: 'Fontos teendő a konzultáció előtt',
      body: `A konzultációja a Crown Dental Prímás Sziget rendelőben lesz. Kérjük, a konzultációt megelőző valamelyik napon, nyitvatartási időben jöjjön be a ${location} rendelőbe ${orthodontic ? 'a fogszabályozási konzultációhoz szükséges CBCT-felvétel elkészítésére' : 'az egyeztetett röntgen- vagy CT-felvétel elkészítésére'}. A vizsgálat részleteit és az érkezést kérjük, egyeztesse munkatársainkkal a +36 30 589 2468 telefonszámon.`,
    },
    en: {
      title: 'Important: before your consultation',
      body: `Your consultation will take place at Crown Dental Prímás Sziget. Please visit ${location} during opening hours on a day before your consultation ${orthodontic ? 'for the CBCT scan needed for your orthodontic consultation' : 'for your agreed X-ray or CT scan'}. Please arrange the examination details and your visit with our team on +36 30 589 2468.`,
    },
    de: {
      title: 'Wichtig: vor Ihrem Beratungstermin',
      body: `Ihr Beratungstermin findet bei Crown Dental Prímás Sziget statt. Bitte kommen Sie an einem Tag vor Ihrem Beratungstermin während der Öffnungszeiten zu ${location}, ${orthodontic ? 'um die für die kieferorthopädische Beratung benötigte CBCT-Aufnahme anfertigen zu lassen' : 'um die vereinbarte Röntgen- oder CT-Aufnahme anfertigen zu lassen'}. Bitte stimmen Sie die Untersuchung und Ihren Besuch unter +36 30 589 2468 mit unserem Team ab.`,
    },
    sk: {
      title: 'Dôležité: pred konzultáciou',
      body: `Vaša konzultácia sa uskutoční v ambulancii Crown Dental Prímás Sziget. Prosíme, príďte v niektorý deň pred konzultáciou počas otváracích hodín do ${location} ${orthodontic ? 'na CBCT vyšetrenie potrebné na ortodontickú konzultáciu' : 'na dohodnuté RTG alebo CT vyšetrenie'}. Podrobnosti vyšetrenia a návštevu si, prosím, dohodnite s naším tímom na čísle +36 30 589 2468.`,
    },
  };

  return notices[locale === 'en' || locale === 'de' || locale === 'sk' ? locale : 'hu'];
}
