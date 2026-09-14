'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { rememberBookingSource, trackSiteEvent, type EventOptions } from '@/lib/siteAnalytics';

const placements = new Set(['home_hero', 'treatment_hero', 'mobile_bar', 'treatment_card']);

/** Delegation covers existing links as well as newly shared components. */
export default function SiteAnalytics() {
  const locale = useLocale();
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const marked = link.closest('[data-cta-location]')?.getAttribute('data-cta-location');
      const placement: EventOptions['placement'] = marked && placements.has(marked)
        ? marked as EventOptions['placement']
        : link.closest('header') ? 'navigation' : link.closest('footer') ? 'footer' : 'content';
      if (link.protocol === 'tel:') {
        trackSiteEvent('phone_click', locale, { placement });
      } else if (link.origin === window.location.origin && /^\/(?:hu\/|en\/|de\/|sk\/)?idopont\/?$/.test(link.pathname)) {
        rememberBookingSource(window.location.pathname);
        trackSiteEvent('booking_cta_click', locale, { placement });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [locale]);
  return null;
}
