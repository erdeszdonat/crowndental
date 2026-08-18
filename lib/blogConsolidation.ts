export const BLOG_SLUG_MIGRATIONS: Readonly<Record<string, string>> = {
  'ko-ko-stoja-umele-zuby-v-ma-arsku-v-roku-2026-kompletn-sprievodca-cenami':
    'kolko-stoja-umele-zuby-v-madarsku-2026',
  'zubn-implantat-v-ma-arsku-ko-ko-m-ete-u-etri-a-pre-o-je-crown-dental-najlep-ou-vo-bou':
    'zubny-implantat-v-madarsku-cena-a-vyhody',
};

export const BLOG_MERGE_TARGETS: Readonly<Record<string, string>> = {
  hetvege: 'fogaszati-ugyelet-esztergomban-2026',
  'vikendovy-zubar-preco-je-dolezite-osetrenie-v-sobotu-a-nedelu':
    'zubna-pohotovost-ostrihom-2026-ordinacne-hodiny',
  'weekend-dentist-why-saturday-and-sunday-care-matters':
    'emergency-dentist-esztergom-2026-weekend-hours',
  'zahnarzt-am-wochenende-samstag-sonntag-esztergom':
    'zahnaerztlicher-notdienst-esztergom-2026-wochenende',
};

const SANITY_SLUG_BY_CANONICAL = Object.fromEntries(
  Object.entries(BLOG_SLUG_MIGRATIONS).map(([oldSlug, canonicalSlug]) => [canonicalSlug, oldSlug]),
);

const MERGE_SOURCE_BY_TARGET = Object.fromEntries(
  Object.entries(BLOG_MERGE_TARGETS).map(([sourceSlug, targetSlug]) => [targetSlug, sourceSlug]),
);

const UNIQUE_SECTION_HEADING_BY_SOURCE: Readonly<Record<string, string>> = {
  hetvege: 'Miért különleges a hétvégi helyzet?',
  'vikendovy-zubar-preco-je-dolezite-osetrenie-v-sobotu-a-nedelu':
    'Prečo je víkendová situácia odlišná?',
  'weekend-dentist-why-saturday-and-sunday-care-matters':
    'Why is the weekend different?',
  'zahnarzt-am-wochenende-samstag-sonntag-esztergom':
    'Warum ist die Situation am Wochenende anders?',
};

type PortableTextBlock = {
  _type?: string;
  children?: Array<{ text?: string }>;
  [key: string]: unknown;
};

function blockText(block: PortableTextBlock): string {
  return (block.children ?? []).map((child) => child.text ?? '').join('').trim();
}

export function canonicalBlogSlug(slug: string): string {
  return BLOG_SLUG_MIGRATIONS[slug] ?? slug;
}

export function sanityBlogSlug(slug: string): string {
  return SANITY_SLUG_BY_CANONICAL[slug] ?? slug;
}

export function mergedBlogTarget(slug: string): string | undefined {
  return BLOG_MERGE_TARGETS[slug];
}

export function mergedBlogSource(targetSlug: string): string | undefined {
  return MERGE_SOURCE_BY_TARGET[targetSlug];
}

export function isMergedBlogSource(slug: string): boolean {
  return Boolean(BLOG_MERGE_TARGETS[slug]);
}

/**
 * The source Sanity document stays untouched as a recoverable archive. Its
 * unique weekend-care section is rendered as part of the stronger emergency
 * article, so the redirect never discards useful editorial content.
 */
export function mergeArchivedBlogContent(
  targetContent: unknown[] | undefined,
  sourceContent: unknown[] | undefined,
  sourceSlug: string,
): unknown[] | undefined {
  if (!sourceContent?.length) return targetContent;

  const heading = UNIQUE_SECTION_HEADING_BY_SOURCE[sourceSlug];
  const startIndex = (sourceContent as PortableTextBlock[]).findIndex(
    (block) => block._type === 'block' && blockText(block) === heading,
  );
  if (startIndex < 0) return targetContent;

  return [...(targetContent ?? []), ...sourceContent.slice(startIndex)];
}
