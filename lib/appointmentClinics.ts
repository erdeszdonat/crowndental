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
  const normalizedTreatment = (treatment || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const consultation = /(konzult|consult|beratung)/i.test(normalizedTreatment);
  // Include the four booking options without treating follow-up visits as an initial consultation.
  const orthodonticTreatment = /^(fogszabalyozas|orthodontics?|ortodontia|kieferorthopadie)$/.test(normalizedTreatment);
  if (clinicId !== 'primas-sziget' || (!consultation && !orthodonticTreatment)) return null;

  const orthodontic = /(fogszab|orthodont|ortodont|kieferorthop)/i.test(treatment || '');
  const location = APPOINTMENT_CLINICS[0].location;
  const orthodonticNotices = {
    hu: {
      title: 'Fontos teendő a fogszabályozási időpont előtt',
      body: 'Az időpontja a Crown Dental Prímás Sziget rendelőben lesz. Amennyiben még nincs CBCT-felvétele, vagy a meglévő felvétel 1 hónapnál régebbi, kérjük, az időpontja előtt bármikor, nyitvatartási időben jöjjön be a Crown Dental Belváros rendelőbe (2500 Esztergom, Petőfi Sándor utca 11.) a teleröntgen elkészítésére. A vizsgálat részleteit és az érkezést kérjük, egyeztesse munkatársainkkal a +36 30 589 2468 telefonszámon.',
    },
    en: {
      title: 'Important: before your orthodontic appointment',
      body: 'Your appointment will take place at Crown Dental Prímás Sziget. If you do not yet have a CBCT scan, or your existing scan is more than 1 month old, please visit Crown Dental Belváros (2500 Esztergom, Petőfi Sándor utca 11.) at any time during opening hours before your appointment for a cephalometric X-ray. Please arrange the examination details and your visit with our team on +36 30 589 2468.',
    },
    de: {
      title: 'Wichtig: vor Ihrem kieferorthopädischen Termin',
      body: 'Ihr Termin findet bei Crown Dental Prímás Sziget statt. Wenn Sie noch keine CBCT-Aufnahme haben oder Ihre vorhandene Aufnahme älter als 1 Monat ist, kommen Sie bitte vor Ihrem Termin jederzeit während der Öffnungszeiten zu Crown Dental Belváros (2500 Esztergom, Petőfi Sándor utca 11.), um eine Fernröntgenaufnahme anfertigen zu lassen. Bitte stimmen Sie die Untersuchung und Ihren Besuch unter +36 30 589 2468 mit unserem Team ab.',
    },
    sk: {
      title: 'Dôležité: pred ortodontickým termínom',
      body: 'Váš termín sa uskutoční v ambulancii Crown Dental Prímás Sziget. Ak ešte nemáte CBCT snímku alebo je vaša existujúca snímka staršia ako 1 mesiac, príďte, prosím, kedykoľvek počas otváracích hodín pred svojím termínom do Crown Dental Belváros (2500 Esztergom, Petőfi Sándor utca 11.) na teleröntgen (kefalometrické RTG vyšetrenie). Podrobnosti vyšetrenia a návštevu si, prosím, dohodnite s naším tímom na čísle +36 30 589 2468.',
    },
  };
  const language = locale === 'en' || locale === 'de' || locale === 'sk' ? locale : 'hu';
  if (orthodontic) return orthodonticNotices[language];

  const notices = {
    hu: {
      title: 'Fontos teendő a konzultáció előtt',
      body: `A konzultációja a Crown Dental Prímás Sziget rendelőben lesz. Kérjük, a konzultációt megelőző valamelyik napon, nyitvatartási időben jöjjön be a ${location} rendelőbe az egyeztetett röntgen- vagy CT-felvétel elkészítésére. A vizsgálat részleteit és az érkezést kérjük, egyeztesse munkatársainkkal a +36 30 589 2468 telefonszámon.`,
    },
    en: {
      title: 'Important: before your consultation',
      body: `Your consultation will take place at Crown Dental Prímás Sziget. Please visit ${location} during opening hours on a day before your consultation for your agreed X-ray or CT scan. Please arrange the examination details and your visit with our team on +36 30 589 2468.`,
    },
    de: {
      title: 'Wichtig: vor Ihrem Beratungstermin',
      body: `Ihr Beratungstermin findet bei Crown Dental Prímás Sziget statt. Bitte kommen Sie an einem Tag vor Ihrem Beratungstermin während der Öffnungszeiten zu ${location}, um die vereinbarte Röntgen- oder CT-Aufnahme anfertigen zu lassen. Bitte stimmen Sie die Untersuchung und Ihren Besuch unter +36 30 589 2468 mit unserem Team ab.`,
    },
    sk: {
      title: 'Dôležité: pred konzultáciou',
      body: `Vaša konzultácia sa uskutoční v ambulancii Crown Dental Prímás Sziget. Prosíme, príďte v niektorý deň pred konzultáciou počas otváracích hodín do ${location} na dohodnuté RTG alebo CT vyšetrenie. Podrobnosti vyšetrenia a návštevu si, prosím, dohodnite s naším tímom na čísle +36 30 589 2468.`,
    },
  };

  return notices[language];
}
