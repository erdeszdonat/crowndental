'use client';
import Link from 'next/link';
import { Phone, ArrowUpRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { getSiteCopy } from '@/lib/siteCopy';

export default function MobileContactBar() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const copy = getSiteCopy(locale);
  return (
    <aside className="crown-mobile-contact" aria-label={copy.contact} data-cta-location="mobile_bar">
      <a href="tel:+36305892468" className="crown-button crown-button-secondary"><Phone size={18} aria-hidden="true" />{copy.call}</a>
      <Link href={`${p}/idopont`} className="crown-button">{copy.book}<ArrowUpRight size={18} aria-hidden="true" /></Link>
    </aside>
  );
}
