import {
  HREFLANG_BY_LOCALE,
  SITE_URL,
  type SupportedLocale,
} from '@/lib/seo';

export type BlogTranslationGroup = Record<SupportedLocale, string>;

/**
 * Curated translation groups for the existing Sanity articles.
 *
 * Sanity currently stores translated posts as independent documents, so there
 * is no reliable CMS relationship to use for hreflang or the language switcher.
 * Keep this map in sync when an article slug changes or a new translation is
 * published. The content audit script validates every entry against Sanity.
 */
export const BLOG_TRANSLATION_GROUPS: readonly BlogTranslationGroup[] = [
  {
    hu: 'soha-nincs-keso-a-tokeletes-mosolyhoz-fogszabalyoz',
    sk: 'ortodoncia-v-kazdom-veku-deti-tinedzeri-dospeli',
    en: 'orthodontics-every-age-children-teenagers-adults',
    de: 'kieferorthopaedie-jedes-alter-kinder-jugendliche-erwachsene',
  },
  {
    hu: 'hogyan-valasszunk-fogorvost-5-szempont-ami-segit-a',
    sk: 'ako-si-vybrat-zubara-10-kriterii-dobrej-kliniky',
    en: 'how-to-choose-dentist-10-signs-good-clinic',
    de: 'zahnarzt-auswaehlen-10-merkmale-gute-praxis',
  },
  {
    hu: 'fogorvos-es-fogtechnikus-egy-csapatban',
    sk: 'zubar-zubny-technik-jeden-tim-preco-zalezi',
    en: 'dentist-dental-technician-one-team-why-it-matters',
    de: 'zahnarzt-zahntechniker-team-warum-wichtig',
  },
  {
    hu: 'ragyogo-mosoly-egy-ora-alatt-igy-mukodik-a-valodi',
    sk: 'ako-funguje-bielenie-zubov-metody-vysledok-bezpecnost',
    en: 'how-teeth-whitening-works-methods-results-safety',
    de: 'wie-funktioniert-zahnaufhellung-methoden-ergebnis-sicherheit',
  },
  {
    hu: 'hagyomanyos-vagy-elektromos-fogkefe-a-tiszta-fogak',
    sk: 'manualna-alebo-elektricka-zubna-kefka-porovnanie',
    en: 'manual-vs-electric-toothbrush-dental-guide',
    de: 'handzahnbuerste-oder-elektrische-zahnbuerste-vergleich',
  },
  {
    hu: 'faj-vagy-csak-kellemetlen',
    sk: 'boli-to-alebo-je-to-neprijemne-co-cakat-zubne-osetrenie',
    en: 'does-dental-treatment-hurt-what-to-expect',
    de: 'tut-zahnbehandlung-weh-was-sie-erwartet',
  },
  {
    hu: 'uj-mosoly-varakozas-nelkul-minden-a-modern-fogsoro',
    sk: 'moderne-zubne-protezy-typy-materialy-ceny-starostlivost',
    en: 'modern-dentures-types-materials-costs-care',
    de: 'moderner-zahnersatz-prothesenarten-materialien-kosten-pflege',
  },
  {
    hu: 'aranykoszoru',
    sk: 'aranykoszorus-mester-pribeh-zakladatela-crown-dental-a-30-rokov-odbornosti',
    en: 'master-craftsmanship-story-of-crown-dental',
    de: 'meisterhandwerk-geschichte-von-crown-dental',
  },
  {
    hu: 'a-fogpotlas-implantacio-folyamata-es-lehetosegei-teljes-utmutato',
    sk: 'zubna-nahrada-implantacia-proces-moznosti-krok-za-krokom',
    en: 'tooth-replacement-implantation-process-options',
    de: 'zahnersatz-implantation-ablauf-moeglichkeiten',
  },
  {
    hu: 'fogorvos-esztergomban-teljes-utmutato-a-fajdalommentes-mosolyert-crown-dental',
    sk: 'zubar-v-ostrihome-kompletny-sprievodca-bezbolestnym-usmevom',
    en: 'dentist-esztergom-complete-guide-comfortable-smile',
    de: 'zahnarzt-esztergom-ratgeber-entspanntes-laecheln',
  },
  {
    hu: 'fogpotlas-arak-es-lehetosegek-2026-ban-miert-eri-meg-a-crown-dental',
    sk: 'zubne-nahrady-ceny-moznosti-2026',
    en: 'tooth-replacement-costs-options-2026',
    de: 'zahnersatz-kosten-moeglichkeiten-2026',
  },
  {
    hu: 'a-fogszabalyozas-menete-modszerek-es-arak-attekintese-crown-dental',
    sk: 'ortodoncia-priebeh-metody-ceny-strojcekov',
    en: 'orthodontics-methods-process-braces-costs',
    de: 'kieferorthopaedie-methoden-ablauf-kosten-zahnspange',
  },
  {
    hu: 'cirkonium-korona-a-modern-fogpotlas-esztetikai-es-funkcionalis-csucsa',
    sk: 'zirkonova-korunka-esteticka-pevna-bez-kovu',
    en: 'zirconia-crowns-aesthetic-strong-metal-free',
    de: 'zirkonkrone-aesthetisch-stabil-metallfrei',
  },
  {
    hu: 'cirkonium-porcelan-vagy-femkeramia-a-fogpotlas-anyagai-erthetoen',
    sk: 'zirkon-porcelan-alebo-kovokeramika-materialy-zubnych-nahrad',
    en: 'zirconia-porcelain-or-metal-ceramic-dental-materials-explained',
    de: 'zirkon-porzellan-oder-metallkeramik-zahnersatzmaterialien',
  },
  {
    hu: 'a-fogszabalyozas-folyamata-lepesek-idotartam-es-utankovetes-a-crown-dentalnal',
    sk: 'priebeh-ortodontickej-liecby-kroky-trvanie-retencia',
    en: 'orthodontic-treatment-process-steps-duration-retainers',
    de: 'ablauf-zahnspangenbehandlung-schritte-dauer-retainer',
  },
  {
    hu: 'fogszabalyozas-gyerekeknek-mikortol-erdemes-elkezdeni-a-kezelest',
    sk: 'strojcek-na-zuby-pre-deti-kedy-zacat-ortodonticku-liecbu',
    en: 'braces-for-children-when-orthodontic-treatment-start',
    de: 'zahnspange-kinder-wann-behandlung-beginnen',
  },
  {
    hu: 'fix-fogsor-4-implantatummal-teljes-attekintes-az-all-on-4-arakrol-es-lehetosegekrol',
    sk: 'fixny-chrup-na-4-implantatoch-all-on-4-cena-postup',
    en: 'fixed-teeth-4-implants-all-on-4-cost-procedure',
    de: 'feste-zaehne-4-implantate-all-on-4-kosten-ablauf',
  },
  {
    hu: 'cuppanos-fogsor-arak-2026-ban-mennyibe-kerul-egy-stabil-kiveheto-fogsor',
    sk: 'horna-zubna-proteza-cena-2026-stabilna-nahrada',
    en: 'suction-dentures-cost-2026-stable-removable-denture',
    de: 'saugprothese-kosten-2026-stabile-zahnprothese',
  },
  {
    hu: 'fogorvos-esztergomban-miert-valasztjak-crown-dentalt-szlovak-paciensek',
    sk: 'zubar-v-madarsku-preco-si-slovenski-pacienti-vyberaju-ostrihom',
    en: 'dentist-hungary-why-international-patients-choose-esztergom',
    de: 'zahnarzt-ungarn-warum-patienten-esztergom-waehlen',
  },
  {
    hu: 'mennyibe-kerul-mufogsor-magyarorszagon-2026-arkalauz',
    sk: 'kolko-stoja-umele-zuby-v-madarsku-2026',
    en: 'dentures-cost-hungary-2026-price-guide',
    de: 'zahnersatz-prothesen-kosten-ungarn-2026-preisratgeber',
  },
  {
    hu: 'szajpadlas-nelkuli-fogsor-kenyelmesebb-megoldas-teljes-foghiany-eseten',
    sk: 'zubna-proteza-bez-podnebia-pohodlnejsia-horna-nahrada',
    en: 'palateless-dentures-more-comfortable-upper-denture',
    de: 'gaumenfreie-zahnprothese-mehr-komfort-oberkiefer',
  },
  {
    hu: 'fogimplantatum-magyarorszagon-arak-elonyok-kulfoldi-pacienseknek',
    sk: 'zubny-implantat-v-madarsku-cena-a-vyhody',
    en: 'dental-implants-hungary-costs-benefits-international-patients',
    de: 'zahnimplantate-ungarn-kosten-vorteile-internationale-patienten',
  },
  {
    hu: 'mennyibe-kerul-egy-fogkorona-2026-ban-teljes-arutmutato',
    sk: 'kolko-stoji-zubna-korunka-2026',
    en: 'dental-crown-cost-2026-complete-price-guide',
    de: 'zahnkrone-kosten-2026-vollstaendiger-preisratgeber',
  },
  {
    hu: 'melyik-a-legjobb-fogpotlasi-megoldas-atfogo-utmutato-a-crown-dentaltol',
    sk: 'ktora-zubna-nahrada-je-najlepsia-mostik-implantat-proteza',
    en: 'best-tooth-replacement-bridge-implant-or-denture',
    de: 'bester-zahnersatz-bruecke-implantat-oder-prothese',
  },
  {
    hu: 'a-felpattinthato-fogsor-modern-megoldas-a-hianyzo-fogak-potlasara',
    sk: 'nacvakavacia-zubna-proteza-stabilne-riesenie-chybajucich-zubov',
    en: 'snap-on-dentures-stable-solution-for-missing-teeth',
    de: 'druckknopfprothese-stabiler-zahnersatz-fehlende-zaehne',
  },
  {
    hu: 'hetvege',
    sk: 'vikendovy-zubar-preco-je-dolezite-osetrenie-v-sobotu-a-nedelu',
    en: 'weekend-dentist-why-saturday-and-sunday-care-matters',
    de: 'zahnarzt-am-wochenende-samstag-sonntag-esztergom',
  },
  {
    hu: 'fogaszati-ugyelet-esztergomban-2026',
    sk: 'zubna-pohotovost-ostrihom-2026-ordinacne-hodiny',
    en: 'emergency-dentist-esztergom-2026-weekend-hours',
    de: 'zahnaerztlicher-notdienst-esztergom-2026-wochenende',
  },
  {
    hu: 'fogimplantatum-igen-vagy-nem',
    sk: 'zubne-implantaty-ano-alebo-nie',
    en: 'dental-implants-yes-or-no',
    de: 'zahnimplantate-ja-oder-nein',
  },
  {
    hu: 'fogaszati-hid-vagy-implantatum',
    sk: 'zubny-mostik-alebo-implantat',
    en: 'dental-bridge-or-implant',
    de: 'zahnbruecke-oder-implantat',
  },
] as const;

type BlogSlugMatch = {
  group: BlogTranslationGroup;
  locale: SupportedLocale;
};

const translationBySlug = new Map<string, BlogSlugMatch>();

for (const group of BLOG_TRANSLATION_GROUPS) {
  for (const locale of Object.keys(group) as SupportedLocale[]) {
    translationBySlug.set(group[locale], { group, locale });
  }
}

export function findBlogTranslation(slug: string): BlogSlugMatch | undefined {
  return translationBySlug.get(slug);
}

export function blogPath(locale: SupportedLocale, slug: string): string {
  const prefix = locale === 'hu' ? '' : `/${locale}`;
  return `${prefix}/blog/${slug}`;
}

export function blogLanguageAlternates(slug: string): Record<string, string> | undefined {
  const match = findBlogTranslation(slug);
  if (!match) return undefined;

  const languages = Object.fromEntries(
    (Object.keys(match.group) as SupportedLocale[]).map((locale) => [
      HREFLANG_BY_LOCALE[locale],
      `${SITE_URL}${blogPath(locale, match.group[locale])}`,
    ]),
  );

  return {
    ...languages,
    'x-default': `${SITE_URL}${blogPath('hu', match.group.hu)}`,
  };
}
