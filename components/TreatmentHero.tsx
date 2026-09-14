'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowUpRight, Phone } from 'lucide-react';
import { sanityImageUrl } from '@/lib/sanityImage';
import { getSiteCopy } from '@/lib/siteCopy';

export default function TreatmentHero({ imageUrl, contentKey }: { imageUrl: string; contentKey: string }) {
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const t = useTranslations(`treatmentPages.${contentKey}`);
  const copy = getSiteCopy(locale);

  return (
    <section className="crown-clinical-hero" data-cta-location="treatment_hero">
      <div className="crown-container">
        <Link href={`${p}/kezelesek`} className="crown-back"><ArrowLeft size={16} aria-hidden="true" />{copy.back}</Link>
        <div className="crown-hero-grid">
          <div className="crown-hero-copy">
            <p className="crown-eyebrow">{t('heroBadge')}</p>
            <h1>{t('heroTitle').replace(/\n/g, ' ')}</h1>
            <p className="crown-lead">{t('heroDesc')}</p>
            <div className="crown-actions">
              <Link href={`${p}/idopont`} className="crown-button">{copy.book}<ArrowUpRight size={19} aria-hidden="true" /></Link>
              <a href="tel:+36305892468" className="crown-button crown-button-secondary"><Phone size={18} aria-hidden="true" />06 30 589 2468</a>
            </div>
          </div>
          <div className="crown-hero-visual">
            <div className="crown-hero-photo">
              {imageUrl && <img src={sanityImageUrl(imageUrl, 1000)} alt={t('heroTitle').replace(/\n/g, ' ')} width={1000} height={850} fetchPriority="high" />}
            </div>
            <div className="crown-price-note">
              <span>{t('heroPriceLabel')}</span>
              <strong>{t('heroPriceValue')}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
