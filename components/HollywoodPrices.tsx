'use client';

import Link from 'next/link';
import { useVeneerOffer, type VeneerOfferState } from './VeneerOffer';
import { formatLocalizedVeneerPrice, getVeneerLabels, normalizeVeneerLocale, veneerPath } from '@/lib/veneerI18n';

const priceCopy = {
  hu: {
    title: 'Fogászati héj árak: példák 4, 6, 8 és 10 fogra',
    intro: 'A héjak díját a fogankénti ár és a kezelt fogak száma határozza meg. A táblázat a direkt kompozit és az indirekt porcelán héjak költségét hasonlítja össze az oldalon feltüntetett árak alapján.',
    caption: 'Árpéldák 4, 6, 8 és 10 héjra – kizárólag a héjak díja',
    count: 'Fogak száma',
    note: 'Ezek számítási példák, nem kezelési csomagok vagy javasolt fogszámok. A szükséges fogszámot a személyes kezelési terv határozza meg. Az esetleges előzetes kezelések külön díját előre egyeztetjük.',
  },
  en: {
    title: 'Hollywood smile prices by number of teeth',
    intro: 'Veneer costs depend on the price per tooth and the number of teeth treated. The table compares direct composite and indirect porcelain veneer costs using the prices shown on this page.',
    caption: 'Cost examples for 4, 6, 8 and 10 veneers – veneer fees only',
    count: 'Number of teeth',
    note: 'These are calculation examples, not treatment packages or recommended numbers of teeth. Your personal treatment plan determines how many teeth need treatment. Any additional fees for preliminary treatment are agreed in advance.',
  },
  de: {
    title: 'Hollywood-Smile-Preise nach Zahnanzahl',
    intro: 'Die Kosten für Veneers ergeben sich aus dem Preis pro Zahn und der Anzahl der behandelten Zähne. Die Tabelle vergleicht direkte Komposit-Veneers mit indirekten Keramik-Veneers anhand der auf dieser Seite angegebenen Preise.',
    caption: 'Kostenbeispiele für 4, 6, 8 und 10 Veneers – nur die Veneer-Kosten',
    count: 'Zahnanzahl',
    note: 'Dies sind Rechenbeispiele, keine Behandlungspakete oder Empfehlungen zur Zahnanzahl. Ihr persönlicher Behandlungsplan bestimmt, wie viele Zähne behandelt werden. Zusätzliche Kosten für notwendige Vorbehandlungen stimmen wir vorab ab.',
  },
  sk: {
    title: 'Ceny hollywoodskeho úsmevu podľa počtu zubov',
    intro: 'Cena faziet závisí od ceny za jeden zub a počtu ošetrených zubov. Tabuľka porovnáva náklady na priame kompozitné a nepriame keramické fazety podľa cien uvedených na tejto stránke.',
    caption: 'Príklady cien pre 4, 6, 8 a 10 faziet – iba cena faziet',
    count: 'Počet zubov',
    note: 'Ide o príklady výpočtu, nie o balíky ošetrení ani odporúčaný počet zubov. Potrebný počet určí osobný plán ošetrenia. Prípadné dodatočné náklady na predchádzajúce ošetrenia dohodneme vopred.',
  },
};

export default function HollywoodPrices({ locale, directOffer, indirectOffer }: {
  locale: string;
  directOffer: VeneerOfferState;
  indirectOffer: VeneerOfferState;
}) {
  const language = normalizeVeneerLocale(locale);
  const copy = priceCopy[language];
  const labels = getVeneerLabels(language);
  const direct = useVeneerOffer('direkt-hej', directOffer);
  const formatPrice = (amount: number) => formatLocalizedVeneerPrice(amount, language);

  return (
    <section id="arak" aria-labelledby="hollywood-prices-title">
      <div className="crown-container max-w-5xl">
        <div className="crown-section-heading">
          <h2 id="hollywood-prices-title">{copy.title}</h2>
          <p className="crown-lead">{copy.intro}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base">
            <caption className="pb-4 text-left text-sm text-slate-600">{copy.caption}</caption>
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th scope="col" className="p-3 sm:p-5">{copy.count}</th>
                <th scope="col" className="p-3 sm:p-5">
                  <Link href={veneerPath(language, '/kezelesek/direkt-hej')} className="text-sky-700 underline underline-offset-4">{labels.directName}</Link>
                </th>
                <th scope="col" className="p-3 sm:p-5">
                  <Link href={veneerPath(language, '/kezelesek/indirekt-hej')} className="text-sky-700 underline underline-offset-4">{labels.indirectName}</Link>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b border-slate-200">
              {[4, 6, 8, 10].map(count => (
                <tr key={count}>
                  <th scope="row" className="p-3 sm:p-5 font-semibold">{count}</th>
                  <td className="p-3 sm:p-5 whitespace-nowrap">{formatPrice(direct.price * count)}</td>
                  <td className="p-3 sm:p-5 whitespace-nowrap">{formatPrice(indirectOffer.price * count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {direct.validThrough && <p className="mt-4 text-sm leading-relaxed text-slate-600">{labels.directName} – {labels.periodLabel} {labels.period}</p>}
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{copy.note}</p>
      </div>
    </section>
  );
}
