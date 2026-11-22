import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/lib/seo';
import { salesReady } from '@/lib/vouchers/service';
import { isVoucherLocale, voucherShopNames, voucherShopPath } from '@/lib/vouchers/storefront';
import Purchase, { ReturnNotice } from './Purchase';
import './voucher.css';

export const dynamic = 'force-dynamic';
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ visszateres?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isVoucherLocale(locale)) notFound();
  const hu = SITE_URL + voucherShopPath('hu');
  const sk = SITE_URL + voucherShopPath('sk');
  return {
    title: locale === 'sk' ? 'Vianočná darčeková poukážka na zubné ošetrenie | Crown Dental' : 'Karácsonyi fogászati ajándékutalvány | Crown Dental',
    description: locale === 'sk' ? 'Darujte poukážku na zubné ošetrenie v hodnote od 10 000 do 500 000 HUF. Vyberte si PDF e-mailom alebo osobné prevzatie v Ostrihome.' : 'Névre szóló fogászati ajándékutalvány 10 000–500 000 Ft értékben, e-mailben vagy nyomtatva az esztergomi Crown Dental rendelőben.',
    alternates: { canonical: SITE_URL + voucherShopPath(locale), languages: { 'hu-HU': hu, 'sk-SK': sk, 'x-default': hu } },
  };
}

export default async function Vouchers({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isVoucherLocale(locale)) notFound();
  return (
    <main lang={locale} className="cd-vouchers">
      {(await searchParams).visszateres === '1' ? (
        <div className="crown-container voucher-return">
          <h1>{voucherShopNames[locale]}</h1>
          <ReturnNotice locale={locale} />
        </div>
      ) : (
        <Purchase locale={locale} salesOpen={Boolean(salesReady())} />
      )}
    </main>
  );
}
