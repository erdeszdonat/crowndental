'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

type ConsentSettings = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

type GtagFunction = (...args: unknown[]) => void;
type FbqFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
    fbq?: FbqFunction;
  }
}

const CONSENT_STORAGE_KEY = 'crown_cookie_consent';
const CONSENT_EVENT = 'crown-cookie-consent';
const GOOGLE_TAG_ID = 'G-9BS3P1DC4T';
const GOOGLE_ADS_ID = 'AW-16510822421';

function parseStoredConsent(value: string | null): ConsentSettings | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ConsentSettings>;
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    return null;
  }
}

function ensureGtag(): GtagFunction {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? ((...args: unknown[]) => {
    window.dataLayer?.push(args);
  });
  return window.gtag;
}

export default function ConsentScripts() {
  const [consent, setConsent] = useState<ConsentSettings | null>(null);
  const configuredGoogle = useRef({ analytics: false, marketing: false });

  useEffect(() => {
    setConsent(parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY)));

    const handleConsent = (event: Event) => {
      const customEvent = event as CustomEvent<ConsentSettings>;
      setConsent(customEvent.detail);
    };

    window.addEventListener(CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
  }, []);

  useEffect(() => {
    if (!consent) return;

    const gtag = ensureGtag();
    gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
    });

    if (consent.analytics && !configuredGoogle.current.analytics) {
      gtag('js', new Date());
      gtag('config', GOOGLE_TAG_ID);
      configuredGoogle.current.analytics = true;
    }

    if (consent.marketing && !configuredGoogle.current.marketing) {
      gtag('js', new Date());
      gtag('config', GOOGLE_ADS_ID);
      configuredGoogle.current.marketing = true;
    }

    if (window.fbq) {
      window.fbq('consent', consent.marketing ? 'grant' : 'revoke');
      if (consent.marketing) window.fbq('track', 'PageView');
    }
  }, [consent]);

  if (!consent) return null;

  const googleEnabled = consent.analytics || consent.marketing;

  return (
    <>
      {googleEnabled && (
        <Script
          id="crown-google-tag"
          src={`https://www.googletagmanager.com/gtag/js?id=${consent.analytics ? GOOGLE_TAG_ID : GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
      )}
      {consent.marketing && (
        <Script id="crown-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1245020569792754');fbq('consent','grant');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
