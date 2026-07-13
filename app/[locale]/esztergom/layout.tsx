import type { Metadata } from 'next';
import { buildFaqJsonLd } from '@/lib/faqSchema';
import {
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildLocalizedMetadata,
  localizedUrl,
  normalizeLocale,
  type SupportedLocale,
} from '@/lib/seo';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

const seoContent: Record<SupportedLocale, { title: string; description: string; keywords: string[] }> = {
  hu: {
    title: 'Fogorvos Esztergom | Crown Dental fogászat és saját labor',
    description: 'Fogorvos Esztergom belvárosában 1994 óta: teljes körű fogászat, saját fogtechnikai labor, hétvégi rendelés és online időpontkérés.',
    keywords: ['fogorvos Esztergom', 'Esztergom fogorvos', 'fogászat Esztergom', 'fogorvos Komárom-Esztergom'],
  },
  en: {
    title: 'Dentist in Esztergom | Crown Dental and in-house laboratory',
    description: 'Trusted dentist in central Esztergom since 1994, offering comprehensive care, an in-house dental laboratory, weekend appointments and online booking.',
    keywords: ['dentist Esztergom', 'dental clinic Esztergom', 'dentist Hungary', 'Crown Dental Esztergom'],
  },
  sk: {
    title: 'Zubár Ostrihom pre slovenských pacientov | Crown Dental',
    description: 'Zubná klinika v centre Ostrihomu od roku 1994, ľahko dostupná zo Štúrova. Vlastné laboratórium, víkendové termíny a online rezervácia.',
    keywords: ['zubár Ostrihom', 'zubná klinika Ostrihom', 'zubár Štúrovo', 'zubár Maďarsko', 'zubár pri Štúrove'],
  },
  de: {
    title: 'Zahnarzt in Esztergom | Crown Dental mit eigenem Dentallabor',
    description: 'Zahnarztpraxis im Zentrum von Esztergom seit 1994: umfassende Zahnmedizin, eigenes Dentallabor, Wochenendtermine und Online-Terminbuchung.',
    keywords: ['Zahnarzt Esztergom', 'Zahnklinik Esztergom', 'Zahnarzt Ungarn', 'Crown Dental Esztergom'],
  },
};

const clinicDescriptions: Record<SupportedLocale, string> = {
  hu: 'Teljes körű fogászati rendelő és saját fogtechnikai labor Esztergom belvárosában, hétvégi ellátással magyar és szlovák pácienseknek.',
  en: 'Comprehensive dental clinic with an in-house dental laboratory in central Esztergom, offering weekend care for Hungarian and international patients.',
  sk: 'Komplexná zubná klinika s vlastným zubnotechnickým laboratóriom v centre Ostrihomu, dostupná aj cez víkend pre pacientov zo Slovenska.',
  de: 'Umfassende Zahnklinik mit eigenem Dentallabor im Zentrum von Esztergom, mit Wochenendterminen für Patienten aus Ungarn und dem Ausland.',
};

const clinicFaqs: Record<SupportedLocale, Array<{ q: string; a: string }>> = {
  hu: [
    { q: 'Hol található a Crown Dental esztergomi rendelője?', a: 'Rendelőnk Esztergom belvárosában, a 2500 Esztergom, Petőfi Sándor utca 11. címen található.' },
    { q: 'Hétvégén is van rendelés Esztergomban?', a: 'Igen. Szombaton és vasárnap 7:00 és 13:00 között is fogadunk pácienseket.' },
    { q: 'Fogadnak szlovákiai pácienseket is?', a: 'Igen. Rendelőnk Párkányból és Dél-Szlovákiából is könnyen megközelíthető, a weboldalon pedig szlovák nyelven is kérhető időpont.' },
    { q: 'Helyben készülnek a fogpótlások?', a: 'Igen. Saját fogtechnikai laborunk a rendelővel egy épületben működik, így a fogorvos és a fogtechnikus közvetlenül együtt dolgozik.' },
  ],
  en: [
    { q: 'Where is Crown Dental Esztergom located?', a: 'Our clinic is in central Esztergom at 11 Petőfi Sándor Street, 2500 Esztergom, Hungary.' },
    { q: 'Is the Esztergom clinic open at weekends?', a: 'Yes. We also see patients on Saturdays and Sundays from 7:00 to 13:00.' },
    { q: 'Do you welcome patients from Slovakia?', a: 'Yes. The clinic is easy to reach from Štúrovo and southern Slovakia, and appointments can also be requested through our Slovak website.' },
    { q: 'Are dental restorations made on site?', a: 'Yes. Our dental laboratory operates in the same building, allowing dentists and dental technicians to work together directly.' },
  ],
  sk: [
    { q: 'Kde sa nachádza Crown Dental v Ostrihome?', a: 'Naša klinika sa nachádza v centre Ostrihomu na adrese Petőfi Sándor utca 11, 2500 Esztergom, Maďarsko.' },
    { q: 'Je klinika v Ostrihome otvorená aj cez víkend?', a: 'Áno. Pacientov prijímame aj v sobotu a v nedeľu od 7:00 do 13:00.' },
    { q: 'Prijímate pacientov zo Slovenska?', a: 'Áno. Klinika je ľahko dostupná zo Štúrova aj z južného Slovenska a termín si môžete vyžiadať online v slovenčine.' },
    { q: 'Vyrábajú sa zubné náhrady priamo na mieste?', a: 'Áno. Vlastné zubnotechnické laboratórium je v rovnakej budove, takže zubár a zubný technik spolupracujú priamo.' },
  ],
  de: [
    { q: 'Wo befindet sich Crown Dental Esztergom?', a: 'Unsere Praxis liegt im Zentrum von Esztergom, Petőfi Sándor utca 11, 2500 Esztergom, Ungarn.' },
    { q: 'Ist die Praxis in Esztergom auch am Wochenende geöffnet?', a: 'Ja. Wir behandeln Patienten auch samstags und sonntags von 7:00 bis 13:00 Uhr.' },
    { q: 'Behandeln Sie auch deutschsprachige Patienten?', a: 'Ja. Termine können über unsere deutschsprachige Website angefragt werden.' },
    { q: 'Wird Zahnersatz direkt vor Ort hergestellt?', a: 'Ja. Unser eigenes Dentallabor befindet sich im selben Gebäude, sodass Zahnärzte und Zahntechniker unmittelbar zusammenarbeiten.' },
  ],
};

export function generateMetadata({ params }: Props): Metadata {
  const locale = normalizeLocale(params.locale);
  return buildLocalizedMetadata({
    locale,
    path: 'esztergom',
    image: '/og-esztergom.jpg',
    ...seoContent[locale],
  });
}

function buildClinicJsonLd(locale: SupportedLocale) {
  const pageUrl = localizedUrl(locale, 'esztergom');
  const bookingUrl = localizedUrl(locale, 'idopont');

  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': `${SITE_URL}/esztergom#dentist`,
    name: 'Crown Dental Esztergom',
    alternateName: ['Crown Dental Ostrihom', 'Crown Dental Esztergomi Rendelő', 'Crown Dental Zahnarztpraxis Esztergom'],
    description: clinicDescriptions[locale],
    url: pageUrl,
    mainEntityOfPage: { '@id': pageUrl },
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    telephone: '+36705646837',
    email: 'info@crowndental.hu',
    foundingDate: '1994',
    image: [`${SITE_URL}/og-esztergom.jpg`, `${SITE_URL}/logo.webp`],
    logo: `${SITE_URL}/logo.webp`,
    priceRange: '$$',
    currenciesAccepted: 'HUF',
    paymentAccepted: 'Cash, Credit Card',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Petőfi Sándor utca 11.',
      addressLocality: 'Esztergom',
      addressRegion: 'Komárom-Esztergom',
      postalCode: '2500',
      addressCountry: 'HU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 47.79269,
      longitude: 18.74323,
    },
    hasMap: 'https://www.google.com/maps?cid=13855060144941940295',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '07:00',
        closes: '13:00',
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Esztergom' },
      { '@type': 'AdministrativeArea', name: 'Komárom-Esztergom' },
      { '@type': 'City', name: 'Štúrovo', alternateName: 'Párkány' },
      { '@type': 'City', name: 'Komárno' },
      { '@type': 'Country', name: 'Slovakia', alternateName: 'Szlovákia' },
    ],
    sameAs: [
      'https://www.facebook.com/koronafogaszatesztergom/',
      'https://www.instagram.com/crown_dental93/',
      'https://www.tiktok.com/@crowndentalhungary',
      'https://www.google.com/maps?cid=13855060144941940295',
    ],
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: bookingUrl,
        inLanguage: locale,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      result: { '@type': 'Reservation', name: 'Fogászati időpontkérés' },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'sk' ? 'Zubné ošetrenia' : locale === 'en' ? 'Dental treatments' : locale === 'de' ? 'Zahnbehandlungen' : 'Fogászati kezelések',
      itemListElement: [
        ['implantatum', locale === 'sk' ? 'Zubné implantáty' : locale === 'en' ? 'Dental implants' : locale === 'de' ? 'Zahnimplantate' : 'Fogászati implantátum'],
        ['koronak-hidak', locale === 'sk' ? 'Korunky a mostíky' : locale === 'en' ? 'Crowns and bridges' : locale === 'de' ? 'Kronen und Brücken' : 'Koronák és hidak'],
        ['fogszabalyozas', locale === 'sk' ? 'Ortodoncia' : locale === 'en' ? 'Orthodontics' : locale === 'de' ? 'Kieferorthopädie' : 'Fogszabályozás'],
        ['fogsor', locale === 'sk' ? 'Zubné náhrady' : locale === 'en' ? 'Dentures' : locale === 'de' ? 'Zahnersatz' : 'Fogsor készítés'],
      ].map(([slug, name]) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name,
          url: localizedUrl(locale, `kezelesek/${slug}`),
          provider: { '@id': `${SITE_URL}/esztergom#dentist` },
        },
      })),
    },
  };
}

export default function EsztergomLayout({ children, params }: Props) {
  const locale = normalizeLocale(params.locale);
  const clinicJsonLd = buildClinicJsonLd(locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    locale,
    'esztergom',
    locale === 'sk' ? 'Crown Dental Ostrihom' : 'Crown Dental Esztergom',
  );
  const faqJsonLd = buildFaqJsonLd(clinicFaqs[locale]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {children}
    </>
  );
}
