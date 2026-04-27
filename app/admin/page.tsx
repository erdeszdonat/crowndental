'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Briefcase, Sparkles, BookOpen, ChevronDown, ChevronUp,
  RefreshCw, LogOut, ExternalLink, Phone, MapPin, ShieldAlert,
  User, Lock, Edit3, Search, UserCheck, DollarSign, MessageSquare,
  AlertTriangle, Loader2, Trash2, CheckCircle2, Clock, ListOrdered
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'appointments' | 'career' | 'quotes' | 'blog'>('appointments');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

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
    { id: 'appointments' as const, label: 'Időpontok', icon: Calendar, count: appointments.length },
    { id: 'career' as const, label: 'Karrier', icon: Briefcase, count: applications.length },
    { id: 'quotes' as const, label: 'AI Leads', icon: Sparkles, count: quotes.length },
    { id: 'blog' as const, label: 'Blog', icon: BookOpen, count: null },
  ];

  const tabLabel = tabs.find(t => t.id === activeTab)?.label ?? '';

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
          <button onClick={() => { setIsAuthenticated(false); setPasswordInput(''); setUsernameInput(''); setAppointments([]); }} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold">
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

            {/* BLOG */}
            {activeTab === 'blog' ? (
              <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="bg-gray-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-60 h-60 bg-sky-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-black italic flex items-center gap-2 text-sky-400"><Edit3 className="w-5 h-5" /> Sanity Studio CMS</h3>
                    <p className="text-gray-400 mt-1 text-sm font-medium">Új cikkek írása és képek feltöltése.</p>
                  </div>
                  <a href="/studio" target="_blank" className="relative z-10 bg-white text-gray-900 px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg uppercase tracking-widest text-xs whitespace-nowrap">
                    STÚDIÓ <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
                  {posts.length === 0 && !isLoading && <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest italic text-xs">Nincsenek publikált cikkek...</div>}
                  {posts.map(post => (
                    <div key={post._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-all">
                      <div className="flex-1 mr-3 min-w-0">
                        <h5 className="font-black text-gray-900 truncate">{post.title}</h5>
                        <p className="text-gray-400 text-xs font-bold uppercase mt-0.5">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('hu-HU') : 'Friss cikk'}</p>
                      </div>
                      <a href={`/blog/${post.slug}`} target="_blank" className="p-3 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-600 hover:text-white transition-all flex-shrink-0"><Search className="w-5 h-5" /></a>
                    </div>
                  ))}
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
        <button onClick={() => { setIsAuthenticated(false); setPasswordInput(''); setUsernameInput(''); setAppointments([]); }} className="flex-shrink-0 flex flex-col items-center gap-0.5 py-3 px-3 text-red-500">
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider leading-none">Ki</span>
        </button>
      </nav>

    </div>
  );
}
