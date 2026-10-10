'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { normalizeVeneerLocale, veneerPath, type VeneerLocale } from '@/lib/veneerI18n';

const treatmentPaths = ['/hollywood-mosoly', '/kezelesek/direkt-hej', '/kezelesek/indirekt-hej'] as const;

type SmileCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  cards: Record<(typeof treatmentPaths)[number], { title: string; description: string; linkLabel: string }>;
};

const copyByLocale: Record<VeneerLocale, SmileCopy> = {
  hu: {
    eyebrow: 'Mosolytervezés · Crown Dental',
    title: 'Fogászati héjak és hollywoodi mosoly Esztergomban',
    intro: 'Direkt kompozit vagy saját laborban készülő porcelán héj? Ismerje meg a kezelések közötti különbséget, a fogankénti árakat és a személyes konzultáció menetét.',
    cards: {
      '/hollywood-mosoly': {
        title: 'Hollywoodi mosoly: a lehetőségek',
        description: 'Hasonlítsa össze a két héjtípust, és nézze meg, hogyan indul a személyre szabott mosolytervezés.',
        linkLabel: 'Mosolytervezés és árak',
      },
      '/kezelesek/direkt-hej': {
        title: 'Direkt kompozit héj',
        description: 'A rendelőben, közvetlenül a fog felszínén kialakított kompozit héj. Tudjon meg többet a kezelésről és a fenntartásáról.',
        linkLabel: 'A direkt héj részletei',
      },
      '/kezelesek/indirekt-hej': {
        title: 'Indirekt porcelán héj',
        description: 'Saját fogtechnikai laborunkban készülő kerámia héj, egyénre tervezett színnel és formával. Ismerje meg a kezelés lépéseit.',
        linkLabel: 'A porcelán héj részletei',
      },
    },
  },
  en: {
    eyebrow: 'Smile design · Crown Dental',
    title: 'Hollywood smile in Esztergom',
    intro: 'Direct composite or porcelain veneers from our own laboratory? Explore the differences, per-tooth prices and what happens at a personal consultation.',
    cards: {
      '/hollywood-mosoly': {
        title: 'Hollywood smile: your options',
        description: 'Compare both veneer types and find out how an individual smile plan begins.',
        linkLabel: 'Smile design and prices',
      },
      '/kezelesek/direkt-hej': {
        title: 'Direct composite veneers',
        description: 'Composite shaped directly on the tooth surface in the clinic. Learn about the treatment and ongoing care.',
        linkLabel: 'Explore composite veneers',
      },
      '/kezelesek/indirekt-hej': {
        title: 'Indirect porcelain veneers',
        description: 'Ceramic veneers made in our own dental laboratory, with individually planned colour and shape. Explore the treatment steps.',
        linkLabel: 'Explore porcelain veneers',
      },
    },
  },
  sk: {
    eyebrow: 'Návrh úsmevu · Crown Dental',
    title: 'Hollywood smile v Ostrihome',
    intro: 'Priame kompozitné fazety alebo keramické fazety z vlastného laboratória? Spoznajte rozdiely, ceny za zub a priebeh osobnej konzultácie.',
    cards: {
      '/hollywood-mosoly': {
        title: 'Hollywood smile: vaše možnosti',
        description: 'Porovnajte oba typy faziet a zistite, ako sa začína individuálny návrh úsmevu.',
        linkLabel: 'Návrh úsmevu a ceny',
      },
      '/kezelesek/direkt-hej': {
        title: 'Priame kompozitné fazety',
        description: 'Kompozit sa tvaruje priamo na povrchu zuba v ambulancii. Zistite viac o ošetrení a následnej starostlivosti.',
        linkLabel: 'Podrobnosti o kompozitných fazetách',
      },
      '/kezelesek/indirekt-hej': {
        title: 'Nepriame keramické fazety',
        description: 'Keramické fazety z vlastného zubného laboratória s individuálne navrhnutou farbou a tvarom. Spoznajte jednotlivé kroky ošetrenia.',
        linkLabel: 'Podrobnosti o keramických fazetách',
      },
    },
  },
  de: {
    eyebrow: 'Smile Design · Crown Dental',
    title: 'Hollywood Smile in Esztergom',
    intro: 'Direkte Komposit-Veneers oder Keramik-Veneers aus unserem eigenen Labor? Vergleichen Sie die Möglichkeiten, Preise pro Zahn und den Ablauf einer persönlichen Beratung.',
    cards: {
      '/hollywood-mosoly': {
        title: 'Hollywood Smile: Ihre Möglichkeiten',
        description: 'Vergleichen Sie beide Veneer-Arten und erfahren Sie, wie eine individuelle Planung Ihres Lächelns beginnt.',
        linkLabel: 'Smile Design und Preise',
      },
      '/kezelesek/direkt-hej': {
        title: 'Direkte Komposit-Veneers',
        description: 'Komposit wird in der Praxis direkt auf der Zahnoberfläche geformt. Erfahren Sie mehr über die Behandlung und die Pflege.',
        linkLabel: 'Mehr über Komposit-Veneers',
      },
      '/kezelesek/indirekt-hej': {
        title: 'Indirekte Keramik-Veneers',
        description: 'Keramik-Veneers aus unserem eigenen Dentallabor mit individuell geplanter Farbe und Form. Lernen Sie die Behandlungsschritte kennen.',
        linkLabel: 'Mehr über Keramik-Veneers',
      },
    },
  },
};

export default function SmileTreatmentsSection() {
  const locale = normalizeVeneerLocale(useLocale());
  const copy = copyByLocale[locale];

  return (
    <section aria-labelledby="home-smile-title" className="bg-white border-t border-gray-100">
      <div className="crown-container">
        <div className="crown-section-heading">
          <p className="crown-eyebrow">{copy.eyebrow}</p>
          <h2 id="home-smile-title">{copy.title}</h2>
          <p className="crown-lead">{copy.intro}</p>
        </div>
        <div className="crown-cards-grid">
          {treatmentPaths.map(path => {
            const card = copy.cards[path];
            return (
              <Link key={path} href={veneerPath(locale, path)} prefetch={false} className="crown-treatment-card">
                <div className="crown-treatment-body">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="crown-treatment-bottom">
                    <span>{card.linkLabel}<ArrowUpRight size={18} className="shrink-0" aria-hidden="true" /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
