'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function StaffAccessPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const value = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
    window.history.replaceState(null, '', window.location.pathname);
    setToken(value);
    if (!value) { setError('Nyissa meg az e-mailben kapott aktiváló hivatkozást.'); setLoading(false); return; }
    void fetch('/api/admin/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'preview', token: value }) })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error); setEmail(result.email); setName(result.name || ''); })
      .catch(e => setError(e instanceof Error ? e.message : 'A hivatkozás nem ellenőrizhető.'))
      .finally(() => setLoading(false));
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (password !== confirmation) { setError('A két jelszó nem egyezik.'); return; }
    setSaving(true); setError('');
    try {
      const response = await fetch('/api/admin/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'accept', token, name, password }) });
      const result = await response.json();
      setPassword(''); setConfirmation('');
      if (!response.ok) throw new Error(result.error || 'A beállítás nem sikerült.');
      window.location.replace('/crown-dental');
    } catch (e) { setError(e instanceof Error ? e.message : 'Hálózati hiba.'); }
    finally { setSaving(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12"><section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-10">
    <ShieldCheck className="mb-5 h-10 w-10 text-sky-600" aria-hidden="true" />
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-sky-700">Crown Dental</p><h1 className="text-3xl font-bold text-slate-950">Hozzáférés beállítása</h1>
    <p className="mt-3 leading-relaxed text-slate-500">Adja meg a nevét és válasszon saját jelszót. A jelszó legalább 12 karakterből álljon.</p>
    {loading ? <p className="mt-6 text-slate-500" role="status">Hivatkozás ellenőrzése…</p> : email && <form onSubmit={submit} className="mt-7 space-y-5">
      <p className="break-words rounded-xl bg-slate-50 px-4 py-3 font-semibold text-slate-700">{email}</p>
      <label className="block text-sm font-semibold text-slate-700">Név<input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
      <label className="block text-sm font-semibold text-slate-700">Új jelszó<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
      <label className="block text-sm font-semibold text-slate-700">Új jelszó még egyszer<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
      <button disabled={saving} className="w-full rounded-xl bg-sky-600 px-4 py-4 font-bold text-white hover:bg-sky-700 disabled:bg-slate-400">{saving ? 'Beállítás folyamatban…' : 'Hozzáférés aktiválása'}</button>
    </form>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    <a href="/crown-dental" className="mt-6 inline-block text-sm font-semibold text-sky-700 underline underline-offset-4">Vissza a belépéshez</a>
  </section></main>;
}
