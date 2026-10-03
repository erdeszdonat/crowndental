import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Phone } from 'lucide-react';
import { getTreatmentImages } from '@/lib/treatmentImages';
import { getVeneerOffer, VENEERS } from '@/lib/veneers.mjs';
import { getVeneerContent, getVeneerUi, type VeneerFaq, type VeneerSlug } from './VeneerContent';
import { getVeneerLabels, normalizeVeneerLocale, veneerPath } from '@/lib/veneerI18n';
import VeneerImage from './VeneerImage';
import VeneerOffer from './VeneerOffer';
import VeneerSeo from './VeneerSeo';

export function VeneerFaqSection({ faqs, locale = 'hu' }: { faqs: VeneerFaq[]; locale?: string }) {
  const ui = getVeneerUi(locale);
  return (
    <section className="bg-gray-50 border-t border-gray-100" aria-labelledby="veneer-faq-title">
      <div className="crown-container">
        <div className="crown-section-heading"><h2 id="veneer-faq-title">{ui.faqTitle}</h2></div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => <details key={faq.question} className="bg-white rounded-2xl border border-gray-200 p-6">
            <summary className="cursor-pointer font-bold text-lg text-slate-900">{faq.question}</summary>
            <p className="pt-4 text-slate-600 leading-relaxed">{faq.answer}</p>
          </details>)}
        </div>
      </div>
    </section>
  );
}

export function VeneerHealthNote({ locale = 'hu' }: { locale?: string } = {}) {
  const ui = getVeneerUi(locale);
  return (
    <div className="mt-8 border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-600">
      <p>{ui.healthNote}</p>
      <p className="mt-3">{ui.healthSourcePrefix}{' '}<a href="https://www.mouthhealthy.org/all-topics-a-z/veneers" className="text-sky-700 underline underline-offset-4">{ui.healthSource}</a>.</p>
    </div>
  );
}

export default async function VeneerPage({ slug, locale = 'hu' }: { slug: VeneerSlug; locale?: string }) {
  const language = normalizeVeneerLocale(locale);
  const labels = getVeneerLabels(language);
  const ui = getVeneerUi(language);
  const localizedPath = (path: string) => veneerPath(language, path);
  const treatment = VENEERS[slug];
  const content = getVeneerContent(slug, language);
  const now = new Date().toISOString();
  const offer = getVeneerOffer(slug, now);
  const images = await getTreatmentImages();
  const directImage = images['direkt-hej'] || images['hollywood-mosoly'];
  const imageUrl = (slug === 'direkt-hej' ? directImage : images[slug]) || images['esztetikai-fogaszat'] || images['fogfeherites'] || '';
  const imageAlt = slug === 'direkt-hej' && directImage ? ui.beforeAfterAlt : '';
  const faqs = content.faqs.map((faq, index) => slug === 'direkt-hej' && !offer.isPromotion && index === 2
    ? { ...faq, answer: ui.expiredBookingAnswer }
    : faq);
  return (
    <>
      <VeneerSeo locale={language} slug={slug} name={content.h1} path={treatment.path} faqs={faqs} now={now} />
      <main className="crown-page bg-white min-h-screen">
        <section className="crown-clinical-hero" data-cta-location="veneer_hero">
          <div className="crown-container">
            <Link href={localizedPath('/kezelesek')} className="crown-back"><ArrowLeft size={16} aria-hidden="true" />{ui.back}</Link>
            <div className="crown-hero-grid">
              <div className="crown-hero-copy">
                <p className="crown-eyebrow">{content.eyebrow}</p>
                <h1>{content.h1}</h1>
                <p className="crown-lead">{content.lead}</p>
                <div className="crown-actions">
                  <Link href={localizedPath(treatment.bookingHref)} className="crown-button">{ui.book}<ArrowUpRight size={19} aria-hidden="true" /></Link>
                  <a href="tel:+36305892468" className="crown-button crown-button-secondary"><Phone size={18} aria-hidden="true" />{ui.phone}</a>
                </div>
              </div>
              <div className="crown-hero-visual">
                <div className="crown-hero-photo">{imageUrl && <VeneerImage src={imageUrl} alt={imageAlt} />}</div>
                <div className="crown-price-note"><VeneerOffer locale={language} slug={slug} initialOffer={offer} compact /></div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="veneer-intro-title">
          <div className="crown-container max-w-4xl">
            <div className="crown-section-heading"><h2 id="veneer-intro-title">{content.introTitle}</h2></div>
            <p className="text-lg leading-relaxed text-slate-600">{content.intro}</p>
            <VeneerHealthNote locale={language} />
          </div>
        </section>

        <section className="bg-gray-50 border-y border-gray-100" aria-labelledby="veneer-considerations-title">
          <div className="crown-container">
            <div className="crown-section-heading"><h2 id="veneer-considerations-title">{content.considerationsTitle}</h2></div>
            <div className="crown-cards-grid">
              {content.considerations.map((item) => <div key={item.title} className="p-8 bg-white rounded-3xl border border-gray-100">
                <h3 className="text-xl text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.body}</p>
              </div>)}
            </div>
          </div>
        </section>

        <section aria-labelledby="veneer-process-title">
          <div className="crown-container">
            <div className="crown-section-heading"><p className="crown-eyebrow">{ui.processEyebrow}</p><h2 id="veneer-process-title">{ui.processTitle}</h2></div>
            <ol className="max-w-4xl mx-auto space-y-5">
              {content.steps.map((step, index) => <li key={step.title} className="flex gap-5 rounded-2xl border border-gray-200 p-6 md:p-8">
                <span className="text-2xl font-bold text-sky-700" aria-hidden="true">{index + 1}.</span>
                <div><h3 className="text-xl mb-2">{step.title}</h3><p className="text-slate-600 leading-relaxed">{step.body}</p></div>
              </li>)}
            </ol>
            <p className="max-w-4xl mx-auto mt-5 text-sm text-slate-600 leading-relaxed">{ui.processNote}{' '}<a className="text-sky-700 underline underline-offset-4" href="https://www.nhs.uk/live-well/healthy-teeth-and-gums/dental-treatments/">{ui.processSource}</a>.</p>
          </div>
        </section>

        <section id="arak" className="bg-gray-50 border-y border-gray-100" aria-labelledby="veneer-price-title" data-cta-location="veneer_price">
          <div className="crown-container">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
              <div><p className="crown-eyebrow">{ui.priceEyebrow}</p><h2 id="veneer-price-title" className="text-3xl mb-4">{slug === 'direkt-hej' ? ui.directPriceTitle : ui.indirectPriceTitle}</h2>
                <p className="text-slate-600 leading-relaxed">{ui.priceNote}</p>
                <p className="mt-4 text-slate-600 leading-relaxed">{ui.locationNote}</p>
              </div>
              <div className="crown-booking-panel"><VeneerOffer locale={language} slug={slug} initialOffer={offer} />
                <div className="crown-actions"><Link href={localizedPath(treatment.bookingHref)} className="crown-button">{slug === 'direkt-hej' ? ui.directBook : ui.indirectBook}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
              </div>
            </div>
          </div>
        </section>

        <VeneerFaqSection locale={language} faqs={faqs} />

        <section aria-labelledby="veneer-related-title">
          <div className="crown-container">
            <div className="crown-section-heading"><h2 id="veneer-related-title">{content.otherTitle}</h2><p className="crown-lead">{content.otherDescription}</p></div>
            <div className="crown-actions justify-center">
              <Link href={localizedPath(VENEERS[content.otherSlug].path)} className="crown-button">{content.otherSlug === 'direkt-hej' ? labels.directName : labels.indirectName}<ArrowUpRight size={18} aria-hidden="true" /></Link>
              <Link href={localizedPath('/hollywood-mosoly')} className="crown-button crown-button-secondary">{ui.comparison}</Link>
              <Link href={localizedPath('/kezelesek/esztetikai-fogaszat')} className="crown-button crown-button-secondary">{ui.aesthetic}</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
