export const BLOG_LANGUAGES = [
  { id: 'hu', label: 'Magyar', shortLabel: 'HU' },
  { id: 'sk', label: 'Szlovák', shortLabel: 'SK' },
  { id: 'en', label: 'Angol', shortLabel: 'EN' },
  { id: 'de', label: 'Német', shortLabel: 'DE' },
] as const;

export const BLOG_CATEGORIES = [
  {
    id: 'professional',
    label: 'Fogászati szakmai cikkek',
    shortLabel: 'Szakmai',
    description: 'SEO-alapú, keresésekre optimalizált fogászati tudástár cikkek.',
  },
  {
    id: 'magazine',
    label: 'Fejlődésünk és érdekességek',
    shortLabel: 'Magazin',
    description: 'Crown Dental hírek, rendelőfejlesztések, csapat és kulisszák mögötti tartalmak.',
  },
] as const;

export type BlogLanguage = (typeof BLOG_LANGUAGES)[number]['id'];
export type BlogCategory = (typeof BLOG_CATEGORIES)[number]['id'];

export function normalizeBlogLanguage(language?: string | null): BlogLanguage {
  return BLOG_LANGUAGES.some((item) => item.id === language) ? (language as BlogLanguage) : 'hu';
}

export function normalizeBlogCategory(category?: string | null): BlogCategory {
  return BLOG_CATEGORIES.some((item) => item.id === category) ? (category as BlogCategory) : 'professional';
}
