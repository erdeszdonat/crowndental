'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Star,
  Building2,
  ArrowRight
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

function AnimatedCounter({ end, suffix = "", text, desc }: { end: number, suffix?: string, text: string, desc: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div ref={ref} className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-50 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
      <div className="text-5xl font-extrabold text-sky-600 mb-4 tracking-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-lg font-bold text-gray-900 mb-2">{text}</div>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StatsSection() {
  const t = useTranslations('blog');
  // @ts-ignore
  const stats = t.raw('stats') as Array<{ end: number; suffix: string; text: string; desc: string }>;
  return (
    <section className="py-20 bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100/50 rounded-full text-sky-700 text-sm font-bold uppercase mb-6">
          <Building2 className="w-4 h-4" /> {t('statsLabel')}
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12 tracking-tight">{t('statsTitle')}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((s, i) => (
            <AnimatedCounter key={i} end={s.end} suffix={s.suffix} text={s.text} desc={s.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const t = useTranslations('home.reviews');
  // @ts-ignore
  const allReviews = (t.raw('items') as Array<{ name: string; text: string; date: string }>).slice(0, 5);
  const extendedReviews = [...allReviews, ...allReviews, ...allReviews];
  const blogT = useTranslations('blog');

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{blogT('reviewsTitle')}</h3>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; width: max-content; animation: marquee 50s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}} />
      <div className="animate-marquee gap-6 px-6">
        {extendedReviews.map((review, i) => (
          <div key={i} className="w-[350px] p-8 bg-gray-50 rounded-[2rem] shadow-sm border border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-1 mb-4 text-amber-400">
              {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
            </div>
            <p className="text-gray-600 mb-6 italic leading-relaxed">"{review.text}"</p>
            <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-200">
              <span className="font-bold text-gray-900">{review.name}</span>
              <span className="text-gray-400">{review.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BlogPostClient({ post }: { post: any }) {
  const t = useTranslations('blog');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;
  const dateLocale = locale === 'sk' ? 'sk-SK' : locale === 'en' ? 'en-GB' : 'hu-HU';

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('postNotFound')}</h1>
        <a href={`${p}/blog`} className="text-sky-600 font-bold hover:underline">{t('backToBlogLabel')}</a>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <article className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
        <a href={`${p}/blog`} className="inline-flex items-center gap-2 text-sky-600 font-bold mb-8 bg-sky-50 px-4 py-2 rounded-full text-sm hover:bg-sky-100 transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('backToBlogLabel')}
        </a>

        <header className="mb-12">
          <div className="flex items-center gap-2 text-gray-500 font-bold mb-6 text-sm uppercase tracking-wide">
            <Clock className="w-4 h-4 text-sky-600" />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(dateLocale) : t('freshContent')}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-8 tracking-tight italic">
            {post.title}
          </h1>
          {post.imageUrl && (
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 border border-gray-100 group">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          )}
        </header>

        <div className="prose prose-lg prose-sky max-w-none text-gray-700 mb-20 font-medium leading-relaxed">
          {post.content?.map((block: any, i: number) => {
            if (block._type === 'block') {
              const text = block.children?.map((c: any) => c.text).join('') || '';
              if (block.style === 'h2') return <h2 key={i} className="text-3xl font-extrabold mt-16 mb-8 text-gray-900 border-b pb-4 border-gray-100">{text}</h2>;
              if (block.style === 'h3') return <h3 key={i} className="text-2xl font-bold mt-12 mb-6 text-gray-800">{text}</h3>;
              if (block.style === 'blockquote') return <blockquote key={i} className="border-l-4 border-sky-500 pl-6 italic text-gray-600 my-10 bg-gray-50 py-8 rounded-r-3xl text-xl">{text}</blockquote>;
              return <p key={i} className="mb-6">{text}</p>;
            }
            return null;
          })}
        </div>

        <div className="p-10 md:p-16 bg-gradient-to-br from-sky-600 to-sky-800 rounded-[3rem] shadow-2xl text-center relative overflow-hidden text-white mt-24 transform hover:scale-[1.01] transition-transform duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-inner">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">{t('ctaTitle')}</h3>
            <p className="text-xl text-sky-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">{t('ctaSubtitle')}</p>
            <a href={`${p}/idopont`} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-sky-700 font-extrabold rounded-full shadow-xl hover:scale-105 transition-all text-lg tracking-wide group">
              {t('ctaBtn')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </article>

      <StatsSection />
      <ReviewsSection />
    </main>
  );
}
