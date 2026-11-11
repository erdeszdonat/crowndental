'use client';
import ClinicPhoneLinks from '@/components/ClinicPhoneLinks';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { getSiteCopy } from '@/lib/siteCopy';
import { usePathname } from 'next/navigation';

export default function MobileContactBar() {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const copy = getSiteCopy(locale);
  const pathname = usePathname();
  const isSmileLanding = /^\/(?:hu\/|en\/|de\/|sk\/)?hollywood-mosoly\/?$/.test(pathname);
  return (
    <aside className="crown-mobile-contact" aria-label={copy.contact} data-cta-location="mobile_bar">
      <ClinicPhoneLinks tone="light" compact />
      <Link href={isSmileLanding ? '#konzultacio' : `${p}/idopont`} data-booking-cta={isSmileLanding ? 'true' : undefined} className="crown-button">{copy.book}<ArrowUpRight size={18} aria-hidden="true" /></Link>
    </aside>
  );
}
