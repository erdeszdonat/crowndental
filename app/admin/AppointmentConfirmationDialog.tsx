'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Loader2, Mail, MapPin } from 'lucide-react';
import {
  APPOINTMENT_CLINICS,
  getAppointmentClinic,
  getConsultationImagingNotice,
  type AppointmentClinicId,
} from '@/lib/appointmentClinics';

export type AppointmentConfirmationModalState = {
  appointment: {
    id: string | number;
    name?: string;
    email?: string;
    phone?: string;
    treatment?: string;
    city?: string;
  };
  dateTime: string;
  clinicId: AppointmentClinicId | '';
  step: 'input' | 'review';
  error: string;
};

type Props = {
  state: AppointmentConfirmationModalState;
  busy: boolean;
  displayDateTime: string;
  onChange: (state: AppointmentConfirmationModalState) => void;
  onClose: () => void;
  onReview: () => void;
  onSend: () => void;
};

export default function AppointmentConfirmationDialog({ state, busy, displayDateTime, onChange, onClose, onReview, onSend }: Props) {
  const dialogRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectedClinic = getAppointmentClinic(state.clinicId);
  const imagingNotice = getConsultationImagingNotice(state.clinicId, state.appointment.treatment, 'hu');

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [state.step]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6"
    >
      <motion.form
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-confirmation-title"
        aria-busy={busy}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          if (state.step === 'input') onReview();
          else onSend();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !busy) {
            event.preventDefault();
            onClose();
          }
          if (event.key !== 'Tab') return;
          const candidates = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]') || []);
          const controls = candidates.filter((control) => {
            if (!(control instanceof HTMLInputElement) || control.type !== 'radio') return true;
            const group = candidates.filter((candidate): candidate is HTMLInputElement => candidate instanceof HTMLInputElement && candidate.type === 'radio' && candidate.name === control.name);
            return group.some((radio) => radio.checked) ? control.checked : control === group[0];
          });
          if (!controls.length) {
            event.preventDefault();
            dialogRef.current?.focus();
            return;
          }
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="flex-shrink-0 bg-gradient-to-br from-sky-500 to-slate-950 p-4 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <Calendar className="mt-1 h-6 w-6 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="mb-1 text-xs font-black uppercase tracking-widest text-sky-100">Időpont visszaigazolás</p>
              <h3 id="appointment-confirmation-title" className="text-xl font-black leading-tight sm:text-2xl">
                {state.step === 'input' ? 'Rendelő és pontos időpont' : 'Ellenőrizd a küldés előtt'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-sky-100">A rendelő és a cím a páciens e-mailjébe és naptárába is bekerül.</p>
            </div>
          </div>
        </div>

        <div ref={contentRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-500">Páciens</p>
              <p className="font-black text-slate-950">{state.appointment.name}</p>
              <p className="break-all text-sm text-slate-600">{state.appointment.email}</p>
              <p className="text-sm text-slate-600">{state.appointment.phone}</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <p className="mb-1 text-xs font-black uppercase tracking-widest text-sky-700">Kért kezelés</p>
              <p className="font-black text-slate-950">{state.appointment.treatment || 'Fogászati időpont'}</p>
              <p className="mt-1 text-sm text-slate-600">Kérés helyszíne: {state.appointment.city || 'Nincs megadva'}</p>
            </div>
          </div>

          {state.step === 'input' ? (
            <div className="space-y-5">
              <fieldset disabled={busy} aria-describedby="appointment-clinic-help">
                <legend className="mb-1 text-base font-black text-slate-950">Rendelő kiválasztása <span className="text-red-600">– kötelező</span></legend>
                <p id="appointment-clinic-help" className="mb-3 text-sm text-slate-600">Válaszd ki, hová érkezzen a páciens. Nincs előre kiválasztott rendelő.</p>
                <div className="grid gap-3">
                  {APPOINTMENT_CLINICS.map((clinic) => (
                    <label key={clinic.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors focus-within:ring-4 focus-within:ring-sky-100 ${state.clinicId === clinic.id ? 'border-sky-600 bg-sky-50' : 'border-slate-200 bg-white hover:border-sky-300'}`}>
                      <input
                        type="radio"
                        name="appointmentClinicId"
                        value={clinic.id}
                        required
                        checked={state.clinicId === clinic.id}
                        onChange={() => onChange({ ...state, clinicId: clinic.id, error: '' })}
                        className="mt-1 h-5 w-5 flex-shrink-0 accent-sky-700"
                      />
                      <span className="min-w-0">
                        <span className="block text-base font-black text-slate-950">{clinic.name}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-slate-600">{clinic.address}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className="mb-2 block text-base font-black text-slate-950">Pontos dátum és idő <span className="text-red-600">– kötelező</span></span>
                <input
                  type="datetime-local"
                  name="appointmentDateTime"
                  required
                  disabled={busy}
                  value={state.dateTime}
                  onChange={(event) => onChange({ ...state, dateTime: event.target.value, error: '' })}
                  className="min-h-14 w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-base font-black text-slate-950 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 sm:px-4 sm:text-lg"
                />
              </label>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-sky-300">Visszaigazolandó időpont</p>
              <p className="text-2xl font-black sm:text-3xl">{displayDateTime}</p>
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-white/10 p-4">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-sky-300" aria-hidden="true" />
                <div>
                  <p className="text-lg font-black">{selectedClinic?.name || 'Nincs kiválasztott rendelő'}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200">{selectedClinic?.address}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-200">Ezt a rendelőt, címet és időpontot küldjük el a páciensnek. Az e-mailben Google, Apple és Outlook naptárgomb is lesz.</p>
            </div>
          )}

          {imagingNotice && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-amber-700">Ez a tájékoztatás is szerepel az e-mailben</p>
              <p className="font-black">{imagingNotice.title}</p>
              <p className="mt-2 text-sm leading-relaxed">{imagingNotice.body}</p>
            </div>
          )}

          {state.error && <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</div>}
        </div>

        <div className="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:p-5">
          <button
            type="button"
            disabled={busy}
            onClick={() => state.step === 'input' ? onClose() : onChange({ ...state, step: 'input', error: '' })}
            className="min-h-12 rounded-xl border border-slate-200 px-5 py-3 font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:w-40"
          >
            {state.step === 'input' ? 'Mégsem' : 'Vissza, javítom'}
          </button>
          <button
            type="submit"
            disabled={busy || (state.step === 'review' && !selectedClinic)}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-black text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : state.step === 'review' ? <Mail className="h-5 w-5" aria-hidden="true" /> : null}
            {busy ? 'Küldés folyamatban…' : state.step === 'input' ? 'Tovább az ellenőrzéshez' : 'Igen, visszaigazoló e-mail küldése'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
