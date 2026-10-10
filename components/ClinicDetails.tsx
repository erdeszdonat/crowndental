import Link from 'next/link';
import { CLINIC_LOCATIONS, clinicCopy } from '@/lib/clinicLocations';
import type { SupportedLocale } from '@/lib/seo';

export default function ClinicDetails({ locale, index, showDetails = true }: { locale: SupportedLocale; index: 0 | 1; showDetails?: boolean }) {
  const clinic = CLINIC_LOCATIONS[index];
  const copy = clinicCopy[locale];
  const prefix = locale === 'hu' ? '' : `/${locale}`;
  return (
    <div className="space-y-3 text-gray-700">
      <address className="not-italic font-semibold">{clinic.address}</address>
      <dl className="space-y-2 text-sm">
        <div><dt className="inline">{copy.weekdays}: </dt><dd className="inline font-semibold">{clinic.weekdayOpens}–18:00</dd></div>
        <div><dt className="inline">{copy.weekend}: </dt><dd className="inline font-semibold">08:00–20:00</dd></div>
      </dl>
      <p className="text-sm">{index === 1 ? copy.freeParking : copy.paidParking} · {copy.accessible}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-3 pt-2 font-semibold text-sky-700">
        <a href={clinic.mapUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{copy.directions}</a>
        {showDetails && <Link href={`${prefix}/${clinic.path}`} className="underline underline-offset-4">{copy.details}</Link>}
      </div>
    </div>
  );
}
