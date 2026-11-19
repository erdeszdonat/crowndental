// These IDs are shared by all four locales. The appointment keeps the translated label.
export const bookingTreatmentIds = [
  'allapotfelmeres', 'fogszabalyozas', 'implantatum', 'koronak-hidak', 'fogfeherites',
  'direkt-hej', 'indirekt-hej', 'hollywood-mosoly', 'fogko', 'air-polishing', 'premium-biofilm-terapia', 'panorama', 'cbct',
  'fogsor', 'szajsebeszet', 'gyokerkezeles', 'fogtomes', 'fogszabalyozo-kezeles',
  'gyerekfogaszat', 'gockutatas', 'esztetikai-fogaszat', 'fogtechnikai-megoldasok', 'egyeb',
] as const;

export type BookingTreatmentId = typeof bookingTreatmentIds[number];

export function bookingTreatmentId(value: string | null): BookingTreatmentId | undefined {
  if (value === 'foghuzas') return 'szajsebeszet';
  return bookingTreatmentIds.find(id => id === value);
}

const articleTopics: [BookingTreatmentId, RegExp][] = [
  ['fogszabalyozas', /fogszab|ortodon|orthodon|kieferorthop|aligner|strojcek|braces|zahnspang|retainer|retencios sin/],
  ['implantatum', /implant|all on (four|4|6)/],
  ['fogfeherites', /feherit|whiten|bleach|bielen|zahnaufhell/],
  ['gyokerkezeles', /gyokerkezel|root canal|wurzelkanal|endodon|korenov.{0,5} (liec|oset)/],
  ['fogsor', /fogsor|denture|prothes|protez/],
  ['koronak-hidak', /korona|korunk|\bcrowns?\b|krone|bridge|\bhid(?:ak)?\b|mostik|brucke|cirkon|zircon|zirkon/],
  ['fogko', /fogko(?!ron)|tartar|scaling|zahnstein|zubn.{0,3} kamen/],
  ['szajsebeszet', /foghuz|szajsebesz|tooth extraction|oral surgery|oralchirurg|zahnextraktion|extrakci/],
  ['gyerekfogaszat', /gyerekfogasz|gyermekfogasz|pediatric dent|paediatric dent|kinderzahn|detska stomat/],
  ['gockutatas', /gockutat|focal infect|herdsuche|lozisk/],
  ['fogtechnikai-megoldasok', /fogtechn|dental technician|zahntechnik|zubn\w* technik/],
  ['fogtomes', /fogtomes|dental filling|zahnfull|zubna vypln/],
  ['cbct', /\bcbct\b|\bdvt\b/],
  ['panorama', /panoram/],
  ['allapotfelmeres', /allapotfelmer|dental checkup|dental check up|vorsorgeuntersuch|preventivna prehliadka/],
];

export function articleBookingTreatment(slug: string, title = ''): BookingTreatmentId | undefined {
  const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ').replace(/crown dental\w*/g, '');
  // Prefer the editorial title: older Sanity slugs can be truncated or describe an earlier title.
  for (const text of [title, slug].map(normalize)) {
    if (/biofilm|lepedekfest|plaque disclos|plaqueanfarb|farbenie povlaku/.test(text)) return 'premium-biofilm-terapia';
    if (/air[ -]?polish|pieskovanie/.test(text)) return 'air-polishing';
    if (/all on (4|four)\b/.test(text)) return 'implantatum';
    if (/pattintos fogsor|snap in dentur|druckknopfprothes|nacvakavaci\w* protez/.test(text)) return 'fogsor';
    if (/\bhej(ak)?\b|veneer|fazet/.test(text)) {
      if (/hollywood/.test(text)) return 'hollywood-mosoly';
      const composite = /\bdire(k|c)t|kompozit|composite|komposit|priame/.test(text);
      const ceramic = /indire(k|c)t|porcel|kerami|porzell/.test(text);
      if (composite !== ceramic) return composite ? 'direkt-hej' : 'indirekt-hej';
      return 'esztetikai-fogaszat';
    }
    const matches = articleTopics.filter(([, pattern]) => pattern.test(text));
    if (matches.length === 1) return matches[0][0];
    if (matches.length > 1) return undefined;
  }
}

export function bookingHref(prefix: string, pathname: string) {
  const base = prefix + '/idopont';
  const path = pathname.replace(/^\/(hu|en|de|sk)(?=\/|$)/, '').replace(/\/$/, '');
  const article = /^\/blog\/([^/]+)$/.exec(path);
  if (article) return base + '?cikk=' + encodeURIComponent(article[1]);
  const slug = path === '/hollywood-mosoly' ? 'hollywood-mosoly' : /^\/kezelesek\/([^/]+)$/.exec(path)?.[1];
  const treatment = bookingTreatmentId(slug ?? null);
  return treatment ? base + '?kezeles=' + treatment : base;
}

// Preserve explicit editorial choices, tracking parameters, fragments, and external destinations.
export function contextualArticleLink(href: string, prefix: string, slug: string, topic?: BookingTreatmentId) {
  let url: URL;
  try { url = new URL(href, 'https://www.crowndental.hu'); } catch { return href; }
  if (!['https://crowndental.hu', 'https://www.crowndental.hu'].includes(url.origin) ||
      !/^\/(?:hu\/|en\/|de\/|sk\/)?idopont\/?$/.test(url.pathname) ||
      url.searchParams.has('kezeles') || url.searchParams.has('cikk')) return href;
  if (topic) url.searchParams.set('kezeles', topic);
  else if (slug) url.searchParams.set('cikk', slug);
  return prefix + '/idopont' + url.search + url.hash;
}
