"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  getHygienist,
  HYGIENISTS,
  HYGIENE_TREATMENTS,
  type NfcCard,
  type HygieneTreatmentId,
} from "@/lib/nfcCards";
import { getAppointmentClinic } from "@/lib/appointmentClinics";
import { nfcCopy } from "@/lib/nfcCopy";
import { bookingAnalyticsContext } from "@/lib/firstPartyAnalytics";
import { trackSiteEvent, rememberBookingSource } from "@/lib/siteAnalytics";
import { ANALYTICS_READY_EVENT } from "@/lib/siteAnalytics";

type Locale = keyof typeof nfcCopy;
export default function NfcBookingForm({
  card,
  locale,
}: {
  card: NfcCard;
  locale: Locale;
}) {
  const copy = nfcCopy[locale];
  const clinic = getAppointmentClinic(card.clinicId)!;
  const [treatment, setTreatment] = useState<HygieneTreatmentId | "">("");
  const [person, setPerson] = useState<string>(card.hygienistId || "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ emailSent: boolean } | null>(null);
  const [error, setError] = useState("");
  const lock = useRef(false),
    key = useRef(""),
    started = useRef(false),
    viewed = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const view = () => {
      if (!viewed.current)
        viewed.current = trackSiteEvent("booking_form_view", locale, {
          placement: "nfc_card",
        });
    };
    view();
    window.addEventListener(ANALYTICS_READY_EVENT, view);
    window.addEventListener("crown-measurement-consent", view);
    return () => {
      window.removeEventListener(ANALYTICS_READY_EVENT, view);
      window.removeEventListener("crown-measurement-consent", view);
    };
  }, [locale]);
  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);
  const start = () => {
    if (!started.current)
      started.current = trackSiteEvent("booking_start", locale, {
        placement: "nfc_card",
      });
  };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || done) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    if (!key.current) key.current = `nfc-${crypto.randomUUID()}`;
    rememberBookingSource(window.location.pathname);
    trackSiteEvent("booking_submit", locale, { placement: "nfc_card" });
    try {
      const response = await fetch("/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          city: "Esztergom",
          locale,
          nfcCardId: card.id,
          requestedHygienistId: person || null,
          hygieneTreatmentId: treatment,
          privacyAcknowledged: form.get("privacy") === "on",
          treatment: treatment ? HYGIENE_TREATMENTS[treatment][locale] : "",
          idempotencyKey: key.current,
          analytics: bookingAnalyticsContext(),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw Error("submission_failed");
      setDone({ emailSent: payload.emailSent === true });
      trackSiteEvent("booking_success", locale, { placement: "nfc_card" });
    } catch {
      setError(copy.error);
      trackSiteEvent("booking_error", locale, {
        placement: "nfc_card",
        error: "service",
      });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      id="konzultacio"
      className="scroll-mt-28 self-start rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8"
      aria-labelledby="nfc-form-title"
    >
      {done ? (
        <div
          tabIndex={-1}
          ref={successRef}
          className="py-6 outline-none"
          role="status"
        >
          <CheckCircle2 className="mb-5 h-12 w-12 text-emerald-600" />
          <h2 id="nfc-form-title" className="text-2xl font-bold">
            {copy.success}
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            {copy.successText}
          </p>
          <p className="mt-4 font-semibold">
            {getHygienist(person)?.name || clinic.name} ·{" "}
            {treatment && HYGIENE_TREATMENTS[treatment][locale]}
          </p>
          <p className="mt-2 text-sm text-slate-500">{clinic.address}</p>
          {!done.emailSent && (
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              {copy.receiptFailed}
            </p>
          )}
        </div>
      ) : (
        <>
          <h2 id="nfc-form-title" className="text-2xl font-bold tracking-tight">
            {copy.formTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {copy.formIntro}
          </p>
          <form
            onSubmit={submit}
            onFocusCapture={start}
            onChange={() => {
              if (!lock.current) key.current = "";
            }}
            className="mt-6 space-y-5"
          >
            <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
              <div>
                <label
                  htmlFor="nfc-treatment"
                  className="mb-2 block text-sm font-semibold"
                >
                  {copy.treatment} *
                </label>
                <select
                  id="nfc-treatment"
                  required
                  value={treatment}
                  onChange={(e) =>
                    setTreatment(e.target.value as HygieneTreatmentId)
                  }
                  className="crown-input"
                >
                  <option value="">{copy.choose}</option>
                  {Object.entries(HYGIENE_TREATMENTS).map(([id, t]) => (
                    <option key={id} value={id}>
                      {t[locale]}
                    </option>
                  ))}
                </select>
              </div>
              {card.hygienistId ? (
                <div className="rounded-xl bg-sky-50 p-4 text-sm">
                  <p className="text-slate-500">{copy.selected}</p>
                  <p className="mt-1 font-bold text-sky-900">
                    {getHygienist(card.hygienistId)?.name}
                  </p>
                  <p className="mt-1 text-slate-600">{clinic.name}</p>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="nfc-person"
                    className="mb-2 block text-sm font-semibold"
                  >
                    {copy.person}
                  </label>
                  <select
                    id="nfc-person"
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    className="crown-input"
                  >
                    <option value="">{copy.any}</option>
                    {HYGIENISTS.filter((p) => p.clinicId === card.clinicId).map(
                      (p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}
              {(
                [
                  {
                    id: "name",
                    label: copy.name,
                    type: "text",
                    autocomplete: "name",
                    max: 120,
                  },
                  {
                    id: "phone",
                    label: copy.phone,
                    type: "tel",
                    autocomplete: "tel",
                    max: 40,
                  },
                  {
                    id: "email",
                    label: copy.email,
                    type: "email",
                    autocomplete: "email",
                    max: 254,
                  },
                ] as const
              ).map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={`nfc-${field.id}`}
                    className="mb-2 block text-sm font-semibold"
                  >
                    {field.label} *
                  </label>
                  <input
                    id={`nfc-${field.id}`}
                    name={field.id}
                    type={field.type}
                    autoComplete={field.autocomplete}
                    maxLength={field.max}
                    required
                    className="crown-input"
                  />
                </div>
              ))}
              <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                <input
                  name="privacy"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 shrink-0"
                />
                <span>
                  {copy.privacy}{" "}
                  <a
                    href={`${locale === "hu" ? "" : `/${locale}`}/adatkezeles`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 underline"
                  >
                    {copy.privacyLink}
                  </a>
                </span>
              </label>
              <p className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                {copy.notice}
              </p>
              {error && (
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-4 font-bold text-white transition-colors hover:bg-sky-700"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {copy.busy}
                  </>
                ) : (
                  copy.submit
                )}
              </button>
            </fieldset>
          </form>
        </>
      )}
    </section>
  );
}
