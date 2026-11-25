import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import voucherArt from '@/prototypes/karacsonyi-utalvanyok/teli-mese-a5.webp';
import { voucherShopPath } from '@/lib/vouchers/storefront';
import { hygieneCopy, hygieneFee, hygienePrices } from '@/lib/hygiene';
import { itopFees } from '@/lib/itop';
import { localePrefix, type SupportedLocale } from '@/lib/seo';
import styles from './HomeCampaigns.module.css';

const copy = {
  hu: {
    gift: 'Karácsonyi ajándékutalvány', detail: '10 000 Ft-tól, nyomtatható PDF-ben vagy személyes átvétellel.',
    buy: 'Utalványt választok', hygiene: 'Dentálhigiénia Esztergomban', visit: 'első alkalom',
    air: 'Ultrahangos fogkőeltávolítás és a felszíni elszíneződések tisztítása finom porral.',
    bio: 'Plakkfestéssel láthatóvá tesszük a lepedéket, majd air polishing segítségével célzottan eltávolítjuk.',
    itop: 'iTOP szájápolási tanácsadás', coaching: 'Egy óra gyakorlás Berber-Waller Oxánával, hazavihető Curaprox szájápolási csomaggal.',
  },
  sk: {
    gift: 'Vianočná darčeková poukážka', detail: 'Od 10 000 HUF ako PDF na vytlačenie alebo s osobným prevzatím.',
    buy: 'Vybrať poukážku', hygiene: 'Dentálna hygiena v Ostrihome', visit: 'prvá návšteva',
    air: 'Ultrazvukom odstránime zubný kameň a jemným práškom povrchové zafarbenie zubov.',
    bio: 'Farbením zvýrazníme povlak a označené miesta cielene vyčistíme pieskovaním.',
    itop: 'Individuálna inštruktáž iTOP', coaching: 'Hodina praktického nácviku s Oxánou Berber-Waller a balíček pomôcok Curaprox na doma.',
  },
  en: {
    gift: 'Christmas gift vouchers', detail: 'From 10,000 HUF as a printable PDF or for collection in Esztergom.',
    buy: 'Choose a voucher in Hungarian', hygiene: 'Dental hygiene in Esztergom', visit: 'first visit',
    air: 'Ultrasonic scaling removes tartar. A fine powder spray then lifts surface stains.',
    bio: 'We use a dye to show where plaque remains and clean those areas with air polishing.',
    itop: 'One-to-one iTOP coaching', coaching: 'Practise with hygienist Oxána Berber-Waller for an hour and take home a Curaprox oral care kit.',
  },
  de: {
    gift: 'Geschenkgutscheine zu Weihnachten', detail: 'Ab 10.000 HUF als PDF zum Ausdrucken oder zur Abholung in Esztergom.',
    buy: 'Gutschein auf Ungarisch wählen', hygiene: 'Dentalhygiene in Esztergom', visit: 'Ersttermin',
    air: 'Wir entfernen Zahnstein mit Ultraschall und oberflächliche Verfärbungen mit einem feinen Pulverstrahl.',
    bio: 'Wir färben Zahnbelag an und reinigen die sichtbaren Stellen gezielt mit Air-Polishing.',
    itop: 'Persönliche iTOP-Mundhygieneschulung', coaching: 'Sie üben eine Stunde mit Oxána Berber-Waller und erhalten ein Curaprox-Pflegeset für zu Hause.',
  },
} as const;

export function ChristmasVoucherBanner({ locale }: { locale: SupportedLocale }) {
  const t = copy[locale];
  const shopLocale = locale === 'sk' ? 'sk' : 'hu';
  return (
    <aside aria-label={t.gift} className={styles.voucher}>
      <Link href={voucherShopPath(shopLocale)} hrefLang={shopLocale} prefetch={false} className={styles.offer}>
        <div className={styles.offerCopy}>
          <strong>{t.gift}</strong>
          <span>{t.detail}</span>
          <span className={styles.buy}>{t.buy}<ArrowRight size={16} aria-hidden="true" /></span>
        </div>
        <Image src={voucherArt} alt="" sizes="(max-width: 460px) 23vw, (max-width: 768px) 150px, 195px" className={styles.voucherImage} />
      </Link>
    </aside>
  );
}

export function HomeHygiene({ locale }: { locale: SupportedLocale }) {
  const t = copy[locale];
  const { copy: services } = hygieneCopy(locale, 'air-polishing');
  const offers = [
    { slug: 'air-polishing', name: services.air.name, description: t.air, fee: hygienePrices['air-polishing'], unit: services.unit },
    { slug: 'premium-biofilm-terapia', name: services.bio.name, description: t.bio, fee: hygienePrices['premium-biofilm-terapia'], unit: services.unit },
    { slug: 'itop', name: t.itop, description: t.coaching, fee: itopFees.itop, unit: t.visit },
  ];
  return (
    <section id="dentalhigienia" aria-labelledby="home-hygiene-title" className={styles.hygiene}>
      <div className="crown-container">
        <h2 id="home-hygiene-title">{t.hygiene}</h2>
        <div className={styles.treatments}>{offers.map(offer => (
          <Link key={offer.slug} className={styles.treatment} href={localePrefix(locale) + '/kezelesek/' + offer.slug} prefetch={false}>
            <h3>{offer.name}</h3><p>{offer.description}</p>
            <span>{hygieneFee(locale, offer.fee)} / {offer.unit}<ArrowUpRight size={18} aria-hidden="true" /></span>
          </Link>
        ))}</div>
        <Link className={styles.scaling} href={localePrefix(locale) + '/idopont?kezeles=fogko'} data-cta-location="treatment_card">
          {services.base} · {hygieneFee(locale, hygienePrices.fogko)} / {services.unit}<ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
