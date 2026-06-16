'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Briefcase, Sparkles, BookOpen, ChevronDown, ChevronUp,
  RefreshCw, LogOut, ExternalLink, Phone, MapPin, ShieldAlert,
  User, Lock, Edit3, Search, UserCheck, DollarSign, MessageSquare,
  AlertTriangle, Loader2, Trash2, CheckCircle2, Clock, ListOrdered,
  Wand2, Send, Eye, EyeOff, FileText, ImageIcon, Zap, BrainCircuit,
  BarChart3, Globe2, Layers3, Mail, Download
} from 'lucide-react';
import StatsDashboard from './StatsDashboard';
import { BLOG_CATEGORIES, BLOG_LANGUAGES, normalizeBlogCategory, normalizeBlogLanguage } from '@/lib/blogConfig';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'stats' | 'appointments' | 'career' | 'quotes' | 'blog' | 'marketing'>('stats');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [marketingSubscribers, setMarketingSubscribers] = useState<any[]>([]);

  // Blog generator state
  const [genTopic, setGenTopic] = useState('');
  const [genKeywords, setGenKeywords] = useState('');
  const [genLang, setGenLang] = useState('hu');
  const [genCategory, setGenCategory] = useState('professional');
  const [genLoading, setGenLoading] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genResult, setGenResult] = useState<any>(null);
  const [genError, setGenError] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const genStepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const GEN_STEPS = [
    { icon: BrainCircuit, label: 'AI elemzi a témát...', color: 'text-sky-400', bg: 'bg-sky-400/20' },
    { icon: FileText,     label: 'Cikkstruktúra felépítése...', color: 'text-purple-400', bg: 'bg-purple-400/20' },
    { icon: Zap,          label: 'SEO szöveg megírása...', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
    { icon: ImageIcon,    label: 'Borítókép keresése...', color: 'text-pink-400', bg: 'bg-pink-400/20' },
  ];

  useEffect(() => {
    if (genLoading) {
      setGenStep(0);
      genStepRef.current = setInterval(() => {
        setGenStep(s => Math.min(s + 1, GEN_STEPS.length - 1));
      }, 6000);
    } else {
      if (genStepRef.current) clearInterval(genStepRef.current);
    }
    return () => { if (genStepRef.current) clearInterval(genStepRef.current); };
  }, [genLoading]);

  const fetchSecureData = async (pwd: string) => {
    setIsLoading(true);
    setDbError(null);
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
        setApplications(data.applications);
        setQuotes(data.quotes);
        setMarketingSubscribers(data.marketingSubscribers || []);
        setPosts(data.posts);
      } else {
        setDbError(data.error || 'Hiba az adatok betöltésekor.');
        if (res.status === 401) setIsAuthenticated(false);
      }
    } catch {
      setDbError('Hálózati hiba az adatok betöltésekor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (table: string, id: string | number, action: 'hide' | 'update_status', value?: string) => {
    if (action === 'hide') {
      const confirmed = window.confirm('Biztosan törlöd a listából ezt a bejegyzést?');
      if (!confirmed) return;
    }
    setActionLoading(`${action}-${id}`);
    try {
      const res = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput, action, table, id, value })
      });
      const data = await res.json();
      if (data.success) {
        const updateList = (list: any[], setList: any) => {
          if (action === 'hide') setList(list.filter((i: any) => i.id !== id));
          if (action === 'update_status') setList(list.map((i: any) => i.id === id ? { ...i, status: value } : i));
        };
        if (table === 'appointments') updateList(appointments, setAppointments);
        if (table === 'career_applications') updateList(applications, setApplications);
        if (table === 'quote_leads') updateList(quotes, setQuotes);
        if (data.warning) {
          alert(data.warning);
        } else if (data.noAnswerEmailSent) {
          alert('A visszahívást kérő e-mail elküldve.');
        }
      } else {
        alert(data.error || 'Hiba történt a módosítás során.');
      }
    } catch {
      alert('Hálózati hiba a mentés során.');
    } finally {
      setActionLoading(null);
    }
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
        setIsAuthenticated(true);
        await fetchSecureData(passwordInput);
      } else {
        setDbError(data.error || 'Helytelen felhasználónév vagy jelszó!');
      }
    } catch {
      setDbError('Hálózati hiba a bejelentkezés során.');
    } finally {
      setIsLoginLoading(false);
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
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Feldolgozva</span>;
    }
    if (status === 'no_answer') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider"><Phone className="w-3 h-3" /> Nem vette fel</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider animate-pulse"><Clock className="w-3 h-3" /> Új Kérelem</span>;
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

  const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const exportMarketingSubscribers = () => {
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

    const rows = marketingSubscribers.map((subscriber) => {
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

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1 text-center tracking-tight">CROWN ADMIN</h1>
          <p className="text-gray-500 mb-8 text-center text-sm font-medium">Titkosított belépés a vezérlőpultba</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Felhasználónév" required className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-600 outline-none font-bold" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Jelszó" required className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-600 outline-none font-bold tracking-widest" />
            </div>
            {dbError && <p className="text-red-500 text-center text-sm font-bold bg-red-50 py-2 rounded-xl border border-red-100">{dbError}</p>}
            <button type="submit" disabled={isLoginLoading} className="w-full bg-gray-900 text-white font-black py-4 rounded-xl hover:bg-sky-600 transition-all shadow-lg disabled:bg-gray-400 flex justify-center items-center gap-2">
              {isLoginLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'RENDSZER BELÉPÉS'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── TAB CONFIG ────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'stats' as const, label: 'Statisztika', icon: BarChart3, count: null },
    { id: 'appointments' as const, label: 'Időpontok', icon: Calendar, count: appointments.length },
    { id: 'career' as const, label: 'Karrier', icon: Briefcase, count: applications.length },
    { id: 'quotes' as const, label: 'AI Leads', icon: Sparkles, count: quotes.length },
    { id: 'blog' as const, label: 'Blog', icon: BookOpen, count: null },
    { id: 'marketing' as const, label: 'Email lista', icon: Mail, count: marketingSubscribers.length },
  ];

  const tabLabel = tabs.find(t => t.id === activeTab)?.label ?? '';
  const getBlogPostPath = (language: string | undefined, slug: string) => {
    const normalizedLanguage = normalizeBlogLanguage(language);
    return `${normalizedLanguage === 'hu' ? '' : `/${normalizedLanguage}`}/blog/${slug}`;
  };
  const getBlogLanguageLabel = (language: string | undefined) =>
    BLOG_LANGUAGES.find(item => item.id === normalizeBlogLanguage(language))?.label ?? 'Magyar';
  const getBlogCategoryLabel = (category: string | undefined) =>
    BLOG_CATEGORIES.find(item => item.id === normalizeBlogCategory(category))?.shortLabel ?? 'Szakmai';
  const marketingClinicStats = Object.entries(
    marketingSubscribers.reduce<Record<string, number>>((totals, subscriber) => {
      const clinic = subscriber.clinic || 'Nincs megadva';
      totals[clinic] = (totals[clinic] || 0) + 1;
      return totals;
    }, {})
  );

  // ── MAIN DASHBOARD ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-72 bg-gray-950 text-white flex-col flex-shrink-0 shadow-2xl sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div>
            <h1 className="text-lg font-black text-white tracking-tighter italic">CROWN DENTAL</h1>
            <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mt-0.5 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Titkosított Kapcsolat</p>
          </div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
        </div>
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => { setActiveTab(id); setExpandedId(null); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === id ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'text-gray-500 hover:bg-gray-900 hover:text-white'}`}>
              <Icon className="w-5 h-5 flex-shrink-0" /> {label}
              {count !== null && <span className="ml-auto bg-black/30 text-[10px] py-0.5 px-2 rounded-full border border-white/5">{count}</span>}
            </button>
          ))}
        </nav>
        <div className="p-5 border-t border-white/5 bg-black/40">
          <button onClick={() => { setIsAuthenticated(false); setPasswordInput(''); setUsernameInput(''); setAppointments([]); setMarketingSubscribers([]); }} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold">
            <LogOut className="w-4 h-4" /> Kijelentkezés
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-8 md:py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest md:hidden">Crown Admin</p>
            <h2 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight italic uppercase">{tabLabel}</h2>
          </div>
          <button onClick={() => fetchSecureData(passwordInput)} disabled={isLoading} className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-all text-sm">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Frissítés</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-3 md:p-8">
          {dbError && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div><p className="font-black uppercase text-xs">Szerver Hiba</p><p className="text-sm font-medium">{dbError}</p></div>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* STATS */}
            {activeTab === 'stats' ? (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <StatsDashboard appointments={appointments} quotes={quotes} adminPassword={passwordInput} />
              </motion.div>
            ) : activeTab === 'blog' ? (
              <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">

                {/* AI BLOG GENERATOR */}
                <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl border border-white/5 space-y-4 relative overflow-hidden">
                  <h3 className="text-lg font-black flex items-center gap-2 text-sky-400"><Wand2 className="w-5 h-5" /> AI Cikkgeneráló</h3>

                  <AnimatePresence mode="wait">
                  {genLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-6 py-6"
                    >
                      {/* Pulsing glow + spinning icon */}
                      <div className="relative flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute w-24 h-24 rounded-full bg-sky-500/20 blur-xl"
                        />
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-sky-500/30"
                        >
                          <Wand2 className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>

                      {/* Topic */}
                      <div className="text-center">
                        <p className="text-white font-black text-base">Cikk generálása...</p>
                        <p className="text-sky-400 text-sm mt-1 font-medium max-w-xs truncate">"{genTopic}"</p>
                      </div>

                      {/* Steps */}
                      <div className="w-full space-y-2">
                        {GEN_STEPS.map((step, i) => {
                          const Icon = step.icon;
                          const done = genStep > i;
                          const active = genStep === i;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: i <= genStep ? 1 : 0.25, x: 0 }}
                              transition={{ delay: i * 0.08, duration: 0.3 }}
                              className="flex items-center gap-3"
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-green-500/20' : active ? step.bg : 'bg-white/5'}`}>
                                {done
                                  ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  : active
                                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                                        <Icon className={`w-4 h-4 ${step.color}`} />
                                      </motion.div>
                                    : <Icon className="w-4 h-4 text-gray-600" />}
                              </div>
                              <span className={`text-sm font-medium ${done ? 'text-green-400' : active ? 'text-white' : 'text-gray-600'}`}>
                                {step.label}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400"
                          animate={{ width: `${10 + (genStep / (GEN_STEPS.length - 1)) * 80}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                    <input
                      value={genTopic} onChange={e => { setGenTopic(e.target.value); setGenResult(null); setPublishSuccess(''); setGenError(''); }}
                      placeholder="Téma (pl. Mennyibe kerül egy implantátum Magyarországon?)"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm outline-none focus:border-sky-400"
                    />
                    <input
                      value={genKeywords} onChange={e => setGenKeywords(e.target.value)}
                      placeholder="Kulcsszavak vesszővel (pl. implantátum ár, fogászat esztergom)"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm outline-none focus:border-sky-400"
                    />
                    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-3">
                      <label className="relative">
                        <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300" />
                        <select value={genLang} onChange={e => setGenLang(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm outline-none focus:border-sky-400">
                          {BLOG_LANGUAGES.filter(language => language.id !== 'de').map(language => (
                            <option key={language.id} value={language.id} className="text-gray-900">{language.shortLabel} – {language.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="relative">
                        <Layers3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300" />
                        <select value={genCategory} onChange={e => setGenCategory(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm outline-none focus:border-sky-400">
                          {BLOG_CATEGORIES.map(category => (
                            <option key={category.id} value={category.id} className="text-gray-900">{category.label}</option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={async () => {
                          if (!genTopic.trim()) return;
                          setGenLoading(true); setGenError(''); setGenResult(null); setPublishSuccess('');
                          try {
                            const res = await fetch('/api/generate-blog-post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: genTopic, keywords: genKeywords, language: genLang, category: genCategory }) });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error);
                            setGenResult(data); setShowPreview(true);
                          } catch(e: any) { setGenError(e.message); }
                          finally { setGenLoading(false); }
                        }}
                        disabled={!genTopic.trim()}
                        className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                      >
                        <Wand2 className="w-4 h-4" /> Generálás
                      </button>
                    </div>
                    </motion.div>
                  )}
                  </AnimatePresence>

                  {!genLoading && genError && <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-300 text-sm font-bold">{genError}</div>}

                  {genResult && (
                    <div className="border border-white/10 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-white/5">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-black text-white truncate">{genResult.title}</p>
                          <p className="text-gray-400 text-xs mt-0.5">/{genResult.slug} · {getBlogLanguageLabel(genResult.language)} · {getBlogCategoryLabel(genResult.category)} · {genResult.content?.length ?? 0} blokk · ~{genResult.wordCount ?? '?'} szó{genResult.pexelsImage ? ' · 📷 kép kész' : ''}</p>
                        </div>
                        <button onClick={() => setShowPreview(v => !v)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex-shrink-0">
                          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {showPreview && (
                        <div className="p-4 bg-white/5 space-y-2 max-h-80 overflow-y-auto text-sm">
                          {genResult.pexelsImage && (
                            <div className="relative rounded-xl overflow-hidden mb-3">
                              <img src={genResult.pexelsImage.url} alt="Cikk borítókép" className="w-full h-36 object-cover" />
                              <a href={genResult.pexelsImage.creditUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-1 right-2 text-white/70 text-[10px] hover:text-white">
                                © {genResult.pexelsImage.credit} / Pexels
                              </a>
                            </div>
                          )}
                          <p className="text-gray-300 italic text-xs">{genResult.excerpt}</p>
                          <hr className="border-white/10" />
                          {genResult.content?.slice(0, 8).map((block: any, i: number) => (
                            <p key={i} className={`${block.style === 'h2' ? 'font-black text-sky-300' : block.style === 'h3' ? 'font-bold text-sky-200' : 'text-gray-300'} text-xs leading-relaxed`}>
                              {block.children?.[0]?.text}
                            </p>
                          ))}
                          {(genResult.content?.length ?? 0) > 8 && <p className="text-gray-500 text-xs italic">... és még {genResult.content.length - 8} blokk</p>}
                        </div>
                      )}

                      <div className="px-4 py-3 bg-white/5 flex gap-3">
                        {publishSuccess ? (
                          <div className="flex-1 flex items-center gap-2 text-green-400 font-black text-sm"><CheckCircle2 className="w-4 h-4" /> {publishSuccess}</div>
                        ) : (
                          <button
                            onClick={async () => {
                              setPublishLoading(true);
                              try {
                                const res = await fetch('/api/publish-blog-post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(genResult) });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error);
                                setPublishSuccess(`Feltöltve! → ${getBlogPostPath(data.language, data.slug)}`);
                              } catch(e: any) { setGenError(e.message); }
                              finally { setPublishLoading(false); }
                            }}
                            disabled={publishLoading}
                            className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white font-black rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
                          >
                            {publishLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Feltöltés...</> : <><Send className="w-4 h-4" /> Feltöltés Sanity-be</>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* STUDIO LINK */}
                <div className="bg-gray-900 rounded-2xl p-5 text-white flex items-center justify-between gap-4 border border-white/5">
                  <div>
                    <h3 className="font-black text-sky-400 flex items-center gap-2 text-sm"><Edit3 className="w-4 h-4" /> Sanity Studio CMS</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Képek feltöltése, cikkek szerkesztése</p>
                  </div>
                  <a href="/studio" target="_blank" className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-all text-xs uppercase tracking-widest whitespace-nowrap">
                    STÚDIÓ <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* POST LIST */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
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
            ) : activeTab === 'marketing' ? (
              <motion.div key="marketing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="bg-white rounded-3xl border border-gray-200 p-5 md:p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-700">
                        <Mail className="w-3.5 h-3.5" /> Marketing feliratkozók
                      </div>
                      <h3 className="mt-3 text-2xl font-black text-gray-950 tracking-tight">Email lista</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Csak azok jelennek meg itt, akik külön bepipálták vagy a sikeres foglalás oldalon kérték az ajánlatokat.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={exportMarketingSubscribers}
                      disabled={marketingSubscribers.length === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:bg-gray-300 disabled:shadow-none"
                    >
                      <Download className="w-4 h-4" /> Export MailerLite CSV
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">Feliratkozók</p>
                    <p className="mt-2 text-3xl font-black text-gray-950">{marketingSubscribers.length}</p>
                    <p className="text-xs font-medium text-gray-500">összes marketing consent</p>
                  </div>
                  {marketingClinicStats.slice(0, 3).map(([clinic, count]) => (
                    <div key={clinic} className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rendelő</p>
                      <p className="mt-2 text-2xl font-black text-gray-950">{count}</p>
                      <p className="truncate text-xs font-bold text-gray-500">{clinic}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h4 className="font-black text-gray-950">Feliratkozói lista</h4>
                    <p className="text-xs text-gray-500">Az export külön oszlopokba teszi az emailt, nevet, keresztnevet, vezetéknevet, telefonszámot, rendelőt és consent adatokat.</p>
                  </div>
                  {marketingSubscribers.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                        <Mail className="h-7 w-7" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Még nincs email lista feliratkozó.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[980px] text-left text-sm">
                        <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <tr>
                            <th className="px-5 py-3">Név</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Telefonszám</th>
                            <th className="px-5 py-3">Rendelő</th>
                            <th className="px-5 py-3">Forrás</th>
                            <th className="px-5 py-3">Nyelv</th>
                            <th className="px-5 py-3">Feliratkozás</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {marketingSubscribers.map((subscriber) => (
                            <tr key={subscriber.id || subscriber.email} className="hover:bg-sky-50/40">
                              <td className="px-5 py-4">
                                <p className="font-black text-gray-950">{subscriber.name || '-'}</p>
                                {subscriber.nickname && <p className="text-xs font-medium text-gray-400">{subscriber.nickname}</p>}
                              </td>
                              <td className="px-5 py-4">
                                <a href={`mailto:${subscriber.email}`} className="font-bold text-sky-700 hover:underline">{subscriber.email}</a>
                              </td>
                              <td className="px-5 py-4">
                                {subscriber.phone ? (
                                  <a href={`tel:${subscriber.phone}`} className="font-bold text-gray-800 hover:text-sky-600">{subscriber.phone}</a>
                                ) : '-'}
                              </td>
                              <td className="px-5 py-4">
                                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-700">{subscriber.clinic || 'Nincs megadva'}</span>
                              </td>
                              <td className="px-5 py-4 text-xs font-bold text-gray-500">{subscriber.source || '-'}</td>
                              <td className="px-5 py-4">
                                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase text-sky-700">{subscriber.locale || 'hu'}</span>
                              </td>
                              <td className="px-5 py-4 text-xs font-medium text-gray-500">{formatDate(subscriber.consented_at || subscriber.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (

              /* DATA CARDS */
              <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">

                {/* APPOINTMENTS STATS */}
                {activeTab === 'appointments' && (() => {
                  const total = appointments.length;
                  const waiting = appointments.filter(a => !a.status || a.status === 'new').length;
                  const noAnswer = appointments.filter(a => a.status === 'no_answer').length;
                  const done = appointments.filter(a => a.status === 'processed').length;
                  return (
                    <div className="grid grid-cols-4 gap-2 mb-1">
                      <div className="bg-white rounded-2xl border border-gray-200 p-3 text-center">
                        <p className="text-2xl font-black text-gray-900">{total}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">Összes</p>
                      </div>
                      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-3 text-center">
                        <p className="text-2xl font-black text-amber-600">{waiting}</p>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider mt-0.5">Vár</p>
                      </div>
                      <div className="bg-red-50 rounded-2xl border border-red-200 p-3 text-center">
                        <p className="text-2xl font-black text-red-600">{noAnswer}</p>
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-wider mt-0.5">Nem vette fel</p>
                      </div>
                      <div className="bg-green-50 rounded-2xl border border-green-200 p-3 text-center">
                        <p className="text-2xl font-black text-green-600">{done}</p>
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-wider mt-0.5">Időpontot kapott</p>
                      </div>
                    </div>
                  );
                })()}

                {/* APPOINTMENTS */}
                {activeTab === 'appointments' && appointments.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <button className="w-full text-left p-4 flex items-start gap-3" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getStatusBadge(item.status)}
                          <span className="text-gray-400 text-xs">{formatDate(item.created_at)}</span>
                        </div>
                        <p className="font-black text-gray-900 text-base uppercase truncate">{item.name}</p>
                        <span className="inline-block mt-1 bg-sky-100 text-sky-700 px-3 py-0.5 rounded-full text-[10px] font-black uppercase">{item.treatment}</span>
                      </div>
                      <div className="flex-shrink-0 text-sky-400 mt-1">
                        {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>
                    {expandedId === item.id && (
                      <div className="border-t border-sky-100 bg-sky-50/20 p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-xl p-3 border border-sky-100">
                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Telefon</p>
                            <a href={`tel:${item.phone}`} className="font-black text-gray-900 text-sm hover:text-sky-600 block">{item.phone}</a>
                            <p className="text-gray-500 text-xs truncate">{item.email}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-sky-100">
                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Rendelő</p>
                            <p className="font-black text-gray-900 text-sm">{item.city}i klinika</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-sky-100 space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adminisztráció</p>
                          <select value={item.status || 'new'} onChange={(e) => handleAction('appointments', item.id, 'update_status', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-sm text-gray-700 outline-none focus:ring-2 focus:ring-sky-500">
                            <option value="new">Új Kérelem</option>
                            <option value="no_answer">Felhívtuk – Nem vette fel</option>
                            <option value="processed">Időpontot kapott / Feldolgozva</option>
                          </select>
                          <button onClick={() => handleAction('appointments', item.id, 'hide')} className="w-full py-2.5 text-red-500 hover:bg-red-50 font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-red-100">
                            {actionLoading === `hide-${item.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Törlés</>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* CAREER */}
                {activeTab === 'career' && applications.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <button className="w-full text-left p-4 flex items-start gap-3" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getStatusBadge(item.status)}
                          <span className="text-gray-400 text-xs">{formatDate(item.created_at)}</span>
                        </div>
                        <p className="font-black text-gray-900 text-base uppercase truncate">{item.name}</p>
                        <span className="inline-block mt-1 bg-amber-100 text-amber-800 px-3 py-0.5 rounded-full text-[10px] font-black uppercase">{item.position}</span>
                      </div>
                      <div className="flex-shrink-0 text-amber-500 mt-1">
                        {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>
                    {expandedId === item.id && (
                      <div className="border-t border-amber-100 bg-amber-50/20 p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-xl p-3 border border-amber-100">
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Kapcsolat</p>
                            <p className="font-black text-gray-900 text-sm">{item.phone}</p>
                            <p className="text-gray-500 text-xs truncate underline italic">{item.email}</p>
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
                          <select value={item.status || 'new'} onChange={(e) => handleAction('career_applications', item.id, 'update_status', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-sm text-gray-700 outline-none focus:border-amber-400">
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
                {activeTab === 'quotes' && quotes.map(item => {
                  const quoteItems = parseItems(item.items);
                  return (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <button className="w-full text-left p-4 flex items-start gap-3" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {getStatusBadge(item.status)}
                            <span className="text-gray-400 text-xs">{formatDate(item.created_at)}</span>
                          </div>
                          <p className="font-black text-gray-900 text-base uppercase truncate">{item.name}</p>
                          <p className="font-black text-green-600 text-lg mt-0.5">
                            {item.savings ? `${item.savings.toLocaleString('hu-HU')} Ft megtakarítás` : '-'}
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
                              <p className="text-xl font-black text-sky-700">{item.new_total?.toLocaleString('hu-HU')} Ft</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-green-100 space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Értékesítés</p>
                            <a href={`tel:${item.phone}`} className="w-full bg-gray-900 text-white py-3 rounded-xl font-black hover:bg-sky-500 transition-all text-sm uppercase tracking-widest text-center flex items-center justify-center gap-2">
                              <Phone className="w-4 h-4" /> Hívás indítása
                            </a>
                            <p className="text-xs text-gray-400 text-center">{item.phone} · {item.email}</p>
                            <select value={item.status || 'new'} onChange={(e) => handleAction('quote_leads', item.id, 'update_status', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-sm text-gray-700 outline-none focus:border-green-400">
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
                                  const diff = qItem.competitorPrice - qItem.ourPrice;
                                  return (
                                    <div key={idx} className="flex justify-between items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                                      <span className="font-bold text-gray-800 text-sm flex-1">{qItem.name}</span>
                                      <div className="text-right text-xs flex-shrink-0">
                                        <p className="text-gray-400 line-through">{qItem.competitorPrice?.toLocaleString('hu-HU')} Ft</p>
                                        <p className="font-black text-sky-600">{qItem.ourPrice?.toLocaleString('hu-HU')} Ft</p>
                                        {diff > 0 && <p className="font-black text-green-500">-{diff.toLocaleString('hu-HU')} Ft</p>}
                                      </div>
                                    </div>
                                  );
                                })}
                                <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                                  <span className="font-black text-gray-900 text-xs uppercase tracking-wider">Összesen</span>
                                  <div className="text-right text-xs">
                                    <p className="text-gray-400 line-through">{item.original_total?.toLocaleString('hu-HU')} Ft</p>
                                    <p className="font-black text-sky-700">{item.new_total?.toLocaleString('hu-HU')} Ft</p>
                                    <p className="font-black text-green-600 text-sm">-{item.savings?.toLocaleString('hu-HU')} Ft</p>
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
                {((activeTab === 'appointments' && appointments.length === 0) || (activeTab === 'career' && applications.length === 0) || (activeTab === 'quotes' && quotes.length === 0)) && !isLoading && (
                  <div className="py-24 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                      <Search className="w-7 h-7 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Nincs megjeleníthető adat.</p>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-white/5 flex z-50">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => { setActiveTab(id); setExpandedId(null); }} className={`flex-1 flex flex-col items-center gap-0.5 py-3 px-1 transition-all relative ${activeTab === id ? 'text-sky-400' : 'text-gray-600'}`}>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {count !== null && count > 0 && <span className="absolute -top-1.5 -right-2 bg-sky-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{count}</span>}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider leading-none">{label}</span>
          </button>
        ))}
        <button onClick={() => { setIsAuthenticated(false); setPasswordInput(''); setUsernameInput(''); setAppointments([]); setMarketingSubscribers([]); }} className="flex-shrink-0 flex flex-col items-center gap-0.5 py-3 px-3 text-red-500">
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider leading-none">Ki</span>
        </button>
      </nav>

    </div>
  );
}
