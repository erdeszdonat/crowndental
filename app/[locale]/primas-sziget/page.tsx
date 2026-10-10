import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Accessibility, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, MapPin, Microscope, ParkingCircle, Phone, Sparkles } from 'lucide-react';
import VeneerOffer from '@/components/VeneerOffer';
import ClinicDetails from '@/components/ClinicDetails';
import { clinicCopy, CLINIC_LOCATIONS } from '@/lib/clinicLocations';
import { buildLocationSchema } from '@/lib/clinicSchema';
import { buildFaqJsonLd } from '@/lib/faqSchema';
import { primasPageContent, type PrimasTreatmentSlug } from '@/lib/primasPageContent';
import { getTreatmentImages } from '@/lib/treatmentImages';
import { getVeneerOffer } from '@/lib/veneers.mjs';
import { buildBreadcrumbJsonLd, buildLocalizedMetadata, getTreatmentContent, localePrefix, normalizeLocale, safeJsonLd } from '@/lib/seo';

export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const copy = clinicCopy[locale];
  return buildLocalizedMetadata({ locale, path: 'primas-sziget', title: `${copy.title} | Crown Dental`, description: copy.description });
}

const treatments: PrimasTreatmentSlug[] = ['allapotfelmeres', 'gyokerkezeles', 'fogfeherites', 'koronak-hidak', 'fogsor', 'implantatum', 'szajsebeszet', 'gyerekfogaszat', 'fogszabalyozas'];
const benefitIcons = [ParkingCircle, Accessibility, CalendarDays];
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-4';
const primaryButton = `inline-flex items-center justify-center gap-3 rounded-full bg-sky-600 px-7 py-4 font-bold text-white shadow-lg shadow-sky-900/10 transition-colors hover:bg-sky-700 ${focusRing}`;
const textLink = `inline-flex items-center gap-2 rounded font-bold text-sky-700 underline-offset-4 hover:underline ${focusRing}`;
const sectionTitle = 'text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl';
const eyebrow = 'mb-4 text-xs font-bold uppercase tracking-[0.18em] text-sky-700';

function imageUrl(url: string, width: number) {
  return `${url}?auto=format&w=${width}&q=75`;
}

async function getPrimasClinicImage(): Promise<string | undefined> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const query = '*[_type == "location" && name == "primas-sziget" && !(_id in path("drafts.**"))][0]{"url": image.asset->url}';
  const response = await fetch(`https://${projectId}.api.sanity.io/v2024-03-10/data/query/${dataset}?query=${encodeURIComponent(query)}`, { next: { revalidate: 604800, tags: ['clinic-images'] } });
  if (!response.ok) throw new Error(`Clinic image unavailable (${response.status})`);
  const data = await response.json() as { result: { url?: string } | null };
  return data.result?.url?.startsWith('https://cdn.sanity.io/') ? data.result.url : undefined;
}

export default async function PrimasSzigetPage({ params }: Props) {
  const [routeParams, images, clinicImage] = await Promise.all([params, getTreatmentImages(), getPrimasClinicImage()]);
  const locale = normalizeLocale(routeParams.locale);
  const copy = clinicCopy[locale];
  const content = primasPageContent[locale];
  const prefix = localePrefix(locale);
  const clinic = CLINIC_LOCATIONS[1];
  const heroImage = clinicImage || images['esztetikai-fogaszat'];
  const labImage = images.fokep1;
  const veneerCards = [{ slug: 'direkt-hej' as const, title: copy.direct }, { slug: 'indirekt-hej' as const, title: copy.indirect }];

  return (
    <main className="bg-white text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(buildLocationSchema(locale, 1)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(buildBreadcrumbJsonLd(locale, 'primas-sziget', 'Crown Dental Prímás Sziget')) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(buildFaqJsonLd(content.faqs.map(({ question, answer }) => ({ q: question, a: answer })))) }} />

      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        {heroImage && <Image src={imageUrl(heroImage, 1536)} alt="" fill preload unoptimized sizes="100vw" className="object-cover object-center" />}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
        <div className="container relative mx-auto px-5 pb-16 pt-36 sm:pb-24 sm:pt-44 lg:pb-28 lg:pt-48">
          <div className="max-w-3xl">
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] backdrop-blur-sm sm:text-sm"><MapPin className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />Crown Dental Prímás Sziget</p>
            <h1 className="text-4xl font-black leading-[1.06] tracking-tight sm:text-6xl xl:text-7xl">{content.heroTitle}<span className="mt-3 block text-sky-300">{content.heroAccent}</span></h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">{content.heroDescription}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={`${prefix}/idopont`} className={primaryButton}>{copy.book}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link>
              <a href="tel:+36305892468" className={`inline-flex items-center justify-center gap-3 rounded-full border border-white/35 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20 ${focusRing}`}><Phone className="h-5 w-5" aria-hidden="true" />+36 30 589 2468</a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/20 pt-6 text-sm text-slate-100">
              {[copy.freeParking, copy.accessible, `${copy.weekend}: 08:00–20:00`].map((label) => <li key={label} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />{label}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-5">
          <div className="grid gap-7 lg:grid-cols-2 lg:items-end lg:gap-16">
            <div><p className={eyebrow}>{content.introEyebrow}</p><h2 className={sectionTitle}>{content.introTitle}</h2></div>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">{content.introDescription}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {content.benefits.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return <article key={benefit.title} className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-7 lg:p-8"><span className="mb-7 inline-flex rounded-2xl bg-white p-3 text-sky-700 shadow-sm"><Icon className="h-7 w-7" aria-hidden="true" /></span><h3 className="text-xl font-bold">{benefit.title}</h3><p className="mt-3 leading-relaxed text-slate-600">{benefit.description}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-20 sm:py-24">
        <div className="container mx-auto px-5">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className={eyebrow}>{content.smileEyebrow}</p>
              <h2 className={sectionTitle}>{content.smileTitle}</h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">{content.smileDescription}</p>
              <Link href={`${prefix}/hollywood-mosoly`} className={`mt-6 ${textLink}`}>{copy.smile}<ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link>
              <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-sky-800"><Sparkles className="h-5 w-5 shrink-0" aria-hidden="true" />{content.labEyebrow}</div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {veneerCards.map((item) => <Link key={item.slug} href={`${prefix}/kezelesek/${item.slug}`} className={`group flex flex-col overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white shadow-xl shadow-sky-900/5 transition-shadow hover:shadow-sky-900/10 ${focusRing}`}>
                {images[item.slug] && <div className="relative aspect-[4/3] overflow-hidden bg-sky-50"><Image src={imageUrl(images[item.slug], 720)} alt={item.title} fill unoptimized sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 30vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /></div>}
                <div className="flex flex-1 flex-col p-6"><h3 className="mb-5 text-2xl font-bold">{item.title}</h3><VeneerOffer slug={item.slug} initialOffer={getVeneerOffer(item.slug)} locale={locale} /><span className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm font-bold text-sky-700">{content.treatmentLink}<ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" /></span></div>
              </Link>)}
            </div>
          </div>
          <p className="mt-8 max-w-4xl text-sm leading-relaxed text-slate-600">{copy.smileNote}</p>
        </div>
      </section>

      <section className="py-20 sm:py-24" id="kezelesek">
        <div className="container mx-auto px-5">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl"><p className={eyebrow}>{content.treatmentsEyebrow}</p><h2 className={sectionTitle}>{content.treatmentsTitle}</h2><p className="mt-5 text-lg leading-relaxed text-slate-600">{content.treatmentsDescription}</p></div>
            <Link href={`${prefix}/kezelesek#arlista`} className={`${textLink} shrink-0`}>{content.priceListLabel}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {treatments.map((slug) => {
              const treatment = getTreatmentContent(locale, slug);
              return <li key={slug}><Link href={`${prefix}/kezelesek/${slug}`} className={`group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white transition-shadow hover:shadow-xl hover:shadow-slate-900/5 ${focusRing}`}>
                {images[slug] && <div className="relative aspect-[16/9] overflow-hidden bg-slate-100"><Image src={imageUrl(images[slug], 720)} alt="" fill unoptimized sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /></div>}
                <div className="flex flex-1 flex-col p-6"><h3 className="text-xl font-bold">{treatment.heroTitle}</h3><p className="mt-3 text-sm leading-relaxed text-slate-600">{content.treatmentDescriptions[slug]}</p><span className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm font-bold text-sky-700">{content.treatmentLink}<ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" /></span></div>
              </Link></li>;
            })}
          </ul>
          <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-2xl bg-slate-50 p-6 sm:flex-row sm:items-center"><p className="font-semibold">{copy.fillings}</p><Link href={`${prefix}/kezelesek`} className={`${textLink} shrink-0`}>{copy.allTreatments}<ArrowRight className="h-5 w-5" aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white sm:py-24">
        <div className="container mx-auto grid items-center gap-10 px-5 lg:grid-cols-2 lg:gap-20">
          <div className="relative min-h-80 overflow-hidden rounded-[2rem] bg-slate-900 sm:min-h-[28rem]">
            {labImage ? <Image src={imageUrl(labImage, 1000)} alt={content.labEyebrow} fill unoptimized sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-900 to-slate-900"><Microscope className="h-28 w-28 text-sky-300" aria-hidden="true" /></div>}
          </div>
          <div><p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">{content.labEyebrow}</p><h2 className={sectionTitle}>{content.labTitle}</h2><p className="mt-6 text-lg leading-relaxed text-slate-300">{content.labDescription}</p><ul className="mt-7 space-y-4">{content.labFeatures.map((feature) => <li key={feature} className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />{feature}</li>)}</ul><Link href={`${prefix}/kezelesek/fogtechnikai-megoldasok`} className={`mt-8 inline-flex items-center gap-3 rounded font-bold text-sky-300 underline-offset-4 hover:underline ${focusRing}`}>{content.labLink}<ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="container mx-auto px-5">
          <h2 className={`${sectionTitle} max-w-2xl`}>{content.stepsTitle}</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">{content.steps.map((step, index) => <li key={step.title} className="border-t border-slate-200 pt-6"><span className="text-4xl font-black tracking-tight text-sky-600" aria-hidden="true">0{index + 1}</span><h3 className="mt-5 text-xl font-bold">{step.title}</h3><p className="mt-3 leading-relaxed text-slate-600">{step.description}</p></li>)}</ol>
          <Link href={`${prefix}/idopont`} className={`mt-10 ${primaryButton}`}>{copy.book}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container mx-auto grid gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div><p className={eyebrow}>Crown Dental Prímás Sziget</p><h2 className={sectionTitle}>{content.faqTitle}</h2><a href="tel:+36305892468" className={`mt-7 ${textLink}`}><Phone className="h-5 w-5" aria-hidden="true" />+36 30 589 2468</a></div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">{content.faqs.map((faq) => <details key={faq.question} className="group py-1"><summary className={`flex cursor-pointer list-none items-center justify-between gap-5 rounded py-5 text-lg font-bold [&::-webkit-details-marker]:hidden ${focusRing}`}>{faq.question}<ChevronDown className="h-5 w-5 shrink-0 text-sky-600 transition-transform group-open:rotate-180" aria-hidden="true" /></summary><p className="max-w-2xl pb-6 leading-relaxed text-slate-600">{faq.answer}</p></details>)}</div>
        </div>
      </section>

      <section className="border-t border-sky-100 bg-sky-50/70 py-20 sm:py-24" id="kapcsolat">
        <div className="container mx-auto px-5">
          <div className="mb-12 max-w-2xl"><p className={eyebrow}>Helischer József út 6. · Esztergom</p><h2 className={sectionTitle}>{content.contactTitle}</h2><p className="mt-5 text-lg leading-relaxed text-slate-600">{content.contactDescription}</p></div>
          <div className="grid overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-900/5 lg:grid-cols-2">
            <div className="p-7 sm:p-10"><MapPin className="mb-5 h-8 w-8 text-sky-600" aria-hidden="true" /><h3 className="mb-6 text-2xl font-bold">Crown Dental Prímás Sziget</h3><ClinicDetails locale={locale} index={1} showDetails={false} /><a href="tel:+36305892468" className={`mt-6 ${textLink}`}><Phone className="h-5 w-5" aria-hidden="true" />+36 30 589 2468</a><div className="mt-7"><Link href={`${prefix}/idopont`} className={primaryButton}>{copy.book}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link></div><p className="mt-5 text-sm leading-relaxed text-slate-500">{copy.bookingNote}</p></div>
            <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(clinic.address)}&output=embed`} title="Crown Dental Prímás Sziget — Helischer József út 6." loading="lazy" className="h-80 w-full border-0 lg:h-full lg:min-h-[30rem]" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className="mt-7 rounded-2xl border border-sky-100 bg-white/70 p-6"><p className="max-w-3xl leading-relaxed text-slate-600">{copy.imaging}</p><Link href={`${prefix}/esztergom`} className={`mt-3 ${textLink}`}>Crown Dental Belváros · Petőfi Sándor utca 11.<ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link></div>
        </div>
      </section>
    </main>
  );
}
