'use client';

import React, { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CookieBanner from "@/components/CookieBanner";
import { MotionConfig } from 'framer-motion';
import MobileContactBar from '@/components/MobileContactBar';
import SiteAnalytics from '@/components/SiteAnalytics';
import { getSiteCopy } from '@/lib/siteCopy';
import '@/app/site-system.css';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const isStudio = pathname?.includes('/studio') || pathname?.includes('/admin');
  const basePath = pathname.replace(/^\/(hu|en|sk|de)(?=\/|$)/, '') || '/';
  const hasContactBar = basePath === '/' || basePath.startsWith('/kezelesek');
  const copy = getSiteCopy(locale);

  if (isStudio) {
    return (
      <main className="w-full h-screen">
        {children}
      </main>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className={`crown-site ${hasContactBar ? 'crown-has-mobile-contact' : ''}`}>
      <a href="#crown-content" className="crown-skip">{copy.skip}</a>
      <Navigation />
      <div id="crown-content" tabIndex={-1} className="flex-1">
        {children}
      </div>
      <Footer />
      {hasContactBar && <MobileContactBar />}
      <SiteAnalytics />
      <CookieBanner />
    </div>
    </MotionConfig>
  );
}
