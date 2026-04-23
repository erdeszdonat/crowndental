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
  imageUrl?: string;
  excerpt?: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.imageUrl || 'https://www.crowndental.hu/og-image.jpg',
    datePublished: post.publishedAt || '',
    dateModified: post.publishedAt || '',
    author: { '@type': 'Organization', name: 'Crown Dental', url: 'https://www.crowndental.hu' },
    publisher: {
      '@type': 'Organization',
      name: 'Crown Dental',
      url: 'https://www.crowndental.hu',
      logo: { '@type': 'ImageObject', url: 'https://www.crowndental.hu/logo.webp' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.crowndental.hu/blog/${post.slug}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.article-intro', '.article-lead'],
    },
  };
}
