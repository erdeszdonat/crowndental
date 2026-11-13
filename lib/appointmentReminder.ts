import { getAppointmentClinic, getAppointmentContacts, getConsultationImagingNotice } from './appointmentClinics';

export type ReminderSnapshot = {
  name: string | null;
  email: string;
  locale: string | null;
  treatment: string | null;
  dateTime: string;
  clinicId: string;
  includeImagingNotice: boolean;
};

const copy = {
  hu: { subject: 'Emlékeztető: holnapi időpontja', greeting: 'Kedves', intro: 'Szeretettel várjuk holnap a Crown Dental rendelőjében.', date: 'Az Ön időpontja', place: 'Rendelő', arrive: 'Kérjük, érkezzen 5 perccel korábban. Ha mégsem tud eljönni, kérjük, mielőbb jelezze a rendelő telefonszámán.', call: 'A rendelő hívása', other: 'Másik rendelőnk', team: 'A Crown Dental csapata' },
  en: { subject: 'Reminder: your appointment tomorrow', greeting: 'Hello', intro: 'We look forward to welcoming you to Crown Dental tomorrow.', date: 'Your appointment', place: 'Clinic', arrive: 'Please arrive 5 minutes early. If you cannot attend, please call the clinic as soon as possible.', call: 'Call the clinic', other: 'Our other clinic', team: 'The Crown Dental team' },
  de: { subject: 'Erinnerung: Ihr morgiger Termin', greeting: 'Guten Tag', intro: 'Wir freuen uns, Sie morgen bei Crown Dental begrüßen zu dürfen.', date: 'Ihr Termin', place: 'Praxis', arrive: 'Bitte kommen Sie 5 Minuten früher. Sollten Sie verhindert sein, informieren Sie die Praxis bitte möglichst frühzeitig telefonisch.', call: 'Praxis anrufen', other: 'Unsere andere Praxis', team: 'Ihr Crown Dental Team' },
  sk: { subject: 'Pripomienka: váš zajtrajší termín', greeting: 'Dobrý deň', intro: 'Tešíme sa na vašu zajtrajšiu návštevu v Crown Dental.', date: 'Váš termín', place: 'Ambulancia', arrive: 'Prosíme, príďte o 5 minút skôr. Ak sa nemôžete dostaviť, zavolajte do ambulancie čo najskôr.', call: 'Zavolať do ambulancie', other: 'Naša druhá ambulancia', team: 'Tím Crown Dental' },
};
const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

export function buildAppointmentReminder(snapshot: ReminderSnapshot) {
  const clinic = getAppointmentClinic(snapshot.clinicId);
  if (!clinic || !/^\d{4}\.\d{2}\.\d{2}\. \d{2}:\d{2}$/.test(snapshot.dateTime) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(snapshot.email)) throw new Error('invalid_reminder_snapshot');
  const locale = snapshot.locale === 'en' || snapshot.locale === 'de' || snapshot.locale === 'sk' ? snapshot.locale : 'hu';
  const c = copy[locale];
  const notice = snapshot.includeImagingNotice ? getConsultationImagingNotice(clinic.id, snapshot.treatment, locale, true) : null;
  const secondary = getAppointmentContacts(clinic.id)[1];
  const greeting = `${c.greeting} ${snapshot.name?.trim() || (locale === 'hu' ? 'Páciensünk' : 'Crown Dental') }!`;
  const text = [greeting, c.intro, `${c.date}: ${snapshot.dateTime}`, `${c.place}: ${clinic.location}`, `${clinic.phoneLabel}`, c.arrive,
    ...(notice ? [notice.title, notice.body] : []), `${c.other}: ${secondary.name}: ${secondary.phoneLabel}`, c.team].join('\n\n');
  return {
    from: 'Crown Dental <info@crowndental.hu>', to: snapshot.email,
    subject: `${c.subject} – ${snapshot.dateTime} | Crown Dental`, text,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;background:#fff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden">
      <div style="padding:30px;background:#0f172a;color:white"><p style="color:#7dd3fc;font-size:13px;letter-spacing:2px">CROWN DENTAL</p><h1 style="font-size:26px">${escape(greeting)}</h1><p style="line-height:1.6">${c.intro}</p></div>
      <div style="padding:30px"><div style="padding:24px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:14px"><p style="color:#0369a1">${c.date}</p><p style="font-size:28px;font-weight:bold;color:#0f172a">${escape(snapshot.dateTime)}</p><p style="line-height:1.7"><strong>${escape(clinic.name)}</strong><br>${escape(clinic.address)}</p></div>
      <p style="line-height:1.7;color:#334155">${c.arrive}</p>
      ${notice ? `<div style="padding:18px;border:1px solid #f59e0b;border-radius:12px;background:#fffbeb;color:#78350f"><strong>${escape(notice.title)}</strong><p style="line-height:1.6">${escape(notice.body)}</p></div>` : ''}
      <a href="tel:${clinic.phone}" style="display:block;margin-top:24px;padding:17px;background:#0284c7;border-radius:12px;color:#fff;text-decoration:none;text-align:center;font-weight:bold">${c.call}: ${clinic.phoneLabel}</a>
      <p style="font-size:13px;line-height:1.7;color:#64748b">${c.other}: ${escape(secondary.name)}<br><a href="tel:${secondary.phone}">${secondary.phoneLabel}</a></p></div>
      <div style="padding:20px;background:#f8fafc;text-align:center;color:#64748b">${c.team}<br>info@crowndental.hu</div></div>`,
  };
}
