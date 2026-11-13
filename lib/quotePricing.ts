// Prices are applied by the server, never supplied by the AI extractor.
function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, maxLength) : '';
}

export const PRICE_LIST: Record<string, string> = {
  'Elő-vizsgálat, írásos vélemény, góckutatás, kezelési terv': '10 000 Ft', 'Tömés': '30 000–35 000 Ft',
  'Foghúzás': '25 000–35 000 Ft', 'Röntgen felvétel (kisröntgen)': '5 000 Ft', 'Panoráma röntgen': '8 000 Ft',
  'Teleröntgen': '10 000 Ft', '3D CT felvétel': '20 000 Ft', 'Gyökértömés (egy gyökerű)': '25 000 Ft', 'Gyökértömés (két gyökerű)': '30 000 Ft',
  'Gyökértömés (három gyökerű)': '33 000 Ft', 'Gyökértömés eltávolítása': '20 000 Ft', 'Gyökérkezelés alkalmanként': '10 000 Ft',
  'Fogkőeltávolítás (állcsontonként)': '15 000 Ft', 'Fogfehérítés otthoni (fogívenként)': '30 000 Ft',
  'Fogfehérítés rendelői lámpás (fogívenként)': '45 000 Ft', 'Ideiglenes korona (rövidtávú)': '6 000 Ft',
  'Ideiglenes korona (hosszútávú)': '15 000 Ft', 'Fémkerámia korona': '55 000 Ft', 'Cirkónium korona (fémmentes)': '65 000 Ft',
  'Egyéni fogszínek készítése (foganként)': '15 000 Ft', 'Kivehető fogsor (kompozit)': '110 000 Ft', 'Fémlemezes fogsor': '150 000 Ft',
  'Régi híd eltávolítása (pillérenként)': '12 000 Ft', 'Fogsor alábélelés': '25 000 Ft', 'Foghúzás műtéttel': '55 000 Ft',
  'Bölcsességfog eltávolítása': '55 000 Ft', 'Gyökércsúcs rezekció': '55 000 Ft', 'DIO Implantátum': '240 000 Ft',
  'ALPHA BIO Implantátum': '180 000 Ft', 'Csontpótlás': '200 000 Ft', 'Arcüregemelés (sinus lift)': '200 000 Ft',
  'Implantátumfelépítmény': '15 000–30 000 Ft',
  'Nagy műtéti díj': 'Díjmentes', 'Gyógyulási csavar': 'Díjmentes', 'Technikai analóg': 'Díjmentes',
  'Digitális szkennelés': 'Díjmentes', 'Csavarfurat fedése': 'Díjmentes', 'Tömés tejfogakba': '15 000 Ft',
  'Barázdazárás': '15 000 Ft', 'Rögzített készülék': '190 000–285 000 Ft', 'Kivehető készülék': '60 000–90 000 Ft',
  'Rögzített készülék aktiválása': '10 000–15 000 Ft', 'Kivehető készülék aktiválása': '5 000–8 000 Ft',
};

export type QuoteItem = {
  name: string;
  competitorPrice: number;
  ourPriceMin: number | null;
  ourPriceMax: number | null;
  manualReview: boolean;
  includedInPackage?: boolean;
  priceListKey?: string;
};
export type QuoteResult = {
  items: QuoteItem[];
  competitorTotal: number;
  ourTotalMin: number | null;
  ourTotalMax: number | null;
  savingsMin: number | null;
  savingsMax: number | null;
  requiresManualReview: boolean;
};
type ExtractedQuoteItem = { name: string; competitorPrice: number; quantity: number; priceListKey: string; boneGraftGroup?: string };

function priceListRange(key: string): { min: number; max: number } | null {
  const configured = Object.hasOwn(PRICE_LIST, key) ? PRICE_LIST[key] : undefined;
  if (!configured) return null;
  if (configured === 'Díjmentes') return { min: 0, max: 0 };
  const amounts = (configured.match(/\d[\d\s\u00a0]*/g) || [])
    .map((value) => Number(value.replace(/[\s\u00a0]/g, '')))
    .filter((value) => Number.isSafeInteger(value) && value > 0);
  if (amounts.length < 1 || amounts.length > 2) return null;
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
}

function buildQuoteResult(items: QuoteItem[]): QuoteResult | null {
  if (items.length < 1 || items.length > 100) return null;
  const competitorTotal = items.reduce((sum, item) => sum + item.competitorPrice, 0);
  if (!Number.isSafeInteger(competitorTotal) || competitorTotal > 100_000_000) return null;
  const requiresManualReview = items.some((item) => item.manualReview);
  if (requiresManualReview) {
    return {
      items, competitorTotal, ourTotalMin: null, ourTotalMax: null,
      savingsMin: null, savingsMax: null, requiresManualReview: true,
    };
  }
  const ourTotalMin = items.reduce((sum, item) => sum + (item.ourPriceMin || 0), 0);
  const ourTotalMax = items.reduce((sum, item) => sum + (item.ourPriceMax || 0), 0);
  if (!Number.isSafeInteger(ourTotalMin) || !Number.isSafeInteger(ourTotalMax) || ourTotalMax > 100_000_000) return null;
  const hasGuaranteedSaving = competitorTotal > ourTotalMax;
  return {
    items,
    competitorTotal,
    ourTotalMin,
    ourTotalMax,
    savingsMin: hasGuaranteedSaving ? competitorTotal - ourTotalMax : null,
    savingsMax: hasGuaranteedSaving ? competitorTotal - ourTotalMin : null,
    requiresManualReview: false,
  };
}

export function validateQuoteResult(value: unknown): QuoteResult | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as { items?: unknown; currency?: unknown; documentTotal?: unknown };
  if (typeof candidate.currency !== 'string' || candidate.currency.trim().toUpperCase() !== 'HUF') return null;
  if (!Array.isArray(candidate.items) || candidate.items.length < 1 || candidate.items.length > 100) return null;
  const items: QuoteItem[] = [];
  // Only explicitly matched treatment sites share a package. Independent sites remain chargeable.
  const boneGroups = new Map<string, { bone: number; sinus: number }>();
  for (const raw of candidate.items) {
    if (!raw || typeof raw !== 'object') return null;
    const item = raw as Partial<ExtractedQuoteItem>;
    const name = cleanText(item.name, 160);
    const competitorPrice = item.competitorPrice;
    const quantity = item.quantity;
    const priceListKey = cleanText(item.priceListKey, 160);
    if (!name || typeof competitorPrice !== 'number' || !Number.isSafeInteger(competitorPrice) || competitorPrice < 0 || competitorPrice > 100_000_000 || typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) return null;
    const unitRange = priceListRange(priceListKey);
    let chargeableQuantity = quantity;
    const group = cleanText(item.boneGraftGroup, 80);
    if (group && (priceListKey === 'Csontpótlás' || priceListKey === 'Arcüregemelés (sinus lift)')) {
      const counts = boneGroups.get(group) || { bone: 0, sinus: 0 };
      const kind = priceListKey === 'Csontpótlás' ? 'bone' : 'sinus';
      const other = kind === 'bone' ? 'sinus' : 'bone';
      chargeableQuantity = Math.max(0, quantity - Math.max(0, counts[other] - counts[kind]));
      counts[kind] += quantity;
      boneGroups.set(group, counts);
    }
    const ourPriceMin = unitRange ? unitRange.min * chargeableQuantity : null;
    const ourPriceMax = unitRange ? unitRange.max * chargeableQuantity : null;
    if ((ourPriceMin !== null && ourPriceMin > 100_000_000) || (ourPriceMax !== null && ourPriceMax > 100_000_000)) return null;
    items.push({ name, competitorPrice, ourPriceMin, ourPriceMax, manualReview: unitRange === null, priceListKey,
      includedInPackage: chargeableQuantity === 0 });
  }
  const result = buildQuoteResult(items);
  if (candidate.documentTotal !== null && candidate.documentTotal !== undefined
    && (typeof candidate.documentTotal !== 'number' || !Number.isSafeInteger(candidate.documentTotal)
      || candidate.documentTotal !== result?.competitorTotal)) return null;
  return result;
}

export function validateStoredQuoteResult(value: unknown): QuoteResult | null {
  let parsedItems = value;
  if (typeof parsedItems === 'string') {
    try {
      parsedItems = JSON.parse(parsedItems);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(parsedItems) || parsedItems.length < 1 || parsedItems.length > 100) return null;
  const items: QuoteItem[] = [];

  for (const raw of parsedItems) {
    if (!raw || typeof raw !== 'object') return null;
    const item = raw as Record<string, unknown>;
    if (typeof item.name !== 'string' || item.name.trim().length > 240) return null;
    const name = cleanText(item.name, 240);
    const competitorPrice = item.competitorPrice;
    const ourPriceMin = item.ourPriceMin;
    const ourPriceMax = item.ourPriceMax;
    const minIsValid = ourPriceMin === null || (
      typeof ourPriceMin === 'number' && Number.isSafeInteger(ourPriceMin) && ourPriceMin >= 0 && ourPriceMin <= 100_000_000
    );
    const maxIsValid = ourPriceMax === null || (
      typeof ourPriceMax === 'number' && Number.isSafeInteger(ourPriceMax) && ourPriceMax >= 0 && ourPriceMax <= 100_000_000
    );
    if (
      !name
      || typeof competitorPrice !== 'number'
      || !Number.isSafeInteger(competitorPrice)
      || competitorPrice < 0
      || competitorPrice > 100_000_000
      || !minIsValid
      || !maxIsValid
      || (ourPriceMin === null) !== (ourPriceMax === null)
      || (typeof ourPriceMin === 'number' && typeof ourPriceMax === 'number' && ourPriceMin > ourPriceMax)
    ) return null;
    items.push({
      name,
      competitorPrice,
      ourPriceMin: typeof ourPriceMin === 'number' ? ourPriceMin : null,
      ourPriceMax: typeof ourPriceMax === 'number' ? ourPriceMax : null,
      manualReview: ourPriceMin === null,
      includedInPackage: item.includedInPackage === true && ourPriceMax === 0,
      priceListKey: cleanText(item.priceListKey, 160),
    });
  }
  return buildQuoteResult(items);
}

