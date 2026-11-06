"use client";

import { CheckCircle2, Download, Mail, Phone } from "lucide-react";

export type MarketingContact = {
  id?: string;
  email: string;
  name?: string;
  nickname?: string;
  phone?: string;
  clinic?: string;
  source?: string;
  locale?: string;
  consented_at?: string;
  created_at?: string;
};

export default function MarketingContacts({
  records,
  onExport,
}: {
  records: MarketingContact[];
  onExport: () => void;
}) {
  const date = (value?: string) =>
    value
      ? new Date(value).toLocaleDateString("hu-HU", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/20">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Feliratkozók</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            A marketinghez hozzájárult kapcsolatok. Az export az aktuális
            találatokat tartalmazza.
          </p>
        </div>
        <button
          onClick={onExport}
          disabled={records.length === 0}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-40"
        >
          <Download className="h-4 w-4" aria-hidden="true" /> CSV export ·{" "}
          {records.length}
        </button>
      </div>
      {records.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <Mail
            className="mx-auto mb-3 h-7 w-7 text-slate-300"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold text-slate-700">
            Nincs megjeleníthető kapcsolat
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Próbáljon másik keresést, vagy törölje a szűrőket.
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-100 lg:hidden">
            {records.map((contact) => (
              <li key={contact.id || contact.email} className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-semibold text-sky-800">
                    {(contact.name || contact.email).slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-slate-900">
                      {contact.name || "Név nincs megadva"}
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {contact.email}
                    </p>
                  </div>
                  <CheckCircle2
                    className="mt-1 h-4 w-4 shrink-0 text-emerald-500"
                    aria-label="Hozzájárult a marketinghez"
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {contact.clinic && (
                    <span className="rounded-md bg-slate-100 px-2 py-1">
                      {contact.clinic}
                    </span>
                  )}
                  <span className="py-1">
                    {date(contact.consented_at || contact.created_at)}
                  </span>
                  <span className="py-1 uppercase">
                    {contact.locale || "hu"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-sky-800"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" /> E-mail
                  </a>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-sky-800"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" /> Hívás
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[840px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "Név",
                    "E-mail / telefon",
                    "Rendelő",
                    "Forrás",
                    "Feliratkozás",
                  ].map((label) => (
                    <th key={label} className="px-5 py-3 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((contact) => (
                  <tr
                    key={contact.id || contact.email}
                    className="hover:bg-sky-50/30"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {contact.name || "—"}
                      {contact.nickname && (
                        <small className="mt-1 block font-normal text-slate-500">
                          {contact.nickname}
                        </small>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`mailto:${contact.email}`}
                        className="block text-sky-800 hover:underline"
                      >
                        {contact.email}
                      </a>
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="mt-1 block text-slate-500 hover:underline"
                        >
                          {contact.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {contact.clinic || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {contact.source || "—"}
                      <span className="ml-2 uppercase">
                        {contact.locale || "hu"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {date(contact.consented_at || contact.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
