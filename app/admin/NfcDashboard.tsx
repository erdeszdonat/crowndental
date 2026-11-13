"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Copy, Download, Loader2, RefreshCw } from "lucide-react";
import {
  NFC_CARDS,
  getNfcCard,
  getHygienist,
  HYGIENE_TREATMENTS,
  type HygieneTreatmentId,
} from "@/lib/nfcCards";
import { getAppointmentClinic } from "@/lib/appointmentClinics";
import { presetRange, localDay, type DateRange } from "@/lib/analyticsDates";
import { nfcConversion, type NfcReport } from "@/lib/nfcReport";
const n = (v: number) => Number(v || 0).toLocaleString("hu-HU");
const url = (id: string) => `https://www.crowndental.hu/kartya/${id}`;
const presets = [
  ["today", "Ma"],
  ["yesterday", "Tegnap"],
  ["7d", "Utolsó 7 nap"],
  ["last_week", "Előző hét"],
  ["this_month", "Ez a hónap"],
  ["last_month", "Előző hónap"],
  ["this_year", "Ez az év"],
  ["last_year", "Előző év"],
];
function download(report: NfcReport) {
  const rows = [
    [
      "Kártya",
      "Link",
      "Megnyitás",
      "Egyedi látogató",
      "Mért látogatás",
      "Foglaló megkezdése",
      "Időpontkérés",
      "Visszaigazolt / egyeztetett",
      "Mért konverzió %",
    ],
    ...report.cards.map((c) => [
      getNfcCard(c.id)?.name || c.id,
      url(c.id),
      c.views,
      c.visitors,
      c.sessions,
      c.starts,
      c.requests,
      c.confirmed,
      nfcConversion(c) ?? "",
    ]),
  ];
  const blob = new Blob(
    [
      "\ufeff" +
        rows
          .map((row) =>
            row
              .map((value) => '"' + String(value).replaceAll('"', '""') + '"')
              .join(";"),
          )
          .join("\r\n"),
    ],
    { type: "text/csv;charset=utf-8" },
  );
  const href = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = href;
  a.download = `crown-nfc-${report.range.from}-${report.range.to}.csv`;
  a.click();
  URL.revokeObjectURL(href);
}
export function NfcReportView({ report }: { report: NfcReport }) {
  const [copied, setCopied] = useState("");
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [
            "Kártyalink-megnyitás",
            report.cards.reduce((s, c) => s + c.views, 0),
          ],
          [
            "Beérkezett időpontkérés",
            report.cards.reduce((s, c) => s + c.requests, 0),
          ],
          [
            "Visszaigazolt / egyeztetett",
            report.cards.reduce((s, c) => s + c.confirmed, 0),
          ],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {n(Number(value))}
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              {[
                "Kártya",
                "Megnyitás",
                "Egyedi látogató",
                "Mért látogatás",
                "Megkezdett foglalás",
                "Időpontkérés",
                "Visszaigazolt / egyeztetett",
                "Mért konverzió",
              ].map((t) => (
                <th key={t} scope="col" className="px-4 py-4">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NFC_CARDS.map((card) => {
              const row = report.cards.find((r) => r.id === card.id);
              if (!row) return null;
              const conversion = nfcConversion(row);
              return (
                <tr key={card.id} className="border-t border-slate-100">
                  <th scope="row" className="px-4 py-5 font-semibold">
                    <a
                      href={url(card.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-700"
                    >
                      {card.name}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <p className="mt-1 text-xs font-normal text-slate-500">
                      {getAppointmentClinic(card.clinicId)?.name}
                    </p>
                  </th>
                  {[
                    row.views,
                    row.visitors,
                    row.sessions,
                    row.starts,
                    row.requests,
                    row.confirmed,
                  ].map((v, i) => (
                    <td key={i} className="px-4 py-5 tabular-nums">
                      {n(v)}
                    </td>
                  ))}
                  <td className="px-4 py-5 font-semibold">
                    {conversion === null
                      ? "—"
                      : `${conversion.toLocaleString("hu-HU", { maximumFractionDigits: 1 })}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl bg-sky-50 p-5 text-sm leading-relaxed text-slate-700">
        <p>
          A megnyitás és a látogatási adatok csak mérési hozzájárulással
          rögzülnek. Az időpontkérések kártyája és választott kollégája
          hozzájárulás nélküli analitika esetén is megmarad a foglaláson.
        </p>
        <p className="mt-2">
          Mért konverzió: az időszakban kártyaoldalt megnyitó, majd ugyanabban
          az időszakban arról kérést beküldő mért munkamenetek aránya. A
          megosztott link megnyitása is beleszámít; ez nem a fizikai
          NFC-érintések száma. A különleges egyeztetés visszaigazoltnak számít,
          a rejtett rekordok nem szerepelnek. Az időszak az időpontkérés
          beérkezésére vonatkozik, Budapest időzónájában.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold">Kihez jelentkeztek?</h3>
          {report.hygienists.length ? (
            report.hygienists.map((row) => (
              <p
                key={row.id || "any"}
                className="mt-3 flex justify-between gap-4 text-sm"
              >
                <span>
                  {getHygienist(row.id)?.name || "Legkorábbi elérhető kolléga"}
                </span>
                <strong>
                  {n(row.requests)} kérés · {n(row.confirmed)} egyeztetett
                </strong>
              </p>
            ))
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Még nincs kártyáról érkezett kérés ebben az időszakban.
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold">Kezelések kártyánként</h3>
          {report.treatments.map((row) => (
            <p
              key={row.card_id + row.treatment}
              className="mt-3 flex justify-between gap-4 text-sm"
            >
              <span>
                {getNfcCard(row.card_id)?.name} ·{" "}
                {HYGIENE_TREATMENTS[row.treatment as HygieneTreatmentId]?.hu ||
                  row.treatment}
              </span>
              <strong>{n(row.requests)}</strong>
            </p>
          ))}
          {!report.treatments.length && (
            <p className="mt-3 text-sm text-slate-500">
              A beérkező kérelmek kezelési bontása itt jelenik meg.
            </p>
          )}
        </div>
      </div>
      <details className="rounded-2xl border border-slate-200 bg-white p-5">
        <summary className="cursor-pointer font-bold">
          További mutatók és programozható kártyalinkek
        </summary>
        <div className="mt-4 space-y-4">
          {NFC_CARDS.map((card) => {
            const row = report.cards.find((r) => r.id === card.id);
            return (
              <div key={card.id} className="border-t border-slate-100 pt-4">
                <p className="font-semibold">{card.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={url(card.id)}
                    className="break-all text-sm text-sky-700"
                  >
                    {url(card.id)}
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(url(card.id));
                        setCopied(card.id);
                      } catch {
                        setCopied("error");
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs"
                  >
                    <Copy className="h-3 w-3" />
                    {copied === card.id ? "Másolva" : "Link másolása"}
                  </button>
                </div>
                {row && (
                  <p className="mt-2 text-xs text-slate-500">
                    Telefonkattintás: {n(row.phoneClicks)} · Sztornózott kérés:{" "}
                    {n(row.cancelled)} · Mért foglalási munkamenet:{" "}
                    {n(row.bookedSessions)} · Aktív idő / mért látogatás:{" "}
                    {row.sessions
                      ? `${Math.round(row.engagementMs / row.sessions / 1000)} mp`
                      : "—"}
                  </p>
                )}
              </div>
            );
          })}
          {copied === "error" && (
            <p role="status" className="text-sm text-amber-700">
              A linket jelölje ki és másolja ki kézzel.
            </p>
          )}
        </div>
      </details>
    </div>
  );
}
export default function NfcDashboard() {
  const [draft, setDraft] = useState<DateRange>(() => presetRange("30d")),
    [range, setRange] = useState(draft),
    [revision, setRevision] = useState(0);
  const [report, setReport] = useState<NfcReport | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setReport(null);
    void (async () => {
      try {
        const response = await fetch("/api/admin/nfc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(range),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw Error(data.error || "Betöltési hiba.");
        setReport(data);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Betöltési hiba.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [range, revision]);
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">NFC-kártyák</h2>
          <p className="mt-1 text-sm text-slate-500">
            Melyik kártya hozza az időpontkéréseket?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={() => setRevision((v) => v + 1)}
            className="rounded-xl border bg-white p-3"
            aria-label="Kártyakimutatás frissítése"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            disabled={!report || loading}
            onClick={() => report && download(report)}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            CSV letöltése
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap gap-2">
          {presets.map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                const next = presetRange(id);
                setDraft(next);
                setRange(next);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-sky-50"
            >
              {label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setRange({ ...draft });
          }}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <label className="text-sm">
            Ettől
            <input
              type="date"
              required
              max={localDay()}
              value={draft.from}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
              className="mt-1 block rounded-lg border p-2"
            />
          </label>
          <label className="text-sm">
            Eddig
            <input
              type="date"
              required
              min={draft.from}
              max={localDay()}
              value={draft.to}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
              className="mt-1 block rounded-lg border p-2"
            />
          </label>
          <button className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
            Időszak alkalmazása
          </button>
        </form>
      </div>
      {loading ? (
        <div
          role="status"
          className="flex items-center gap-2 py-8 text-sm text-slate-500"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          Kártyakimutatás betöltése…
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </p>
      ) : (
        report && <NfcReportView report={report} />
      )}
    </section>
  );
}
