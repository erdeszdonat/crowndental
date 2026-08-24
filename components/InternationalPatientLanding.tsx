import Link from 'next/link';
import { ArrowRight, CheckCircle2, FlaskConical, MapPin, Route, ShieldCheck } from 'lucide-react';
import { buildFaqJsonLd } from '@/lib/faqSchema';
import { localePrefix, localizedUrl, safeJsonLd } from '@/lib/seo';
import type { InternationalLandingContent } from '@/lib/internationalPatients';

export default function InternationalPatientLanding({ content }: { content: InternationalLandingContent }) {
  const prefix = localePrefix(content.locale);
  const faqJsonLd = buildFaqJsonLd(content.faqs);
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': 'https://www.crowndental.hu/#organization',
    name: 'Crown Dental',
    url: localizedUrl(content.locale, content.path),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Petőfi Sándor utca 11.',
      postalCode: '2500',
      addressLocality: 'Esztergom',
      addressCountry: 'HU',
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 text-slate-900 md:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceJsonLd) }} />

      <section className="overflow-hidden bg-slate-950 text-white">
        <div className="container mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <p className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-sky-400">{content.eyebrow}</p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">{content.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">{content.lead}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href={`${prefix}/idopont`} className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-7 py-4 font-black text-white transition hover:bg-sky-400">
                {content.primaryCta}<ArrowRight className="h-5 w-5" />
              </Link>
              <Link href={`${prefix}/kezelesek`} className="inline-flex items-center rounded-full border border-white/20 px-7 py-4 font-bold text-white transition hover:bg-white/10">
                {content.secondaryCta}
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { icon: MapPin, text: 'Crown Dental · 2500 Esztergom' },
              { icon: FlaskConical, text: content.locale === 'sk' ? 'Vlastné zubnotechnické laboratórium' : content.locale === 'de' ? 'Eigenes Dentallabor' : 'In-house dental laboratory' },
              { icon: Route, text: content.locale === 'sk' ? 'Plánovanie pre pacientov zo Slovenska' : content.locale === 'de' ? 'Terminplanung für internationale Patienten' : 'Travel-aware appointment planning' },
              { icon: ShieldCheck, text: content.locale === 'sk' ? 'Diagnóza po osobnom vyšetrení' : content.locale === 'de' ? 'Diagnose nach persönlicher Untersuchung' : 'Diagnosis after an in-person examination' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <Icon className="h-6 w-6 shrink-0 text-sky-400" />
                <span className="font-bold text-slate-100">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-black md:text-4xl">{content.benefitsTitle}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {content.benefits.map((item) => (
            <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <CheckCircle2 className="h-7 w-7 text-sky-600" />
              <h3 className="mt-5 text-xl font-black">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-black md:text-4xl">{content.treatmentsTitle}</h2>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">{content.treatmentsIntro}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {content.treatments.map((treatment) => (
              <Link key={treatment.slug} href={`${prefix}/kezelesek/${treatment.slug}`} className="group rounded-3xl bg-slate-50 p-7 transition hover:-translate-y-1 hover:bg-sky-50 hover:shadow-lg">
                <h3 className="flex items-center justify-between gap-3 text-xl font-black group-hover:text-sky-700">
                  {treatment.title}<ArrowRight className="h-5 w-5 shrink-0" />
                </h3>
                <p className="mt-3 leading-7 text-slate-600">{treatment.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-black md:text-4xl">{content.processTitle}</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {content.process.map((step) => (
            <article key={step.title} className="rounded-3xl bg-slate-900 p-7 text-white">
              <h3 className="text-xl font-black text-sky-300">{step.title}</h3>
              <p className="mt-4 leading-7 text-slate-300">{step.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-sky-100 bg-sky-50 p-8 md:p-10">
          <h2 className="text-2xl font-black">{content.planningTitle}</h2>
          <p className="mt-4 max-w-4xl leading-8 text-slate-700">{content.planningBody}</p>
          <Link href={`${prefix}/utazas-szallas`} className="mt-6 inline-flex items-center gap-2 font-black text-sky-700 hover:text-sky-900">
            {content.locale === 'sk' ? 'Cesta, ubytovanie a následná starostlivosť' : content.locale === 'de' ? 'Anreise, Unterkunft und Nachsorge' : 'Travel, accommodation and aftercare'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-black md:text-4xl">{content.faqTitle}</h2>
          <div className="mt-9 space-y-4">
            {content.faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 open:bg-white open:shadow-md">
                <summary className="cursor-pointer list-none pr-8 text-lg font-black">{faq.q}</summary>
                <p className="mt-4 leading-7 text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-14 rounded-3xl bg-gradient-to-br from-sky-600 to-sky-800 p-9 text-center text-white md:p-12">
            <h2 className="text-3xl font-black">{content.primaryCta}</h2>
            <Link href={`${prefix}/idopont`} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-black text-sky-700 transition hover:scale-105">
              {content.primaryCta}<ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
