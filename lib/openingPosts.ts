import content from './openingContent.json';


// Versioned clinic news is published together with its contact and routing changes.
export const openingPosts = Object.entries(content).map(([language, copy]) => {
  let sequence = 0;
  const block = (text: string, style = 'normal', href?: string) => {
    const key = `opening-${sequence++}`;
    return { _type: 'block', _key: key, style,
      markDefs: href ? [{ _type: 'link', _key: `${key}-link`, href }] : [],
      children: [{ _type: 'span', _key: `${key}-text`, text, marks: href ? [`${key}-link`] : [] }],
    };
  };
  const prefix = language === 'hu' ? '' : `/${language}`;
  return {
    _id: `primas-opening-${language}`, language, category: 'magazine',
    title: copy.title, slug: copy.slug, seoTitle: copy.seoTitle, seoDescription: copy.seoDescription,
    excerpt: copy.intro, publishedAt: '2026-11-11', _updatedAt: '2026-11-11', authorName: 'Crown Dental',
    content: [block(copy.intro), block('Crown Dental Prímás Sziget: +36 70 604 2500', 'normal', 'tel:+36706042500'),
      block(copy.book, 'normal', `${prefix}/idopont`),
      ...copy.sections.flatMap(([heading, text]) => [block(heading, 'h2'), block(text)]),
      block(copy.faqTitle, 'h2'),
      ...copy.faqs.flatMap(([question, answer]) => [block(question, 'h3'), block(answer)]),
      block(copy.linksTitle, 'h2'),
      ...copy.links.map(([path, label]) => block(label, 'normal', `${prefix}/${path}`)),
      block('Crown Dental Prímás Sziget: +36 70 604 2500', 'normal', 'tel:+36706042500'),
      block(copy.fallback), block('Crown Dental Belváros: +36 30 589 2468', 'normal', 'tel:+36305892468'),
    ],
  };
});
