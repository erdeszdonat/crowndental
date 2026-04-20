'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Briefcase, Sparkles, BookOpen, ChevronDown, ChevronUp,
  RefreshCw, LogOut, ExternalLink, Phone, Mail, MapPin, ShieldAlert,
  User, Lock, Edit3, FileText, Search, UserCheck, TrendingDown,
  ArrowRight, Layers, DollarSign, MessageSquare, AlertTriangle, 
  Loader2, Trash2, CheckCircle2, Clock, ListOrdered
} from 'lucide-react';

// Kényszerített dinamikus mód a Vercel build fixhez
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ADATOK LEKÉRÉSE A BIZTONSÁGOS API-RÓL
  // ═══════════════════════════════════════════════════════════════════════════
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
        setDbError(data.error || "Hiba az adatok betöltésekor.");
        if (res.status === 401) setIsAuthenticated(false);
      }
    } catch (err: any) {
      setDbError("Hálózati hiba az adatok betöltésekor.");
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STÁTUSZ VÁLTOZTATÁS ÉS TÖRLÉS (ELREJTÉS) API HÍVÁS
  // ═══════════════════════════════════════════════════════════════════════════
  const handleAction = async (table: string, id: string | number, action: 'hide' | 'update_status', value?: string) => {
    if (action === 'hide') {
      const confirmed = window.confirm("Biztosan törlöd a listából ezt a bejegyzést? (Az adatbázisban a háttérben megmarad biztonsági okokból, de itt már nem fog látszani többé.)");
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
        // Lokális adatok frissítése, hogy ne kelljen mindent újra letölteni
        const updateList = (list: any[], setList: any) => {
          if (action === 'hide') setList(list.filter((i: any) => i.id !== id));
          if (action === 'update_status') setList(list.map((i: any) => i.id === id ? { ...i, status: value } : i));
        };

        if (table === 'appointments') updateList(appointments, setAppointments);
        if (table === 'career_applications') updateList(applications, setApplications);
        if (table === 'quote_leads') updateList(quotes, setQuotes);
      } else {
        alert(data.error || "Hiba történt a módosítás során.");
      }
    } catch (err) {
      alert("Hálózati hiba a mentés során.");
    } finally {
      setActionLoading(null);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════════════════════════════════════════
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
        await fetchSecureData(passwordInput); // Sikeres belépés után betöltjük az adatokat
      } else {
        setDbError(data.error || "Helytelen felhasználónév vagy jelszó!");
      }
    } catch (err) {
      setDbError("Hálózati hiba a bejelentkezés során.");
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
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Feldolgozva</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider animate-pulse"><Clock className="w-3 h-3" /> Új Kérelem</span>;
  };

  // Segédfüggvény a JSON adatok biztonságos parszeolásához
  const parseItems = (itemsStr: string | any) => {
    if (typeof itemsStr === 'object') return itemsStr;
    try {
      return JSON.parse(itemsStr);
    } catch (e) {
      return [];
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 fixed inset-0 z-[9999]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white/10">
          <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 text-center tracking-tight">CROWN ADMIN</h1>
          <p className="text-gray-500 mb-10 text-center font-medium">Titkosított belépés a vezérlőpultba</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Felhasználónév" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sky-600 outline-none font-bold" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Jelszó" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sky-600 outline-none font-bold tracking-widest" />
            </div>
            {dbError && <p className="text-red-500 text-center text-sm font-bold bg-red-50 py-2 rounded-xl border border-red-100">{dbError}</p>}
            <button type="submit" disabled={isLoginLoading} className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl hover:bg-sky-600 transition-all shadow-xl disabled:bg-gray-400 flex justify-center items-center gap-2 mt-4">
              {isLoginLoading ? <Loader2 className="animate-spin w-6 h-6" /> : 'RENDSZER BELÉPÉS'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans fixed inset-0 z-[9999] overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-gray-950 text-white flex flex-col flex-shrink-0 z-20 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter italic">CROWN DENTAL</h1>
            <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Titkosított Kapcsolat</p>
          </div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
        </div>
        
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          <button onClick={() => {setActiveTab('appointments'); setExpandedId(null);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'appointments' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'text-gray-500 hover:bg-gray-900 hover:text-white'}`}>
            <Calendar className="w-5 h-5" /> Időpontok <span className="ml-auto bg-black/30 text-[10px] py-0.5 px-2 rounded-full border border-white/5">{appointments.length}</span>
          </button>
          <button onClick={() => {setActiveTab('career'); setExpandedId(null);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'career' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'text-gray-500 hover:bg-gray-900 hover:text-white'}`}>
            <Briefcase className="w-5 h-5" /> Karrier (HR) <span className="ml-auto bg-black/30 text-[10px] py-0.5 px-2 rounded-full border border-white/5">{applications.length}</span>
          </button>
          <button onClick={() => {setActiveTab('quotes'); setExpandedId(null);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'quotes' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'text-gray-500 hover:bg-gray-900 hover:text-white'}`}>
            <Sparkles className="w-5 h-5" /> AI Kalkulátor <span className="ml-auto bg-black/30 text-[10px] py-0.5 px-2 rounded-full border border-white/5">{quotes.length}</span>
          </button>
          <div className="pt-8 mt-6 border-t border-white/5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-4 px-2 font-black italic">Tartalomkezelő</p>
            <button onClick={() => {setActiveTab('blog'); setExpandedId(null);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'blog' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'text-gray-500 hover:bg-gray-900 hover:text-white'}`}>
              <BookOpen className="w-5 h-5" /> Blog Cikkek
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/40">
          <button onClick={() => {setIsAuthenticated(false); setPasswordInput(''); setUsernameInput(''); setAppointments([]);}} className="w-full flex items-center justify-center gap-3 px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold group">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kijelentkezés
          </button>
        </div>
      </div>

      {/* FŐ TARTALOM TERÜLET */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        
        <header className="bg-white border-b border-gray-200 p-8 flex justify-between items-center flex-shrink-0 shadow-sm z-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight italic underline decoration-sky-500 decoration-4 underline-offset-8 uppercase">
            {activeTab === 'appointments' && 'Időpontfoglalások'}
            {activeTab === 'career' && 'HR Jelentkezések'}
            {activeTab === 'quotes' && 'AI Lead Analízis'}
            {activeTab === 'blog' && 'Tartalmak'}
          </h2>
          <button onClick={() => fetchSecureData(passwordInput)} disabled={isLoading} className="flex items-center gap-2 bg-gray-100 text-gray-600 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-sm">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Frissítés
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          
          {dbError && (
            <div className="max-w-4xl mx-auto mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] flex items-center gap-4 text-red-700 shadow-sm animate-pulse">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div><p className="font-black uppercase text-xs">Szerver Hiba</p><p className="font-medium">{dbError}</p></div>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* BLOG VIEW */}
            {activeTab === 'blog' ? (
              <motion.div key="blog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl mx-auto space-y-6">
                <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                  <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-2xl font-black italic flex items-center gap-2 justify-center md:justify-start text-sky-400">
                      <Edit3 className="w-6 h-6" /> Sanity Studio CMS
                    </h3>
                    <p className="text-gray-400 mt-2 font-medium">Új cikkek írása és képek feltöltése a hivatalos szerkesztőben.</p>
                  </div>
                  <a href="/studio" target="_blank" className="relative z-10 bg-white text-gray-900 px-10 py-5 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl uppercase tracking-widest text-xs">
                    STÚDIÓ MEGNYITÁSA <ExternalLink className="w-5 h-5"/>
                  </a>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
                   {posts.length === 0 && !isLoading && <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest italic text-sm">Nincsenek publikált cikkek a Sanity-ben...</div>}
                   {posts.map(post => (
                     <div key={post._id} className="p-8 flex justify-between items-center hover:bg-gray-50 transition-all group">
                       <div className="flex-1 mr-4">
                         <h5 className="text-xl font-black text-gray-900 group-hover:text-sky-600 transition-colors">{post.title}</h5>
                         <p className="text-gray-400 text-xs font-black uppercase mt-1 tracking-widest italic">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('hu-HU') : 'Friss cikk'}</p>
                       </div>
                       <a href={`/blog/${post.slug}`} target="_blank" className="p-4 bg-sky-50 text-sky-600 rounded-2xl hover:bg-sky-600 hover:text-white transition-all shadow-sm"><Search className="w-6 h-6"/></a>
                     </div>
                   ))}
                </div>
              </motion.div>
            ) : (
              
              /* DATA TABLES */
              <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-200 overflow-hidden pb-32">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-400 text-[10px] uppercase font-black tracking-widest font-sans">
                      <th className="p-8">Dátum / Állapot</th>
                      <th className="p-8">Ügyfél / Pályázó</th>
                      <th className="p-8">{activeTab === 'appointments' ? 'Igényelt Kezelés' : activeTab === 'career' ? 'Megpályázott Pozíció' : 'AI Spórolás'}</th>
                      <th className="p-8 text-right italic font-bold">Részletek</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    
                    {/* APPOINTMENTS TABLE */}
                    {activeTab === 'appointments' && appointments.map(item => (
                      <React.Fragment key={item.id}>
                        <tr className={`cursor-pointer group transition-colors ${expandedId === item.id ? 'bg-sky-50/40' : 'hover:bg-gray-50'}`} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                          <td className="p-8">
                             <div className="text-gray-400 text-sm font-medium mb-2">{formatDate(item.created_at)}</div>
                             {getStatusBadge(item.status)}
                          </td>
                          <td className="p-8">
                             <div className="text-xl font-black text-gray-900 uppercase tracking-tight">{item.name}</div>
                             <div className="text-xs text-gray-400 font-bold uppercase tracking-wider italic">{item.nickname ? `"${item.nickname}"` : ''}</div>
                          </td>
                          <td className="p-8"><span className="bg-sky-100 text-sky-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm border border-sky-200">{item.treatment}</span></td>
                          <td className="p-8 text-right font-bold text-sky-400 italic">
                             {expandedId === item.id ? <ChevronUp className="inline ml-1 w-5 h-5"/> : <ChevronDown className="inline ml-1 w-5 h-5"/>}
                          </td>
                        </tr>
                        {expandedId === item.id && (
                          <tr className="bg-sky-50/20">
                            <td colSpan={4} className="p-8 md:p-12 border-b border-sky-100 shadow-inner animate-in fade-in slide-in-from-top-1">
                              <div className="flex flex-col md:flex-row justify-between gap-8 mb-4">
                                <div className="grid grid-cols-2 gap-8 flex-1">
                                  <div className="space-y-1"><p className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic flex items-center gap-2"><Phone className="w-3 h-3"/> Kapcsolat</p><a href={`tel:${item.phone}`} className="text-2xl font-black text-gray-900 hover:text-sky-600 block transition-colors">{item.phone}</a><p className="text-gray-500 font-bold truncate">{item.email}</p></div>
                                  <div className="space-y-1"><p className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic flex items-center gap-2"><MapPin className="w-3 h-3"/> Rendelő</p><p className="text-xl font-black text-gray-900">{item.city}i klinika</p></div>
                                </div>
                                <div className="flex flex-col gap-3 min-w-[250px] bg-white p-6 rounded-3xl border border-sky-100 shadow-sm">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adminisztráció</p>
                                  <select 
                                    value={item.status || 'new'} 
                                    onChange={(e) => handleAction('appointments', item.id, 'update_status', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                  >
                                    <option value="new">Új Kérelem</option>
                                    <option value="processed">Időpontot kapott / Feldolgozva</option>
                                  </select>
                                  <button onClick={() => handleAction('appointments', item.id, 'hide')} className="w-full py-3 text-red-500 hover:bg-red-50 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-100">
                                    {actionLoading === `hide-${item.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Trash2 className="w-4 h-4" /> Törlés (Elrejtés)</>}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}

                    {/* CAREER TABLE */}
                    {activeTab === 'career' && applications.map(item => (
                      <React.Fragment key={item.id}>
                        <tr className={`cursor-pointer group transition-colors ${expandedId === item.id ? 'bg-amber-50/40' : 'hover:bg-gray-50'}`} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                          <td className="p-8">
                             <div className="text-gray-400 text-sm font-medium mb-2">{formatDate(item.created_at)}</div>
                             {getStatusBadge(item.status)}
                          </td>
                          <td className="p-8 font-black text-gray-900 text-lg uppercase tracking-tight">{item.name}</td>
                          <td className="p-8"><span className="bg-amber-100 text-amber-800 px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-sm border border-amber-200">{item.position}</span></td>
                          <td className="p-8 text-right font-bold text-amber-500 italic">{expandedId === item.id ? <ChevronUp className="inline ml-1 w-5 h-5"/> : <ChevronDown className="inline ml-1 w-5 h-5"/>}</td>
                        </tr>
                        {expandedId === item.id && (
                          <tr className="bg-amber-50/20">
                            <td colSpan={4} className="p-8 md:p-12 border-b border-amber-100 shadow-inner animate-in fade-in slide-in-from-top-1">
                              <div className="flex flex-col lg:flex-row gap-8 mb-8">
                                <div className="flex-1 grid sm:grid-cols-2 gap-6">
                                   <div className="p-6 bg-white rounded-3xl border border-amber-100 shadow-sm">
                                      <p className="font-black text-amber-500 uppercase text-[10px] mb-2 flex items-center gap-2"><UserCheck className="w-3 h-3"/> Jelentkező</p>
                                      <p className="text-xl font-black text-gray-900">{item.phone}</p>
                                      <p className="text-gray-500 font-medium italic underline">{item.email}</p>
                                   </div>
                                   <div className="p-6 bg-white rounded-3xl border border-amber-100 shadow-sm">
                                      <p className="font-black text-amber-500 uppercase text-[10px] mb-2 flex items-center gap-2"><MapPin className="w-3 h-3"/> Hely / Tapasztalat</p>
                                      <p className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{item.location}</p>
                                      <p className="text-gray-500 font-bold">{item.experience === '5' ? 'Szenior (5+ év)' : `${item.experience} év`}</p>
                                   </div>
                                </div>
                                <div className="flex flex-col gap-3 lg:min-w-[280px] bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HR Adminisztráció</p>
                                  <select 
                                    value={item.status || 'new'} 
                                    onChange={(e) => handleAction('career_applications', item.id, 'update_status', e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 outline-none cursor-pointer focus:border-amber-400"
                                  >
                                    <option value="new">Új Jelentkező</option>
                                    <option value="processed">Feldolgozva / Felhívva</option>
                                  </select>
                                  <button onClick={() => handleAction('career_applications', item.id, 'hide')} className="w-full py-3 text-red-500 hover:bg-red-50 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-100">
                                    {actionLoading === `hide-${item.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Trash2 className="w-4 h-4" /> Elutasít / Elrejt</>}
                                  </button>
                                </div>
                              </div>
                              <div className="bg-white p-10 rounded-[2.5rem] border border-amber-100 shadow-inner relative overflow-hidden italic text-gray-700 text-xl font-light">
                                 <div className="absolute top-6 left-6 text-amber-100/50 opacity-30 rotate-12"><MessageSquare className="w-16 h-16" /></div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 relative z-10 italic font-bold">Bemutatkozás / Motivációs levél:</p>
                                 <p className="relative z-10 leading-relaxed font-serif">"{item.message || 'A pályázó nem küldött kísérőlevelet.'}"</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}

                    {/* QUOTES TABLE - ITT LETT BEILLESZTVE A TÁBLÁZAT */}
                    {activeTab === 'quotes' && quotes.map(item => {
                      const quoteItems = parseItems(item.items);
                      return (
                        <React.Fragment key={item.id}>
                          <tr className={`cursor-pointer group transition-colors ${expandedId === item.id ? 'bg-green-50/40' : 'hover:bg-gray-50'}`} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                            <td className="p-8">
                               <div className="text-gray-400 text-sm font-medium mb-2">{formatDate(item.created_at)}</div>
                               {getStatusBadge(item.status)}
                            </td>
                            <td className="p-8 font-black text-gray-900 text-lg uppercase tracking-tight">{item.name}</td>
                            <td className="p-8 font-black text-green-600 text-2xl tracking-tighter italic decoration-green-200 decoration-4 underline underline-offset-4">
                              {item.savings ? `${item.savings.toLocaleString('hu-HU')} Ft` : '-'}
                            </td>
                            <td className="p-8 text-right font-bold text-green-500 italic">{expandedId === item.id ? <ChevronUp className="inline ml-1 w-5 h-5"/> : <ChevronDown className="inline ml-1 w-5 h-5"/>}</td>
                          </tr>
                          {expandedId === item.id && (
                            <tr className="bg-green-50/30">
                              <td colSpan={4} className="p-8 md:p-12 border-b border-green-100 shadow-inner animate-in fade-in slide-in-from-top-1">
                                <div className="flex flex-col xl:flex-row gap-8 mb-8">
                                  <div className="grid md:grid-cols-2 gap-6 flex-1 text-sm">
                                     <div className="p-6 bg-white rounded-3xl border border-green-100 shadow-sm text-center flex flex-col justify-center">
                                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Versenytárs ára</p>
                                       <p className="text-2xl font-bold text-gray-400 line-through decoration-2 italic">{item.original_total?.toLocaleString('hu-HU')} Ft</p>
                                     </div>
                                     <div className="p-6 bg-white rounded-3xl border border-green-100 shadow-sm ring-4 ring-green-50 text-center flex flex-col justify-center">
                                       <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1 flex items-center gap-2 justify-center font-serif tracking-tighter"><DollarSign className="w-3 h-3"/> Crown Dental Ár</p>
                                       <p className="text-4xl font-black text-sky-700 tracking-tighter">{item.new_total?.toLocaleString('hu-HU')} Ft</p>
                                     </div>
                                  </div>

                                  <div className="flex flex-col gap-3 xl:min-w-[300px] bg-white p-6 rounded-3xl border border-green-100 shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Értékesítés / Kapcsolat</p>
                                    <a href={`tel:${item.phone}`} className="w-full bg-gray-900 text-white px-6 py-4 rounded-xl font-black hover:bg-sky-500 transition-all text-sm uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                      <Phone className="w-4 h-4"/> Hívás indítása
                                    </a>
                                    <p className="text-xs text-gray-400 font-medium text-center italic mt-1">{item.phone} <br/> {item.email}</p>
                                    <div className="border-t border-gray-100 my-2"></div>
                                    <select 
                                      value={item.status || 'new'} 
                                      onChange={(e) => handleAction('quote_leads', item.id, 'update_status', e.target.value)}
                                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 outline-none cursor-pointer focus:border-green-400"
                                    >
                                      <option value="new">Új Lead (Még nincs hívva)</option>
                                      <option value="processed">Feldolgozva / Siker</option>
                                    </select>
                                    <button onClick={() => handleAction('quote_leads', item.id, 'hide')} className="w-full py-3 text-red-500 hover:bg-red-50 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-100">
                                      {actionLoading === `hide-${item.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Trash2 className="w-4 h-4" /> Elrejtés</>}
                                    </button>
                                  </div>
                                </div>

                                {/* 🔴 ITT VAN AZ ÚJ RÉSZLETES TÁBLÁZAT 🔴 */}
                                {quoteItems && quoteItems.length > 0 && (
                                  <div className="bg-white rounded-[2rem] p-8 border border-green-100 shadow-sm">
                                    <h4 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                                      <ListOrdered className="w-4 h-4 text-green-500"/> Kezelések Részletezése
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-sm">
                                        <thead>
                                          <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                                            <th className="p-4 rounded-tl-xl">Kezelés megnevezése</th>
                                            <th className="p-4 text-right">Versélytárs ára</th>
                                            <th className="p-4 text-right text-sky-600">Crown Dental ár</th>
                                            <th className="p-4 text-right text-green-500 rounded-tr-xl">Megtakarítás</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                          {quoteItems.map((qItem: any, idx: number) => {
                                            const diff = qItem.competitorPrice - qItem.ourPrice;
                                            return (
                                              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 font-bold text-gray-800 border-r border-gray-50">
                                                  {qItem.name}
                                                </td>
                                                <td className="p-4 text-right text-gray-400 line-through decoration-1 italic border-r border-gray-50">
                                                  {qItem.competitorPrice?.toLocaleString('hu-HU')} Ft
                                                </td>
                                                <td className="p-4 text-right font-black text-sky-600 border-r border-gray-50">
                                                  {qItem.ourPrice?.toLocaleString('hu-HU')} Ft
                                                </td>
                                                <td className="p-4 text-right font-black text-green-500 bg-green-50/20">
                                                  {diff > 0 ? `-${diff.toLocaleString('hu-HU')} Ft` : '—'}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                        <tfoot>
                                          <tr className="bg-gray-50 border-t-2 border-gray-200">
                                            <td className="p-4 font-black text-gray-900 rounded-bl-xl uppercase text-xs tracking-wider">Összesen</td>
                                            <td className="p-4 text-right font-bold text-gray-400 line-through italic">
                                              {item.original_total?.toLocaleString('hu-HU')} Ft
                                            </td>
                                            <td className="p-4 text-right font-black text-sky-600">
                                              {item.new_total?.toLocaleString('hu-HU')} Ft
                                            </td>
                                            <td className="p-4 text-right font-black text-green-600 rounded-br-xl text-lg">
                                              -{item.savings?.toLocaleString('hu-HU')} Ft
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </div>
                                )}

                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
                
                {((activeTab === 'appointments' && appointments.length === 0) || (activeTab === 'career' && applications.length === 0) || (activeTab === 'quotes' && quotes.length === 0)) && !isLoading && (
                   <div className="p-40 text-center flex flex-col items-center">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                        <Search className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px]">Nincs megjeleníthető rögzített adat ebben a kategóriában.</p>
                   </div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
