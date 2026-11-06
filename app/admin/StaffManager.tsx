'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail, ShieldCheck, UserRound, UserPlus, RefreshCw, KeyRound, Ban, X } from 'lucide-react';
import type { StaffIdentity, StaffRole } from '@/lib/staffAuth';

type Member = { user_id: string; email: string; name: string; role: StaffRole; status: 'active' | 'invited' | 'disabled'; is_owner: boolean; invited_at: string };
type Audit = { id: number; actor: string; action: string; target_user_id: string | null; created_at: string };
type Pending = { action: 'invite' | 'reset' | 'resend' | 'role' | 'disable'; email?: string; userId?: string; role?: StaffRole; label: string };
const roleLabel = { admin: 'Admin', assistant: 'Asszisztens' };
const statusLabel = { active: 'Aktív', invited: 'Aktiválásra vár', disabled: 'Letiltva' };
const auditLabel: Record<string, string> = { invitation_created: 'Meghívó készült', password_reset_requested: 'Jelszó-visszaállítás indult', invitation_accepted: 'Meghívó elfogadva', password_reset_completed: 'Új jelszó beállítva', access_disabled: 'Hozzáférés letiltva', role_changed_to_admin: 'Adminjog megadva', role_changed_to_assistant: 'Asszisztensjog beállítva' };

export default function StaffManager({ identity }: { identity: StaffIdentity }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('assistant');
  const [pending, setPending] = useState<Pending | null>(null);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/staff', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'A kollégák adatai nem tölthetők be.');
      setMembers(result.members); setAudit(result.audit);
    } catch (e) { setError(e instanceof Error ? e.message : 'Hálózati hiba.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    setPassword(''); setError('');
    if (pending && !dialog.current?.open) dialog.current?.showModal();
  }, [pending]);

  async function execute(event: React.FormEvent) {
    event.preventDefault();
    if (!pending || saving) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...pending, adminPassword: password }) });
      const result = await response.json();
      setPassword('');
      if (!response.ok) throw new Error(result.error || 'A művelet nem sikerült.');
      setNotice(['invite', 'resend', 'reset'].includes(pending.action) ? 'Az e-mailt a levelezőrendszer befogadta. A címzett 24 órán belül állíthatja be a hozzáférését.' : 'A hozzáférést módosítottuk.');
      if (pending.action === 'invite') setEmail('');
      setPending(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Hálózati hiba.'); await load(); }
    finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
      <ShieldCheck className="mb-4 h-8 w-8 text-sky-400" aria-hidden="true" />
      <h2 className="text-2xl font-bold">Kollégák és hozzáférések</h2>
      <p className="mt-2 max-w-3xl leading-relaxed text-slate-300">Minden kolléga saját e-mail-címmel és jelszóval lép be. Az asszisztens a pácienseket és az időpontokat kezeli. Az admin minden adminfunkcióhoz hozzáfér.</p>
    </div>
    {notice && <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">{notice}</p>}
    {error && !pending && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
    <form onSubmit={event => { event.preventDefault(); setPending({ action: 'invite', email, role, label: 'Meghívó küldése' }); }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h3 className="mb-5 flex items-center gap-3 text-xl font-bold text-slate-950"><UserPlus className="h-6 w-6 text-sky-600" aria-hidden="true" /> Új kolléga meghívása</h3>
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_180px_auto] xl:items-end">
        <label className="space-y-2 text-sm font-semibold text-slate-700">E-mail-cím<input required type="email" autoComplete="off" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className="block w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" placeholder="A kolléga e-mail-címe" /></label>
        <label className="space-y-2 text-sm font-semibold text-slate-700">Jogosultság<select value={role} onChange={e => setRole(e.target.value as StaffRole)} className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="assistant">Asszisztens</option><option value="admin">Admin</option></select></label>
        <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-bold text-white hover:bg-sky-700"><Mail className="h-5 w-5" aria-hidden="true" /> Meghívó küldése</button>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-500">A kolléga az e-mailben kapott egyszer használható linken adja meg a nevét és jelszavát. A link 24 óra után lejár.</p>
    </form>
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-6"><h3 className="text-xl font-bold text-slate-950">Hozzáférések</h3><button type="button" onClick={() => void load()} disabled={loading} aria-label="Kollégák frissítése" className="rounded-full p-2 text-slate-600 hover:bg-slate-100"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button></div>
      {loading && members.length === 0 ? <p className="p-6 text-slate-500">Betöltés…</p> : members.length === 0 ? <p className="p-6 text-slate-500">Még nincs meghívott kolléga.</p> : <ul className="divide-y divide-slate-100">{members.map(member => <li key={member.user_id} className="flex flex-col gap-4 p-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0"><p className="flex flex-wrap items-center gap-2 font-bold text-slate-900"><UserRound className="h-5 w-5 shrink-0 text-slate-400" />{member.name || 'Név még nincs megadva'}<span className={`rounded-full px-3 py-1 text-xs ${member.status === 'active' ? 'bg-emerald-50 text-emerald-700' : member.status === 'disabled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>{statusLabel[member.status]}</span></p><p className="mt-1 break-words text-sm text-slate-500">{member.email}</p></div>
        {member.user_id === identity.id || member.is_owner ? <p className="text-sm text-slate-500">{member.is_owner ? 'Tulajdonosi fiók' : 'Saját fiók'} · {roleLabel[member.role]}</p> : <div className="flex flex-wrap items-center gap-2">
          <select aria-label={`${member.email} jogosultsága`} value={member.role} onChange={e => setPending({ action: 'role', userId: member.user_id, role: e.target.value as StaffRole, label: `${member.email} jogosultságának módosítása` })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"><option value="assistant">Asszisztens</option><option value="admin">Admin</option></select>
          <button type="button" onClick={() => setPending({ action: member.status === 'active' ? 'reset' : 'resend', userId: member.user_id, email: member.email, label: member.status === 'active' ? 'Jelszó-visszaállítás indítása' : 'Új aktiváló link küldése' })} className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100"><KeyRound className="h-4 w-4" />{member.status === 'active' ? 'Jelszó visszaállítása' : 'Aktiváló link küldése'}</button>
          {member.status !== 'disabled' && <button type="button" onClick={() => setPending({ action: 'disable', userId: member.user_id, email: member.email, label: 'Hozzáférés letiltása' })} className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"><Ban className="h-4 w-4" /> Letiltás</button>}
        </div>}
      </li>)}</ul>}
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="mb-4 text-xl font-bold text-slate-950">Hozzáférési napló</h3><ul className="space-y-3 text-sm">{audit.length === 0 ? <li className="text-slate-500">A meghívások és jogosultságmódosítások itt jelennek meg.</li> : audit.map(entry => <li key={entry.id} className="flex flex-col justify-between gap-1 border-b border-slate-100 pb-3 last:border-0 md:flex-row"><div><span className="font-semibold text-slate-800">{auditLabel[entry.action] || 'Hozzáférés módosítva'}</span><span className="ml-2 text-slate-500">{members.find(m => m.user_id === entry.target_user_id)?.email || ''}</span></div><time className="text-slate-500" dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString('hu-HU')}</time></li>)}</ul></section>
    {pending && <dialog ref={dialog} aria-labelledby="staff-confirm-title" onCancel={e => { if (saving) e.preventDefault(); else setPending(null); }} className="w-[calc(100%_-_2rem)] max-w-lg rounded-3xl border border-slate-200 p-0 shadow-2xl backdrop:bg-slate-950/60">
      <form onSubmit={execute} className="space-y-5 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4"><h3 id="staff-confirm-title" className="text-xl font-bold text-slate-950">{pending.label}</h3><button type="button" disabled={saving} onClick={() => setPending(null)} aria-label="Mégsem" className="p-1 text-slate-500"><X className="h-5 w-5" /></button></div>
        {pending.email && <p className="break-words font-semibold text-slate-700">{pending.email}</p>}
        {pending.role && <p className="rounded-xl bg-sky-50 p-4 text-sm text-sky-900">{pending.role === 'admin' ? 'Az admin minden adminfunkciót és adatot elér, és kollégákat is meghívhat.' : 'Az asszisztens a pácienslistát és az időpontkezelést éri el.'}</p>}
        {['reset', 'resend', 'disable'].includes(pending.action) && <p className="text-sm leading-relaxed text-slate-600">A korábbi munkamenetek hozzáférése megszűnik. Új belépéshez az aktiváló linkkel beállított jelszó szükséges.</p>}
        <label className="block text-sm font-semibold text-slate-700">A saját jelszavad a megerősítéshez<input autoFocus required type="password" autoComplete="current-password" maxLength={256} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex gap-3"><button type="button" disabled={saving} onClick={() => setPending(null)} className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-600">Mégsem</button><button disabled={saving} type="submit" className="flex-1 rounded-xl bg-sky-600 py-3 font-bold text-white disabled:bg-slate-400">{saving ? 'Folyamatban…' : 'Megerősítem'}</button></div>
      </form>
    </dialog>}
  </div>;
}
