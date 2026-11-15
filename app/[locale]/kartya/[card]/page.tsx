import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowDown, MapPin, Sparkles } from "lucide-react";
import {
  getNfcCard,
  getHygienist,
  HYGIENISTS,
  NFC_CARDS,
  HYGIENE_TREATMENTS,
} from "@/lib/nfcCards";
import { getAppointmentClinic } from "@/lib/appointmentClinics";
import { nfcCopy } from "@/lib/nfcCopy";
import { getPublicTeam } from "@/lib/teamServer";
import { localizedTeamText } from "@/lib/team";
import { buildLocalizedMetadata, normalizeLocale } from "@/lib/seo";
import ClinicPhoneLinks from "@/components/ClinicPhoneLinks";
import NfcBookingForm from "./NfcBookingForm";

export const revalidate = 300;
type Props = { params: Promise<{ locale: string; card: string }> };
export function generateStaticParams() {
  return NFC_CARDS.map((card) => ({ card: card.id }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, card: id } = await params;
  const card = getNfcCard(id);
  if (!card) notFound();
  const locale = normalizeLocale(raw);
  const copy = nfcCopy[locale];
  return {
    ...buildLocalizedMetadata({
      locale,
      path: `kartya/${card.id}`,
      title: `${card.name} · ${copy.book} | Crown Dental`,
      description: copy.intro,
    }),
    robots: { index: false, follow: true },
  };
}
const key = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
export default async function CardPage({ params }: Props) {
  const { locale: raw, card: id } = await params;
  const card = getNfcCard(id);
  if (!card) notFound();
  const locale = normalizeLocale(raw),
    copy = nfcCopy[locale],
    person = getHygienist(card.hygienistId),
    clinic = getAppointmentClinic(card.clinicId)!;
  const team = await getPublicTeam().catch(() => []);
  const people = HYGIENISTS.filter((p) => p.clinicId === card.clinicId).map(
    (p) => ({
      ...p,
      profile: team.find(
        (m) => m.role === "dental_hygienist" && key(m.name) === key(p.name),
      ),
    }),
  );
  const profile = people.find((p) => p.id === person?.id)?.profile;
  return (
    <main className="bg-slate-50 pt-24 text-slate-900">
      <section
        className="relative overflow-hidden bg-slate-950 text-white"
        data-cta-location="nfc_card"
      >
        <div
          className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-300">
              Crown Dental · {copy.role}
            </p>
            <p className="mt-6 text-sky-100">{copy.badge}</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {person?.name || card.name}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300">
              {copy.intro}
            </p>
            <div className="mt-6 flex items-start gap-3 text-sm text-slate-200">
              <MapPin
                className="h-5 w-5 shrink-0 text-sky-300"
                aria-hidden="true"
              />
              <div>
                <strong>{clinic.name}</strong>
                <p className="mt-1">{clinic.address}</p>
              </div>
            </div>
            <a
              href="#konzultacio"
              data-booking-cta
              className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-sky-500 px-6 py-4 font-bold text-white transition-colors hover:bg-sky-400"
            >
              {copy.book}
              <ArrowDown className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
          {profile?.photoUrl ? (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/15 bg-slate-800">
              <Image
                src={profile.photoUrl}
                alt={person!.name}
                fill
                sizes="(max-width: 768px) 85vw, 384px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {people.map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-white/15 bg-white/5"
                >
                  {p.profile?.photoUrl && (
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={p.profile.photoUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 42vw, 240px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="p-4 text-sm font-semibold">{p.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:py-16">
        <div>
          <p className="text-sm font-semibold text-sky-700">
            {copy.role} · {card.name}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            {copy.clinicTitle}
          </h2>
          <ul className="mt-6 space-y-3">
            {Object.entries(HYGIENE_TREATMENTS).map(([id, t]) => (
              <li
                key={id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <Sparkles
                  className="h-5 w-5 shrink-0 text-sky-600"
                  aria-hidden="true"
                />
                {t[locale]}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            {copy.serviceNote}
          </p>
          {profile && localizedTeamText(profile.bio, locale) && (
            <details className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer font-semibold">
                {copy.about}
              </summary>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {localizedTeamText(profile.bio, locale)}
              </p>
            </details>
          )}
          <div className="mt-8 rounded-2xl bg-sky-50 p-5">
            <p className="mb-3 font-semibold">{copy.contact}</p>
            <ClinicPhoneLinks />
          </div>
        </div>
        <NfcBookingForm card={card} locale={locale} />
      </div>
    </main>
  );
}
