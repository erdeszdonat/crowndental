"use client";

import {
  ArrowDownWideNarrow,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { AdminListOptions } from "@/lib/adminLists";

export default function AdminListFilters({
  value,
  onChange,
  total,
  visible,
  statuses,
  clinics,
  clinic = "all",
  onClinicChange,
}: {
  value: AdminListOptions;
  onChange: (value: AdminListOptions) => void;
  total: number;
  visible: number;
  statuses?: { value: string; label: string }[];
  clinics?: string[];
  clinic?: string;
  onClinicChange?: (value: string) => void;
}) {
  const filtered =
    value.query.trim() || value.status !== "all" || clinic !== "all";
  return (
    <section
      aria-label="Lista keresése és szűrése"
      className="mb-5 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/20 sm:p-5"
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Keresés a listában"
          placeholder="Név, e-mail, telefonszám…"
          value={value.query}
          onChange={(event) =>
            onChange({ ...value, query: event.target.value })
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-base text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
        />
        {value.query && (
          <button
            aria-label="Keresés törlése"
            onClick={() => onChange({ ...value, query: "" })}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {(statuses || clinics) && (
        <div className="flex flex-wrap items-center gap-2">
          {statuses && (
            <label className="min-w-0 flex-1 basis-24">
              <span className="sr-only">Státusz szűrése</span>
              <select
                aria-label="Státusz szűrése"
                value={value.status}
                onChange={(event) =>
                  onChange({ ...value, status: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
              >
                <option value="all">Státusz</option>
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {clinics && onClinicChange && (
            <label className="min-w-0 flex-1 basis-24">
              <span className="sr-only">Rendelő szűrése</span>
              <select
                aria-label="Rendelő szűrése"
                value={clinic}
                onChange={(event) => onClinicChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
              >
                <option value="all">Rendelő</option>
                {clinics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={() =>
              onChange({ ...value, oldestFirst: !value.oldestFirst })
            }
            aria-label={
              value.oldestFirst
                ? "Rendezés: legrégebbi elöl. Váltás a legújabbra."
                : "Rendezés: legújabb elöl. Váltás a legrégebbire."
            }
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600"
          >
            <ArrowDownWideNarrow className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {value.oldestFirst ? "Legrégebbi elöl" : "Legújabb elöl"}
            </span>
          </button>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <p role="status" aria-live="polite">
          {filtered
            ? `${visible} találat · ${total} bejegyzésből`
            : `${total} bejegyzés`}
        </p>
        {!statuses && !clinics ? (
          <button
            onClick={() =>
              onChange({ ...value, oldestFirst: !value.oldestFirst })
            }
            className="flex items-center gap-1.5 font-medium text-slate-600"
            aria-label={
              value.oldestFirst
                ? "Rendezés: legrégebbi elöl. Váltás a legújabbra."
                : "Rendezés: legújabb elöl. Váltás a legrégebbire."
            }
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5" aria-hidden="true" />
            {value.oldestFirst ? "Legrégebbi elöl" : "Legújabb elöl"}
          </button>
        ) : filtered ? (
          <button
            onClick={() => {
              onChange({ query: "", status: "all", oldestFirst: false });
              onClinicChange?.("all");
            }}
            className="flex items-center gap-1.5 font-semibold text-sky-800"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" /> Szűrők törlése
          </button>
        ) : (
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />{" "}
            {value.oldestFirst ? "Legrégebbiek elöl" : "Legújabbak elöl"}
          </span>
        )}
      </div>
    </section>
  );
}
