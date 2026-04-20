'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import { Building2, Quote, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-08',
  useCdn: true,
});

function AboutHero() {
  const t = useTranslations('about');
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = `*[_type == "treatment" && slug.current == "rolunk"][0]{"url": coalesce(mainImage.asset->url, heroImage.asset->url)}`;
        const result = await client.fetch(query);
        if (result?.url) setImageUrl(result.url);
      } catch (error) {
        console.error("Sanity image error:", error);
      }
    };
    fetchImage();
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0 bg-gray-900">
        {imageUrl && (
          <img src={imageUrl} alt="Crown Dental Clinic" className="w-full h-full object-cover opacity-60 animate-in fade-in duration-1000" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/90 to-gray-900/40" />
      </div>
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-sky-500/20 border border-sky-400/30 backdrop-blur-md rounded-full text-sky-300 text-xs sm:text-sm font-bold tracking-wide uppercase mb-6">
              <Sparkles className="w-4 h-4" /> {t('badge')}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              {t('title')} <br /> <span className="text-sky-400">Crown Dental</span>
              {t('titleHighlight') ? `` : `!`}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed font-light max-w-2xl">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
}

function CentralMessage() {
  const t = useTranslations('about');
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = `*[_type == "treatment" && slug.current == "rolunk"][0]{"url": coalesce(mainImage.asset->url, heroImage.asset->url)}`;
        const result = await client.fetch(query);
        if (result?.url) setImageUrl(result.url);
      } catch (error) { console.error("Sanity kép hiba:", error); }
    };
    fetchImage();
  }, []);

  return (
    <section className="py-20 md:py-32 bg-sky-950 relative overflow-hidden flex items-center justify-center">
      {imageUrl && (
        <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950 via-sky-900/95 to-sky-950" />
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <Quote className="w-12 h-12 md:w-16 md:h-16 text-sky-400/40 mx-auto mb-6 md:mb-8 rotate-180" />
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[5rem] font-black text-white tracking-tighter leading-[1.1] max-w-5xl mx-auto">
            {t('centralTitle1')} <br className="hidden sm:block"/>
            <span className="text-sky-300">{t('centralTitle2')}</span> <br className="hidden sm:block"/>
            {t('centralTitle3')}
          </h2>
        </motion.div>
      </div>
    </section>
  );
}

function MissionSection() {
  const t = useTranslations('about');
  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 md:mb-12 leading-tight tracking-tight">
            {t('missionTitle')} <br/>
            <span className="text-sky-600">{t('missionHighlight')}</span>
          </h2>
          <div className="space-y-6 md:space-y-8 text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed font-light text-left">
            <p><strong className="font-extrabold text-gray-900">{t('mission1Bold')}</strong> {t('mission1Rest')}</p>
            <p>{t('mission2Plain')} <strong className="font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg">{t('mission2Bold')}</strong></p>
            <p>{t('mission3')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StorySection() {
  const t = useTranslations('about');
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = `*[_type == "treatment" && slug.current == "rolunk1"][0]{"url": coalesce(mainImage.asset->url, heroImage.asset->url)}`;
        const result = await client.fetch(query);
        if (result?.url) setImageUrl(result.url);
      } catch (error) { console.error("Sanity kép hiba:", error); }
    };
    fetchImage();
  }, []);

  return (
    <section className="py-20 md:py-24 bg-gray-50 border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-sky-600 font-bold uppercase tracking-widest mb-3 text-sm text-left">{t('storyLabel')}</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight text-left">{t('storyTitle')}</h3>
            <div className="space-y-6 text-base md:text-lg text-gray-600 leading-relaxed text-left">
              <p>{t('story1Part1')} <strong>{t('story1Bold')}</strong>.</p>
              <p>{t('story2Part1')} <strong>{t('story2Bold')}</strong>{t('story2Part2')}</p>
              <p>{t('story3Part1')} <strong>{t('story3Bold')}</strong> {t('story3Part2')}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
            <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] bg-gray-200">
              {imageUrl && <img src={imageUrl} alt="Laboratórium" className="w-full h-full object-cover" />}
            </div>
            <div className="absolute -bottom-6 left-4 right-4 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sm:max-w-[280px] text-left">
              <div className="flex items-center gap-4 mb-1">
                <Building2 className="w-8 h-8 text-sky-600" />
                <div className="text-3xl font-extrabold text-gray-900">1994</div>
              </div>
              <p className="text-gray-500 text-sm">{t('storySince')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function RolunkClient() {
  return (
    <div className="bg-white min-h-screen selection:bg-sky-200 selection:text-sky-900 overflow-x-hidden">
      <main>
        <AboutHero />
        <CentralMessage />
        <MissionSection />
        <StorySection />
      </main>
    </div>
  );
}
