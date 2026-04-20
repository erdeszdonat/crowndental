'use client';

import React, { useState, useEffect } from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function BlogClient() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dateLocale = locale === 'sk' ? 'sk-SK' : locale === 'en' ? 'en-GB' : 'hu-HU';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const id = 'h68mmabs';
        const dataSet = 'production';
        const query = encodeURIComponent(`*[_type == "post"] | order(publishedAt desc) { _id, title, "slug": slug.current, publishedAt, excerpt, "imageUrl": mainImage.asset->url }`);
        const url = `https://${id}.api.sanity.io/v2024-03-08/data/query/${dataSet}?query=${query}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.result) {
          setPosts(data.result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pt-24 md:pt-32 flex flex-col">
      <section className="pb-12 text-center container mx-auto px-4 text-left">
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

      <section className="py-12 container mx-auto px-4 max-w-6xl flex-1">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <a href={`${p}/blog/${post.slug}`} key={post._id} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-sky-600 text-sm font-bold mb-4 bg-sky-50 self-start px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(dateLocale) : t('freshPost')}
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 line-clamp-3 mb-6 font-medium flex-1">{post.excerpt}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
