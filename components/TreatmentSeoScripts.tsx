import { buildFaqJsonLd, buildSpeakableJsonLd } from '@/lib/faqSchema';
import {
  buildBreadcrumbJsonLd,
  buildTreatmentJsonLd,
  getTreatmentContent,
  localizedUrl,
  normalizeLocale,
  type TreatmentSlug,
} from '@/lib/seo';

type TreatmentSeoScriptsProps = {
  locale: string;
  slug: TreatmentSlug;
};

export default function TreatmentSeoScripts({ locale, slug }: TreatmentSeoScriptsProps) {
  const normalizedLocale = normalizeLocale(locale);
  const content = getTreatmentContent(normalizedLocale, slug);
  const schemas = [
    buildTreatmentJsonLd(normalizedLocale, slug),
    buildFaqJsonLd(content.faqs ?? []),
    buildBreadcrumbJsonLd(normalizedLocale, `kezelesek/${slug}`, content.heroTitle),
    buildSpeakableJsonLd(localizedUrl(normalizedLocale, `kezelesek/${slug}`), [
      'h1',
      '.treatment-lead',
      '.faq-section',
    ]),
  ];

  return schemas.map((schema, index) => (
    <script
      key={`${slug}-schema-${index}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ));
}
