'use client';

import { useSyncExternalStore } from 'react';
import { isVoucherSeasonOpen, voucherSeasonEnds, voucherSeasonStarts } from './storefront';

function subscribe(onChange: () => void) {
  let timer: number | undefined;
  function refresh() {
    window.clearTimeout(timer);
    onChange();
    const now = Date.now();
    const next = now < voucherSeasonStarts ? voucherSeasonStarts : voucherSeasonEnds;
    if (now < next) timer = window.setTimeout(refresh, Math.min(next - now, 2_147_483_647));
  }
  refresh();
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', refresh);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener('pageshow', refresh);
    document.removeEventListener('visibilitychange', refresh);
  };
}

export function useVoucherSeason(initiallyOpen = false) {
  return useSyncExternalStore(subscribe, isVoucherSeasonOpen, () => initiallyOpen);
}
