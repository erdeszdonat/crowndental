'use client';

import React, { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CookieBanner from "@/components/CookieBanner";
import LanguageWelcome from '@/components/LanguageWelcome';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const isStudio = pathname?.includes('/studio') || pathname?.includes('/admin');

  if (isStudio) {
    return (
      <main className="w-full h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navigation />
      <LanguageWelcome />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
