'use client';

import { useSyncExternalStore } from 'react';
import { getVeneerOffer, VENEER_CAMPAIGN } from '@/lib/veneers.mjs';

export type VeneerSlug = 'direkt-hej' | 'indirekt-hej';
export type VeneerOfferState = ReturnType<typeof getVeneerOffer>;

// The HTML is cached hourly. A local clock guard also removes an expired direct
// promotion from an already open tab, without polling the server or extra costs.
function subscribeToExpiry(notify: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    clearTimeout(timer);
    notify();
    const remaining = Date.parse(VENEER_CAMPAIGN.endsAt) - Date.now();
    if (remaining > 0) timer = setTimeout(schedule, Math.min(remaining + 1, 2147483647));
  };
  schedule();
  document.addEventListener('visibilitychange', schedule);
  return () => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', schedule);
  };
}

export function useVeneerOffer(slug: VeneerSlug, initialOffer: VeneerOfferState) {
  const expired = useSyncExternalStore(subscribeToExpiry,
    () => Date.now() >= Date.parse(VENEER_CAMPAIGN.endsAt),
    () => !initialOffer.isPromotion && slug === 'direkt-hej');
  return slug === 'direkt-hej' && expired
    ? getVeneerOffer(slug, VENEER_CAMPAIGN.endsAt)
    : initialOffer;
}

export default function VeneerOffer({ slug, initialOffer, compact = false }: {
  slug: VeneerSlug;
  initialOffer: VeneerOfferState;
  compact?: boolean;
}) {
  const offer = useVeneerOffer(slug, initialOffer);
  return (
    <div>
      <p className="mb-2 text-sm text-slate-600">{offer.isPromotion ? 'Kedvezményes ár / fog' : 'Ár / fog'}</p>
      <p className={compact ? 'text-xl font-bold text-sky-700' : 'text-3xl font-bold text-sky-700'}>
        {offer.formattedPrice}<span className="text-sm font-normal"> / fog</span>
      </p>
      {offer.isPromotion && <p className="mt-1 text-sm text-slate-600"><s>{offer.formattedRegularPrice}</s> helyett</p>}
      {offer.validThrough && <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Akciós kezelési időszak: {VENEER_CAMPAIGN.periodLabel}
      </p>}
      {!compact && <p className="mt-3 text-sm leading-relaxed text-slate-600">{offer.availabilityCopy}</p>}
    </div>
  );
}
