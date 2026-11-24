import Link from 'next/link';
import { useLocale } from 'next-intl';
import { itopCopy } from '@/lib/itop';
import { localePrefix, normalizeLocale } from '@/lib/seo';

export default function ItopAftercareLink() {
  const locale = normalizeLocale(useLocale());
  const copy = itopCopy[locale];
  return <aside className="crown-container my-10">
    <div className="rounded-2xl bg-sky-50 p-6 sm:p-8">
      <h2 className="text-2xl font-bold">{copy.restoration}</h2>
      <p className="my-3 max-w-3xl leading-relaxed">{copy.restorationText}</p>
      <Link className="font-semibold text-sky-800 underline underline-offset-4" href={localePrefix(locale) + '/kezelesek/itop'}>{copy.title}</Link>
    </div>
  </aside>;
}
