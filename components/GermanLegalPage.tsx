import Link from 'next/link';
import { FileText, ShieldCheck } from 'lucide-react';

type GermanLegalDocument = 'terms' | 'privacy' | 'cookies' | 'imprint';

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

const documents: Record<GermanLegalDocument, { eyebrow: string; title: string; lead: string; updated: string; sections: LegalSection[] }> = {
  terms: {
    eyebrow: 'Rechtliche Informationen',
    title: 'Allgemeine Geschäftsbedingungen',
    lead: 'Bedingungen für die Nutzung der zahnmedizinischen Leistungen und Online-Dienste von Crown Dental.',
    updated: 'Stand: 20. Juli 2026',
    sections: [
      {
        title: '1. Anbieter und Geltungsbereich',
        paragraphs: ['Anbieter ist die Crown Dental Praxis és Labor Fogászati Kft., Petőfi Sándor utca 11, 2500 Esztergom, Ungarn. Diese Bedingungen gelten für Terminanfragen, zahnmedizinische Leistungen und die Nutzung dieser Website.'],
      },
      {
        title: '2. Terminanfrage und Bestätigung',
        paragraphs: ['Eine über die Website gesendete Anfrage ist noch kein endgültig bestätigter Behandlungstermin. Der Termin wird erst verbindlich, nachdem Crown Dental Datum und Uhrzeit telefonisch oder per E-Mail bestätigt hat. Bitte geben Sie vollständige und richtige Kontaktdaten an.'],
      },
      {
        title: '3. Behandlung und medizinische Aufklärung',
        paragraphs: ['Diagnose, Behandlungsplan, Risiken, Alternativen und voraussichtliche Kosten werden vor der Behandlung individuell besprochen. Die Informationen auf der Website dienen der allgemeinen Orientierung und ersetzen keine persönliche Untersuchung oder ärztliche Beratung.'],
      },
      {
        title: '4. Preise und Zahlung',
        paragraphs: ['Es gelten die zum Zeitpunkt der Behandlung mitgeteilten Preise in ungarischen Forint. Online angezeigte Preise sind Richtwerte, sofern nicht ausdrücklich ein verbindliches schriftliches Angebot erstellt wurde. Die Zahlung ist grundsätzlich bar oder mit Bankkarte möglich.'],
      },
      {
        title: '5. Absage und Nichterscheinen',
        paragraphs: ['Kann ein bestätigter Termin nicht wahrgenommen werden, bitten wir um eine möglichst frühzeitige telefonische oder schriftliche Absage, nach Möglichkeit mindestens 24 Stunden vor Behandlungsbeginn. Wiederholtes Nichterscheinen ohne vorherige Mitteilung kann dazu führen, dass weitere Termine nur nach individueller Abstimmung angeboten werden.'],
      },
      {
        title: '6. KI-Angebotsvergleich',
        paragraphs: ['Der automatisierte Angebotsvergleich dient nur der ersten Orientierung. Er ist weder eine Diagnose noch ein Behandlungsplan oder ein verbindliches Angebot. Die endgültige Planung und der Preis können erst nach einer persönlichen zahnärztlichen Untersuchung festgelegt werden.'],
      },
      {
        title: '7. Haftung und Beschwerden',
        paragraphs: ['Crown Dental erbringt die Leistungen nach den geltenden fachlichen und gesetzlichen Vorschriften. Beschwerden können an info@crowndental.hu gerichtet werden. Zwingende Verbraucher- und Patientenrechte bleiben unberührt.'],
      },
    ],
  },
  privacy: {
    eyebrow: 'Datenschutz',
    title: 'Datenschutzerklärung',
    lead: 'Informationen darüber, wie Crown Dental personenbezogene Daten verarbeitet, schützt und für die Patientenkommunikation verwendet.',
    updated: 'Stand: 20. Juli 2026',
    sections: [
      {
        title: '1. Verantwortlicher',
        paragraphs: ['Crown Dental Praxis és Labor Fogászati Kft., Petőfi Sándor utca 11, 2500 Esztergom, Ungarn. Kontakt: info@crowndental.hu, +36 70 564 6837.'],
      },
      {
        title: '2. Verarbeitete Daten und Zwecke',
        items: ['Terminanfragen: Name, gewünschte Anrede, E-Mail-Adresse, Telefonnummer, Praxis, gewünschte Behandlung und Mitteilung.', 'Behandlung: die gesetzlich erforderlichen Gesundheits- und Behandlungsdaten sowie medizinische Dokumentation.', 'Karriere: Bewerbungs- und Kontaktdaten sowie freiwillig übermittelte Informationen.', 'Marketing nur nach Einwilligung: Name, E-Mail-Adresse, Telefonnummer, gewählte Praxis, Sprache, Quelle und Zeitpunkt der Einwilligung.', 'Technische Daten: notwendige Sicherheits-, Protokoll- und Cookie-Informationen.'],
      },
      {
        title: '3. Rechtsgrundlagen und Speicherdauer',
        paragraphs: ['Die Verarbeitung erfolgt je nach Zweck zur Durchführung vorvertraglicher Maßnahmen oder eines Behandlungsvertrags, zur Erfüllung gesetzlicher Pflichten, aufgrund berechtigter Interessen oder auf Grundlage einer freiwilligen Einwilligung. Medizinische Unterlagen werden entsprechend den ungarischen gesetzlichen Aufbewahrungspflichten gespeichert. Marketingdaten werden bis zum Widerruf oder zur Löschung gespeichert.'],
      },
      {
        title: '4. Automatisierte Patientenkommunikation',
        paragraphs: ['Nach einem Behandlungstermin kann nach 30 Tagen eine Bewertungsanfrage versendet werden. Nach 90 Tagen kann eine Erinnerung folgen, dass noch 90 Tage bis zur halbjährlichen Kontrolle verbleiben; anschließend können Erinnerungen zur Halbjahres- und Jahreskontrolle versendet und dieser Kontrollzyklus wiederholt werden. Marketing-Newsletter werden nur mit gesonderter Einwilligung versendet.'],
      },
      {
        title: '5. Empfänger und Dienstleister',
        items: ['Supabase: geschützte Datenbank und Speicherung.', 'Vercel: Hosting und technische Bereitstellung der Website.', 'Resend: Versand transaktionaler E-Mails.', 'Google und Meta: Statistik- und Marketingdienste ausschließlich entsprechend Ihrer Cookie-Auswahl.', 'Sanity: Verwaltung veröffentlichter Website- und Bloginhalte.'],
      },
      {
        title: '6. Ihre Rechte',
        items: ['Auskunft, Berichtigung und – soweit rechtlich zulässig – Löschung Ihrer Daten.', 'Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.', 'Jederzeitiger Widerruf einer Einwilligung ohne Auswirkung auf die Rechtmäßigkeit der vorherigen Verarbeitung.', 'Beschwerde bei der ungarischen Datenschutzbehörde NAIH: 1055 Budapest, Falk Miksa utca 9–11, ugyfelszolgalat@naih.hu.'],
      },
    ],
  },
  cookies: {
    eyebrow: 'Cookie-Einstellungen',
    title: 'Cookie-Richtlinie',
    lead: 'Welche Cookies und ähnlichen Technologien auf crowndental.hu verwendet werden und wie Sie Ihre Auswahl ändern können.',
    updated: 'Stand: 20. Juli 2026',
    sections: [
      {
        title: '1. Was sind Cookies?',
        paragraphs: ['Cookies sind kleine Dateien, die der Browser auf Ihrem Gerät speichert. Sie ermöglichen grundlegende Websitefunktionen und – mit Ihrer Einwilligung – Reichweitenmessung und Marketing.'],
      },
      {
        title: '2. Notwendige Cookies',
        paragraphs: ['Diese Cookies sind für Sicherheit, Navigation, Spracheinstellungen, Formulare und die Speicherung Ihrer Cookie-Auswahl erforderlich. Sie können nicht über das Einwilligungsfenster deaktiviert werden.'],
      },
      {
        title: '3. Statistik und Marketing',
        items: ['Google Analytics hilft uns, die Nutzung der Website in zusammengefasster Form zu verstehen.', 'Google Ads unterstützt die Messung von Werbekampagnen und Termin-Conversions.', 'Meta Pixel unterstützt – nur nach Einwilligung – die Messung und Optimierung von Kampagnen.', 'Nicht notwendige Dienste werden erst nach Ihrer entsprechenden Auswahl aktiviert.'],
      },
      {
        title: '4. Eingesetzte Speichertechnologien',
        items: ['crown_cookie_consent (notwendiger lokaler Speicher): speichert Ihre Auswahl bis zur Löschung der Browserdaten.', 'Buchungsbestätigung (notwendiger Sitzungsspeicher): bleibt bis zum Ende der Browser-Sitzung bestehen.', '_ga und _ga_* (Google Analytics): typischerweise bis zu zwei Jahre.', '_gcl_au und _gcl_aw_* (Google Ads): typischerweise bis zu 90 Tage.', '_fbp (Meta): typischerweise bis zu 90 Tage.'],
      },
      {
        title: '5. Externe Anbieter',
        paragraphs: ['Google Ireland Limited beziehungsweise Google LLC stellt Analytics, Ads und eingebettete Karteninhalte bereit. Meta Platforms Ireland Limited stellt den Meta Pixel bereit. Bei einer Verarbeitung außerhalb des EWR werden die nach dem anwendbaren Datenschutzrecht erforderlichen Garantien verwendet.'],
      },
      {
        title: '6. Einwilligung ändern',
        paragraphs: ['Sie können Ihre Auswahl jederzeit über „Cookie-Einstellungen“ im unteren Bereich der Website ändern oder widerrufen. Zusätzlich können Cookies in den Einstellungen Ihres Browsers gelöscht oder blockiert werden.'],
      },
    ],
  },
  imprint: {
    eyebrow: 'Unternehmensangaben',
    title: 'Impressum',
    lead: 'Offizielle Angaben zum Betreiber der Website und zu den technischen Dienstleistern.',
    updated: 'Stand: 20. Juli 2026',
    sections: [
      {
        title: '1. Websitebetreiber',
        items: ['Unternehmen: Crown Dental Praxis és Labor Fogászati Kft.', 'Sitz: Petőfi Sándor utca 11, 2500 Esztergom, Ungarn', 'Steuernummer: 26537353-2-11', 'E-Mail: info@crowndental.hu', 'Telefon: +36 70 564 6837'],
      },
      {
        title: '2. Hosting',
        paragraphs: ['Die Website wird über die Cloud-Infrastruktur von Vercel Inc., USA, bereitgestellt.'],
      },
      {
        title: '3. Urheberrecht',
        paragraphs: ['Texte, Gestaltung, Bilder und sonstige Inhalte dieser Website sind – sofern nicht anders angegeben – geistiges Eigentum von Crown Dental. Eine Verwendung oder Vervielfältigung ist nur mit vorheriger schriftlicher Zustimmung zulässig.'],
      },
      {
        title: '4. Medizinischer Hinweis',
        paragraphs: ['Die veröffentlichten Informationen dienen der allgemeinen Aufklärung und ersetzen weder eine Untersuchung noch eine individuelle Diagnose oder Therapieempfehlung.'],
      },
      {
        title: '5. Streitbeilegung',
        paragraphs: ['Regional zuständige Schlichtungsstelle am Sitz des Anbieters: Fejér Vármegyei Békéltető Testület, Hosszúsétatér 4–6, 8000 Székesfehérvár, Ungarn; bekeltetes@fmkik.hu; +36 22 510 310.'],
      },
    ],
  },
};

export default function GermanLegalPage({ document }: { document: GermanLegalDocument }) {
  const content = documents[document];

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-28 md:pt-36">
      <section className="mx-auto max-w-5xl px-4">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <header className="bg-slate-950 px-6 py-12 text-white md:px-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-300">
              <ShieldCheck className="h-4 w-4" /> {content.eyebrow}
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">{content.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">{content.lead}</p>
            <p className="mt-5 text-sm font-bold text-slate-400">{content.updated}</p>
          </header>

          <div className="space-y-10 px-6 py-10 md:px-12 md:py-14">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
              <FileText className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p>Diese deutsche Fassung dient der verständlichen Information. Im Fall von Auslegungsunterschieden ist die <Link href={`/${document === 'terms' ? 'aszf' : document === 'privacy' ? 'adatkezeles' : document === 'cookies' ? 'cookie-tajekoztato' : 'impresszum'}`} className="font-black underline">ungarische Originalfassung</Link> maßgeblich.</p>
            </div>

            {content.sections.map((section) => (
              <section key={section.title} className="border-b border-slate-100 pb-9 last:border-0 last:pb-0">
                <h2 className="text-2xl font-black tracking-tight text-slate-950">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 leading-8 text-slate-600">{paragraph}</p>)}
                {section.items && (
                  <ul className="mt-5 space-y-3">
                    {section.items.map((item) => <li key={item} className="flex gap-3 leading-7 text-slate-600"><span className="mt-2.5 h-2 w-2 flex-shrink-0 rounded-full bg-sky-500" />{item}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
