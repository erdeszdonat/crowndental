'use client';
import Link from 'next/link';
import examples from '@/lib/vouchers/examples.json';
import Image from 'next/image';
import sample from '@/prototypes/karacsonyi-utalvanyok/teli-mese-a5.webp';
import { useState, useEffect, type FormEvent } from 'react';
export function ReturnNotice() {
  useEffect(() => {
    sessionStorage.removeItem('crown-voucher-checkout');
  }, []);
  return (
    <div>
      <h2 className="text-xl">Visszaérkezett a fizetési oldalról.</h2>
      <p>
        Sikeres fizetés után e-mailben küldjük az utalványt vagy az átvétel
        részleteit. A számla külön levélben érkezik a Számlázz.hu-tól.
      </p>
      <Link href="/karacsonyi-utalvanyok">Új utalvány vásárlása</Link>
    </div>
  );
}
export default function Purchase({ salesOpen }: { salesOpen: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  const [preset, setPreset] = useState('60000'),
    [custom, setCustom] = useState('60000');
  const [delivery, setDelivery] = useState('email'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const amount = Number(preset === 'custom' ? custom : preset);
  const example = examples.filter(item => item.treatmentPrice <= amount).at(-1);
  const [business, setBusiness] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  async function buy(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !salesOpen) return;
    setError('');
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const billing = {
        business,
        ...Object.fromEntries(
          [
            'name',
            'email',
            'country',
            'postalCode',
            'city',
            'line1',
            'taxNumber',
          ].map((key) => [key, form.get(key)]),
        ),
      };
      const nameOnVoucher = recipientName.trim().normalize('NFC').replace(/ +/g, ' ');
      const bytes = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(JSON.stringify(nameOnVoucher ? [billing, nameOnVoucher] : billing)),
      );
      const billingHash = Array.from(new Uint8Array(bytes)).join('.');
      const previous = JSON.parse(
        sessionStorage.getItem('crown-voucher-checkout') || 'null',
      );
      const attempt =
        previous?.amount === amount &&
        previous?.delivery === delivery &&
        previous?.billingHash === billingHash
          ? previous.attempt
          : crypto.randomUUID();
      sessionStorage.setItem(
        'crown-voucher-checkout',
        JSON.stringify({ attempt, amount, delivery, billingHash }),
      );
      const response = await fetch('/api/utalvany/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, delivery, attempt, billing, recipientName }),
      });
      if (response.status === 409)
        sessionStorage.removeItem('crown-voucher-checkout');
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(
          result?.error ||
            'A fizetési oldal nem nyílt meg. Kérjük, próbálja újra.',
        );
        setBusy(false);
        return;
      }
      location.assign((await response.json()).url);
    } catch {
      setError('A fizetési oldal nem nyílt meg. Kérjük, próbálja újra.');
      setBusy(false);
    }
  }
  return (
    <>
    <section className="crown-home-hero">
      <div className="crown-container crown-hero-grid">
        <div><h1>Karácsonyi <span>ajándékutalvány</span></h1>
          <p>Válasszon összeget, és ha szeretné, írja rá a megajándékozott nevét. Az utalvány bármelyik Crown Dental rendelőben felhasználható.</p>
          <a className="crown-button" href="#utalvany-vasarlas">Utalvány összeállítása <span aria-hidden="true">↓</span></a>
        </div>
        <div className="voucher-art">
          <Image src={sample} alt="A Crown Dental A5-ös karácsonyi ajándékutalványa" sizes="(max-width: 940px) 90vw, 530px" priority />
          <svg viewBox="0 0 595.276 419.528" aria-hidden="true">
            <text x="39.685" y="262" fontSize={Math.min(17, 370 / Math.max(1,recipientName.trim().length))}>{recipientName.trim()}</text>
            <text x="526" y="262" textAnchor="end" fontSize="19">{amount > 0 ? amount.toLocaleString('hu-HU') : ''}</text>
          </svg>
        </div>
      </div>
    </section>
    <div className="crown-container voucher-grid" id="utalvany-vasarlas">
    <form
      method="post"
      action={salesOpen ? '/api/utalvany/checkout' : undefined}
      onSubmit={buy}
      className="voucher-form"
    >
      <label>Kinek szól az utalvány? <span className="voucher-optional">(nem kötelező)</span>
        <input name="recipientName" type="text" maxLength={60} autoComplete="off"
          value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="A megajándékozott neve" />
      </label>
      <label>
        Az utalvány értéke
        <select
          className="mt-2 block w-full rounded border p-3"
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
        >
          {examples.map(({amount: a}) => (
            <option key={a} value={a}>
              {a.toLocaleString('hu-HU')} Ft
            </option>
          ))}
          <option value="custom">Egyéb összeg</option>
        </select>
      </label>
      {preset === 'custom' && (
        <label>
          Egyedi összeg forintban
          <input
            className="mt-2 block w-full rounded border p-3"
            type="number"
            min={10000}
            max={500000}
            step={5000}
            required
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        </label>
      )}
      <p aria-live="polite">{Number.isInteger(amount) && amount >= 10000 && amount <= 500000 && amount % 5000 === 0
        ? 'Példa a felhasználásra: ' + example?.description
        : '10 000 és 500 000 Ft közötti összeget adjon meg, 5 000 Ft-os lépésekben.'} <Link href="/kezelesek" className="underline">Aktuális árlista</Link></p>
      <fieldset className="grid gap-2">
        <legend className="mb-2">Hogyan szeretné átvenni?</legend>
        <label>
          <input
            type="radio"
            name="delivery"
            checked={delivery === 'email'}
            onChange={() => setDelivery('email')}
          />{' '}
          Nyomtatható A5-ös utalvány e-mailben
        </label>
        <label>
          <input
            type="radio"
            name="delivery"
            checked={delivery === 'pickup'}
            onChange={() => setDelivery('pickup')}
          />{' '}
          Nyomtatott utalvány személyesen
        </label>
      </fieldset>
      {delivery === 'pickup' && (
        <p>
          A nyomtatott utalványt a fizetést követő harmadik naptári naptól
          veheti át belvárosi rendelőnkben, nyitvatartási időben
          (2500 Esztergom, Petőfi Sándor utca 11.). Az első átvételi napot e-mailben küldjük.
        </p>
      )}
      <p>
        Az utalvány a fizetéstől számított egy évig érvényes adómentes fogászati kezelésre.
        Bármelyik Crown Dental rendelőben egyszer váltható be.
      </p>
      <p>
        <Link className="underline" href="/aszf#dijazas">Vásárlási feltételek</Link>
        {' · '}
        <Link className="underline" href="/adatkezeles">Adatkezelési tájékoztató</Link>
      </p>
      {salesOpen && <fieldset className="grid gap-3">
        <legend className="mb-2">Számlázási adatok</legend>
        <p>
          Erre az e-mail-címre küldjük a számlát és az utalványt vagy a
          személyes átvétel részleteit.
        </p>
        <label>
          <input
            type="checkbox"
            checked={business}
            onChange={(e) => setBusiness(e.target.checked)}
          />{' '}
          Céges számlát kérek
        </label>
        {[
          [
            'name',
            business ? 'Cégnév' : 'Számlázási név',
            business ? 'organization' : 'name',
            180,
          ],
          ['email', 'E-mail-cím', 'email', 254],
          ['country', 'Országkód (pl. HU vagy SK)', 'country', 2],
          ['postalCode', 'Irányítószám', 'postal-code', 20],
          ['city', 'Település', 'address-level2', 100],
          ['line1', 'Utca, házszám, emelet, ajtó', 'address-line1', 240],
          ...(business ? [['taxNumber', 'Adószám', 'off', 40]] : []),
        ].map(([key, label, complete, limit]) => (
          <label key={key}>
            {label}
            <input
              className="mt-1 block w-full rounded border p-3"
              name={String(key)}
              type={key === 'email' ? 'email' : 'text'}
              autoComplete={String(complete)}
              maxLength={Number(limit)}
              defaultValue={key === 'country' ? 'HU' : undefined}
              required
            />
          </label>
        ))}
      </fieldset>}
      {salesOpen ? <button
        type="submit"
        className="crown-button"
        disabled={busy || !ready}
      >
        {busy
          ? 'Átirányítás…'
          : 'Tovább a fizetéshez · ' + amount.toLocaleString('hu-HU') + ' Ft'}
      </button> : <p role="status"><strong>Az online vásárlás hamarosan indul.</strong> Addig itt összeállíthatja az utalványát.</p>}
      <noscript>
        A biztonságos fizetéshez engedélyezze a JavaScriptet a böngészőben.
      </noscript>
      {error && <p role="alert">{error}</p>}
    </form>
    <aside className="voucher-summary"><h2>Az Ön ajándéka</h2>
      <strong>{amount.toLocaleString('hu-HU')} Ft</strong>
      {recipientName.trim() && <p>{recipientName.trim()} részére</p>}
      <p>{delivery === 'pickup' ? 'Nyomtatott utalvány a belvárosi rendelőben' : 'Nyomtatható A5-ös PDF e-mailben'}</p>
      <hr/><p>A fizetéstől számított egy évig érvényes. Bármelyik Crown Dental rendelőben egyszer váltható be.</p>
    </aside></div></>
  );
}
