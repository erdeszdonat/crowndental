'use client';
import { useState, useEffect, type FormEvent } from 'react';
type Order = {
  id: string;
  amount: number;
  buyer_name: string | null;
  buyer_email: string | null;
  recipient_name: string | null;
  issued_at: string | null;
  delivery: 'email' | 'pickup';
  refunded: boolean;
  collected_at: string | null;
  redeemed_at: string | null;
  expiry: string | null;
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

const dateTime = new Intl.DateTimeFormat('hu-HU', {
  timeZone: 'Europe/Budapest',
  dateStyle: 'medium',
  timeStyle: 'short',
});
const dateOnly = new Intl.DateTimeFormat('hu-HU', {
  timeZone: 'Europe/Budapest',
  dateStyle: 'medium',
});
const buttonStyle =
  'rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50';

function VoucherCode({ id }: { id: string }) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  async function reveal() {
    setNotice('');
    setLoading(true);
    try {
      const { code } = await (await call('show_code', { id })).json();
      if (code) setValue(code.match(/.{5}/g).join('-'));
      else setNotice('Ehhez a vásárláshoz nem készült beváltási kód.');
    } catch {
      setNotice('A kód betöltése sikertelen. Próbáld újra.');
    } finally {
      setLoading(false);
    }
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setNotice('Kód kimásolva.');
    } catch {
      setNotice('Jelöld ki a kódot, és másold ki kézzel.');
    }
  }

  return (
    <div className="grid gap-2">
      {value ? (
        <div className="flex flex-wrap items-center gap-2">
          <code className="select-all break-all font-mono text-base font-semibold">
            {value}
          </code>
          <button className={buttonStyle} onClick={() => void copy(value)}>
            Másolás
          </button>
          <button
            className={buttonStyle}
            onClick={() => {
              setValue(null);
              setNotice('');
            }}
          >
            Elrejtés
          </button>
        </div>
      ) : (
        <button
          className={buttonStyle + ' justify-self-start'}
          disabled={loading}
          onClick={reveal}
        >
          {loading ? 'Kód betöltése…' : 'Beváltási kód megjelenítése'}
        </button>
      )}
      {notice && (
        <p className="text-sm" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}

type PurchasePageProps = {
  page: number;
  changePage: (page: number) => void;
  busy: boolean;
  action: (type: string, id?: string) => Promise<void>;
  reload: () => void;
};

function PurchasePage({
  page,
  changePage,
  action,
  busy,
  reload,
}: PurchasePageProps) {
  const [result, setResult] = useState<{
    orders: Order[];
    hasMore: boolean;
  } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    call('list', { page })
      .then((res) => res.json())
      .then((data) => {
        if (active) setResult(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [page]);
  if (failed)
    return (
      <div role="alert">
        Az utalványok betöltése sikertelen.{' '}
        <button className={buttonStyle} onClick={reload}>
          Újra
        </button>
      </div>
    );
  if (!result) return <p role="status">Vásárlások betöltése…</p>;
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Budapest',
    dateStyle: 'short',
  }).format(new Date());

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold">Megvásárolt utalványok</h3>
      {result.orders.length === 0 && (
        <p>
          {page === 0
            ? 'Még nincs kifizetett utalvány.'
            : 'Ezen az oldalon nincs vásárlás.'}
        </p>
      )}
      {result.orders.map((o) => {
        const expired = Boolean(o.expiry && today > o.expiry);
        const status = o.refunded
          ? 'Visszatérítve'
          : o.redeemed_at
            ? 'Beváltva'
            : expired
              ? 'Lejárt'
              : o.issued_at
                ? 'Beváltható'
                : 'Kiállításra vár';
        const pickupStart =
          o.delivery === 'pickup' &&
          !o.refunded &&
          !o.redeemed_at &&
          !o.collected_at &&
          o.expiry &&
          !expired
            ? o.pickup_from
            : null;
        return (
          <article
            key={o.id}
            className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 sm:p-5"
          >
            <header className="flex flex-wrap justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-slate-600">Vásárló</p>
                <h4 className="break-words text-lg font-semibold">
                  {o.buyer_name || 'Név nincs rögzítve'}
                </h4>
                <p className="break-all text-sm">
                  {o.buyer_email || 'E-mail-cím nincs rögzítve'}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {o.amount.toLocaleString('hu-HU')} Ft
                </p>
                <p className="text-sm">{status}</p>
              </div>
            </header>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-600">Megajándékozott</dt>
                <dd className="break-words">
                  {o.recipient_name || 'Nincs megadva'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-600">Fizetés időpontja</dt>
                <dd>
                  {o.issued_at
                    ? dateTime.format(new Date(o.issued_at))
                    : 'Nincs rögzítve'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-600">Érvényes eddig</dt>
                <dd>
                  {o.expiry
                    ? dateOnly.format(new Date(o.expiry))
                    : 'Nincs rögzítve'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-600">Átvételi mód</dt>
                <dd>
                  {o.delivery === 'email'
                    ? 'PDF e-mailben'
                    : 'Személyesen · Belvárosi rendelő'}
                </dd>
              </div>
              {o.collected_at ? (
                <div>
                  <dt className="text-slate-600">Nyomtatott utalvány átadva</dt>
                  <dd>{dateTime.format(new Date(o.collected_at))}</dd>
                </div>
              ) : (
                pickupStart && (
                  <div>
                    <dt className="text-slate-600">Átvehető ettől</dt>
                    <dd>{dateOnly.format(new Date(pickupStart))}</dd>
                  </div>
                )
              )}
              {o.redeemed_at && (
                <div>
                  <dt className="text-slate-600">Beváltás időpontja</dt>
                  <dd>{dateTime.format(new Date(o.redeemed_at))}</dd>
                </div>
              )}
            </dl>
            <VoucherCode id={o.id} />
            <div className="space-y-2 border-t pt-3 text-sm">
              {o.voucher_jobs.map((j) => (
                <p key={j.kind} className="break-words">
                  {j.kind === 'resend'
                    ? 'Utalványértesítő (Resend)'
                    : 'Számla (Számlázz.hu)'}{' '}
                  ·{' '}
                  {j.issue === 'refund_review'
                    ? 'Visszatérítés miatt egyeztetendő'
                    : states[j.state] || j.state}
                  {j.kind === 'invoice' &&
                    j.provider_id &&
                    ' · ' + j.provider_id}
                </p>
              ))}
              <p className="break-all text-xs text-slate-600">
                Rendelésszám · CD-{o.id}
              </p>
              <div className="flex flex-wrap gap-2">
                {o.voucher_jobs.some(
                  (j) => j.kind === 'resend' && j.provider_id,
                ) && (
                  <button
                    className={buttonStyle}
                    disabled={busy}
                    onClick={() => void action('delivery', o.id)}
                  >
                    Levél kézbesítésének ellenőrzése
                  </button>
                )}
                {pickupStart && (
                  <>
                    <button
                      className={buttonStyle}
                      disabled={busy}
                      onClick={() => void action('print', o.id)}
                    >
                      A5-ös PDF letöltése
                    </button>
                    <button
                      className={buttonStyle}
                      disabled={busy || today < pickupStart}
                      onClick={() => void action('collect', o.id)}
                    >
                      Átadtam a nyomtatott példányt
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        );
      })}
      {(page > 0 || result.hasMore) && (
        <nav
          aria-label="Utalványok lapozása"
          className="flex items-center gap-3"
        >
          <button
            className={buttonStyle}
            disabled={busy || page === 0}
            onClick={() => changePage(page - 1)}
          >
            Előző
          </button>
          <span>{page + 1}. oldal</span>
          <button
            className={buttonStyle}
            disabled={busy || !result.hasMore}
            onClick={() => changePage(page + 1)}
          >
            Következő
          </button>
        </nav>
      )}
    </div>
  );
}

export default function Vouchers({
  redemptionOnly,
}: {
  redemptionOnly: boolean;
}) {
  const [page, setPage] = useState(0),
    [revision, setRevision] = useState(0),
    [code, setCode] = useState(''),
    [checked, setChecked] = useState(''),
    [info, setInfo] = useState(''),
    [busy, setBusy] = useState(false);
  const refresh = () => setRevision((value) => value + 1);
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
            (data.usable
              ? 'Beváltható adómentes fogászati kezelésre.'
              : 'Nem váltható be.'),
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
        refresh();
      }
    } catch (e) {
      setInfo(e instanceof Error ? e.message : 'A művelet nem sikerült.');
      setChecked('');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">
        {redemptionOnly ? 'Utalvány beváltása' : 'Utalványok'}
      </h2>
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
      {!redemptionOnly && (
        <PurchasePage
          key={page + '-' + revision}
          page={page}
          changePage={setPage}
          action={action}
          busy={busy}
          reload={refresh}
        />
      )}
    </section>
  );
}
