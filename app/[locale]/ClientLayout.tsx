'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CookieBanner from "@/components/CookieBanner";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
