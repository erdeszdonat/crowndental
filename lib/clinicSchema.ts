import { CLINIC_LOCATIONS, clinicCopy } from '@/lib/clinicLocations';
import { localizedUrl, SITE_URL, type SupportedLocale } from '@/lib/seo';

export function buildLocationSchema(locale: SupportedLocale, index: 0 | 1) {
  const clinic = CLINIC_LOCATIONS[index];
  const copy = clinicCopy[locale];
  return {
    '@context': 'https://schema.org', '@type': 'Dentist',
    '@id': `${SITE_URL}/${clinic.path}#dentist`, name: clinic.name,
    url: localizedUrl(locale, clinic.path), telephone: '+36305892468', email: 'info@crowndental.hu',
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    address: { '@type': 'PostalAddress', streetAddress: clinic.streetAddress, addressLocality: 'Esztergom', postalCode: '2500', addressCountry: 'HU' },
    hasMap: clinic.mapUrl,
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: clinic.weekdayOpens, closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday', 'PublicHolidays'], opens: '08:00', closes: '20:00' },
    ],
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: copy.accessible, value: true },
      { '@type': 'LocationFeatureSpecification', name: copy.freeParking, value: index === 1 },
    ],
  };
}
