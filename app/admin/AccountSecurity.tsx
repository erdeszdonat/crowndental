'use client';

import { useState, type FormEvent } from 'react';
import { ShieldCheck, KeyRound, Smartphone, Download, LogOut } from 'lucide-react';
import type { StaffIdentity } from '@/lib/staffAuth';

const field = 'mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100';
const button = 'rounded-xl bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800 disabled:opacity-50';
type Enrollment = { factorId: string; qr: string; secret: string };

export default function AccountSecurity({ identity, onReady, onLogout, gated = false }: {
  identity: StaffIdentity; onReady: () => Promise<void>; onLogout: () => Promise<void>; gated?: boolean;
}) {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loginRequired, setLoginRequired] = useState(false);

  async function execute(action: string, event?: FormEvent) {
    event?.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/security', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, password, newPassword, confirmPassword: confirmation, code, recoveryCode, factorId: enrollment?.factorId }) });
      const data = await response.json();
      setPassword(''); setCode(''); setRecoveryCode(''); setNewPassword(''); setConfirmation('');
      if (!response.ok) throw new Error(data.error || 'A művelet nem sikerült.');
      if (data.message) setNotice(data.message);
      if (action === 'enroll') setEnrollment({ factorId: data.factorId, qr: data.qr, secret: data.secret });
      if (action === 'verify') setEnrollment(null);
      if (data.recoveryCodes) setCodes(data.recoveryCodes);
      else if (action === 'verify') await onReady();
      if (data.loginRequired) {
        // Keep the result visible until the user returns to the login screen.
        setEnrollment(null); setRecovering(false); setLoginRequired(true);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Hálózati hiba.'); }
    finally { setBusy(false); }
  }

  function downloadCodes() {
    const url = URL.createObjectURL(new Blob([`Crown Dental – helyreállító kódok\n${identity.email}\n\n${codes.join('\n')}\n\nMinden kód egyszer használható. Tartsa ezeket a telefontól külön, biztonságos helyen.\n`], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'crown-dental-helyreallito-kodok.txt'; link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="mx-auto max-w-2xl space-y-5 text-slate-900">
    <div className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
      <ShieldCheck className="mb-4 h-9 w-9 text-sky-400" aria-hidden="true" />
      <h1 className="text-2xl font-bold">{identity.ownerSetup ? 'Az adminfiók biztonsági aktiválása' : gated ? 'Kétlépcsős azonosítás' : 'Fiókbiztonság'}</h1>
      <p className="mt-3 break-words text-sm text-slate-300">{identity.email}</p>
      <p className="mt-3 leading-relaxed text-slate-300">{identity.ownerSetup
        ? 'A meglévő erdeszdonat fiókot saját e-mail-címhez és telefonos azonosításhoz kapcsoljuk. Az aktiváló linken új jelszót is megadhat.'
        : 'A belépést a jelszó és a telefonon lévő Google Authenticator együtt védi. Az adatok csak mindkét lépés után érhetők el.'}</p>
    </div>
    {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
    {notice && <div role="status" className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"><p>{notice}</p>{!identity.ownerSetup && <button className={button} onClick={() => void onReady()}>Tovább a belépéshez</button>}</div>}

    {loginRequired ? null : codes.length > 0 ? <section className="space-y-5 rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8">
      <h2 className="text-xl font-bold">Mentse el a helyreállító kódokat</h2>
      <p className="leading-relaxed text-slate-700">Ha elveszíti a telefonját, a jelszóval és ezek egyikével új Authenticatort állíthat be. A kódokat csak most mutatjuk meg. Az új kódok felülírják a korábbiakat.</p>
      <ul className="space-y-2 overflow-x-auto rounded-xl bg-white p-4 font-mono text-xs sm:text-sm">{codes.map(item => <li key={item}>{item}</li>)}</ul>
      <div className="flex flex-wrap gap-3"><button className="flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-3 font-semibold" onClick={downloadCodes}><Download className="h-4 w-4" /> Kódok letöltése</button><button className={button} onClick={async () => { setCodes([]); await onReady(); }}>Elmentettem, tovább</button></div>
    </section> : identity.ownerSetup ? <form onSubmit={e => void execute('owner_activate', e)} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-bold">Aktiváló e-mail küldése</h2>
      <p className="leading-relaxed text-slate-600">A hivatkozás az erdeszdonatcd@gmail.com címre érkezik. Megnyitása után beállíthatja a nevét, az új jelszavát és az Authenticatort.</p>
      <label className="block text-sm font-semibold">A jelenlegi adminjelszó<input required type="password" autoComplete="current-password" maxLength={256} value={password} onChange={e => setPassword(e.target.value)} className={field} /></label>
      <button disabled={busy} className={button}>{busy ? 'Küldés…' : 'Aktiváló e-mail küldése'}</button>
    </form> : gated ? <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
      {recovering ? <form onSubmit={e => void execute('recover', e)} className="space-y-5">
        <h2 className="text-xl font-bold">Elveszett a telefon?</h2><p className="text-slate-600">Egy korábban elmentett helyreállító kóddal törölheti a régi telefonos azonosítást. Új belépés után kötelező új Authenticatort beállítani.</p>
        <label className="block text-sm font-semibold">Jelenlegi jelszó<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={field} /></label>
        <label className="block text-sm font-semibold">Helyreállító kód<input required autoComplete="off" spellCheck={false} maxLength={64} value={recoveryCode} onChange={e => setRecoveryCode(e.target.value)} className={field} /></label>
        <button disabled={busy} className={button}>Telefonos azonosítás helyreállítása</button>
      </form> : enrollment || identity.mfa?.enrolled ? <form onSubmit={e => void execute('verify', e)} className="space-y-5">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Smartphone className="h-6 w-6 text-sky-700" /> Google Authenticator</h2>
        {enrollment ? <><p className="text-slate-600">Nyissa meg telefonján a Google Authenticator alkalmazást, koppintson a + jelre, majd válassza a QR-kód beolvasását.</p>
          {/* The provider SVG is rendered as an isolated image, never as HTML. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrollment.qr.startsWith('data:image/') ? enrollment.qr : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(enrollment.qr)}`} alt="A Google Authenticator beállításához beolvasandó QR-kód" width={240} height={240} className="mx-auto rounded-2xl border border-slate-100 bg-white p-3" />
          <details className="rounded-xl bg-slate-50 p-4 text-sm"><summary className="cursor-pointer font-semibold">Kézi beállítási kulcs</summary><p className="mt-3 break-all font-mono select-all">{enrollment.secret}</p><p className="mt-2 text-slate-500">A kulcsot tartsa titokban. Az alkalmazásban válassza az időalapú kódot.</p></details></> : <p className="text-slate-600">Adja meg a telefonon a Crown Dental fióknál megjelenő hatjegyű kódot.</p>}
        <label className="block text-sm font-semibold">Authenticator-kód<input autoFocus required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} className={`${field} text-center text-2xl tracking-[0.3em]`} /></label>
        <button disabled={busy} className={`${button} w-full`}>{busy ? 'Ellenőrzés…' : enrollment ? 'Authenticator bekapcsolása' : 'Belépés megerősítése'}</button>
      </form> : <form onSubmit={e => void execute('enroll', e)} className="space-y-5">
        <h2 className="text-xl font-bold">Google Authenticator beállítása</h2>
        <p className="leading-relaxed text-slate-600">Telepítse a Google Authenticator alkalmazást a telefonjára. A beállítás után minden belépésnél kérjük az alkalmazás hatjegyű kódját.</p>
        <label className="block text-sm font-semibold">Jelenlegi jelszó a megerősítéshez<input required type="password" autoComplete="current-password" maxLength={128} value={password} onChange={e => setPassword(e.target.value)} className={field} /></label>
        <button disabled={busy} className={button}>{busy ? 'Előkészítés…' : 'QR-kód megjelenítése'}</button>
      </form>}
      {identity.mfa?.enrolled && <button type="button" onClick={() => { setRecovering(!recovering); setPassword(''); setRecoveryCode(''); setError(''); setNotice(''); }} className="text-sm font-semibold text-sky-800 underline underline-offset-4">{recovering ? 'Vissza a telefonos kódhoz' : 'Nem férek hozzá a telefonomhoz'}</button>}
    </section> : <>
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"><h2 className="flex items-center gap-2 font-bold text-emerald-900"><ShieldCheck className="h-5 w-5" /> A Google Authenticator aktív</h2><p className="mt-2 text-sm text-emerald-800">A kétlépcsős azonosítás minden belépésnél szükséges.</p></section>
      <form onSubmit={e => void execute('password', e)} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
        <h2 className="flex items-center gap-2 text-xl font-bold"><KeyRound className="h-5 w-5 text-sky-700" /> Saját jelszó módosítása</h2>
        <label className="block text-sm font-semibold">Jelenlegi jelszó<input required type="password" autoComplete="current-password" maxLength={128} value={password} onChange={e => setPassword(e.target.value)} className={field} /></label>
        <label className="block text-sm font-semibold">Új jelszó<input required type="password" autoComplete="new-password" minLength={12} maxLength={128} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={field} /></label>
        <label className="block text-sm font-semibold">Új jelszó még egyszer<input required type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmation} onChange={e => setConfirmation(e.target.value)} className={field} /></label>
        <p className="text-sm text-slate-500">Legalább 12 karakter. A módosítás után minden eszközön újra be kell lépni.</p><button disabled={busy} className={button}>{busy ? 'Mentés…' : 'Jelszó módosítása'}</button>
      </form>
      <form onSubmit={e => void execute('recovery_codes', e)} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 md:p-8"><h2 className="text-xl font-bold">Új helyreállító kódok</h2><p className="text-sm text-slate-600">Ha a korábbi kódokat elveszítette, itt készíthet újakat. A régiek azonnal érvénytelenné válnak.</p><label className="block text-sm font-semibold">Jelenlegi jelszó<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={field} /></label><button disabled={busy} className={button}>Új kódok készítése</button></form>
    </>}
    {gated && <button type="button" disabled={busy} onClick={() => void onLogout()} className="mx-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-900"><LogOut className="h-4 w-4" /> Kijelentkezés</button>}
  </div>;
}
