'use client';
import SharedTreatmentCard from '@/components/TreatmentCard';
import { getSiteCopy } from '@/lib/siteCopy';
import { getVeneerOffer } from '@/lib/veneers.mjs';
import { useVeneerOffer } from '@/components/VeneerOffer';
import { getVeneerLabels, getVeneerOfferCopy, veneerPath } from '@/lib/veneerI18n';

type VeneerOffer = ReturnType<typeof getVeneerOffer>;

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';


function HeroSection() {
  const t = useTranslations('treatments');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const copy = getSiteCopy(locale);
  return (
    <section className="crown-clinical-hero" data-cta-location="treatment_hero">
      <div className="crown-container crown-section-heading" style={{ marginBottom: 0 }}>
        <p className="crown-eyebrow">{t('heroBadge')}</p>
        <h1>{t('heroTitle1')} {t('heroTitle2')}</h1>
        <p className="crown-lead">{t('heroSubtitleStart')} <strong>{t('heroSavings')}</strong> {t('heroSubtitleEnd')}</p>
        <div className="crown-actions justify-center">
          <Link href={`${p}/idopont`} className="crown-button">{copy.book}<ArrowRight size={18} aria-hidden="true" /></Link>
          <a href="#arlista" className="crown-button crown-button-secondary">{copy.treatments}</a>
        </div>
      </div>
    </section>
  );
}

function TreatmentCard({ card, imageUrl, imageIsBeforeAfter }: { card: { id: string; title: string; description: string; href?: string }; index: number; imageUrl?: string; imageIsBeforeAfter?: boolean }) {
  const locale = useLocale();
  const t = useTranslations('treatments');
  return <SharedTreatmentCard href={veneerPath(locale, card.href || `/kezelesek/${card.id}`)} title={card.title} description={card.description} imageUrl={imageUrl} imageAlt={imageIsBeforeAfter ? t('veneerBeforeAfterAlt') : undefined} imageFit={imageIsBeforeAfter ? 'contain' : undefined} linkLabel={getSiteCopy(locale).details} />;
}

function TreatmentCardsSection({ sanityImages }: { sanityImages: Record<string, string> }) {
  const t = useTranslations('treatments');
  const cards = t.raw('cards') as Array<{ id: string; title: string; description: string; href?: string }>;
  const directImage = sanityImages['direkt-hej'] || sanityImages['hollywood-mosoly'];
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <TreatmentCard
              key={card.id}
              card={card}
              index={index}
              imageUrl={(card.id === 'direkt-hej' ? directImage : sanityImages[card.id]) || (['direkt-hej', 'indirekt-hej'].includes(card.id) ? sanityImages['esztetikai-fogaszat'] : undefined)}
              imageIsBeforeAfter={Boolean(card.id === 'direkt-hej' ? directImage : card.id === 'hollywood-mosoly' && sanityImages[card.id])}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const EUR_RATE = 350;

function hufToEur(priceStr: string): string {
  const cleaned = priceStr.replace(/\s*(HUF|Ft)\s*/g, '').trim();
  const parseNum = (s: string) => parseInt(s.trim().replace(/[\s.,]/g, ''), 10);
  if (cleaned.includes('–') || cleaned.includes('-')) {
    const parts = cleaned.split(/\s*[–-]\s*/);
    const nums = parts.map(parseNum);
    if (nums.length === 2 && nums.every(n => !isNaN(n))) {
      return `~€${Math.ceil(nums[0] / EUR_RATE)} – €${Math.ceil(nums[1] / EUR_RATE)}`;
    }
  }
  const num = parseNum(cleaned);
  return !isNaN(num) && num > 0 ? `~€${Math.ceil(num / EUR_RATE)}` : '';
}

function PriceListSection({ directOffer: initialDirectOffer }: { directOffer: VeneerOffer }) {
  const directOffer = useVeneerOffer('direkt-hej', initialDirectOffer);
  const t = useTranslations('treatments');
  const locale = useLocale();
  const showEur = locale === 'en' || locale === 'sk' || locale === 'de';
  // @ts-ignore
  const priceCategories = t.raw('priceCategories') as Array<{ id: string; title: string; items: Array<{ name: string; price: string; highlight?: boolean }> }>;
  const labels = getVeneerLabels(locale);
  const veneerOffers = [
    { slug: 'direkt-hej' as const, title: labels.directName, offer: directOffer },
    { slug: 'indirekt-hej' as const, title: labels.indirectName, offer: getVeneerOffer('indirekt-hej') },
  ].map((item) => ({ ...item, copy: getVeneerOfferCopy(locale, item.slug, item.offer) }));
  return (
    <section id="arlista" className="py-16 sm:py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100/50 rounded-full blur-[100px]" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
            {t('priceListTitle')}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-slate-600 text-lg leading-relaxed font-normal">
            {t('priceListSubtitle')}
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
          <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 sm:px-8 py-5 sm:py-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">{t('veneerPricesTitle')}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {veneerOffers.map(({ slug, title, offer, copy }) => (
                <div key={slug} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4 sm:py-5 bg-sky-50">
                  <div className="pr-4 mb-2 sm:mb-0">
                    <Link href={veneerPath(locale, `/kezelesek/${slug}`)} prefetch={false} className="text-base sm:text-lg font-semibold text-gray-900 underline underline-offset-4">{title}</Link>
                    <p className="text-sm text-gray-600 mt-1">{copy.availabilityCopy}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <strong className="text-lg sm:text-xl text-sky-700 whitespace-nowrap">{copy.formattedPrice} / {copy.perTooth}</strong>
                    {offer.isPromotion && <span className="text-sm text-gray-600">{copy.insteadPrefix}<s>{copy.formattedRegularPrice}</s>{copy.insteadSuffix}</span>}
                  </div>
                </div>
              ))}
            </div>
            <p className="px-6 sm:px-8 py-4 text-sm text-gray-600"><Link href={veneerPath(locale, "/hollywood-mosoly")} prefetch={false} className="underline underline-offset-4">{t('veneerComparison')}</Link> {t('veneerPriceNote')}</p>
          </div>
          {priceCategories.map((category, catIndex) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: catIndex * 0.1 }} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 sm:px-8 py-5 sm:py-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{category.title}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4 sm:py-5 transition-colors ${item.highlight ? 'bg-gradient-to-r from-sky-50 to-sky-50' : 'bg-white hover:bg-gray-50'}`}>
                    <span className={`text-base sm:text-lg mb-2 sm:mb-0 pr-4 ${item.highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`text-lg sm:text-xl font-bold whitespace-nowrap ${item.highlight ? 'bg-gradient-to-r from-sky-600 to-sky-600 bg-clip-text text-transparent' : 'text-gray-900'}`}>
                        {item.price}
                      </span>
                      {showEur && hufToEur(item.price) && (
                        <span className="text-sm font-medium text-emerald-600 whitespace-nowrap">
                          {hufToEur(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto mt-10 sm:mt-12">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 sm:p-8 flex gap-4 sm:gap-5 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('disclaimerTitle')}</h4>
              <p className="text-gray-600 leading-relaxed text-base">{t('disclaimerText')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations('treatments');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-sky-600 via-sky-500 to-sky-600 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px] -translate-x-1/2 translate-y-1/2" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight">{t('ctaTitle')}</h2>
        <p className="text-lg sm:text-xl text-sky-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-normal">{t('ctaSubtitle')}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
          <a href="tel:+36305892468" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-full transition-all border border-white/30 text-base md:text-lg shadow-inner">
            <Phone className="w-5 h-5" /> 06 30 589 2468
          </a>
          <Link href={`${p}/idopont`} className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-sky-700 font-bold rounded-full transition-all shadow-xl shadow-sky-900/20 text-base md:text-lg">
            <Calendar className="w-5 h-5" /> {t('ctaBtn')}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function TreatmentsClient({ images, directOffer }: { images: Record<string, string>; directOffer: VeneerOffer }) {
  return (
    <main className="crown-page min-h-screen bg-white">
      <HeroSection />
      <TreatmentCardsSection sanityImages={images} />
      <PriceListSection directOffer={directOffer} />
      <CTASection />
    </main>
  );
}
