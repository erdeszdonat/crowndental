import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Phone } from 'lucide-react';
import { getTreatmentImages } from '@/lib/treatmentImages';
import { getVeneerOffer, VENEERS } from '@/lib/veneers.mjs';
import VeneerImage from '@/components/VeneerImage';
import VeneerOffer from '@/components/VeneerOffer';
import VeneerSeo, { veneerMetadata } from '@/components/VeneerSeo';
import { hollywoodFaqs } from '@/components/VeneerContent';
import { VeneerFaqSection, VeneerHealthNote } from '@/components/VeneerPage';

export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  if ((await params).locale !== 'hu') notFound();
  return veneerMetadata(
    'Hollywood smile Esztergom – direkt vagy porcelán héj?',
    'Hollywoodi mosoly személyre tervezve a Crown Dentalnál. Direkt és porcelán héj összehasonlítása, fogankénti árak és konzultáció Esztergomban, saját laborral.',
    '/hollywood-mosoly',
  );
}

export default async function HollywoodMosolyPage({ params }: Props) {
  if ((await params).locale !== 'hu') notFound();
  const now = new Date().toISOString();
  const direct = getVeneerOffer('direkt-hej', now);
  const indirect = getVeneerOffer('indirekt-hej', now);
  const images = await getTreatmentImages();
  const imageUrl = images['hollywood-mosoly'] || images['esztetikai-fogaszat'] || images['fogfeherites'] || '';
  return (
    <>
      <VeneerSeo name="Hollywood smile – hollywoodi mosoly" path="/hollywood-mosoly" faqs={hollywoodFaqs} />
      <main className="crown-page bg-white min-h-screen">
        <section className="crown-clinical-hero" data-cta-location="hollywood_hero">
          <div className="crown-container">
            <Link href="/kezelesek" className="crown-back"><ArrowLeft size={16} aria-hidden="true" />Vissza a kezelésekhez</Link>
            <div className="crown-hero-grid">
              <div className="crown-hero-copy">
                <p className="crown-eyebrow">Mosolytervezés · Crown Dental Esztergom</p>
                <h1>Hollywood smile – az Ön hollywoodi mosolya</h1>
                <p className="crown-lead">Direkt kompozit héj vagy saját laborban készülő porcelán héj? Ismerje meg a két lehetőséget, hasonlítsa össze az árakat, és beszéljük át személyesen, melyik illik az elképzeléséhez.</p>
                <div className="crown-actions">
                  <Link href="/idopont" className="crown-button">Mosolytervezési konzultáció<ArrowUpRight size={19} aria-hidden="true" /></Link>
                  <a href="tel:+36305892468" className="crown-button crown-button-secondary"><Phone size={18} aria-hidden="true" />06 30 589 2468</a>
                </div>
              </div>
              <div className="crown-hero-visual"><div className="crown-hero-photo">{imageUrl && <VeneerImage src={imageUrl} alt={images['hollywood-mosoly'] ? 'Mosoly a kezelés előtt és után – Hollywood smile Esztergomban' : ''} />}</div>
                <div className="crown-price-note"><span>Direkt kompozit és indirekt porcelán héj</span><strong>Személyes mosolyterv</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="hollywood-meaning-title">
          <div className="crown-container max-w-4xl">
            <div className="crown-section-heading"><h2 id="hollywood-meaning-title">Mit jelent a hollywoodi mosoly?</h2></div>
            <p className="text-lg leading-relaxed text-slate-600">A Hollywood smile kifejezést a megtervezett, harmonikus mosolyra használjuk. A kívánt megjelenés lehet természetesebb vagy feltűnően világos: a konzultáción az Ön céljából indulunk ki. Nincs mindenkire egyformán alkalmazható héjcsomag vagy kötelező fogszám.</p>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">Érdemes megfogalmaznia, mi zavarja leginkább: a szín, egyes fogak formája, vagy az összhatás. Ez segít abban, hogy a különböző lehetőségeket valóban az Ön szempontjai szerint beszéljük át.</p>
            <VeneerHealthNote />
          </div>
        </section>

        <section id="osszehasonlitas" className="bg-gray-50 border-y border-gray-100" aria-labelledby="veneer-comparison-title">
          <div className="crown-container">
            <div className="crown-section-heading"><p className="crown-eyebrow">Két külön kezelés</p><h2 id="veneer-comparison-title">Direkt héj vagy porcelán héj?</h2><p className="crown-lead">Az anyag, az elkészítés módja és a tervezett költség is fontos szempont.</p></div>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white" role="region" aria-label="Direkt és porcelán héj összehasonlítása" tabIndex={0}>
              <table className="w-full min-w-[640px] text-left">
                <caption className="sr-only">A Crown Dental direkt kompozit és indirekt porcelán héj kezeléseinek összehasonlítása</caption>
                <thead className="bg-sky-50"><tr>
                  <th scope="col" className="p-5 font-bold">Szempont</th>
                  <th scope="col" className="p-5 font-bold">Direkt héj</th>
                  <th scope="col" className="p-5 font-bold">Indirekt porcelán héj</th>
                </tr></thead>
                <tbody className="text-slate-600">
                  <tr className="border-t border-gray-200"><th scope="row" className="p-5 text-slate-900">Anyag</th><td className="p-5">Kompozit</td><td className="p-5">Prémium porcelán / kerámia</td></tr>
                  <tr className="border-t border-gray-200"><th scope="row" className="p-5 text-slate-900">Elkészítés</th><td className="p-5">Közvetlenül a fogon, a rendelőben</td><td className="p-5">Egyénre készítve, saját laborunkban</td></tr>
                  <tr className="border-t border-gray-200"><th scope="row" className="p-5 align-top text-slate-900">Ár foganként</th><td className="p-5 align-top"><VeneerOffer slug="direkt-hej" initialOffer={direct} compact /></td><td className="p-5 align-top"><VeneerOffer slug="indirekt-hej" initialOffer={indirect} compact /></td></tr>
                  <tr className="border-t border-gray-200"><th scope="row" className="p-5 text-slate-900">Részletek</th><td className="p-5"><Link href={VENEERS['direkt-hej'].path} className="text-sky-700 underline underline-offset-4">Direkt héj kezelési oldal</Link></td><td className="p-5"><Link href={VENEERS['indirekt-hej'].path} className="text-sky-700 underline underline-offset-4">Porcelán héj kezelési oldal</Link></td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-5 text-sm text-slate-600 leading-relaxed">A kompozit és a porcelán eltérő lehetőségeket kínál. Mindkét megoldásnak szüksége lehet későbbi karbantartásra vagy cserére; a döntésben az egyéni fogászati állapot is szerepet játszik. További általános információ: <a href="https://www.leedsth.nhs.uk/patients/resources/tooth-whitening-information-for-adult-patients/" className="text-sky-700 underline underline-offset-4">Leeds Teaching Hospitals – esztétikai kezelési lehetőségek</a>.</p>
          </div>
        </section>

        <section aria-labelledby="hollywood-cost-title">
          <div className="crown-container max-w-4xl">
            <div className="crown-section-heading"><h2 id="hollywood-cost-title">Mennyibe kerül a hollywoodi mosoly?</h2></div>
            <p className="text-lg leading-relaxed text-slate-600">A héjak teljes díjának alapja a fogankénti ár és az érintett fogak száma. Nem adunk mindenkire érvényes csomagárat: a konzultáción pontosítjuk, hány fog kezeléséről van szó, és szükséges-e előzetes ellátás. Az esetleges további kezelések külön díját előre egyeztetjük.</p>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">A saját laborban készülő porcelán héj jelenlegi ára 99.000 Ft/fog, 120.000 Ft helyett, és már most kérhető rá időpont. A direkt héj aktuális árát és akciós időszakát a fenti táblázatban és a külön kezelési oldalon találja.</p>
            <div className="crown-actions">
              <Link href={VENEERS['direkt-hej'].bookingHref} className="crown-button">Direkt héj időpontkérés<ArrowUpRight size={18} aria-hidden="true" /></Link>
              <Link href={VENEERS['indirekt-hej'].bookingHref} className="crown-button crown-button-secondary">Porcelán héj időpontkérés<ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 border-y border-gray-100" aria-labelledby="hollywood-alternatives-title">
          <div className="crown-container">
            <div className="crown-section-heading"><h2 id="hollywood-alternatives-title">Milyen lehetőségekről érdemes még beszélni?</h2><p className="crown-lead">A héj mellett más esztétikai kezelések is szóba kerülhetnek az állapotfelmérésen.</p></div>
            <div className="crown-cards-grid">
              {[
                { title: 'Fogfehérítés', description: 'Ha elsősorban a színén változtatna, kérdezzen rá a fogfehérítés lehetőségére. A már meglévő héjak árnyalatát a fehérítés nem változtatja meg.', href: '/kezelesek/fogfeherites' },
                { title: 'Fogszabályozás', description: 'Ha fogai elhelyezkedése foglalkoztatja, a konzultáción a fogszabályozásról is beszélhetünk.', href: '/kezelesek/fogszabalyozas' },
                { title: 'Állapotfelmérés', description: 'Ha még nem döntött a kezelésről, induljon személyes vizsgálattal. Ez adja az egyéni kezelési terv alapját.', href: '/kezelesek/allapotfelmeres' },
              ].map((item) => <Link href={item.href} key={item.href} className="crown-treatment-card"><div className="crown-treatment-body"><h3>{item.title}</h3><p>{item.description}</p><div className="crown-treatment-bottom"><span>A kezelésről<ArrowUpRight size={18} aria-hidden="true" /></span></div></div></Link>)}
            </div>
          </div>
        </section>

        <VeneerFaqSection faqs={hollywoodFaqs} />

        <section data-cta-location="hollywood_contact" aria-labelledby="hollywood-contact-title">
          <div className="crown-container">
            <div className="crown-section-heading"><p className="crown-eyebrow">Crown Dental · Esztergom</p><h2 id="hollywood-contact-title">Beszéljük át az Ön mosolyát</h2><p className="crown-lead">2500 Esztergom, Petőfi Sándor utca 11. Kérjen konzultációt, és kollégánk egyezteti, majd visszaigazolja az időpontot.</p></div>
            <div className="crown-actions justify-center"><Link href="/idopont" className="crown-button">Konzultációt kérek<ArrowUpRight size={18} aria-hidden="true" /></Link><Link href="/kapcsolat" className="crown-button crown-button-secondary">Elérhetőség és megközelítés</Link></div>
          </div>
        </section>
      </main>
    </>
  );
}
