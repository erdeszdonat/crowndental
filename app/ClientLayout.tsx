'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

// FONTOS: Pontosan egyezzen a fájlnevek kis/nagybetűs írásmódja!
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CookieBanner from "@/components/CookieBanner";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Ellenőrizzük, hogy a Sanity Studio vagy Admin oldalon vagyunk-e
  const isStudio = pathname?.startsWith('/studio') || pathname?.startsWith('/admin');

  if (isStudio) {
    // Ha a Stúdióban vagyunk, CSAK magát a Sanity-t rendereljük ki 100% szélességben
    return (
      <main className="w-full h-screen">
        {children}
      </main>
    );
  }

  // Ha a normál weboldalon vagyunk, mindent megjelenítünk
  return (
    <>
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {/* EZ A KOMPONENS JELENÍTI MEG A SÜTISÁVOT */}
      <CookieBanner /> 
    </>
  );
}
