'use client';
import { useState, useEffect, useCallback, type FormEvent } from 'react';
type Order = {
  id: string;
  amount: number;
  delivery: 'email' | 'pickup';
  refunded: boolean;
  collected_at: string | null;
  redeemed_at: string | null;
  expiry: string;
  pickup_from: string | null;
  voucher_jobs: {
    kind: string;
    state: string;
    issue: string | null;
    provider_id: string | null;
  }[];
};
const states: Record<string, string> = {
  done: 'Visszaigazolva',
  pending: 'Küldésre vár',
  working: 'Feldolgozás alatt',
  review: 'Kézi ellenőrzés szükséges',
};
async function call(action: string, fields: object = {}) {
  const response = await fetch('/api/admin/utalvanyok', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...fields }),
  });
  if (!response.ok)
    throw new Error(
      response.status === 404
        ? 'Nincs ilyen utalvány.'
        : response.status === 409
          ? 'A művelet már nem végezhető el.'
          : 'A művelet nem sikerült.',
    );
  return response;
}
export default function Vouchers({ redemptionOnly }: { redemptionOnly: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]),
    [page, setPage] = useState(0),
    [code, setCode] = useState(''),
    [checked, setChecked] = useState(''),
    [info, setInfo] = useState(''),
    [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    if (redemptionOnly) return;
    const rows = await (await call('list', { page })).json();
    setOrders(rows.orders);
  }, [page, redemptionOnly]);
  useEffect(() => {
    refresh().catch(() => setInfo('A lista betöltése sikertelen.'));
  }, [refresh]);
  async function action(type: string, id?: string) {
    setBusy(true);
    try {
      const res = await call(type, { id, code });
      if (type === 'lookup') {
        const data = await res.json();
        setChecked(data.usable ? code : '');
        setInfo(
          data.amount.toLocaleString('hu-HU') +
            ' Ft · ' +
            data.expiry +
            ' · ' +
            (data.usable ? 'Beváltható adómentes fogászati kezelésre.' : 'Nem váltható be.'),
        );
      } else if (type === 'delivery') {
        const labels: Record<string, string> = {
          delivered: 'A címzett levelezőszervere átvette.',
          bounced: 'Visszapattant. Egyeztesse az e-mail-címet a vásárlóval.',
          complained: 'A címzett kéretlen levélnek jelölte.',
          delivery_delayed: 'Késik a kézbesítés.',
          failed: 'Sikertelen küldés.',
          sent: 'A Resend elküldte.',
          opened: 'Megnyitást jelzett a levelező.',
          clicked: 'Kattintást jelzett a levelező.',
          suppressed: 'A szolgáltató letiltotta a kézbesítést.',
        };
        const { status } = await res.json();
        setInfo('CD-' + id + ' · ' + (labels[status] || status));
      } else if (type === 'print') {
        const url = URL.createObjectURL(await res.blob());
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Crown-Dental-A5.pdf';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        setChecked('');
        setInfo(
          type === 'redeem' ? 'Az utalvány beváltva.' : 'Az átadás rögzítve.',
        );
        await refresh();
      }
    } catch (e) {
      setInfo(e instanceof Error ? e.message : 'A művelet nem sikerült.');
      setChecked('');
    } finally {
      setBusy(false);
    }
  }
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Budapest',
    dateStyle: 'short',
  }).format(new Date());
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">{redemptionOnly ? 'Utalvány beváltása' : 'Utalványok'}</h2>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void action('lookup');
        }}
      >
        <label>
          Beváltási kód{' '}
          <input
            className="rounded border p-2"
            disabled={busy}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setChecked('');
              setInfo('');
            }}
            required
          />
        </label>{' '}
        <button disabled={busy}>Ellenőrzés</button>
      </form>
      <p role="status">{info}</p>
      {checked && checked === code && (
        <button disabled={busy} onClick={() => void action('redeem')}>
          Beváltás egyszer, teljes összegben
        </button>
      )}
      {!redemptionOnly && <>
      {orders.map((o) => (
        <article key={o.id} className="rounded-xl border p-4">
          <strong>
            {o.amount.toLocaleString('hu-HU')} Ft ·{' '}
            {o.refunded
              ? 'Visszatérítve'
              : o.redeemed_at
                ? 'Beváltva'
                : 'Lejárat ' + o.expiry}
          </strong>
          <p>CD-{o.id}</p>
          <p>
            {o.delivery === 'email'
              ? 'PDF e-mailben'
              : o.collected_at
                ? 'Nyomtatva átadva'
                : o.refunded || o.redeemed_at || today > o.expiry
                  ? 'Személyes átvétel lezárva'
                  : 'Belvárosi rendelő · Átvétel kezdete: ' + o.pickup_from}
          </p>
          {o.voucher_jobs.map((j) => (
            <p key={j.kind}>
              {j.kind === 'resend' ? 'Resend' : 'Számlázz.hu'} ·{' '}
              {j.issue === 'refund_review'
                ? 'Visszatérítés miatt egyeztetendő'
                : states[j.state]}{' '}
              {j.provider_id || ''}
            </p>
          ))}
          {o.voucher_jobs.some((j) => j.kind === 'resend' && j.provider_id) && (
            <button
              disabled={busy}
              onClick={() => void action('delivery', o.id)}
            >
              Levél kézbesítésének ellenőrzése
            </button>
          )}
          {o.delivery === 'pickup' &&
            !o.refunded &&
            !o.redeemed_at &&
            !o.collected_at &&
            o.pickup_from &&
            today <= o.expiry && (
              <div className="flex gap-4">
                <button
                  disabled={busy}
                  onClick={() => void action('print', o.id)}
                >
                  A5-ös PDF letöltése
                </button>
                <button
                  disabled={busy || today < o.pickup_from}
                  onClick={() => void action('collect', o.id)}
                >
                  Átadtam a nyomtatott példányt
                </button>
              </div>
            )}
        </article>
      ))}
      <div>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Előző
        </button>{' '}
        ·{' '}
        <button disabled={orders.length < 30} onClick={() => setPage(page + 1)}>
          Következő
        </button>
      </div></>}
    </section>
  );
}
