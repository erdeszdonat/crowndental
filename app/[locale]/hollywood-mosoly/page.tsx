import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowUpRight, Check, MapPin, Phone } from 'lucide-react';
import { getTreatmentImages } from '@/lib/treatmentImages';
import { getVeneerOffer, VENEERS } from '@/lib/veneers.mjs';
import { normalizeVeneerLocale, veneerPath } from '@/lib/veneerI18n';
import { hollywoodContent } from '@/components/HollywoodContent';
import VeneerImage from '@/components/VeneerImage';
import VeneerOffer from '@/components/VeneerOffer';
import HollywoodPrices from '@/components/HollywoodPrices';
import VeneerSeo, { veneerMetadata } from '@/components/VeneerSeo';
import { VeneerHealthNote } from '@/components/VeneerPage';
import { BookingForm } from '../idopont/BookingClient';
import styles from './landing.module.css';

export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };

function pageLocale(locale: string) {
  if (!['hu', 'en', 'de', 'sk'].includes(locale)) notFound();
  return normalizeVeneerLocale(locale);
}

export async function generateMetadata({ params }: Props) {
  const locale = pageLocale((await params).locale);
  const copy = hollywoodContent[locale];
  return veneerMetadata(copy.title, copy.description, '/hollywood-mosoly', locale);
}

export default async function HollywoodMosolyPage({ params }: Props) {
  const locale = pageLocale((await params).locale);
  const copy = hollywoodContent[locale];
  const now = new Date().toISOString();
  const direct = getVeneerOffer('direkt-hej', now);
  const indirect = getVeneerOffer('indirekt-hej', now);
  const images = await getTreatmentImages();
  const imageUrl = images['hollywood-mosoly'] || images['direkt-hej'] || '';
  const options = [
    { slug: 'direkt-hej' as const, title: copy.directTitle, text: copy.directText, features: copy.directFeatures, offer: direct },
    { slug: 'indirekt-hej' as const, title: copy.indirectTitle, text: copy.indirectText, features: copy.indirectFeatures, offer: indirect },
  ];
  return (
    <>
      <VeneerSeo name={copy.title} path="/hollywood-mosoly" faqs={copy.faqs} locale={locale} now={now} />
      <main className={`crown-page ${styles.landing}`}>
        <section className={`crown-clinical-hero ${styles.hero}`} aria-labelledby="hollywood-title" data-cta-location="landing_hero">
          <div className="crown-container">
            <div className="crown-hero-grid">
              <div className="crown-hero-copy">
                <p className="crown-eyebrow">{copy.eyebrow}</p>
                <h1 id="hollywood-title">{copy.heading}<span className={styles.accent}>{copy.accent}</span></h1>
                <p className="crown-lead">{copy.lead}</p>
                <div className="crown-actions">
                  <a href="#konzultacio" className="crown-button" data-booking-cta="true">{copy.cta}<ArrowUpRight size={19} aria-hidden="true" /></a>
                  <a href="#ajanlatok" className={styles.textLink}>{copy.secondaryCta}<ArrowDown size={17} aria-hidden="true" /></a>
                </div>
                <p className={styles.reassurance}>{copy.reassurance}</p>
              </div>
              <figure className="crown-hero-visual">
                <div className={`crown-hero-photo ${styles.photo}`}>{imageUrl && <VeneerImage src={imageUrl} alt={copy.imageAlt} />}</div>
                <figcaption className={styles.caption}><strong>{copy.imageTitle}</strong><span>{copy.imageNote}</span></figcaption>
              </figure>
            </div>
            <ul className={styles.facts}>{copy.facts.map(fact => <li key={fact}><Check size={18} aria-hidden="true" />{fact}</li>)}</ul>
          </div>
        </section>

        <section id="ajanlatok" aria-labelledby="hollywood-offers-title" data-cta-location="landing_offer">
          <div className="crown-container">
            <div className="crown-section-heading"><p className="crown-eyebrow">{copy.offerEyebrow}</p><h2 id="hollywood-offers-title">{copy.offerTitle}</h2><p className="crown-lead">{copy.offerIntro}</p></div>
            <div className={styles.offers}>
              {options.map(option => <article key={option.slug} className={styles.offer}>
                <div><h3>{option.title}</h3><p className={styles.offerDescription}>{option.text}</p></div>
                <div className={styles.price}><VeneerOffer slug={option.slug} initialOffer={option.offer} locale={locale} /></div>
                <ul className={styles.features}>{option.features.map(feature => <li key={feature}><Check size={17} aria-hidden="true" />{feature}</li>)}</ul>
                <div className={styles.offerActions}>
                  <a href="#konzultacio" className="crown-button" data-booking-cta="true">{copy.offerCta}<ArrowUpRight size={18} aria-hidden="true" /></a>
                  <Link href={veneerPath(locale, VENEERS[option.slug].path)} className={styles.textLink}>{copy.details}<ArrowUpRight size={16} aria-hidden="true" /></Link>
                </div>
              </article>)}
            </div>
            <p className={styles.costNote}>{copy.costNote}</p>
          </div>
        </section>

        <HollywoodPrices locale={locale} directOffer={direct} indirectOffer={indirect} />

        <section className={styles.process} aria-labelledby="hollywood-process-title">
          <div className="crown-container">
            <div className="crown-section-heading"><p className="crown-eyebrow">{copy.processEyebrow}</p><h2 id="hollywood-process-title">{copy.processTitle}</h2></div>
            <ol className={styles.steps}>{copy.steps.map((step, index) => <li key={step.title}><span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
          </div>
        </section>

        <section className={styles.booking} aria-labelledby="hollywood-booking-title" data-cta-location="landing_form">
          <div className={`crown-container ${styles.bookingGrid}`}>
            <div className={styles.bookingCopy}>
              <p className="crown-eyebrow">{copy.bookingEyebrow}</p>
              <h2 id="hollywood-booking-title">{copy.bookingTitle}</h2>
              <p className="crown-lead">{copy.bookingIntro}</p>
            </div>
            <div id="konzultacio" className={styles.bookingForm}>
              <BookingForm directOffer={direct} initialTreatmentSlug="hollywood-mosoly" />
            </div>
            <div className={styles.bookingDetails}>
              <h3>{copy.nextTitle}</h3>
              <ol className={styles.next}>{copy.next.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol>
              <div className={styles.contact}>
                <p>{copy.phoneLabel}</p><a href="tel:+36305892468"><Phone size={20} aria-hidden="true" />+36 30 589 2468</a>
                <p className={styles.address}><MapPin size={19} aria-hidden="true" /><span>2500 Esztergom<br />Petőfi Sándor utca 11.</span></p>
                <Link href={veneerPath(locale, '/kapcsolat')} className={styles.textLink}>{copy.directions}<ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="hollywood-faq-title">
          <div className="crown-container">
            <div className="crown-section-heading"><h2 id="hollywood-faq-title">{copy.faqTitle}</h2></div>
            <div className={styles.faqs}>
              {copy.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
              <VeneerHealthNote locale={locale} />
              <div className="crown-actions"><a href="#konzultacio" className="crown-button" data-booking-cta="true">{copy.cta}<ArrowUpRight size={18} aria-hidden="true" /></a></div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
