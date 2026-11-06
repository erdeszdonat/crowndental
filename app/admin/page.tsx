'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronDown, ChevronUp,
  ExternalLink, Phone, MapPin,
  User, Lock, Edit3, Search, UserCheck, DollarSign,
  AlertTriangle, Loader2, Trash2, CheckCircle2, Clock, ListOrdered,
  Mail, ArrowRight
} from 'lucide-react';
import StatsDashboard from './StatsDashboard';
import StaffManager from './StaffManager';
import AccountSecurity from './AccountSecurity';
import AdminShell, { type AdminTab } from './AdminShell';
import AdminListFilters from './AdminListFilters';
import MarketingContacts from './MarketingContacts';
import { filterAdminRecords, type AdminListOptions } from '@/lib/adminLists';
import type { StaffIdentity } from '@/lib/staffAuth';
import AppointmentConfirmationDialog, { type AppointmentConfirmationModalState } from './AppointmentConfirmationDialog';
import { getAppointmentClinic } from '@/lib/appointmentClinics';
import { BLOG_CATEGORIES, BLOG_LANGUAGES, normalizeBlogCategory, normalizeBlogLanguage } from '@/lib/blogConfig';

export const dynamic = 'force-dynamic';

type SpecialAppointmentModalState = {
  appointment: any;
  note: string;
  error: string;
};

type MoneyRange = { min: number; max: number };

function asSafeMoney(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function getMoneyRange(minValue: unknown, maxValue: unknown, legacyValue?: unknown): MoneyRange | null {
  const legacy = asSafeMoney(legacyValue);
  const min = asSafeMoney(minValue) ?? legacy;
  const max = asSafeMoney(maxValue) ?? legacy;
  return min !== null && max !== null && min <= max ? { min, max } : null;
}

function formatMoneyRange(range: MoneyRange | null): string | null {
  if (!range) return null;
  if (range.min === range.max) return `${range.min.toLocaleString('hu-HU')} Ft`;
  return `${range.min.toLocaleString('hu-HU')}–${range.max.toLocaleString('hu-HU')} Ft`;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<StaffIdentity | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('appointments');
  const [checkingSession, setCheckingSession] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(40);
  const [clinicFilter, setClinicFilter] = useState('all');
  const initialFilter: AdminListOptions = { query: '', status: 'all', oldestFirst: false };
  const [filters, setFilters] = useState<Record<'appointments' | 'career' | 'quotes' | 'marketing', AdminListOptions>>({ appointments: initialFilter, career: initialFilter, quotes: initialFilter, marketing: initialFilter });
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [marketingSubscribers, setMarketingSubscribers] = useState<any[]>([]);
  const [appointmentConfirmModal, setAppointmentConfirmModal] = useState<AppointmentConfirmationModalState | null>(null);
  const confirmationSendingRef = useRef(false);
  const [specialAppointmentModal, setSpecialAppointmentModal] = useState<SpecialAppointmentModalState | null>(null);

  const fetchSecureData = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const sessionResponse = await fetch('/api/admin/session', { method: 'POST' });
      const session = await sessionResponse.json();
      if (!sessionResponse.ok) {
        setIsAuthenticated(false); setIdentity(null);
        setAppointments([]); setApplications([]); setQuotes([]); setMarketingSubscribers([]); setPosts([]);
        if (sessionResponse.status !== 401) setDbError(session.error || 'A belépés nem ellenőrizhető.');
        return;
      }
      setIdentity(session.user);
      if (session.user.ownerSetup || !session.user.mfa?.satisfied) {
        setIsAuthenticated(true);
        setAppointments([]); setApplications([]); setQuotes([]); setMarketingSubscribers([]); setPosts([]);
        return;
      }
      if (session.user.role === 'assistant') {
        setActiveTab(tab => tab === 'security' ? tab : 'appointments'); setApplications([]); setQuotes([]); setMarketingSubscribers([]); setPosts([]);
      }
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setIdentity(data.user);
        if (data.user.role === 'assistant') setActiveTab(tab => tab === 'security' ? tab : 'appointments');
        setUpdatedAt(new Date());
        setAppointments(data.appointments || []);
        setApplications(data.applications || []);
        setQuotes(data.quotes || []);
        setMarketingSubscribers(data.marketingSubscribers || []);
        setPosts(data.posts || []);
      } else {
        if (res.status === 401 || res.status === 428) {
          // A first visit on the new host is a normal login, not an error.
          setIsAuthenticated(false); setIdentity(null);
          setAppointments([]); setApplications([]); setQuotes([]); setMarketingSubscribers([]); setPosts([]);
          setDbError(null);
        } else {
          setDbError(data.error || 'Hiba az adatok betöltésekor.');
        }
      }
    } catch {
      setDbError('Hálózati hiba az adatok betöltésekor.');
    } finally {
      setIsLoading(false); setCheckingSession(false);
    }
  };

  useEffect(() => {
    void fetchSecureData();
    // A böngészőben tárolt HttpOnly admin munkamenetet csak egyszer ellenőrizzük betöltéskor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated || identity?.ownerSetup || !identity?.mfa?.satisfied) return;
    const interval = window.setInterval(() => { void fetchSecureData(); }, 5 * 60_000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, identity?.ownerSetup, identity?.mfa?.satisfied]);

  const handleAction = async (
    table: string,
    id: string | number,
    action: 'hide' | 'update_status',
    value?: string,
    extraPayload?: Record<string, unknown>
  ) => {
    if (action === 'hide') {
      const confirmed = window.confirm('Biztosan elrejted a listából ezt a bejegyzést?');
      if (!confirmed) return false;
    }
    setActionLoading(`${action}-${id}`);
    try {
      const res = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, table, id, value, ...(extraPayload || {}) })
      });
      const data = await res.json();
      if (data.success) {
        const updateList = (list: any[], setList: any) => {
          if (action === 'hide') setList(list.filter((i: any) => i.id !== id));
          if (action === 'update_status') {
            setList(list.map((i: any) => i.id === id ? {
              ...i,
              status: value,
              ...(data.appointmentConfirmationDateTime ? { confirmed_appointment_local: data.appointmentConfirmationDateTime } : {}),
              ...(data.appointmentConfirmationClinicId ? { confirmed_clinic_id: data.appointmentConfirmationClinicId } : {}),
              ...(data.appointmentConfirmationSentAt ? { confirmation_email_sent_at: data.appointmentConfirmationSentAt } : {}),
              ...(value === 'cancelled' ? { confirmed_appointment_local: null, confirmed_clinic_id: null, confirmation_email_sent_at: null } : {}),
              ...(data.specialNote ? { special_note: data.specialNote, special_note_updated_at: data.specialNoteUpdatedAt } : {}),
            } : i));
          }
        };
        if (table === 'appointments') updateList(appointments, setAppointments);
        if (table === 'career_applications') updateList(applications, setApplications);
        if (table === 'quote_leads') updateList(quotes, setQuotes);
        if (data.warning) {
          alert(data.warning);
        } else if (data.appointmentConfirmationEmailSent) {
          const clinic = getAppointmentClinic(data.appointmentConfirmationClinicId);
          alert(`Az időpont visszaigazoló e-mail elküldve: ${data.appointmentConfirmationDateTime}${clinic ? `\n${clinic.location}` : ''}`);
        } else if (data.cancellationEmailSent) {
          alert('Az időpontkérés törléséről szóló e-mail elküldve.');
        } else if (data.noAnswerEmailSent) {
          alert('A visszahívást kérő e-mail elküldve.');
        }
        return true;
      } else {
        alert(data.error || 'Hiba történt a módosítás során.');
        return false;
      }
    } catch {
      alert('Hálózati hiba a mentés során.');
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const formatAppointmentDateTime = (value: string) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (!match) return '';
    const [, year, month, day, hour, minute] = match;
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
    if (
      parsed.getUTCFullYear() !== Number(year) ||
      parsed.getUTCMonth() !== Number(month) - 1 ||
      parsed.getUTCDate() !== Number(day) ||
      parsed.getUTCHours() !== Number(hour) ||
      parsed.getUTCMinutes() !== Number(minute)
    ) return '';
    return `${match[1]}.${match[2]}.${match[3]}. ${match[4]}:${match[5]}`;
  };

  const getAppointmentClinicLabel = (appointment: any) => {
    const clinic = getAppointmentClinic(appointment?.confirmed_clinic_id);
    if (clinic) return clinic.location;
    if (appointment?.confirmed_appointment_local || appointment?.status === 'processed') {
      return 'A visszaigazolt rendelő nincs külön rögzítve (korábbi időpont).';
    }
    return 'Rendelő még nincs kiválasztva.';
  };

  const handleAppointmentStatusChange = (appointment: any, value: string) => {
    if (value === 'processed' && appointment.status !== 'processed') {
      setAppointmentConfirmModal({
        appointment,
        dateTime: '',
        clinicId: '',
        step: 'input',
        error: '',
      });
      return;
    }

    if (value === 'special' && appointment.status !== 'special') {
      setSpecialAppointmentModal({
        appointment,
        note: appointment.special_note || '',
        error: '',
      });
      return;
    }

    if (value === 'cancelled' && appointment.status !== 'cancelled') {
      const confirmed = window.confirm('Biztosan sztornózod ezt az időpontkérést? A páciens e-mailt kap arról, hogy az időpontkérését töröltük.');
      if (!confirmed) return;
    }

    handleAction('appointments', appointment.id, 'update_status', value);
  };

  const advanceAppointmentConfirmationReview = () => {
    if (!appointmentConfirmModal || confirmationSendingRef.current) return;

    if (!getAppointmentClinic(appointmentConfirmModal.clinicId)) {
      setAppointmentConfirmModal({
        ...appointmentConfirmModal,
        error: 'Válaszd ki a rendelőt: Crown Dental Belváros vagy Crown Dental Prímás Sziget.',
      });
      return;
    }

    if (!formatAppointmentDateTime(appointmentConfirmModal.dateTime)) {
      setAppointmentConfirmModal({
        ...appointmentConfirmModal,
        error: 'Adj meg egy pontos dátumot és időpontot.',
      });
      return;
    }

    setAppointmentConfirmModal({
      ...appointmentConfirmModal,
      step: 'review',
      error: '',
    });
  };

  const sendAppointmentConfirmation = async () => {
    if (!appointmentConfirmModal || appointmentConfirmModal.step !== 'review' || confirmationSendingRef.current) return;
    if (!getAppointmentClinic(appointmentConfirmModal.clinicId) || !formatAppointmentDateTime(appointmentConfirmModal.dateTime)) {
      setAppointmentConfirmModal({ ...appointmentConfirmModal, step: 'input', error: 'Válassz rendelőt, és add meg a pontos dátumot és időpontot.' });
      return;
    }
    confirmationSendingRef.current = true;
    try {
      const success = await handleAction(
        'appointments',
        appointmentConfirmModal.appointment.id,
        'update_status',
        'processed',
        { appointmentDateTime: appointmentConfirmModal.dateTime, appointmentClinicId: appointmentConfirmModal.clinicId }
      );
      if (success) setAppointmentConfirmModal(null);
    } finally {
      confirmationSendingRef.current = false;
    }
  };

  const sendSpecialAppointmentStatus = async () => {
    if (!specialAppointmentModal) return;

    const note = specialAppointmentModal.note.trim().replace(/\s+/g, ' ');

    if (!note) {
      setSpecialAppointmentModal({
        ...specialAppointmentModal,
        error: 'Különleges egyeztetéshez kötelező rövid megjegyzést írni.',
      });
      return;
    }

    const success = await handleAction(
      'appointments',
      specialAppointmentModal.appointment.id,
      'update_status',
      'special',
      { statusNote: note }
    );

    if (success) setSpecialAppointmentModal(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordInput('');
        await fetchSecureData();
      } else {
        setDbError(data.error || 'Helytelen felhasználónév vagy jelszó!');
      }
    } catch {
      setDbError('Hálózati hiba a bejelentkezés során.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin-logout', { method: 'POST' });
      if (!response.ok) {
        const result = await response.json();
        setDbError(result.error || 'A kijelentkezés nem igazolható vissza.');
      }
    } catch {
      setDbError('A szerveres kijelentkezés hálózati hiba miatt nem igazolható vissza.');
    } finally {
      setIsAuthenticated(false);
      setPasswordInput('');
      setUsernameInput('');
      setIdentity(null);
      setActiveTab('appointments');
      setAppointments([]);
      setApplications([]);
      setQuotes([]);
      setPosts([]);
      setMarketingSubscribers([]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('hu-HU', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'processed') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold"><CheckCircle2 className="w-3 h-3" />{activeTab === 'appointments' ? 'Időpontot kapott' : 'Feldolgozva'}</span>;
    }
    if (status === 'no_answer') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-semibold"><Phone className="w-3 h-3" /> Nem vette fel</span>;
    }
    if (status === 'cancelled') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold"><Trash2 className="w-3 h-3" /> Időpont sztornózva</span>;
    }
    if (status === 'special') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold"><Sparkles className="w-3 h-3" /> Különleges egyeztetés</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold"><Clock className="w-3 h-3" /> Új megkeresés</span>;
  };

  const parseItems = (itemsStr: string | any) => {
    if (typeof itemsStr === 'object') return itemsStr;
    try { return JSON.parse(itemsStr); } catch { return []; }
  };

  const getNamePartsForExport = (fullName: string) => {
    const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts.slice(1).join(' '), lastName: parts[0] };
  };

  const csvCell = (value: unknown) => {
    const raw = String(value ?? '');
    // Prevent spreadsheet formula execution when a public form value begins
    // with a formula sigil, whitespace control character, or tab.
    const safe = /^[=+\-@\t\r\n]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const exportMarketingSubscribers = (records = marketingSubscribers) => {
    const headers = [
      'Email',
      'Name',
      'First name',
      'Last name',
      'Phone',
      'Clinic',
      'Source',
      'Language',
      'Consent status',
      'Consent date',
      'Created at',
    ];

    const rows = records.filter((subscriber) => subscriber.consent_status === 'subscribed').map((subscriber) => {
      const fullName = subscriber.name || '';
      const { firstName, lastName } = getNamePartsForExport(fullName);
      return [
        subscriber.email || '',
        fullName,
        firstName,
        lastName,
        subscriber.phone || '',
        subscriber.clinic || '',
        subscriber.source || '',
        subscriber.locale || '',
        subscriber.consent_status || '',
        subscriber.consented_at || '',
        subscriber.created_at || '',
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(';'))
      .join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crown-dental-email-lista-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (checkingSession) return <main className="flex min-h-dvh items-center justify-center bg-slate-50"><div role="status" className="flex flex-col items-center gap-4 text-sm font-medium text-slate-500"><Loader2 className="h-6 w-6 animate-spin text-sky-700" />Munkatér betöltése…</div></main>;

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (isAuthenticated && identity && (identity.ownerSetup || !identity.mfa?.satisfied)) {
    return <main className="min-h-screen bg-slate-100 px-4 py-8 md:py-14"><AccountSecurity identity={identity} gated onReady={fetchSecureData} onLogout={handleLogout} /></main>;
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#e2f0f8,#f4f7fb_65%)] flex items-center justify-center p-5">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-10 shadow-xl shadow-slate-200/50">
          <a href="/admin/portal" className="mb-6 inline-flex text-sm text-slate-600 underline underline-offset-4">← Vissza a választáshoz</a>
          <Image src="/logo.webp" alt="Crown Dental" width={232} height={145} priority className="mx-auto mb-7 h-24 w-44 object-contain" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center tracking-tight">Üdvözöljük a munkatérben</h1>
          <p className="text-gray-500 mb-8 text-center text-sm font-medium">Lépjen be a saját fiókjával a folytatáshoz.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} aria-label="E-mail-cím vagy meglévő adminnév" autoComplete="username" placeholder="E-mail-cím vagy adminnév" required className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-600 outline-none text-base font-medium" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} aria-label="Jelszó" autoComplete="current-password" placeholder="Jelszó" required className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-600 outline-none text-base font-medium" />
            </div>
            {dbError && <p className="text-red-500 text-center text-sm font-bold bg-red-50 py-2 rounded-xl border border-red-100">{dbError}</p>}
            <button type="submit" disabled={isLoginLoading} className="w-full bg-gray-900 text-white font-black py-4 rounded-xl hover:bg-sky-600 transition-all shadow-lg disabled:bg-gray-400 flex justify-center items-center gap-2">
              {isLoginLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Belépés a munkatérbe'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const getBlogPostPath = (language: string | undefined, slug: string) => {
    const normalizedLanguage = normalizeBlogLanguage(language);
    return `https://www.crowndental.hu${normalizedLanguage === 'hu' ? '' : `/${normalizedLanguage}`}/blog/${slug}`;
  };
  const getBlogLanguageLabel = (language: string | undefined) =>
    BLOG_LANGUAGES.find(item => item.id === normalizeBlogLanguage(language))?.label ?? 'Magyar';
  const getBlogCategoryLabel = (category: string | undefined) =>
    BLOG_CATEGORIES.find(item => item.id === normalizeBlogCategory(category))?.shortLabel ?? 'Szakmai';
  const appointmentClinic = (record: any) => getAppointmentClinic(record.confirmed_clinic_id)?.name || (record.city ? `Kérés: ${record.city}` : 'Rendelő még nincs megadva');
  const clinics = Array.from(new Set(appointments.map(appointmentClinic))).sort((a, b) => a.localeCompare(b, 'hu'));
  const visibleAppointments = filterAdminRecords(appointments, filters.appointments, ['name', 'email', 'phone', 'treatment', 'city', 'special_note']).filter(record => clinicFilter === 'all' || appointmentClinic(record) === clinicFilter);
  const visibleApplications = filterAdminRecords(applications, filters.career, ['name', 'email', 'phone', 'position', 'location']);
  const visibleQuotes = filterAdminRecords(quotes, filters.quotes, ['name', 'email', 'phone']);
  const visibleMarketing = filterAdminRecords(marketingSubscribers, filters.marketing, ['name', 'nickname', 'email', 'phone', 'clinic']);
  const dataTab = ['appointments', 'career', 'quotes', 'marketing'].includes(activeTab) ? activeTab as keyof typeof filters : null;
  const records = activeTab === 'appointments' ? visibleAppointments : activeTab === 'career' ? visibleApplications : activeTab === 'quotes' ? visibleQuotes : visibleMarketing;
  const totalRecords = activeTab === 'appointments' ? appointments.length : activeTab === 'career' ? applications.length : activeTab === 'quotes' ? quotes.length : marketingSubscribers.length;
  const updateFilter = (value: AdminListOptions) => { if (dataTab) setFilters(previous => ({ ...previous, [dataTab]: value })); setVisibleLimit(40); };
  const statusOptions = [{ value: 'new', label: 'Új megkeresés' }, { value: 'processed', label: activeTab === 'appointments' ? 'Időpontot kapott' : 'Feldolgozva' }, ...(activeTab === 'appointments' ? [{ value: 'no_answer', label: 'Nem vette fel' }, { value: 'special', label: 'Különleges egyeztetés' }, { value: 'cancelled', label: 'Sztornózva' }] : [])];

  if (!identity) return null;
  return (<AdminShell identity={identity} activeTab={activeTab} onSelect={tab => { setActiveTab(tab); setExpandedId(null); setVisibleLimit(40); }} refreshing={isLoading} onRefresh={() => void fetchSecureData()} onLogout={() => void handleLogout()} updatedAt={updatedAt} pendingCount={identity.role === 'admin' ? appointments.filter(item => !item.status || item.status === 'new').length : 0}>
          {dbError && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div><p className="font-black uppercase text-xs">Szerver Hiba</p><p className="text-sm font-medium">{dbError}</p></div>
            </div>
          )}

          {dataTab && <AdminListFilters value={filters[dataTab]} onChange={updateFilter} total={totalRecords} visible={records.length} statuses={activeTab === 'marketing' ? undefined : statusOptions} clinics={activeTab === 'appointments' ? clinics : undefined} clinic={activeTab === 'appointments' ? clinicFilter : 'all'} onClinicChange={activeTab === 'appointments' ? value => { setClinicFilter(value); setVisibleLimit(40); } : undefined} />}

          <AnimatePresence mode="wait">

            {/* STATS */}
            {activeTab === 'security' && identity ? (
              <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AccountSecurity identity={identity} onReady={fetchSecureData} onLogout={handleLogout} /></motion.div>
            ) : activeTab === 'staff' && identity?.role === 'admin' ? (
              <motion.div key="staff" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><StaffManager identity={identity} /></motion.div>
            ) : activeTab === 'stats' && identity?.role === 'admin' ? (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <StatsDashboard appointments={appointments} quotes={quotes} marketingSubscriberCount={marketingSubscribers.length} />
              </motion.div>
            ) : activeTab === 'blog' && identity?.role === 'admin' ? (
              <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">

                {/* STUDIO LINK */}
                <div className="bg-gray-900 rounded-2xl p-5 text-white flex items-center justify-between gap-4 border border-white/5">
                  <div>
                    <h3 className="font-black text-sky-400 flex items-center gap-2 text-sm"><Edit3 className="w-4 h-4" /> Sanity Studio CMS</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Képek feltöltése, cikkek szerkesztése</p>
                  </div>
                  <a href="https://www.crowndental.hu/studio" target="_blank" className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-all text-xs uppercase tracking-widest whitespace-nowrap">
                    STÚDIÓ <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* POST LIST */}
                <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/20 border border-slate-200/80 overflow-hidden divide-y divide-gray-100">
                  {posts.length === 0 && !isLoading && <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest italic text-xs">Nincsenek publikált cikkek...</div>}
                  {posts.map(post => (
                    <div key={post._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-all">
                      <div className="flex-1 mr-3 min-w-0">
                        <h5 className="font-black text-gray-900 truncate">{post.title}</h5>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-gray-400 text-xs font-bold uppercase">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('hu-HU') : 'Friss cikk'}</p>
                          <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">{getBlogLanguageLabel(post.language)}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">{getBlogCategoryLabel(post.category)}</span>
                        </div>
                      </div>
                      <a href={getBlogPostPath(post.language, post.slug)} target="_blank" className="p-3 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-600 hover:text-white transition-all flex-shrink-0"><Search className="w-5 h-5" /></a>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === 'marketing' && identity?.role === 'admin' ? (
              <motion.div key="marketing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><MarketingContacts records={visibleMarketing} onExport={() => exportMarketingSubscribers(visibleMarketing)} /></motion.div>
            ) : (

              /* DATA CARDS */
              <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">

                {activeTab === 'appointments' && identity?.role === 'admin' && <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-4">{[
                  { status: 'new', label: 'Új megkeresés', color: 'text-sky-800', bg: 'bg-sky-50/70' },
                  { status: 'no_answer', label: 'Visszahívás', color: 'text-amber-800', bg: 'bg-amber-50/70' },
                  { status: 'processed', label: 'Időpontot kapott', color: 'text-emerald-800', bg: 'bg-emerald-50/70' },
                ].map(tile => <button key={tile.status} onClick={() => updateFilter({ ...filters.appointments, status: filters.appointments.status === tile.status ? 'all' : tile.status })} aria-pressed={filters.appointments.status === tile.status} className={`rounded-2xl border p-3 text-left transition sm:p-5 ${tile.bg} ${filters.appointments.status === tile.status ? 'border-sky-500 ring-1 ring-sky-500' : 'border-transparent hover:border-slate-200'}`}><p className={`text-2xl font-bold tracking-tight sm:text-3xl ${tile.color}`}>{appointments.filter(item => (item.status || 'new') === tile.status).length}</p><p className={`mt-1.5 text-[10px] font-medium leading-snug sm:text-xs ${tile.color}`}>{tile.label}</p></button>)}</div>}

                {/* APPOINTMENTS */}
                {activeTab === 'appointments' && visibleAppointments.slice(0, visibleLimit).map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm shadow-slate-200/20 border border-slate-200/80 overflow-hidden relative">
                    <button aria-expanded={expandedId === item.id} className="w-full text-left p-5 xl:pr-60 flex items-start gap-3 hover:bg-slate-50/70 transition-colors" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getStatusBadge(item.status)}
                          <span className="ml-auto text-[11px] text-slate-500">{formatDate(item.created_at)}</span>
                        </div>
                        <p className="text-base font-semibold tracking-tight text-slate-900 break-words">{item.name}</p>
                        <span className="mt-2 block text-sm leading-relaxed text-slate-500">{item.treatment}</span>
                        {item.confirmed_appointment_local && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{formatAppointmentDateTime(item.confirmed_appointment_local) || item.confirmed_appointment_local}</p>}
                        {item.status === 'special' && item.special_note && <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-purple-700"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{item.special_note}</p>}
                        {(item.confirmed_appointment_local || item.status === 'processed') && (
                          <p className={`mt-2 flex items-start gap-1 text-sm font-bold ${getAppointmentClinic(item.confirmed_clinic_id) ? 'text-emerald-800' : 'text-amber-800'}`}>
                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            {getAppointmentClinic(item.confirmed_clinic_id)?.name || 'Rendelő nincs külön rögzítve (korábbi időpont)'}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-sky-400 mt-1">
                        {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>
                    <div className="flex gap-2 px-5 pb-4 xl:absolute xl:right-5 xl:top-9 xl:w-48 xl:p-0"><a href={`tel:${item.phone}`} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-50 text-sm font-semibold text-sky-800 hover:bg-sky-100"><Phone className="h-4 w-4" aria-hidden="true" /> Hívás</a><a href={`mailto:${item.email}`} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Mail className="h-4 w-4" aria-hidden="true" /> E-mail</a></div>
                    {expandedId === item.id && (
                      <div className="border-t border-sky-100 bg-sky-50/20 p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 min-w-0 bg-white rounded-xl p-3 border border-sky-100 sm:col-span-1">
                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Telefon</p>
                            <a href={`tel:${item.phone}`} className="font-black text-gray-900 text-sm hover:text-sky-600 block">{item.phone}</a>
                            <a className="mt-1 block break-all text-xs text-sky-800" href={`mailto:${item.email}`}>{item.email}</a>
                          </div>
                          <div className="col-span-2 bg-white rounded-xl p-3 border border-sky-100 sm:col-span-1">
                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Rendelő</p>
                            <p className="font-black text-gray-900 text-sm">{getAppointmentClinicLabel(item)}</p>
                            <p className="mt-1 text-xs text-slate-500">Kérés helyszíne: {item.city || 'Nincs megadva'}</p>
                          </div>
                          {item.confirmed_appointment_local && (
                            <div className="col-span-2 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Kapott időpont</p>
                              <p className="font-black text-emerald-950 text-lg">{formatAppointmentDateTime(item.confirmed_appointment_local) || item.confirmed_appointment_local}</p>
                              {item.confirmation_email_sent_at && (
                                <p className="text-emerald-700/70 text-xs mt-0.5">Visszaigazoló e-mail elküldve: {formatDate(item.confirmation_email_sent_at)}</p>
                              )}
                            </div>
                          )}
                          {item.status === 'special' && item.special_note && (
                            <div className="col-span-2 bg-purple-50 rounded-xl p-3 border border-purple-100">
                              <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Különleges egyeztetés megjegyzés</p>
                              <p className="font-black text-purple-950 text-sm">{item.special_note}</p>
                              {item.special_note_updated_at && (
                                <p className="text-purple-700/70 text-xs mt-0.5">Frissítve: {formatDate(item.special_note_updated_at)}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-sky-100 space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adminisztráció</p>
                          <select aria-label={`${item.name} státusza`} value={item.status || 'new'} disabled={actionLoading !== null} onChange={(e) => handleAppointmentStatusChange(item, e.target.value)} className="w-full min-h-12 p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-base text-gray-700 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60 sm:text-sm">
                            <option value="new">Új Kérelem</option>
                            <option value="no_answer">Felhívtuk – Nem vette fel</option>
                            <option value="processed">Időpontot kapott / Feldolgozva</option>
                            <option value="cancelled">Időpont sztornózva</option>
                            <option value="special">Különleges Egyeztetés</option>
                          </select>
                          <button onClick={() => handleAction('appointments', item.id, 'hide')} className="w-full py-2.5 text-red-500 hover:bg-red-50 font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-red-100">
                            {actionLoading === `hide-${item.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Elrejtés</>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* CAREER */}
                {activeTab === 'career' && visibleApplications.slice(0, visibleLimit).map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm shadow-slate-200/20 border border-slate-200/80 overflow-hidden">
                    <button aria-expanded={expandedId === item.id} className="w-full text-left p-5 flex items-start gap-3 hover:bg-slate-50/70 transition-colors" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getStatusBadge(item.status)}
                          <span className="ml-auto text-[11px] text-slate-500">{formatDate(item.created_at)}</span>
                        </div>
                        <p className="text-base font-semibold tracking-tight text-slate-900 break-words">{item.name}</p>
                        <span className="inline-block mt-1 bg-amber-100 text-amber-800 px-3 py-0.5 rounded-full text-[10px] font-black uppercase">{item.position}</span>
                      </div>
                      <div className="flex-shrink-0 text-amber-500 mt-1">
                        {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>
                    {expandedId === item.id && (
                      <div className="border-t border-amber-100 bg-amber-50/20 p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white rounded-xl p-3 border border-amber-100">
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Kapcsolat</p>
                            <a className="block min-h-11 py-2 text-sm font-semibold text-sky-800" href={`tel:${item.phone}`}>{item.phone}</a>
                            <a className="block break-all text-xs text-sky-800 underline" href={`mailto:${item.email}`}>{item.email}</a>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-amber-100">
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Tapasztalat</p>
                            <p className="font-black text-gray-900 text-sm uppercase">{item.location}</p>
                            <p className="text-gray-500 text-xs">{item.experience === '5' ? 'Szenior (5+ év)' : `${item.experience} év`}</p>
                          </div>
                        </div>
                        {item.message && (
                          <div className="bg-white rounded-xl p-3 border border-amber-100 relative overflow-hidden">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Motivációs levél</p>
                            <p className="text-gray-700 text-sm leading-relaxed italic">"{item.message}"</p>
                          </div>
                        )}
                        <div className="bg-white rounded-xl p-3 border border-amber-100 space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HR Adminisztráció</p>
                          <select aria-label={`${item.name} státusza`} value={item.status || 'new'} onChange={(e) => handleAction('career_applications', item.id, 'update_status', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-sm text-gray-700 outline-none focus:border-amber-400">
                            <option value="new">Új Jelentkező</option>
                            <option value="processed">Feldolgozva / Felhívva</option>
                          </select>
                          <button onClick={() => handleAction('career_applications', item.id, 'hide')} className="w-full py-2.5 text-red-500 hover:bg-red-50 font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-red-100">
                            {actionLoading === `hide-${item.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Elutasít / Elrejt</>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* QUOTES */}
                {activeTab === 'quotes' && visibleQuotes.slice(0, visibleLimit).map(item => {
                  const quoteItems = parseItems(item.items);
                  const crownTotalRange = getMoneyRange(item.crown_total_min, item.crown_total_max, item.new_total);
                  const savingsRange = getMoneyRange(item.savings_min, item.savings_max, item.savings);
                  const crownTotalLabel = formatMoneyRange(crownTotalRange);
                  const savingsLabel = formatMoneyRange(savingsRange);
                  const requiresManualReview = Boolean(item.requires_manual_review) || !crownTotalRange;
                  return (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm shadow-slate-200/20 border border-slate-200/80 overflow-hidden">
                      <button aria-expanded={expandedId === item.id} className="w-full text-left p-5 flex items-start gap-3 hover:bg-slate-50/70 transition-colors" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {getStatusBadge(item.status)}
                            <span className="ml-auto text-[11px] text-slate-500">{formatDate(item.created_at)}</span>
                          </div>
                          <p className="text-base font-semibold tracking-tight text-slate-900 break-words">{item.name}</p>
                          <p className={`font-black text-lg mt-0.5 ${requiresManualReview ? 'text-amber-600' : savingsLabel ? 'text-green-600' : 'text-gray-500'}`}>
                            {requiresManualReview
                              ? 'Kézi ellenőrzés szükséges'
                              : savingsLabel
                                ? `${savingsLabel} becsült megtakarítás`
                                : 'Nem állapítható meg biztos megtakarítás'}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-green-500 mt-1">
                          {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>
                      {expandedId === item.id && (
                        <div className="border-t border-green-100 bg-green-50/20 p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl p-3 border border-green-100 text-center">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Versenytárs ára</p>
                              <p className="text-lg font-bold text-gray-400 line-through italic">{item.original_total?.toLocaleString('hu-HU')} Ft</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-green-100 ring-2 ring-green-100 text-center">
                              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1 flex items-center gap-1 justify-center"><DollarSign className="w-3 h-3" /> Crown Ár</p>
                              <p className="text-xl font-black text-sky-700">{crownTotalLabel || 'Kézi ellenőrzés'}</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-green-100 space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Értékesítés</p>
                            <a href={`tel:${item.phone}`} className="w-full bg-gray-900 text-white py-3 rounded-xl font-black hover:bg-sky-500 transition-all text-sm uppercase tracking-widest text-center flex items-center justify-center gap-2">
                              <Phone className="w-4 h-4" /> Hívás indítása
                            </a>
                            <p className="break-words text-xs text-gray-500 text-center">{item.phone} · {item.email}</p>
                            <select aria-label={`${item.name} státusza`} value={item.status || 'new'} onChange={(e) => handleAction('quote_leads', item.id, 'update_status', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-sm text-gray-700 outline-none focus:border-green-400">
                              <option value="new">Új Lead (Még nincs hívva)</option>
                              <option value="processed">Feldolgozva / Siker</option>
                            </select>
                            <button onClick={() => handleAction('quote_leads', item.id, 'hide')} className="w-full py-2.5 text-red-500 hover:bg-red-50 font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-red-100">
                              {actionLoading === `hide-${item.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Elrejtés</>}
                            </button>
                          </div>
                          {quoteItems && quoteItems.length > 0 && (
                            <div className="bg-white rounded-xl p-4 border border-green-100">
                              <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-2"><ListOrdered className="w-4 h-4 text-green-500" /> Kezelések</h4>
                              <div className="space-y-2">
                                {quoteItems.map((qItem: any, idx: number) => {
                                  const competitorPrice = asSafeMoney(qItem.competitorPrice);
                                  const itemRange = getMoneyRange(qItem.ourPriceMin, qItem.ourPriceMax, qItem.ourPrice);
                                  const itemRangeLabel = formatMoneyRange(itemRange);
                                  const itemSavingRange = competitorPrice !== null && itemRange && competitorPrice > itemRange.max
                                    ? { min: competitorPrice - itemRange.max, max: competitorPrice - itemRange.min }
                                    : null;
                                  const itemSavingLabel = formatMoneyRange(itemSavingRange);
                                  return (
                                    <div key={idx} className="flex justify-between items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                                      <span className="font-bold text-gray-800 text-sm flex-1">{qItem.name}</span>
                                      <div className="text-right text-xs flex-shrink-0">
                                        <p className="text-gray-400 line-through">{competitorPrice !== null ? `${competitorPrice.toLocaleString('hu-HU')} Ft` : '-'}</p>
                                        <p className="font-black text-sky-600">{itemRangeLabel || 'Kézi ellenőrzés'}</p>
                                        {itemSavingLabel && <p className="font-black text-green-500">{itemSavingLabel} becsült megtakarítás</p>}
                                      </div>
                                    </div>
                                  );
                                })}
                                <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                                  <span className="font-black text-gray-900 text-xs uppercase tracking-wider">Összesen</span>
                                  <div className="text-right text-xs">
                                    <p className="text-gray-400 line-through">{item.original_total?.toLocaleString('hu-HU')} Ft</p>
                                    <p className="font-black text-sky-700">{crownTotalLabel || 'Kézi ellenőrzés'}</p>
                                    <p className={`font-black text-sm ${savingsLabel ? 'text-green-600' : 'text-amber-600'}`}>
                                      {requiresManualReview ? 'Kézi ellenőrzés szükséges' : savingsLabel ? `${savingsLabel} becsült megtakarítás` : 'Nincs biztos megtakarítás'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* EMPTY STATE */}
                {(['appointments', 'career', 'quotes'].includes(activeTab) && records.length === 0) && !isLoading && (
                  <div className="py-24 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                      <Search className="w-7 h-7 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Nincs találat a megadott szűrőkkel.</p>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        {dataTab && dataTab !== 'marketing' && records.length > visibleLimit && <div className="mt-6 text-center"><p className="mb-3 text-xs text-slate-500">{Math.min(visibleLimit, records.length)} / {records.length} bejegyzés</p><button onClick={() => setVisibleLimit(value => value + 40)} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-sky-800">További bejegyzések <ArrowRight className="h-4 w-4" /></button></div>}

      <AnimatePresence>
        {appointmentConfirmModal && (
          <AppointmentConfirmationDialog
            key="appointment-confirmation-modal"
            state={appointmentConfirmModal}
            busy={actionLoading === `update_status-${appointmentConfirmModal.appointment.id}`}
            displayDateTime={formatAppointmentDateTime(appointmentConfirmModal.dateTime)}
            onChange={setAppointmentConfirmModal}
            onClose={() => { if (!confirmationSendingRef.current) setAppointmentConfirmModal(null); }}
            onReview={advanceAppointmentConfirmationReview}
            onSend={sendAppointmentConfirmation}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {specialAppointmentModal && (
          <motion.div
            key="special-appointment-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-950/75 backdrop-blur-sm flex items-start sm:items-center justify-center overflow-y-auto overscroll-contain p-3 py-4 sm:p-4 sm:py-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]"
            >
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-slate-950 p-5 sm:p-8 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-100 mb-2">Különleges egyeztetés</p>
                    <h3 className="text-2xl sm:text-3xl font-black leading-tight">Rövid megjegyzés szükséges</h3>
                    <p className="text-purple-100 text-sm sm:text-base mt-2 leading-relaxed">
                      Ezt akkor használd, ha egyedi egyeztetés kell, például hétvégi fájdalom, későbbi jelentkezés vagy orvosi döntés miatt.
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 pb-0 sm:p-8 sm:pb-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Páciens</p>
                    <p className="font-black text-slate-950">{specialAppointmentModal.appointment.name}</p>
                    <p className="text-sm text-slate-500 truncate">{specialAppointmentModal.appointment.email}</p>
                    <p className="text-sm text-slate-500">{specialAppointmentModal.appointment.phone}</p>
                  </div>
                  <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1">Kezelés</p>
                    <p className="font-black text-slate-950">{specialAppointmentModal.appointment.treatment || 'Fogászati időpont'}</p>
                    <p className="text-sm text-slate-600">{getAppointmentClinicLabel(specialAppointmentModal.appointment)}</p>
                  </div>
                </div>

                <label className="block">
                  <span className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Megjegyzés kötelező</span>
                  <textarea
                    value={specialAppointmentModal.note}
                    onChange={(event) => setSpecialAppointmentModal({ ...specialAppointmentModal, note: event.target.value, error: '' })}
                    maxLength={280}
                    rows={4}
                    placeholder="Pl.: Hétvégén jelentkezik, ha fáj. / Fájdalom esetén orvos dönti el. / Később egyeztetünk."
                    className="w-full resize-none rounded-2xl border border-purple-100 bg-purple-50/50 px-4 py-4 text-base font-bold text-slate-950 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                  />
                  <span className="mt-2 block text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {specialAppointmentModal.note.trim().length}/280
                  </span>
                </label>

                {specialAppointmentModal.error && (
                  <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-600">
                    {specialAppointmentModal.error}
                  </div>
                )}

                <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 pt-4 backdrop-blur sm:-mx-8 sm:flex-row sm:px-8">
                  <button
                    type="button"
                    onClick={() => setSpecialAppointmentModal(null)}
                    className="sm:w-40 rounded-2xl border border-slate-200 px-5 py-4 font-black text-slate-600 hover:bg-slate-50"
                  >
                    Mégsem
                  </button>
                  <button
                    type="button"
                    onClick={sendSpecialAppointmentStatus}
                    disabled={!specialAppointmentModal.note.trim() || actionLoading === `update_status-${specialAppointmentModal.appointment.id}`}
                    className="flex-1 rounded-2xl bg-purple-600 px-5 py-4 font-black text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700 disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {actionLoading === `update_status-${specialAppointmentModal.appointment.id}` ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Különleges egyeztetés mentése
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </AdminShell>
  );
}
