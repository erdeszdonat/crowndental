'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clock, BookOpen, Globe2, Layers3 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import {
  BLOG_CATEGORIES,
  BLOG_LANGUAGES,
  normalizeBlogCategory,
  normalizeBlogLanguage,
  type BlogCategory,
  type BlogLanguage,
} from '@/lib/blogConfig';

type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  publishedAt?: string;
  excerpt?: string;
  imageUrl?: string;
  language?: string;
  category?: string;
};

type NormalizedPost = BlogPost & {
  language: BlogLanguage;
  category: BlogCategory;
};

type SelectedCategory = BlogCategory | 'all';

const EMPTY_BLOG_POSTS: BlogPost[] = [];

const copyByLocale = {
  hu: {
    languageTitle: 'Nyelv szerint',
    categoryTitle: 'Tartalomtípus',
    emptyTitle: 'Ebben a válogatásban még nincs cikk.',
    emptyText: 'Válasszon másik nyelvet vagy kategóriát, hamarosan ide is kerül friss tartalom.',
    future: 'később',
  },
  en: {
    languageTitle: 'By language',
    categoryTitle: 'Content type',
    emptyTitle: 'No articles in this selection yet.',
    emptyText: 'Choose another language or category — fresh content is coming here soon.',
    future: 'later',
  },
  sk: {
    languageTitle: 'Podľa jazyka',
    categoryTitle: 'Typ obsahu',
    emptyTitle: 'V tomto výbere zatiaľ nie sú články.',
    emptyText: 'Vyberte iný jazyk alebo kategóriu, nový obsah sem čoskoro pribudne.',
    future: 'neskôr',
  },
} as const;

const categoryCopy: Record<BlogCategory, { title: string; description: string }> = {
  professional: {
    title: 'Fogászati szakmai cikkek',
    description: 'Google keresésekre optimalizált, orvos-szakmai tudástár cikkek kezelésekről, árakról és döntési helyzetekről.',
  },
  magazine: {
    title: 'Fejlődésünk és érdekességek',
    description: 'Crown Dental hírek, rendelőfejlesztések, kulisszák mögötti történetek és könnyedebb érdekességek.',
  },
};

function getPostPath(language: BlogLanguage, slug: string) {
  return `${language === 'hu' ? '' : `/${language}`}/blog/${slug}`;
}

function getDateLocale(language: BlogLanguage) {
  if (language === 'sk') return 'sk-SK';
  if (language === 'en') return 'en-GB';
  if (language === 'de') return 'de-DE';
  return 'hu-HU';
}

export default function BlogClient({ initialPosts = EMPTY_BLOG_POSTS }: { initialPosts?: BlogPost[] }) {
  const t = useTranslations('blog');
  const locale = useLocale();
  const localeCopy = copyByLocale[locale as keyof typeof copyByLocale] ?? copyByLocale.hu;
  const initialLanguage = normalizeBlogLanguage(locale);
  const [selectedLanguage, setSelectedLanguage] = useState<BlogLanguage>(initialLanguage);
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>('all');
  const [clientPosts, setClientPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);

  useEffect(() => {
    if (initialPosts.length > 0) {
      setClientPosts(initialPosts);
      setLoading(false);
    } else {
      setLoading(true);
    }

    let cancelled = false;

    const fetchPosts = async () => {
      try {
        const id = 'h68mmabs';
        const dataSet = 'production';
        const query = encodeURIComponent(`*[_type == "post"] | order(publishedAt desc) { _id, title, "slug": slug.current, publishedAt, excerpt, "imageUrl": mainImage.asset->url, "language": coalesce(language, "hu"), "category": coalesce(category, "professional") }`);
        const url = `https://${id}.api.sanity.io/v2024-03-08/data/query/${dataSet}?query=${query}`;
        const response = await fetch(url, { cache: 'no-store' });
        const data = await response.json();

        if (!cancelled && data.result) setClientPosts(data.result);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [initialPosts]);

  const posts = useMemo<NormalizedPost[]>(
    () =>
      clientPosts.map((post) => ({
        ...post,
        language: normalizeBlogLanguage(post.language),
        category: normalizeBlogCategory(post.category),
      })),
    [clientPosts]
  );

  const languageCounts = useMemo(
    () =>
      BLOG_LANGUAGES.map((language) => ({
        ...language,
        count: posts.filter((post) => post.language === language.id).length,
      })),
    [posts]
  );

  const categoryCounts = useMemo(
    () =>
      [
        {
          id: 'all' as const,
          title: 'Összes cikk',
          label: 'Összes cikk',
          shortLabel: 'Összes',
          description: 'Minden bejegyzés egyben, így a régi és az újonnan kategorizált cikkek sem tűnnek el.',
          count: posts.filter((post) => post.language === selectedLanguage).length,
        },
        ...BLOG_CATEGORIES.map((category) => ({
          ...category,
          count: posts.filter((post) => post.language === selectedLanguage && post.category === category.id).length,
        })),
      ],
    [posts, selectedLanguage]
  );

  const filteredPosts = useMemo(
    () => posts.filter((post) => post.language === selectedLanguage && (selectedCategory === 'all' || post.category === selectedCategory)),
    [posts, selectedCategory, selectedLanguage]
  );

  return (
    <main className="min-h-screen bg-gray-50 pt-24 md:pt-32 flex flex-col">
      <section className="pb-8 text-center container mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-100/80 text-sky-700 rounded-full font-bold uppercase text-sm mb-6 border border-sky-200 shadow-sm">
          <BookOpen className="w-4 h-4" /> {t('badge')}
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          {t('mainTitle')} <span className="text-sky-600">{t('mainTitleHighlight')}</span>
        </h1>

        <div className="max-w-3xl mx-auto text-gray-600 text-base md:text-lg leading-relaxed font-medium">
          <p className="mb-3">{t('description1')}</p>
          <p>{t('description2')}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white border border-sky-100 rounded-[2rem] shadow-sm p-4 md:p-5">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 text-gray-900 font-black text-sm uppercase tracking-widest mb-3">
                <Globe2 className="w-4 h-4 text-sky-600" />
                {localeCopy.languageTitle}
              </div>
              <div className="flex flex-wrap gap-2">
                {languageCounts.map((language) => {
                  const isFutureLanguage = language.id === 'de' && language.count === 0;
                  return (
                    <button
                      key={language.id}
                      type="button"
                      onClick={() => setSelectedLanguage(language.id)}
                      className={`rounded-full px-4 py-2 text-sm font-black transition-all border ${
                        selectedLanguage === language.id
                          ? 'bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-600/20'
                          : 'bg-sky-50 text-sky-800 border-sky-100 hover:bg-sky-100'
                      }`}
                    >
                      {language.label}
                      <span className={`ml-2 text-xs ${selectedLanguage === language.id ? 'text-sky-100' : 'text-sky-500'}`}>
                        {isFutureLanguage ? localeCopy.future : language.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-900 font-black text-sm uppercase tracking-widest mb-3">
                <Layers3 className="w-4 h-4 text-sky-600" />
                {localeCopy.categoryTitle}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {categoryCounts.map((category) => {
                  const categoryText = category.id === 'all' ? category : categoryCopy[category.id];
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`text-left rounded-3xl p-4 border transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gray-950 text-white border-gray-950 shadow-xl shadow-gray-900/15'
                          : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-white hover:border-sky-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-black text-base">{categoryText.title}</span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${selectedCategory === category.id ? 'bg-white/10 text-sky-200' : 'bg-sky-100 text-sky-700'}`}>
                          {category.count}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${selectedCategory === category.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        {categoryText.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 container mx-auto px-4 max-w-6xl flex-1">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <a href={getPostPath(post.language, post.slug)} key={post._id} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-sky-600 text-sm font-bold mb-4 bg-sky-50 self-start px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(getDateLocale(post.language)) : t('freshPost')}
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 line-clamp-3 mb-6 font-medium flex-1">{post.excerpt}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto mb-5 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{localeCopy.emptyTitle}</h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">{localeCopy.emptyText}</p>
          </div>
        )}
      </section>
    </main>
  );
}
