// types/services.ts - Crown Dental szolgáltatás típusok

export interface ServiceMetadata {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  canonicalUrl: string;
  oldUrls: string[]; // Régi URL-ek a redirect-hez
}

export interface ServiceContent {
  heroTitle: string;
  heroSubtitle: string;
  problemStatement: string;
  solutionIntro: string;
  benefits: Benefit[];
  process: ProcessStep[];
  pricing: PricingInfo;
  faq: FAQ[];
  trustSignals: TrustSignal[];
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration?: string;
}

export interface PricingInfo {
  fromPrice: number;
  currency: 'HUF';
  priceNote: string;
  competitorPrice?: number;
  savingsPercent?: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TrustSignal {
  type: 'years' | 'patients' | 'lab' | 'guarantee' | 'rating';
  value: string;
  label: string;
}

export interface Location {
  slug: 'esztergom' | 'budapest';
  name: string;
  address: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours: OpeningHour[];
  services: string[];
  isNew?: boolean;
}

export interface OpeningHour {
  day: string;
  hours: string;
}

// AI Árajánlat elemző típusok
export interface QuoteAnalysis {
  competitorName?: string;
  items: QuoteItem[];
  totalCompetitor: number;
  totalCrownDental: number;
  savings: number;
  savingsPercent: number;
}

export interface QuoteItem {
  treatment: string;
  competitorPrice: number;
  crownDentalPrice: number;
  savings: number;
}

export interface CallbackRequest {
  name: string;
  phone: string;
  email?: string;
  preferredTime?: string;
  location: 'esztergom' | 'budapest';
  source: 'quote-analyzer' | 'contact' | 'service-page';
  quoteAnalysis?: QuoteAnalysis;
}
