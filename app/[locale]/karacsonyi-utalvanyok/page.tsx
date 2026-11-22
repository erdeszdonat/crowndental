import { notFound } from 'next/navigation';
import { salesReady } from '@/lib/vouchers/service';
import Purchase, { ReturnNotice } from './Purchase';
import './voucher.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Karácsonyi fogászati ajándékutalvány | Crown Dental', description: 'Névre szóló fogászati ajándékutalvány 10 000–500 000 Ft értékben, e-mailben vagy nyomtatva az esztergomi Crown Dental rendelőben.', alternates: {canonical: 'https://www.crowndental.hu/karacsonyi-utalvanyok'} };
export default async function Vouchers({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ visszateres?: string }>;
}) {
  if ((await params).locale !== 'hu') notFound();
  return (
    <main lang="hu" className="cd-vouchers">
      {(await searchParams).visszateres === '1' ? (
        <div className="crown-container voucher-return"><h1>Karácsonyi ajándékutalvány</h1><ReturnNotice /></div>
      ) : (
        <Purchase salesOpen={Boolean(salesReady())} />
      )}
    </main>
  );
}
