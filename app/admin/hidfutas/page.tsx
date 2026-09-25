'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { HIDFUTAS, prizeLabel } from '@/lib/hidfutas';

type Entry = { id: string; code: string; name: string; email: string; phone: string; prize: string; created_at: string; redeemed_at: string | null; marketing_consent: boolean; marketing_synced_at: string | null; marketing_error: string | null };
type Draw = { drawn_at: string; entrant_count: number; email_sent_at: string | null; phone_contacted_at: string | null; facebook_published_at: string | null };
type Data = { entries: Entry[]; total: number; filtered: number; pending: number; draw: Draw | null; winner: Entry | null; canDraw: boolean };
const button = 'rounded-lg bg-sky-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40';

export default function HidfutasAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/hidfutas?page=${page}&q=${encodeURIComponent(search)}`, { cache: 'no-store' });
      const body = await response.json();
      if (response.status === 401) { setNeedsLogin(true); return; }
      if (!response.ok) throw new Error(body.error);
      setData(body); setError(''); setNeedsLogin(false);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Hálózati hiba.'); }
  }, [page, search]);
  useEffect(() => { void load(); }, [load]);

  async function action(action: string, code?: string) {
    if (busy) return;
    const confirmations: Record<string, string> = {
      draw: 'Elindítod az egyetlen, végleges főnyeremény-sorsolást? Ellenőrizd előtte a nevezések érvényességét. Ezzel még nem küldünk e-mailt.',
      send_winner_email: 'Elküldöd a főnyereményről szóló értesítést a nyertesnek e-mailben?',
      redeem: 'Átadod a megjelölt ajándékot? Ezt a kódot utána nem lehet újra beváltani.',
    };
    if (confirmations[action] && !window.confirm(confirmations[action])) return;
    setBusy(true); setNotice(''); setError('');
    try {
      const response = await fetch('/api/admin/hidfutas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, code }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      await load();
      setNotice(action === 'send_winner_email' ? 'A Resend befogadta a nyertesnek küldött e-mailt.' : action === 'sync_marketing' ? `${body.attempted} feliratkozás szinkronizálását megkíséreltük. A függőben lévő tételek alább láthatók.` : 'A műveletet rögzítettük.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Hálózati hiba.'); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-slate-50 p-5 text-slate-900 sm:p-10"><div className="mx-auto max-w-7xl">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><Link href="/admin" className="text-sm text-sky-800 underline">← Crown Dental admin</Link><h1 className="mt-3 text-3xl font-bold">Hídfutás 2026</h1><p className="mt-2 text-slate-600">Nevezés: szeptember 26. 9:00–13:00 · Sorsolás: szeptember 28.</p></div><Link href="/hidfutas" className="text-sky-800 underline" target="_blank">Játékoldal megnyitása</Link></div>
    {needsLogin && <div className="rounded-xl border border-sky-200 bg-white p-6"><h2 className="text-xl font-bold">Admin belépés szükséges</h2><p className="my-3">Lépj be a meglévő Crown Dental adminba, majd térj vissza erre az oldalra.</p><Link href="/admin" className={button}>Belépés</Link></div>}
    {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
    {notice && <p role="status" className="mb-5 rounded-lg bg-sky-100 p-4 text-sky-900">{notice}</p>}
    {!data && !needsLogin && !error && <p>Adatok betöltése…</p>}
    {data && <>
      <div className="mb-6 flex flex-wrap items-center gap-5 rounded-xl border bg-white p-6"><strong className="text-xl">{data.total} nevező</strong><span>{data.pending} függőben lévő hírlevél-szinkron</span><button disabled={busy || !data.pending} className={button} onClick={() => action('sync_marketing')}>Feliratkozások újrapróbálása</button><button className="text-sky-800 underline" disabled={busy} onClick={load}>Frissítés</button></div>
      <section className="mb-8 rounded-xl border bg-white p-6"><h2 className="mb-3 text-xl font-bold">Főnyeremény: 1 rendelői fogfehérítés</h2>
        {!data.draw && <><p className="mb-5 text-slate-600">Az azonnali nyeremény és a hírlevél-pipa nem befolyásolja az esélyeket. A sorsolás egyszer végezhető el, szeptember 28-tól.</p><button disabled={busy || !data.canDraw || !data.total} onClick={() => action('draw')} className={button}>Főnyeremény kisorsolása</button></>}
        {data.draw && data.winner && <><p className="text-2xl font-semibold">{data.winner.name}</p><p className="my-2 font-mono">{data.winner.code}</p><p>{data.winner.email} · <a href={`tel:${data.winner.phone}`} className="text-sky-800 underline">{data.winner.phone}</a></p><p className="mt-3 text-sm text-slate-500">{new Date(data.draw.drawn_at).toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' })} · {data.draw.entrant_count} nevező közül</p>
          <div className="my-5 flex flex-wrap gap-3"><button className={button} disabled={busy || !!data.draw.email_sent_at} onClick={() => action('send_winner_email')}>{data.draw.email_sent_at ? 'E-mail elküldve ✓' : 'Nyertes értesítése e-mailben'}</button><button className={button} disabled={busy || !!data.draw.phone_contacted_at} onClick={() => action('mark_phone')}>{data.draw.phone_contacted_at ? 'Telefonos értesítés rögzítve ✓' : 'Telefonon értesítettem'}</button><button className={button} disabled={busy || !!data.draw.facebook_published_at} onClick={() => action('mark_facebook')}>{data.draw.facebook_published_at ? 'Facebook-közzététel rögzítve ✓' : 'Facebookon közzétettem'}</button></div>
          <p className="mb-3 text-sm text-slate-600">A telefonhívást és a Facebook-bejegyzést a munkatárs végzi; a gombok ezek megtörténtét rögzítik.</p>
          <label className="block text-sm font-semibold">Másolható Facebook-szöveg<textarea readOnly className="mt-2 min-h-36 w-full rounded-lg border bg-slate-50 p-4 text-base font-normal" value={`Megvan a Crown Dental × Hídfutás 2026 főnyereményének nyertese! 🎉\n\nAz 1 alkalom rendelői fogfehérítést a ${data.winner.code} nevezési kód tulajdonosa nyerte. A nyertest e-mailben és telefonon keressük.\n\nKöszönjük mindenkinek a részvételt, és gratulálunk minden futónak!\nJátékszabályzat: https://www.crowndental.hu/hidfutas/szabalyzat`} /></label><a href={HIDFUTAS.facebook} className="mt-3 inline-block text-sky-800 underline" target="_blank" rel="noopener noreferrer">Facebook-oldal megnyitása</a>
        </>}
      </section>
      <form className="mb-5 flex flex-wrap gap-3" onSubmit={event => { event.preventDefault(); setPage(0); setSearch(query); }}><label className="flex flex-1 items-center gap-3">Átvételi kód<input className="min-w-0 flex-1 rounded-lg border p-3 font-mono" placeholder="HF-…" value={query} onChange={event => setQuery(event.target.value.toUpperCase())} /></label><button className={button}>Keresés</button></form>
      <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>{['Nevező', 'Elérhetőség', 'Kód / ajándék', 'Hírlevél', 'Átadás'].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>{data.entries.map(entry => <tr key={entry.id} className="border-t"><td className="p-4 font-semibold">{entry.name}<small className="mt-1 block font-normal text-slate-500">{new Date(entry.created_at).toLocaleTimeString('hu-HU', { timeZone: 'Europe/Budapest' })}</small></td><td className="p-4">{entry.email}<br />{entry.phone}</td><td className="p-4"><span className="font-mono">{entry.code}</span><br />{prizeLabel(entry.prize)}</td><td className="p-4">{entry.marketing_consent ? entry.marketing_synced_at ? 'Feliratkozva' : 'Függőben' : 'Nem kérte'}</td><td className="p-4">{entry.prize === 'none' ? '—' : entry.redeemed_at ? 'Átadva ✓' : <button disabled={busy} className={button} onClick={() => action('redeem', entry.code)}>Ajándék átadása</button>}</td></tr>)}</tbody></table>{!data.entries.length && <p className="p-6 text-slate-500">Nincs megjeleníthető nevezés.</p>}</div>
      <div className="mt-5 flex items-center justify-between"><button className={button} disabled={page === 0 || busy} onClick={() => setPage(page - 1)}>Előző</button><span>{page + 1}. oldal · {data.filtered} találat</span><button className={button} disabled={(page + 1) * 50 >= data.filtered || busy} onClick={() => setPage(page + 1)}>Következő</button></div>
    </>}
  </div></main>;
}
