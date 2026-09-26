'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, Gift, LoaderCircle, MapPin, Sparkles, Trophy } from 'lucide-react';
import { campaignPhase, HIDFUTAS, WHEEL_SECTORS, restoreReceipt, type EntryReceipt } from '@/lib/hidfutas';
import styles from './hidfutas.module.css';

const RECEIPT_KEY = 'crown-hidfutas-2026-receipt';
const REQUEST_KEY = 'crown-hidfutas-2026-request';
const SECTOR_ANGLE = 360 / WHEEL_SECTORS.length;

function wedge(index: number) {
  const a = (index * SECTOR_ANGLE - 90 - SECTOR_ANGLE / 2) * Math.PI / 180;
  const b = (index * SECTOR_ANGLE - 90 + SECTOR_ANGLE / 2) * Math.PI / 180;
  return `M200 200 L${200 + 188 * Math.cos(a)} ${200 + 188 * Math.sin(a)} A188 188 0 0 1 ${200 + 188 * Math.cos(b)} ${200 + 188 * Math.sin(b)} Z`;
}

export default function HidfutasClient() {
  const [phase, setPhase] = useState<'before' | 'open' | 'closed' | 'loading'>('loading');
  const [receipt, setReceipt] = useState<EntryReceipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);
  const requestId = useRef('');
  const submitting = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setPhase(campaignPhase(Date.now()));
    const interval = setInterval(update, 1000);
    const frame = requestAnimationFrame(() => {
    update();
    try {
      requestId.current = localStorage.getItem(REQUEST_KEY) || crypto.randomUUID();
      localStorage.setItem(REQUEST_KEY, requestId.current);
      const saved = restoreReceipt(JSON.parse(localStorage.getItem(RECEIPT_KEY) || 'null') as EntryReceipt | null);
      if (saved) {
        setReceipt(saved); setRevealed(true); setRotation((360 - saved.sector * SECTOR_ANGLE) % 360);
      }
    } catch { requestId.current ||= crypto.randomUUID(); }
    });
    return () => { cancelAnimationFrame(frame); clearInterval(interval); if (timer.current) clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    if (revealed) {
      resultRef.current?.focus({ preventScroll: true });
      resultRef.current?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }, [revealed]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || receipt) return;
    submitting.current = true;
    setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/hidfutas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'), email: form.get('email'), phone: form.get('phone'),
          rules: form.get('rules') === 'on', marketing: form.get('marketing') === 'on',
          website: form.get('website'), requestId: requestId.current,
          rulesVersion: HIDFUTAS.rulesVersion,
        }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'A nevezés most nem sikerült. Kérjük, próbáld újra.');
      const next = data.receipt as EntryReceipt;
      setReceipt(next);
      try { localStorage.setItem(RECEIPT_KEY, JSON.stringify(next)); } catch { /* Receipt stays visible without browser storage. */ }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setSpinning(true);
      setRotation(1800 + (360 - next.sector * SECTOR_ANGLE) % 360);
      document.getElementById('hidfutas-wheel')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
      timer.current = setTimeout(() => { setSpinning(false); setRevealed(true); }, reduced ? 50 : 5200);
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== 'TimeoutError' ? failure.message : 'A kapcsolat megszakadt. Próbáld újra: ugyanazt a nevezést biztonságosan folytatjuk.');
    } finally { setBusy(false); submitting.current = false; }
  }

  return (
    <main className={styles.page} id="crown-content">
      <header className={styles.header}>
        <Link href="/" aria-label="Crown Dental főoldal"><Image src="/logo.webp" alt="Crown Dental" width={168} height={56} priority className={styles.logo} /></Link>
        <span className={styles.eventTag}>HÍDFUTÁS <span>2026</span></span>
      </header>

      <div className={styles.hero}>
        <section className={styles.play} aria-labelledby="hidfutas-title">
          <div className={styles.eyebrow}><span /> ESZTERGOM · SZEPTEMBER 26.</div>
          <h1 id="hidfutas-title">A cél után<br /><em>jöhet a mosoly.</em></h1>
          <p className={styles.intro}>Egy futás. Egy pörgetés. Egy kis szerencse.<br />Nevezz, és pörgess a Crown Dental ajándékaiért!</p>

          <div id="hidfutas-wheel" className={`${styles.wheelArea} ${spinning ? styles.spinning : ''}`}>
            <div className={styles.pointer} aria-hidden="true" />
            <div className={styles.wheelRim}>
              <svg className={styles.wheel} viewBox="0 0 400 400" style={{ transform: `rotate(${rotation}deg)` }} aria-label="Szerencsekerék: 25% fogfehérítő csík, 25% fogfehérítő por, 25% fogselyem, 25% szónikus fogkefe" role="img">
                {WHEEL_SECTORS.map((sector, i) => <g key={i}>
                  <path d={wedge(i)} fill={sector.color} stroke="#fff" strokeWidth="2" />
                  <g transform={`rotate(${i * SECTOR_ANGLE} 200 200)`} fill={sector.ink}>
                    <text x="200" y="72" textAnchor="middle" fontSize="14" fontWeight="700"><tspan x="200">{sector.short[0]}</tspan><tspan x="200" dy="19">{sector.short[1]}</tspan></text>
                    <text x="200" y="123" textAnchor="middle" fontSize="23" aria-hidden="true">✧</text>
                  </g>
                </g>)}
              </svg>
              <div className={styles.hub} aria-hidden="true"><Sparkles size={27} strokeWidth={1.4} /><span>CROWN<br />DENTAL</span></div>
            </div>
            <span className={styles.wheelAccent} aria-hidden="true">✦</span>
          </div>
          <p className={styles.wheelCaption} aria-live="polite">{spinning ? 'Pörög a kerék…' : 'Minden pörgetés nyer. Az ajándékod garantált.'}</p>
        </section>

        <section className={styles.formCard} aria-labelledby="entry-title">
          <div className={styles.cardTop}><span>01 / PÖRGESS ÉS NEVEZZ</span><Gift size={20} /></div>
          {receipt && revealed ? (
            <div className={styles.result} ref={resultRef} tabIndex={-1}>
              <div className={styles.resultIcon}><Gift size={32} /></div>
              <span className={styles.eyebrow}>SIKERES NEVEZÉS</span>
              <h2 id="entry-title">Ez most a te ajándékod!</h2>
              <p className={styles.prizeName}>{WHEEL_SECTORS[receipt.sector].label}</p>
              <p>Mutasd meg ezt a kódot a Crown Dental sátránál, és vedd át az ajándékodat szombaton 13:00-ig.</p>
              <div className={styles.receipt}><span>Ajándékátvételi és nevezési kódod</span><strong>{receipt.code}</strong><small>Mentsd el vagy készíts képernyőképet róla.</small></div>
              <div className={styles.successNote}><CheckCircle2 size={20} /><p>Benne vagy a szeptember 28-i főnyeremény-sorsolásban!</p></div>
              {receipt.marketing !== 'no' && <p className={styles.small}>{receipt.marketing === 'synced' ? 'A hírlevélre is feliratkoztál. Bármikor leiratkozhatsz.' : 'A hírlevél-feliratkozási kérésedet rögzítettük, feldolgozása folyamatban van.'}</p>}
              <a className={styles.textLink} href={HIDFUTAS.facebook} target="_blank" rel="noopener noreferrer">Eredményhirdetés a Facebook-oldalunkon <ArrowRight size={16} /></a>
            </div>
          ) : <>
            <h2 id="entry-title">A következő pörgetés<br />a tiéd.</h2>
            <p className={styles.formIntro}>Add meg az adataidat, és már indulhat is! A főnyereményért külön nevezned sem kell.</p>
            <form onSubmit={submit} className={styles.form}>
              <fieldset disabled={busy || spinning || !!receipt}>
                <label className={styles.field}>Teljes név<input name="name" autoComplete="name" placeholder="Vezetéknév Keresztnév" required minLength={3} maxLength={120} /></label>
                <label className={styles.field}>E-mail-cím<input name="email" type="email" autoComplete="email" inputMode="email" placeholder="pelda@email.hu" required maxLength={254} /></label>
                <label className={styles.field}>Telefonszám<input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+36 30 123 4567" required minLength={7} maxLength={25} /></label>
                <div className={styles.honeypot} aria-hidden="true"><label>Weboldal<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                <div className={styles.consents}>
                  <label><input type="checkbox" name="rules" required /><span>Elmúltam 18 éves, elfogadom a <Link href="/hidfutas/szabalyzat" target="_blank">játékszabályzatot</Link>, és megismertem a <Link href="/hidfutas/szabalyzat#adatkezeles" target="_blank">játék adatkezelési tájékoztatóját</Link>.</span></label>
                  <label><input type="checkbox" name="marketing" /><span>Szeretnék e-mailben Crown Dental híreket és ajánlatokat kapni. <small>Önkéntes, bármikor visszavonható. Nem befolyásolja a nyerési esélyedet.</small></span></label>
                </div>
                {error && <p className={styles.error} role="alert">{error}</p>}
                <button className={styles.submit} disabled={phase !== 'open' || busy || spinning || !!receipt} type="submit">
                  {busy || spinning ? <LoaderCircle className={styles.loader} size={20} /> : <Sparkles size={20} />}
                  {busy ? 'Nevezés rögzítése…' : spinning ? 'Sok szerencsét!' : phase === 'before' ? 'Szeptember 26-án 9:00-kor indulunk' : phase === 'closed' ? 'A nevezés lezárult' : phase === 'loading' ? 'Betöltés…' : 'Pörgetek és nevezek'}
                  {!busy && !spinning && phase === 'open' && <ArrowRight size={20} />}
                </button>
              </fieldset>
            </form>
            <p className={styles.formFoot}><Check size={15} /> Ingyenes részvétel · Egy fő, egy nevezés</p>
            {phase === 'closed' && <p className={styles.closed}>Köszönjük, hogy velünk futottatok! Eredményhirdetés: szeptember 28-án, hétfőn.</p>}
          </>}
        </section>
      </div>

      <section className={styles.grandPrize} aria-labelledby="grand-prize-title">
        <div className={styles.grandIcon}><Trophy size={34} strokeWidth={1.4} /></div>
        <div><span className={styles.eyebrow}>02 / HÉTFŐN JÖN A RÁADÁS</span><h2 id="grand-prize-title">Nyerj egy rendelői fogfehérítést!</h2><p>Minden érvényes nevező részt vesz a főnyeremény sorsolásán, az azonnali eredménytől függetlenül.</p></div>
        <div className={styles.drawDate}><strong>09.28.</strong><span>HÉTFŐ · EREDMÉNYHIRDETÉS</span><p>E-mailben, telefonon és Facebookon.</p></div>
      </section>
      <div className={styles.details}><p><MapPin size={17} /> Azonnali ajándékátvétel a Crown Dental sátránál.</p><p>Nevezés: szeptember 26. · 9:00–13:00</p></div>
      <footer className={styles.footer}><span>© 2026 Crown Dental</span><div><Link href="/hidfutas/szabalyzat">Játékszabályzat</Link><Link href="/hidfutas/szabalyzat#adatkezeles">Adatkezelés</Link><a href="mailto:info@crowndental.hu">Kapcsolat</a></div></footer>
    </main>
  );
}
