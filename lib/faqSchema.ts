export function buildFaqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function buildSpeakableJsonLd(url: string, cssSelectors: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  };
}

export function buildBlogPostingJsonLd(post: {
  title: string;
  publishedAt?: string;
  _updatedAt?: string;
  imageUrl?: string;
  excerpt?: string;
  slug: string;
  language?: string;
  authorName?: string;
  authorRole?: string;
  authorProfileUrl?: string;
  medicalReviewerName?: string;
  medicalReviewerRole?: string;
}) {
  const localePrefix = post.language && post.language !== 'hu' ? `/${post.language}` : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.imageUrl || 'https://www.crowndental.hu/og-image.jpg',
    datePublished: post.publishedAt || '',
    dateModified: post._updatedAt || post.publishedAt || '',
    inLanguage: post.language || 'hu',
    author: post.authorName
      ? {
          '@type': 'Person',
          name: post.authorName,
          jobTitle: post.authorRole || undefined,
          url: post.authorProfileUrl || undefined,
        }
      : { '@id': 'https://www.crowndental.hu/#organization' },
    reviewedBy: post.medicalReviewerName
      ? {
          '@type': 'Person',
          name: post.medicalReviewerName,
          jobTitle: post.medicalReviewerRole || undefined,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.crowndental.hu/#organization',
      name: 'Crown Dental',
      url: 'https://www.crowndental.hu',
      logo: { '@type': 'ImageObject', url: 'https://www.crowndental.hu/logo.webp' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.crowndental.hu${localePrefix}/blog/${post.slug}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.article-intro', '.article-lead'],
    },
  };
}
