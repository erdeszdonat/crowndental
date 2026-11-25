import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/lib/seo';
import { salesReady } from '@/lib/vouchers/service';
import Link from 'next/link';
import { suggestedVoucherAmount } from '@/lib/vouchers/amount';
import { isVoucherSeasonOpen, isVoucherLocale, voucherShopNames, voucherShopPath } from '@/lib/vouchers/storefront';
import Purchase, { ReturnNotice } from './Purchase';
import './voucher.css';

export const dynamic = 'force-dynamic';
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ visszateres?: string; osszeg?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isVoucherLocale(locale)) notFound();
  const hu = SITE_URL + voucherShopPath('hu');
  const sk = SITE_URL + voucherShopPath('sk');
  const title = locale === 'sk' ? 'Vianočná darčeková poukážka na zubné ošetrenie | Crown Dental' : 'Karácsonyi fogászati ajándékutalvány | Crown Dental';
  const description = locale === 'sk' ? 'Darujte poukážku na zubné ošetrenie v hodnote od 10 000 do 500 000 HUF. Vyberte si PDF e-mailom alebo osobné prevzatie v Ostrihome.' : 'Névre szóló fogászati ajándékutalvány 10 000–500 000 Ft értékben, e-mailben vagy nyomtatva az esztergomi Crown Dental rendelőben.';
  const image = {
    url: `${SITE_URL}/brand/karacsonyi-utalvany.jpg`,
    width: 1200,
    height: 675,
    alt: voucherShopNames[locale],
  };
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', siteName: 'Crown Dental', locale: locale === 'sk' ? 'sk_SK' : 'hu_HU', url: SITE_URL + voucherShopPath(locale), images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
    alternates: { canonical: SITE_URL + voucherShopPath(locale), languages: { 'hu-HU': hu, 'sk-SK': sk, 'x-default': hu } },
  };
}

export default async function Vouchers({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isVoucherLocale(locale)) notFound();
  const query = await searchParams;
  return (
    <main lang={locale} className="cd-vouchers">
      {query.visszateres === '1' ? (
        <div className="crown-container voucher-return">
          <h1>{voucherShopNames[locale]}</h1>
          <ReturnNotice locale={locale} />
        </div>
      ) : isVoucherSeasonOpen() ? (
        <Purchase key={suggestedVoucherAmount(query.osszeg)} initialAmount={suggestedVoucherAmount(query.osszeg)} locale={locale} salesOpen={Boolean(salesReady())} />
      ) : (
        <section className="crown-container voucher-return">
          <h1>{voucherShopNames[locale]}</h1>
          <p>{locale === 'sk' ? 'Vianočný predaj na rok 2026 sa skončil. Platnosť zakúpenej poukážky nájdete priamo na nej.' : 'A 2026-os karácsonyi utalványok értékesítése lezárult. A megvásárolt utalvány lejárati dátumát az utalványon találja.'}</p>
          <Link href={locale === 'hu' ? '/idopont' : '/sk/idopont'} className="crown-button">{locale === 'sk' ? 'Požiadať o termín' : 'Időpontot kérek'}</Link>
        </section>
      )}
    </main>
  );
}
