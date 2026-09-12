'use client';

import React from 'react';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { INTERNATIONAL_PATIENT_PATHS } from '@/lib/internationalPaths';
import { sanityImageLoader } from '@/lib/sanityImage';
import GoogleReviewsCta from '@/components/GoogleReviewsCta';

function relatedTreatmentSlug(post: any): string {
  const haystack = `${post?.title ?? ''} ${post?.excerpt ?? ''} ${post?.slug ?? ''}`.toLocaleLowerCase();
  if (/implant|all-on-4/.test(haystack)) return 'implantatum';
  if (/protez|denture|zahnersatz|fogsor|műfogsor|zubn[aé] n[aá]hrad/.test(haystack)) return 'fogsor';
  if (/koron|crown|krone|most[ií]k|bridge|brücke|cirk|zircon|zirkon/.test(haystack)) return 'koronak-hidak';
  if (/ortodon|braces|zahnspang|fogszab/.test(haystack)) return 'fogszabalyozas';
  if (/whiten|bleach|bielen|feh[eé]r[ií]t/.test(haystack)) return 'fogfeherites';
  if (/root canal|wurzel|gy[oö]k[eé]r|endodon/.test(haystack)) return 'gyokerkezeles';
  if (/g[oó]c|focal|ohnisk/.test(haystack)) return 'gockutatas';
  if (/extract|elt[aá]vol|h[uú]z[aá]s|entfern|extrak/.test(haystack)) return 'foghuzas';
  return 'allapotfelmeres';
}

const articleLinkCopy = {
  hu: { heading: 'Kapcsolódó következő lépések', treatment: 'Kapcsolódó kezelés', all: 'Kezelések és árak', international: 'Utazás és szállás' },
  sk: { heading: 'Súvisiace ďalšie kroky', treatment: 'Súvisiace ošetrenie', all: 'Ošetrenia a ceny', international: 'Zubné ošetrenie v Maďarsku' },
  en: { heading: 'Useful next steps', treatment: 'Related treatment', all: 'Treatments and prices', international: 'Dental treatment in Hungary' },
  de: { heading: 'Passende nächste Schritte', treatment: 'Passende Behandlung', all: 'Behandlungen und Preise', international: 'Zahnbehandlung in Ungarn' },
} as const;

export default function BlogPostClient({ post }: { post: any }) {
  const t = useTranslations('blog');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const dateLocale = locale === 'sk' ? 'sk-SK' : locale === 'en' ? 'en-GB' : locale === 'de' ? 'de-DE' : 'hu-HU';
  const linkCopy = articleLinkCopy[locale as keyof typeof articleLinkCopy] ?? articleLinkCopy.hu;
  const treatmentSlug = relatedTreatmentSlug(post);
  const internationalPath = INTERNATIONAL_PATIENT_PATHS[locale as keyof typeof INTERNATIONAL_PATIENT_PATHS] ?? INTERNATIONAL_PATIENT_PATHS.hu;

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('postNotFound')}</h1>
        <a href={`${p}/blog`} className="text-sky-600 font-bold hover:underline">{t('backToBlogLabel')}</a>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <article className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
        <a href={`${p}/blog`} className="inline-flex items-center gap-2 text-sky-600 font-bold mb-8 bg-sky-50 px-4 py-2 rounded-full text-sm hover:bg-sky-100 transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('backToBlogLabel')}
        </a>

        <header className="mb-12">
          <div className="flex items-center gap-2 text-gray-500 font-bold mb-6 text-sm uppercase tracking-wide">
            <Clock className="w-4 h-4 text-sky-600" />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(dateLocale) : t('freshContent')}
          </div>
          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            <span>
              {locale === 'sk' ? 'Vydavateľ odborného obsahu' : locale === 'en' ? 'Dental information published by' : locale === 'de' ? 'Fachinformation veröffentlicht von' : 'Szakmai tartalom kiadója'}:{' '}
              <strong className="text-gray-900">{post.authorName || 'Crown Dental'}</strong>
              {post.authorRole ? ` · ${post.authorRole}` : ''}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-8 tracking-tight italic">
            {post.title}
          </h1>
          {post.imageUrl && (
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 border border-gray-100 group">
              <Image
                loader={sanityImageLoader}
                src={post.imageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 767px) calc(100vw - 2rem), 896px"
                quality={82}
                preload
                className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          )}
        </header>

        <div className="prose prose-lg prose-sky max-w-none text-gray-700 mb-20 font-medium leading-relaxed">
          {(() => {
            const blocks: any[] = post.content ?? [];
            const result: React.ReactNode[] = [];
            let idx = 0;

            const renderSpans = (children: any[], markDefs?: any[]) => {
              const linkMap: Record<string, string> = {};
              for (const md of markDefs ?? []) {
                if (md._type === 'link') linkMap[md._key] = md.href;
              }
              return (children ?? []).map((c: any, j: number) => {
                let el: React.ReactNode = c.text;
                if (c.marks?.includes('strong')) el = <strong key={`s${j}`} className="font-extrabold text-gray-900">{el}</strong>;
                if (c.marks?.includes('em')) el = <em key={`e${j}`}>{el}</em>;
                const linkMark = c.marks?.find((mk: string) => linkMap[mk]);
                if (linkMark) {
                  el = <a key={`l${j}`} href={linkMap[linkMark]} className="text-sky-600 font-semibold underline underline-offset-2 hover:text-sky-500 transition-colors">{el}</a>;
                }
                return <React.Fragment key={j}>{el}</React.Fragment>;
              });
            };

            while (idx < blocks.length) {
              const block = blocks[idx];
              if (block._type !== 'block') { idx++; continue; }

              if (block.listItem === 'bullet') {
                const items: any[] = [];
                while (idx < blocks.length && blocks[idx].listItem === 'bullet') items.push(blocks[idx++]);
                result.push(
                  <ul key={`ul-${idx}`} className="my-6 space-y-2 not-prose">
                    {items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-gray-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-sky-500 mt-[10px] flex-shrink-0" />
                        <span>{renderSpans(item.children, item.markDefs)}</span>
                      </li>
                    ))}
                  </ul>
                );
                continue;
              }

              if (block.listItem === 'number') {
                const items: any[] = [];
                while (idx < blocks.length && blocks[idx].listItem === 'number') items.push(blocks[idx++]);
                result.push(
                  <ol key={`ol-${idx}`} className="my-6 space-y-3 not-prose">
                    {items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-gray-700 font-medium">
                        <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-extrabold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{j + 1}</span>
                        <span className="mt-0.5">{renderSpans(item.children, item.markDefs)}</span>
                      </li>
                    ))}
                  </ol>
                );
                continue;
              }

              const children = renderSpans(block.children, block.markDefs);

              if (block.style === 'h2') result.push(
                <h2 key={idx} className="text-3xl font-extrabold mt-16 mb-8 text-gray-900 border-b pb-4 border-gray-100">{children}</h2>
              );
              else if (block.style === 'h3') result.push(
                <h3 key={idx} className="text-2xl font-bold mt-12 mb-4 text-gray-800">{children}</h3>
              );
              else if (block.style === 'blockquote') result.push(
                <div key={idx} className="my-8 p-6 bg-sky-50 border-l-4 border-sky-500 rounded-r-2xl not-prose">
                  <p className="text-sky-900 font-semibold text-lg leading-relaxed">{children}</p>
                </div>
              );
              else result.push(
                <p key={idx} className="mb-6">{children}</p>
              );

              idx++;
            }
            return result;
          })()}
        </div>

        <aside className="mb-20 rounded-[2rem] border border-sky-100 bg-sky-50 p-7 md:p-9">
          <h2 className="text-2xl font-extrabold text-slate-900">{linkCopy.heading}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link href={`${p}/kezelesek/${treatmentSlug}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-5 font-black text-sky-700 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              {linkCopy.treatment}<ArrowRight className="h-5 w-5 shrink-0" />
            </Link>
            <Link href={`${p}/kezelesek`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-5 font-black text-sky-700 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              {linkCopy.all}<ArrowRight className="h-5 w-5 shrink-0" />
            </Link>
            <Link href={`${p}/${internationalPath}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-5 font-black text-sky-700 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              {linkCopy.international}<ArrowRight className="h-5 w-5 shrink-0" />
            </Link>
          </div>
        </aside>

        <div className="p-10 md:p-16 bg-gradient-to-br from-sky-600 to-sky-800 rounded-[3rem] shadow-2xl text-center relative overflow-hidden text-white mt-24 transform hover:scale-[1.01] transition-transform duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-inner">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">{t('ctaTitle')}</h3>
            <p className="text-xl text-sky-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">{t('ctaSubtitle')}</p>
            <a href={`${p}/idopont`} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-sky-700 font-extrabold rounded-full shadow-xl hover:scale-105 transition-all text-lg tracking-wide group">
              {t('ctaBtn')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </article>

      <GoogleReviewsCta />
    </main>
  );
}
