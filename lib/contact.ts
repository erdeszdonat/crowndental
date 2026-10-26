export const PATIENT_EMAIL = 'info@crowndental.hu';
export const OFFICE_EMAIL = 'iroda@crowndental.hu';

const copyByLocale = {
  hu: {
    patientLabel: 'Pácienseknek',
    patientAction: 'Páciensügyben írok',
    patientDescription: 'Időpontokkal, kezelésekkel és páciensügyekkel kapcsolatos kérdések.',
    officeLabel: 'Üzleti megkeresések és önéletrajzok',
    officeDescription: 'Üzleti együttműködésekhez, álláspályázatokhoz és önéletrajzok küldéséhez.',
    careerTitle: 'Küldje el önéletrajzát!',
    careerDescription: 'Önéletrajzát és szakmai bemutatkozását közvetlenül az alábbi e-mail-címen is várjuk.',
    careerAction: 'Önéletrajz küldése e-mailben',
  },
  en: {
    patientLabel: 'Patient enquiries',
    patientAction: 'Email about patient care',
    patientDescription: 'Questions about appointments, treatments and patient care.',
    officeLabel: 'Business enquiries and CVs',
    officeDescription: 'For business partnerships, job applications and sending your CV.',
    careerTitle: 'Send us your CV',
    careerDescription: 'You can also send your CV and a short professional introduction directly to the email address below.',
    careerAction: 'Send your CV by email',
  },
  sk: {
    patientLabel: 'Pre pacientov',
    patientAction: 'E-mail týkajúci sa ošetrenia',
    patientDescription: 'Otázky týkajúce sa termínov, ošetrení a starostlivosti o pacientov.',
    officeLabel: 'Obchodné dopyty a životopisy',
    officeDescription: 'Pre obchodnú spoluprácu, žiadosti o zamestnanie a zasielanie životopisov.',
    careerTitle: 'Pošlite nám svoj životopis',
    careerDescription: 'Svoj životopis a krátke profesijné predstavenie nám môžete poslať aj priamo na e-mailovú adresu uvedenú nižšie.',
    careerAction: 'Poslať životopis e-mailom',
  },
  de: {
    patientLabel: 'Patientenanfragen',
    patientAction: 'E-Mail zu meiner Behandlung',
    patientDescription: 'Fragen zu Terminen, Behandlungen und zur Patientenbetreuung.',
    officeLabel: 'Geschäftsanfragen und Bewerbungen',
    officeDescription: 'Für geschäftliche Zusammenarbeit, Bewerbungen und die Zusendung Ihres Lebenslaufs.',
    careerTitle: 'Senden Sie uns Ihren Lebenslauf',
    careerDescription: 'Ihren Lebenslauf und eine kurze berufliche Vorstellung können Sie auch direkt an die folgende E-Mail-Adresse senden.',
    careerAction: 'Lebenslauf per E-Mail senden',
  },
};

export function getContactCopy(locale: string) {
  return copyByLocale[locale as keyof typeof copyByLocale] ?? copyByLocale.hu;
}
