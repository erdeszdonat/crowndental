import { Calendar, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { QuoteResult } from '@/lib/quotePricing';
import { quoteResultCopy } from '@/lib/quoteCopy';

type Locale = keyof typeof quoteResultCopy;

export default function QuoteComparison({ result, locale, heading, treatmentLabel, originalLabel, children }: {
  result: QuoteResult; locale: Locale; heading: string; treatmentLabel: string; originalLabel: string; children?: ReactNode;
}) {
  const copy = quoteResultCopy[locale];
  const formatter = new Intl.NumberFormat({ hu: 'hu-HU', en: 'en-GB', sk: 'sk-SK', de: 'de-DE' }[locale]);
  const money = (value: number) => `${formatter.format(value)} Ft`;
  const range = (min: number | null, max: number | null) => min === null || max === null
    ? copy.pending : min === 0 && max === 0 ? copy.free : min === max ? money(min) : `${formatter.format(min)}–${formatter.format(max)} Ft`;
  return (
    <div className="bg-white flex flex-col h-full" data-cta-location="quote_result" aria-live="polite">
      <div className="bg-gradient-to-br from-sky-600 to-sky-800 px-6 py-7 text-white text-center">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-200" aria-hidden="true" />
        <h3 className="text-xl font-bold">{heading}</h3>
        <p className="text-sm text-sky-100 mt-2">{copy.title}</p>
        <p className="mt-5 text-sm font-semibold">{copy.total}</p>
        <p className="mt-1 text-2xl sm:text-3xl font-extrabold">{range(result.ourTotalMin, result.ourTotalMax)}</p>
        {result.savingsMin !== null && result.savingsMax !== null && (
          <div className="mt-4 rounded-xl bg-white/10 p-3">
            <p className="text-xs text-sky-50">{copy.saving}</p>
            <p className="mt-1 text-xl font-bold text-emerald-200">{range(result.savingsMin, result.savingsMax)}</p>
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6 flex-1 space-y-5">
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-relaxed text-slate-700">
          {copy.disclaimer}
        </div>
        <div>
          <a href={`${locale === 'hu' ? '' : `/${locale}`}/idopont`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-4 text-center font-bold text-white shadow-lg shadow-sky-600/20 transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700">
            <Calendar className="h-5 w-5 shrink-0" aria-hidden="true" />{copy.book}
          </a>
          <p className="mt-3 text-center text-sm text-slate-600">{copy.next}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead><tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-3 pr-2 font-medium" scope="col">{treatmentLabel}</th>
              <th className="pb-3 px-1 font-medium text-right" scope="col">{originalLabel}</th>
              <th className="pb-3 pl-2 font-bold text-sky-700 text-right" scope="col">Crown Dental</th>
            </tr></thead>
            <tbody>{result.items.map((item, index) => (
              <tr key={`${item.name}-${index}`} className="border-b border-slate-100 align-top">
                <th scope="row" className="py-3 pr-2 font-medium text-slate-800">{item.name}</th>
                <td className="py-3 px-1 text-right text-slate-500">{money(item.competitorPrice)}</td>
                <td className={`py-3 pl-2 text-right font-bold ${item.ourPriceMax === 0 ? 'text-emerald-700' : 'text-sky-700'}`}>
                  {item.includedInPackage ? copy.included : range(item.ourPriceMin, item.ourPriceMax)}
                </td>
              </tr>
            ))}</tbody>
            <tfoot><tr className="border-t-2 border-sky-200 font-bold">
              <th scope="row" className="pt-4 pr-2 text-slate-900">{copy.total}</th>
              <td className="pt-4 px-1 text-right text-slate-600">{money(result.competitorTotal)}</td>
              <td className="pt-4 pl-2 text-right text-sky-800">{range(result.ourTotalMin, result.ourTotalMax)}</td>
            </tr></tfoot>
          </table>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">{copy.details}</p>
        {children}
      </div>
    </div>
  );
}
