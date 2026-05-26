'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Calendar, TrendingUp, DollarSign, Sparkles, Phone, CheckCircle2, Clock,
  Trophy, Activity, Users, PhoneOff, Target, Percent, Send, Loader2, AlertCircle,
} from 'lucide-react';

interface StatsDashboardProps {
  appointments: any[];
  quotes: any[];
  adminPassword: string;
}

const STATUS_COLORS = {
  new: '#f59e0b',
  no_answer: '#ef4444',
  processed: '#10b981',
};

const TREATMENT_PALETTE = [
  '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#f43f5e', '#a855f7', '#84cc16', '#3b82f6',
  '#eab308', '#14b8a6', '#f97316', '#6366f1', '#22c55e',
];

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return startOfDay(d); }
function formatNum(n: number) { return n.toLocaleString('hu-HU'); }
function formatFt(n: number) { return `${n.toLocaleString('hu-HU')} Ft`; }

type TimeRange = '7d' | '30d' | '90d' | '365d';

export default function StatsDashboard({ appointments, quotes, adminPassword }: StatsDashboardProps) {
  const [range, setRange] = useState<TimeRange>('30d');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState('');

  const runResendImport = async () => {
    const confirmed = window.confirm(
      `Biztosan importálod az összes időpontfoglalót a Resend audience-be?\n\nMind a ${appointments.length} kontakt bekerül és elindul rajuk a 2 éves email sorozat (30 nap múlva Google review, 3 hó múlva emlékeztető, stb.).\n\nEz a művelet több percig tarthat.`
    );
    if (!confirmed) return;
    setImportLoading(true);
    setImportResult(null);
    setImportError('');
    try {
      const res = await fetch('/api/admin/import-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ismeretlen hiba');
      setImportResult(data);
    } catch (e: any) {
      setImportError(e.message);
    } finally {
      setImportLoading(false);
    }
  };

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const weekAgo = daysAgo(7);
    const monthAgo = daysAgo(30);
    const yearAgo = daysAgo(365);

    const inPeriod = (items: any[], from: Date) =>
      items.filter(i => new Date(i.created_at) >= from).length;

    // ── APPOINTMENT TIME COUNTS ──
    const apptToday = inPeriod(appointments, today);
    const apptWeek = inPeriod(appointments, weekAgo);
    const apptMonth = inPeriod(appointments, monthAgo);
    const apptYear = inPeriod(appointments, yearAgo);
    const apptAll = appointments.length;

    // ── STATUS BREAKDOWN ──
    const apptByStatus = {
      new: appointments.filter(a => !a.status || a.status === 'new').length,
      no_answer: appointments.filter(a => a.status === 'no_answer').length,
      processed: appointments.filter(a => a.status === 'processed').length,
    };
    const conversionRate = apptAll > 0 ? Math.round((apptByStatus.processed / apptAll) * 100) : 0;
    const noAnswerRate = apptAll > 0 ? Math.round((apptByStatus.no_answer / apptAll) * 100) : 0;

    // ── TREATMENT BREAKDOWN ──
    const treatmentMap = new Map<string, { name: string; total: number; new: number; no_answer: number; processed: number }>();
    for (const a of appointments) {
      const raw = (a.treatment ?? 'Egyéb');
      const t = String(raw).split(':')[0].trim();
      if (!treatmentMap.has(t)) treatmentMap.set(t, { name: t, total: 0, new: 0, no_answer: 0, processed: 0 });
      const entry = treatmentMap.get(t)!;
      entry.total++;
      const status = a.status || 'new';
      if (status === 'new') entry.new++;
      else if (status === 'no_answer') entry.no_answer++;
      else if (status === 'processed') entry.processed++;
    }
    const byTreatment = Array.from(treatmentMap.values()).sort((a, b) => b.total - a.total);
    const topTreatment = byTreatment[0];

    // ── CITY BREAKDOWN ──
    const cityMap = new Map<string, number>();
    for (const a of appointments) {
      const c = a.city || 'Ismeretlen';
      cityMap.set(c, (cityMap.get(c) || 0) + 1);
    }
    const byCity = Array.from(cityMap.entries()).map(([name, value]) => ({ name, value }));

    // ── AI CALCULATOR STATS ──
    const quoteToday = inPeriod(quotes, today);
    const quoteWeek = inPeriod(quotes, weekAgo);
    const quoteMonth = inPeriod(quotes, monthAgo);
    const quoteAll = quotes.length;
    const totalSavings = quotes.reduce((sum, q) => sum + (Number(q.savings) || 0), 0);
    const avgSavings = quotes.length ? Math.round(totalSavings / quotes.length) : 0;
    const maxSavings = quotes.reduce((max, q) => Math.max(max, Number(q.savings) || 0), 0);

    // Treatments mentioned in quote items
    const calcTreatmentMap = new Map<string, number>();
    for (const q of quotes) {
      let items: any[] = [];
      if (typeof q.items === 'string') {
        try { items = JSON.parse(q.items); } catch { items = []; }
      } else if (Array.isArray(q.items)) {
        items = q.items;
      }
      for (const it of items) {
        const n = it.name || 'Egyéb';
        calcTreatmentMap.set(n, (calcTreatmentMap.get(n) || 0) + 1);
      }
    }
    const byCalcTreatment = Array.from(calcTreatmentMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // ── DAILY TIME SERIES ──
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const groupBy: 'day' | 'week' | 'month' = days <= 30 ? 'day' : days <= 90 ? 'week' : 'month';

    const series: { label: string; appts: number; quotes: number; savings: number; sortKey: string }[] = [];
    if (groupBy === 'day') {
      for (let i = days - 1; i >= 0; i--) {
        const d = daysAgo(i);
        const next = daysAgo(i - 1);
        const apptCount = appointments.filter(a => { const t = new Date(a.created_at); return t >= d && t < next; }).length;
        const quoteList = quotes.filter(q => { const t = new Date(q.created_at); return t >= d && t < next; });
        const quoteSavings = quoteList.reduce((s, q) => s + (Number(q.savings) || 0), 0);
        series.push({
          label: d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
          appts: apptCount,
          quotes: quoteList.length,
          savings: quoteSavings,
          sortKey: d.toISOString(),
        });
      }
    } else if (groupBy === 'week') {
      const weeks = Math.ceil(days / 7);
      for (let i = weeks - 1; i >= 0; i--) {
        const from = daysAgo(i * 7 + 6);
        const to = daysAgo(i * 7 - 1);
        const apptCount = appointments.filter(a => { const t = new Date(a.created_at); return t >= from && t < to; }).length;
        const quoteList = quotes.filter(q => { const t = new Date(q.created_at); return t >= from && t < to; });
        series.push({
          label: from.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
          appts: apptCount,
          quotes: quoteList.length,
          savings: quoteList.reduce((s, q) => s + (Number(q.savings) || 0), 0),
          sortKey: from.toISOString(),
        });
      }
    } else {
      const months = 12;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setMonth(next.getMonth() + 1);
        const apptCount = appointments.filter(a => { const t = new Date(a.created_at); return t >= d && t < next; }).length;
        const quoteList = quotes.filter(q => { const t = new Date(q.created_at); return t >= d && t < next; });
        series.push({
          label: d.toLocaleDateString('hu-HU', { year: '2-digit', month: 'short' }),
          appts: apptCount,
          quotes: quoteList.length,
          savings: quoteList.reduce((s, q) => s + (Number(q.savings) || 0), 0),
          sortKey: d.toISOString(),
        });
      }
    }

    return {
      apptToday, apptWeek, apptMonth, apptYear, apptAll,
      apptByStatus, conversionRate, noAnswerRate,
      byTreatment, topTreatment,
      byCity,
      quoteToday, quoteWeek, quoteMonth, quoteAll,
      totalSavings, avgSavings, maxSavings,
      byCalcTreatment,
      series,
    };
  }, [appointments, quotes, range]);

  const pieData = [
    { name: 'Vár hívásra', value: stats.apptByStatus.new, color: STATUS_COLORS.new },
    { name: 'Nem vette fel', value: stats.apptByStatus.no_answer, color: STATUS_COLORS.no_answer },
    { name: 'Időpontot kapott', value: stats.apptByStatus.processed, color: STATUS_COLORS.processed },
  ].filter(p => p.value > 0);

  return (
    <div className="space-y-5">

      {/* ── HERO KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Ma" value={stats.apptToday} sub="időpont kérés" icon={Clock} color="sky" />
        <KpiCard label="Héten" value={stats.apptWeek} sub="elmúlt 7 nap" icon={Calendar} color="indigo" />
        <KpiCard label="Hónapban" value={stats.apptMonth} sub="elmúlt 30 nap" icon={TrendingUp} color="violet" />
        <KpiCard label="Évben" value={stats.apptYear} sub="elmúlt 365 nap" icon={Activity} color="pink" />
        <KpiCard label="Összes" value={stats.apptAll} sub="rögzített kérés" icon={Users} color="amber" />
      </div>

      {/* ── CONVERSION & TOP STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Konverzió"
          value={`${stats.conversionRate}%`}
          sub={`${formatNum(stats.apptByStatus.processed)} időpont / ${formatNum(stats.apptAll)} kérés`}
          icon={Target}
          accent="green"
        />
        <StatCard
          label="Nem vette fel"
          value={`${stats.noAnswerRate}%`}
          sub={`${formatNum(stats.apptByStatus.no_answer)} fő nem reagált`}
          icon={PhoneOff}
          accent="red"
        />
        <StatCard
          label="Top kezelés"
          value={stats.topTreatment?.name ?? '-'}
          sub={stats.topTreatment ? `${formatNum(stats.topTreatment.total)} kérés` : 'Nincs adat'}
          icon={Trophy}
          accent="amber"
          small
        />
        <StatCard
          label="AI Kalkulátor"
          value={formatNum(stats.quoteAll)}
          sub={`Átlagos megtakarítás: ${formatFt(stats.avgSavings)}`}
          icon={Sparkles}
          accent="purple"
        />
      </div>

      {/* ── TIME SERIES ── */}
      <ChartCard
        title="Aktivitás az időben"
        subtitle="Időpontkérések és AI kalkulátor leadek"
        action={
          <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
            {(['7d', '30d', '90d', '365d'] as TimeRange[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${range === r ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {r === '7d' ? '7 nap' : r === '30d' ? '30 nap' : r === '90d' ? '90 nap' : '1 év'}
              </button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={stats.series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gQuo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
              labelStyle={{ color: '#94a3b8', fontWeight: 700 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Area type="monotone" dataKey="appts" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gApp)" name="Időpontkérés" />
            <Area type="monotone" dataKey="quotes" stroke="#a855f7" strokeWidth={2.5} fill="url(#gQuo)" name="AI kalkulátor lead" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── TREATMENT BREAKDOWN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Időpontkérések státusza" subtitle="Konverziós tölcsér" className="lg:col-span-1">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState text="Nincs adat" />}
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
            <LegendDot color={STATUS_COLORS.new} label="Vár" value={stats.apptByStatus.new} />
            <LegendDot color={STATUS_COLORS.no_answer} label="Nem vette fel" value={stats.apptByStatus.no_answer} />
            <LegendDot color={STATUS_COLORS.processed} label="Időpontot kapott" value={stats.apptByStatus.processed} />
          </div>
        </ChartCard>

        <ChartCard
          title="Kezelések népszerűsége"
          subtitle="Időpontkérések kezelés szerint, státusz lebontásban"
          className="lg:col-span-2"
        >
          {stats.byTreatment.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(260, stats.byTreatment.length * 32)}>
              <BarChart data={stats.byTreatment} layout="vertical" margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#475569" fontSize={11} width={170} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 700 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="new" stackId="s" fill={STATUS_COLORS.new} name="Vár" />
                <Bar dataKey="no_answer" stackId="s" fill={STATUS_COLORS.no_answer} name="Nem vette fel" />
                <Bar dataKey="processed" stackId="s" fill={STATUS_COLORS.processed} name="Időpontot kapott" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState text="Még nem érkeztek időpontkérések" />}
        </ChartCard>
      </div>

      {/* ── DETAILED TREATMENT TABLE ── */}
      {stats.byTreatment.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">Kezelések részletes bontása</h3>
              <p className="text-xs text-gray-500 mt-0.5">Minden kezeléshez tartozó kérések, konverziók</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Kezelés</th>
                  <th className="px-4 py-3 text-right">Összes</th>
                  <th className="px-4 py-3 text-right text-amber-600">Vár</th>
                  <th className="px-4 py-3 text-right text-red-600">Nem vette fel</th>
                  <th className="px-4 py-3 text-right text-green-600">Időpontot kapott</th>
                  <th className="px-4 py-3 text-right">Konverzió</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.byTreatment.map((t, i) => {
                  const conv = t.total > 0 ? Math.round((t.processed / t.total) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TREATMENT_PALETTE[i % TREATMENT_PALETTE.length] }} />
                          <span className="truncate">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-gray-900">{formatNum(t.total)}</td>
                      <td className="px-4 py-3 text-right font-bold text-amber-600">{formatNum(t.new)}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">{formatNum(t.no_answer)}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">{formatNum(t.processed)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black ${conv >= 50 ? 'bg-green-100 text-green-700' : conv >= 25 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                          {conv}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── AI CALCULATOR DETAIL ── */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl border border-purple-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">AI Árkalkulátor analitika</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <MiniStat label="Összes kalkuláció" value={formatNum(stats.quoteAll)} icon={Sparkles} />
          <MiniStat label="Ma" value={formatNum(stats.quoteToday)} icon={Clock} />
          <MiniStat label="Átlag megtakarítás" value={formatFt(stats.avgSavings)} icon={Percent} />
          <MiniStat label="Összes megtakarítás" value={formatFt(stats.totalSavings)} icon={DollarSign} />
        </div>

        {stats.byCalcTreatment.length > 0 ? (
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Top 10 kezelés a kalkulátorban</p>
            <ResponsiveContainer width="100%" height={Math.max(220, stats.byCalcTreatment.length * 28)}>
              <BarChart data={stats.byCalcTreatment} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#475569" fontSize={11} width={170} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
                />
                <Bar dataKey="value" fill="#a855f7" radius={[0, 6, 6, 0]} name="Hányszor választották" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState text="Még nem érkezett kalkulátor lead" />
        )}
      </div>

      {/* ── CITY BREAKDOWN ── */}
      {stats.byCity.length > 0 && (
        <ChartCard title="Időpontkérések rendelő szerint" subtitle="Esztergom vs Budapest">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.byCity} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
              />
              <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} name="Kérések száma" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── RESEND IMPORT TOOL ── */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 rounded-2xl border border-sky-100 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">Resend Audience Import</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Importáld az összes meglévő időpontfoglalót a Resend marketing audience-be. Mindegyikre elindul a 2 éves követési sorozat (Google review, 3 hó / 6 hó / éves emlékeztetők).
            </p>
          </div>
        </div>

        {!importResult && !importError && (
          <button
            onClick={runResendImport}
            disabled={importLoading || appointments.length === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-black rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            {importLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importálás folyamatban... ({appointments.length} kontakt)
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {appointments.length} kontakt importálása Resend-be
              </>
            )}
          </button>
        )}

        {importLoading && (
          <p className="text-xs text-gray-500 mt-3">
            Ne zárd be a böngészőt. A művelet kb. 1-2 percig tart 100+ kontaktnál.
          </p>
        )}

        {importError && (
          <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-black text-red-700 text-sm uppercase tracking-wider mb-1">Import hiba</p>
              <p className="text-sm text-red-600">{importError}</p>
              <button
                onClick={() => { setImportError(''); setImportResult(null); }}
                className="text-xs text-red-700 underline mt-2"
              >
                Próbáld újra
              </button>
            </div>
          </div>
        )}

        {importResult && (
          <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-black text-green-700 text-sm uppercase tracking-wider mb-2">Sikeres import!</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white rounded-lg p-2 border border-green-100">
                    <p className="text-gray-500 font-bold uppercase tracking-wider">DB-ben</p>
                    <p className="font-black text-gray-900 text-base">{importResult.totalInDb}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-green-100">
                    <p className="text-gray-500 font-bold uppercase tracking-wider">Egyedi email</p>
                    <p className="font-black text-gray-900 text-base">{importResult.uniqueEmails}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-green-100">
                    <p className="text-gray-500 font-bold uppercase tracking-wider">Importálva</p>
                    <p className="font-black text-green-700 text-base">{importResult.imported}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-green-100">
                    <p className="text-gray-500 font-bold uppercase tracking-wider">Hiba</p>
                    <p className={`font-black text-base ${importResult.failed > 0 ? 'text-red-600' : 'text-gray-900'}`}>{importResult.failed}</p>
                  </div>
                </div>
                {importResult.errors?.length > 0 && (
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer text-red-700 font-bold">Hibák ({importResult.errors.length})</summary>
                    <ul className="mt-2 space-y-1 text-gray-600 font-mono">
                      {importResult.errors.map((e: string, i: number) => <li key={i}>· {e}</li>)}
                    </ul>
                  </details>
                )}
                <button
                  onClick={() => { setImportResult(null); setImportError(''); }}
                  className="text-xs text-gray-600 underline mt-3"
                >
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

/* ── HELPER COMPONENTS ──────────────────────────────────────── */

function KpiCard({ label, value, sub, icon: Icon, color }: { label: string; value: number | string; sub?: string; icon: any; color: 'sky' | 'indigo' | 'violet' | 'pink' | 'amber' }) {
  const grad = {
    sky: 'from-sky-500 to-cyan-500',
    indigo: 'from-indigo-500 to-blue-500',
    violet: 'from-violet-500 to-purple-500',
    pink: 'from-pink-500 to-rose-500',
    amber: 'from-amber-500 to-orange-500',
  }[color];
  return (
    <div className="relative bg-white rounded-2xl p-4 border border-gray-200 overflow-hidden">
      <div className={`absolute -top-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br ${grad} opacity-10`} />
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-black text-gray-900 leading-none mt-2">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 font-bold mt-1.5">{sub}</p>}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent, small }: { label: string; value: string | number; sub?: string; icon: any; accent: 'green' | 'red' | 'amber' | 'purple'; small?: boolean }) {
  const colors = {
    green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: 'text-green-600' },
    red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: 'text-red-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', icon: 'text-purple-600' },
  }[accent];
  return (
    <div className={`${colors.bg} ${colors.border} border rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-[10px] font-black ${colors.text} uppercase tracking-wider`}>{label}</p>
        <Icon className={`w-4 h-4 ${colors.icon}`} />
      </div>
      <p className={`font-black text-gray-900 ${small ? 'text-base leading-tight' : 'text-2xl'}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-500 font-bold mt-1.5 truncate">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, action, className }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-4 ${className ?? ''}`}>
      <div className="flex items-start justify-between mb-3 gap-3">
        <div>
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function LegendDot({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-0.5">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="font-bold text-gray-600 text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-black text-gray-900 text-base">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-white">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-purple-600" />
        <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider">{label}</p>
      </div>
      <p className="font-black text-gray-900 text-lg leading-tight">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="h-48 flex items-center justify-center text-sm font-bold text-gray-400 uppercase tracking-wider">
      {text}
    </div>
  );
}
