import { articleTranslations } from './blogRouteData.mjs';
import { clinicStorySlugs } from './clinicStorySlugs';
import { openingSlugs } from './openingSlugs';
import {
  HREFLANG_BY_LOCALE,
  SITE_URL,
  type SupportedLocale,
} from '@/lib/seo';

export type BlogTranslationGroup = Record<SupportedLocale, string>;

/**
 * Curated translation groups for the existing Sanity articles.
 *
 * Sanity currently stores translated posts as independent documents, so there
 * is no reliable CMS relationship to use for hreflang or the language switcher.
 * Keep this map in sync when an article slug changes or a new translation is
 * published. The content audit script validates every entry against Sanity.
 */
export const BLOG_TRANSLATION_GROUPS: readonly BlogTranslationGroup[] = [
  openingSlugs,
  clinicStorySlugs,
  ...articleTranslations,
] as const;

type BlogSlugMatch = {
  group: BlogTranslationGroup;
  locale: SupportedLocale;
};

const translationBySlug = new Map<string, BlogSlugMatch>();

for (const group of BLOG_TRANSLATION_GROUPS) {
  for (const locale of Object.keys(group) as SupportedLocale[]) {
    translationBySlug.set(group[locale], { group, locale });
  }
}

export function findBlogTranslation(slug: string): BlogSlugMatch | undefined {
  return translationBySlug.get(slug);
}

export function blogPath(locale: SupportedLocale, slug: string): string {
  const prefix = locale === 'hu' ? '' : `/${locale}`;
  return `${prefix}/blog/${slug}`;
}

export function blogLanguageAlternates(slug: string): Record<string, string> | undefined {
  const match = findBlogTranslation(slug);
  if (!match) return undefined;

  const languages = Object.fromEntries(
    (Object.keys(match.group) as SupportedLocale[]).map((locale) => [
      HREFLANG_BY_LOCALE[locale],
      `${SITE_URL}${blogPath(locale, match.group[locale])}`,
    ]),
  );

  return {
    ...languages,
    'x-default': `${SITE_URL}${blogPath('hu', match.group.hu)}`,
  };
}
