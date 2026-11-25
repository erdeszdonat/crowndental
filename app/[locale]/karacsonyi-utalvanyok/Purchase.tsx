'use client';
import Link from 'next/link';
import { canMeasure, trackVoucherEvent, VOUCHER_RECEIPT_KEY } from '@/lib/siteAnalytics';
import { startVoucherReturnMeasurement } from '@/lib/vouchers/returnMeasurement';
import copy from '@/lib/vouchers/storefront-copy.json';
import { voucherShopPath, type VoucherLocale } from '@/lib/vouchers/storefront';
import { patientGuideLinks } from '@/lib/patientGuideLinks';
import { isVoucherAmount } from '@/lib/vouchers/amount';
import examples from '@/lib/vouchers/examples.json';
import Image from 'next/image';
import sample from '@/prototypes/karacsonyi-utalvanyok/teli-mese-a5.webp';
import { useState, useEffect, useRef, type FormEvent } from 'react';
export function ReturnNotice({ locale }: { locale: VoucherLocale }) {
  const t = copy[locale];
  useEffect(() => {
    try { sessionStorage.removeItem('crown-voucher-checkout'); } catch { /* Optional browser storage. */ }
    return startVoucherReturnMeasurement();
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
const presetAmounts = [...new Set([...examples.map(example => example.amount), 25_000, 40_000, 50_000])].sort((a, b) => a - b);

export default function Purchase({ salesOpen, locale, initialAmount }: { salesOpen: boolean; locale: VoucherLocale; initialAmount: number }) {
  const t = copy[locale];
  const slovak = locale === 'sk';
  const prefix = slovak ? '/sk' : '';
  const formatValue = (value: number) => value.toLocaleString(slovak ? 'sk-SK' : 'hu-HU');
  const currency = slovak ? 'HUF' : 'Ft';
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  const [preset, setPreset] = useState(presetAmounts.includes(initialAmount) ? String(initialAmount) : 'custom');
  const [custom, setCustom] = useState(String(initialAmount));
  const [delivery, setDelivery] = useState('email'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const amount = Number(preset === 'custom' ? custom : preset);
  const example = examples.filter(item => item.treatmentPrice <= amount).at(-1);
  const [business, setBusiness] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const checkoutAttempt = useRef<{ attempt: string; amount: number; delivery: string; billingHash: string; locale: VoucherLocale } | null>(null);
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
      let previous = checkoutAttempt.current;
      if (!previous) {
        try { previous = JSON.parse(sessionStorage.getItem('crown-voucher-checkout') || 'null'); }
        catch { /* An in-memory attempt still protects retries when storage is blocked. */ }
      }
      const attempt =
        (previous?.locale ?? 'hu') === locale &&
        previous?.amount === amount &&
        previous?.delivery === delivery &&
        previous?.billingHash === billingHash
          ? previous.attempt
          : crypto.randomUUID();
      checkoutAttempt.current = { attempt, amount, delivery, billingHash, locale };
      try { sessionStorage.setItem('crown-voucher-checkout', JSON.stringify(checkoutAttempt.current)); }
      catch { /* Keep the current form usable when storage is blocked. */ }
      const response = await fetch('/api/utalvany/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, delivery, attempt, billing, recipientName, locale }),
      });
      if (response.status === 409) {
        checkoutAttempt.current = null;
        try { sessionStorage.removeItem('crown-voucher-checkout'); } catch { /* No stored attempt. */ }
      }
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(
          result?.error ||
            t.error,
        );
        setBusy(false);
        return;
      }
      const result = await response.json();
      if (canMeasure() && typeof result.receipt === 'string') {
        try {
          if (sessionStorage.getItem(VOUCHER_RECEIPT_KEY) !== result.receipt) {
            sessionStorage.setItem(VOUCHER_RECEIPT_KEY, result.receipt);
            if (result.url.startsWith('https://checkout.stripe.com/')) trackVoucherEvent('begin_checkout', amount);
          }
        } catch { /* Optional measurement must never interrupt payment. */ }
      }
      location.assign(result.url);
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
          {presetAmounts.map(a => (
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
      <p aria-live="polite">{isVoucherAmount(amount)
        ? t.example + ': ' + (slovak ? example?.descriptionSk : example?.description)
        : t.amountHint} <Link href={prefix + '/kezelesek'} className="underline">{t.priceList}</Link></p>
      {locale === 'hu' && <p><Link href={'/blog/' + patientGuideLinks.voucher.slug} className="underline">{patientGuideLinks.voucher.label}</Link></p>}
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
