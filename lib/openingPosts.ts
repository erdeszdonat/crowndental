import content from './openingContent.json';
import announcement from './openingAnnouncement.json';
import stories from './clinicStoryContent.json';

const clinicImage = 'https://cdn.sanity.io/images/h68mmabs/production/7e67cedf834aaf0c6093e80d54b2ae4a23d54492-1536x1024.webp';
const storyImage = 'https://www.crowndental.hu/images/blog/primas-sziget-epitkezes-fogtechnika.webp';


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
    _id: `primas-opening-${language}`, language, category: 'professional',
    imageUrl: clinicImage,
    mainImage: { alt: announcement[language as keyof typeof announcement].imageAlt, sourceName: 'Crown Dental' },
    title: copy.title, slug: copy.slug, seoTitle: copy.seoTitle, seoDescription: copy.seoDescription,
    excerpt: copy.intro, publishedAt: '2026-11-11', _updatedAt: '2026-11-11', authorName: 'Crown Dental',
    content: [block(copy.intro), block('Crown Dental Prímás Sziget: +36 70 604 2500', 'normal', 'tel:+36706042500'),
      block(copy.book, 'normal', `${prefix}/idopont`),
      ...copy.sections.flatMap(([heading, text]) => [block(heading, 'h2'), block(text)]),
      block(copy.faqTitle, 'h2'),
      ...copy.faqs.flatMap(([question, answer]) => [block(question, 'h3'), block(answer)]),
      block(copy.linksTitle, 'h2'),
      ...copy.links.map(([path, label]) => block(label, 'normal', `${prefix}/${path}`)),
      block(copy.fallback),
      block('Crown Dental Prímás Sziget: +36 70 604 2500', 'normal', 'tel:+36706042500'),
    ],
  };
});


export const clinicStoryPosts = Object.entries(stories).map(([language, copy]) => {
  let sequence = 0;
  const block = (text: string, style = 'normal', href?: string) => {
    const key = `story-${sequence++}`;
    return { _type: 'block', _key: key, style,
      markDefs: href ? [{ _type: 'link', _key: `${key}-link`, href }] : [],
      children: [{ _type: 'span', _key: `${key}-text`, text, marks: href ? [`${key}-link`] : [] }],
    };
  };
  const prefix = language === 'hu' ? '' : `/${language}`;
  return {
    _id: `primas-story-${language}`, language, category: 'magazine',
    title: copy.title, slug: copy.slug, seoTitle: copy.seoTitle, seoDescription: copy.seoDescription,
    excerpt: copy.intro, publishedAt: '2026-11-11', _updatedAt: '2026-11-11', authorName: 'Crown Dental',
    imageUrl: storyImage,
    mainImage: { alt: copy.imageAlt, caption: copy.imageCaption },
    content: [block(copy.intro),
      ...copy.sections.flatMap(([heading, ...paragraphs]) => [block(heading, 'h2'), ...paragraphs.map(text => block(text))]),
      block(copy.linksTitle, 'h2'),
      ...copy.links.map(([path, label]) => block(label, 'normal', `${prefix}/${path}`)),
      block(copy.phoneIntro),
      block('Crown Dental Prímás Sziget: +36 70 604 2500', 'normal', 'tel:+36706042500'),
    ],
  };
});

export const clinicNewsPosts = [...openingPosts, ...clinicStoryPosts];
