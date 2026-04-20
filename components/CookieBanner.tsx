'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Cookie, X, Check, ShieldCheck, Settings, Info } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

type ConsentSettings = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

export default function CookieBanner() {
  const t = useTranslations('cookie');
  const locale = useLocale();
  const p = locale === 'hu' ? '' : `/${locale}`;

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentSettings>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedConsent = localStorage.getItem('crown_cookie_consent');
      if (!savedConsent) {
        setIsVisible(true);
      } else {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
        applyGoogleConsent(parsedConsent);
      }
    } catch (error) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setIsVisible(true);
      setShowDetails(true);
    };
    window.addEventListener('open-cookie-banner', handleOpen);
    return () => window.removeEventListener('open-cookie-banner', handleOpen);
  }, []);

  const applyGoogleConsent = (settings: ConsentSettings) => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      win.dataLayer = win.dataLayer || [];
      win.gtag = win.gtag || function() {
        // eslint-disable-next-line prefer-rest-params
        win.dataLayer.push(arguments);
      };
      win.gtag('consent', 'update', {
        'analytics_storage': settings.analytics ? 'granted' : 'denied',
        'ad_storage': settings.marketing ? 'granted' : 'denied',
        'ad_user_data': settings.marketing ? 'granted' : 'denied',
        'ad_personalization': settings.marketing ? 'granted' : 'denied',
      });
    }
  };

  const handleAcceptAll = () => { saveConsent({ necessary: true, analytics: true, marketing: true }); };
  const handleRejectAll = () => { saveConsent({ necessary: true, analytics: false, marketing: false }); };
  const handleSaveSelection = () => { saveConsent(consent); };

  const saveConsent = (settings: ConsentSettings) => {
    try {
      localStorage.setItem('crown_cookie_consent', JSON.stringify(settings));
    } catch (e) {}
    applyGoogleConsent(settings);
    setIsVisible(false);
  };

  const toggleToggle = (type: 'analytics' | 'marketing') => {
    setConsent(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cookie-modal"
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[99999] p-4 md:p-6 flex justify-center pointer-events-none"
        >
          <div className="bg-white rounded-3xl shadow-[0_10px_60px_rgba(0,0,0,0.3)] border border-gray-100 w-full max-w-4xl pointer-events-auto overflow-hidden flex flex-col">

            {!showDetails ? (
              <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center flex-shrink-0 border border-sky-100">
                    <Cookie className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{t('bannerTitle')}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                      {t('bannerDesc')}
                      <Link href={`${p}/cookie-tajekoztato`} className="text-sky-600 font-bold hover:underline ml-1">{t('bannerLink')}</Link>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                  <button onClick={() => setShowDetails(true)} className="px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm border border-gray-200 flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" /> {t('settingsBtn')}
                  </button>
                  <button onClick={handleRejectAll} className="px-6 py-3 bg-white text-sky-700 border border-sky-200 font-bold rounded-xl hover:bg-sky-50 transition-colors text-sm">
                    {t('necessaryOnly')}
                  </button>
                  <button onClick={handleAcceptAll} className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 text-sm flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> {t('acceptAll')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="bg-gray-50 p-6 md:p-8 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('settingsTitle')}</h3>
                    <p className="text-gray-500 text-sm">{t('settingsSubtitle')}</p>
                  </div>
                  <button onClick={() => { setIsVisible(false); setShowDetails(false); }} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto">
                  <div className="flex gap-4 items-start pb-6 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-gray-900">{t('necessaryTitle')}</h4>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">{t('alwaysActive')}</span>
                      </div>
                      <p className="text-sm text-gray-500">{t('necessaryDesc')}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start pb-6 border-b border-gray-100">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${consent.analytics ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-gray-900">{t('analyticsTitle')}</h4>
                        <button onClick={() => toggleToggle('analytics')} className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${consent.analytics ? 'bg-sky-600' : 'bg-gray-300'}`}>
                          <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${consent.analytics ? 'transform translate-x-6' : ''}`} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">{t('analyticsDesc')}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${consent.marketing ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Cookie className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-gray-900">{t('marketingTitle')}</h4>
                        <button onClick={() => toggleToggle('marketing')} className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${consent.marketing ? 'bg-sky-600' : 'bg-gray-300'}`}>
                          <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${consent.marketing ? 'transform translate-x-6' : ''}`} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">{t('marketingDesc')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-end items-center">
                  <button onClick={handleAcceptAll} className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    {t('acceptAllBtn')}
                  </button>
                  <button onClick={handleSaveSelection} className="w-full sm:w-auto px-8 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" /> {t('saveSelectionBtn')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
