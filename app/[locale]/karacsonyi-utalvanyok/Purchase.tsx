'use client';
import Link from 'next/link';
import copy from '@/lib/vouchers/storefront-copy.json';
import { voucherShopPath, type VoucherLocale } from '@/lib/vouchers/storefront';
import examples from '@/lib/vouchers/examples.json';
import Image from 'next/image';
import sample from '@/prototypes/karacsonyi-utalvanyok/teli-mese-a5.webp';
import { useState, useEffect, type FormEvent } from 'react';
export function ReturnNotice({ locale }: { locale: VoucherLocale }) {
  const t = copy[locale];
  useEffect(() => {
    sessionStorage.removeItem('crown-voucher-checkout');
  }, []);
  return (
    <div>
      <h2 className="text-xl">{t.returnTitle}</h2>
      <p>
        {t.returnText}
      </p>
      <Link href={voucherShopPath(locale)}>{t.buyAnother}</Link>
    </div>
  );
}
export default function Purchase({ salesOpen, locale }: { salesOpen: boolean; locale: VoucherLocale }) {
  const t = copy[locale];
  const slovak = locale === 'sk';
  const prefix = slovak ? '/sk' : '';
  const formatValue = (value: number) => value.toLocaleString(slovak ? 'sk-SK' : 'hu-HU');
  const currency = slovak ? 'HUF' : 'Ft';
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
        (previous?.locale ?? 'hu') === locale &&
        previous?.amount === amount &&
        previous?.delivery === delivery &&
        previous?.billingHash === billingHash
          ? previous.attempt
          : crypto.randomUUID();
      sessionStorage.setItem(
        'crown-voucher-checkout',
        JSON.stringify({ attempt, amount, delivery, billingHash, locale }),
      );
      const response = await fetch('/api/utalvany/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, delivery, attempt, billing, recipientName, locale }),
      });
      if (response.status === 409)
        sessionStorage.removeItem('crown-voucher-checkout');
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(
          result?.error ||
            t.error,
        );
        setBusy(false);
        return;
      }
      location.assign((await response.json()).url);
    } catch {
      setError(t.error);
      setBusy(false);
    }
  }
  return (
    <>
    <section className="crown-home-hero">
      <div className="crown-container crown-hero-grid">
        <div><h1>{t.heroLead} <span>{t.heroAccent}</span></h1>
          <p>{t.intro}</p>
          <a className="crown-button" href="#utalvany-vasarlas">{t.configure} <span aria-hidden="true">↓</span></a>
        </div>
        <div className="voucher-art">
          <Image src={sample} alt={t.imageAlt} sizes="(max-width: 940px) 90vw, 530px" priority />
          <svg viewBox="0 0 595.276 419.528" aria-hidden="true">
            <text x="39.685" y="262" fontSize={Math.min(17, 370 / Math.max(1,recipientName.trim().length))}>{recipientName.trim()}</text>
            <text x="526" y="262" textAnchor="end" fontSize="19">{amount > 0 ? formatValue(amount) : ''}</text>
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
      <label>{t.recipient} <span className="voucher-optional">{t.optional}</span>
        <input name="recipientName" type="text" maxLength={60} autoComplete="off"
          value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder={t.recipientPlaceholder} />
      </label>
      <label>
        {t.value}
        <select
          className="mt-2 block w-full rounded border p-3"
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
        >
          {examples.map(({amount: a}) => (
            <option key={a} value={a}>
              {formatValue(a)} {currency}
            </option>
          ))}
          <option value="custom">{t.custom}</option>
        </select>
      </label>
      {preset === 'custom' && (
        <label>
          {t.customLabel}
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
        ? t.example + ': ' + (slovak ? example?.descriptionSk : example?.description)
        : t.amountHint} <Link href={prefix + '/kezelesek'} className="underline">{t.priceList}</Link></p>
      <fieldset className="grid gap-2">
        <legend className="mb-2">{t.delivery}</legend>
        <label>
          <input
            type="radio"
            name="delivery"
            checked={delivery === 'email'}
            onChange={() => setDelivery('email')}
          />{' '}
          {t.emailDelivery}
        </label>
        <label>
          <input
            type="radio"
            name="delivery"
            checked={delivery === 'pickup'}
            onChange={() => setDelivery('pickup')}
          />{' '}
          {t.printDelivery}
        </label>
      </fieldset>
      {delivery === 'pickup' && (
        <p>
          {t.pickupInfo}
        </p>
      )}
      <p>
        {t.validity}
      </p>
      <p>
        <Link className="underline" href={slovak ? '/sk/aszf#poukazky' : '/aszf#dijazas'}>{t.terms}</Link>
        {' · '}
        <Link className="underline" href={prefix + '/adatkezeles'}>{t.privacy}</Link>
      </p>
      {slovak && <p lang="sk">Platba prebieha v maďarských forintoch (HUF). Poukážka aj e-mail s pokynmi sú v maďarčine.</p>}
      {salesOpen && <fieldset className="grid gap-3">
        <legend className="mb-2">{t.billing}</legend>
        <p>
          {t.billingNote}
        </p>
        <label>
          <input
            type="checkbox"
            checked={business}
            onChange={(e) => setBusiness(e.target.checked)}
          />{' '}
          {t.business}
        </label>
        {[
          [
            'name',
            business ? t.company : t.name,
            business ? 'organization' : 'name',
            180,
          ],
          ['email', t.email, 'email', 254],
          ['country', t.country, 'country', 2],
          ['postalCode', t.postalCode, 'postal-code', 20],
          ['city', t.city, 'address-level2', 100],
          ['line1', t.street, 'address-line1', 240],
          ...(business ? [['taxNumber', t.taxNumber, 'off', 40]] : []),
        ].map(([key, label, complete, limit]) => (
          <label key={key}>
            {label}
            <input
              className="mt-1 block w-full rounded border p-3"
              name={String(key)}
              type={key === 'email' ? 'email' : 'text'}
              autoComplete={String(complete)}
              maxLength={Number(limit)}
              defaultValue={key === 'country' ? (slovak ? 'SK' : 'HU') : undefined}
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
          ? t.redirecting
          : t.pay + ' · ' + formatValue(amount) + ' ' + currency}
      </button> : <p role="status"><strong>{t.closedTitle}</strong> {t.closedBody}</p>}
      <noscript>
        {t.javascript}
      </noscript>
      {error && <p role="alert">{error}</p>}
    </form>
    <aside className="voucher-summary"><h2>{t.summary}</h2>
      <strong>{formatValue(amount)} {currency}</strong>
      {recipientName.trim() && <p>{slovak ? 'Pre: ' + recipientName.trim() : recipientName.trim() + ' részére'}</p>}
      <p>{delivery === 'pickup' ? t.pickupSummary : t.emailSummary}</p>
      <hr/><p>{t.summaryTerms}</p>
    </aside></div></>
  );
}
