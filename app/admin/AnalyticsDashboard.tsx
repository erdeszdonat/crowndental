'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownToLine, ArrowUpRight, CalendarDays, ChartNoAxesCombined, Clock3, Info, Loader2, RefreshCw, Target, Users } from 'lucide-react';
import { localDay, presetRange, rangeDays, type DateRange } from '@/lib/analyticsDates';
import { change, PAGE_NAMES, percent, type AnalyticsReport, type Breakdown } from '@/lib/analyticsReport';
import styles from './analytics.module.css';

const n = (value: number) => Number(value || 0).toLocaleString('hu-HU');
const pct = (value: number | null) => value === null ? '—' : `${value.toLocaleString('hu-HU', { maximumFractionDigits: 1 })}%`;
const duration = (ms: number) => `${Math.floor(Math.round(ms / 1000) / 60)} p ${Math.round(ms / 1000) % 60} mp`;
const label = (name: string) => PAGE_NAMES[name] || name.replace('kezelesek/', 'Kezelés · ');
const dateLabel = (day: string) => day.replaceAll('-', '.');
const presets = [['today','Ma'],['yesterday','Tegnap'],['7d','Utolsó 7 nap'],['last_week','Előző hét'],['30d','Utolsó 30 nap'],['this_month','Ez a hónap'],['last_month','Előző hónap'],['this_year','Ez az év'],['last_year','Előző év']];
const tabs = [['sources','Források'],['campaigns','Kampányok'],['landingPages','Belépőoldalak'],['devices','Eszközök'],['languages','Nyelvek']];

function exportCsv(report: AnalyticsReport) {
  const lines: unknown[][] = [['Crown Dental elemzések', report.range.from, report.range.to],['Időzóna','Europe/Budapest'],[],
    ['NAP','IDŐPONTKÉRÉS','VISSZAIGAZOLT','MÉRT LÁTOGATÁS','OLDALMEGTEKINTÉS'],
    ...report.current.series.map(r => [r.day,r.requests,r.confirmed,r.sessions,r.views]),[],
    ['BONTÁS','NÉV','LÁTOGATÁS','KÉRÉS','VISSZAIGAZOLT','FOGLALÓ MUNKAMENET'],
    ...Object.entries(report.current.breakdowns).flatMap(([kind,rows]) => rows.map(r => [kind,r.name,r.sessions,r.requests,r.confirmed,r.booked_sessions])),[],
    ['GA ELŐZMÉNY – importálva',report.meta.ga_imported_at,'Adatok eddig',report.meta.ga_through],
    ['NAP','GA LÁTOGATÁS','GA MEGTEKINTÉS','GA FOGLALÁSI ESEMÉNY'],
    ...report.current.ga.series.map(r => [r.day,r.sessions,r.views,r.booking_events])];
  const escape = (v: unknown) => { let s = String(v ?? ''); if (/^[=+@\-\t\r]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"','""') + '"'; };
  const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.map(r=>r.map(escape).join(';')).join('\r\n')], { type:'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href=url; a.download=`crown-elemzes-${report.range.from}-${report.range.to}.csv`; a.click(); URL.revokeObjectURL(url);
}

export default function AnalyticsDashboard() {
  const [preset,setPreset] = useState('30d'); const [draft,setDraft] = useState<DateRange>(()=>presetRange('30d'));
  const [range,setRange] = useState(draft); const [report,setReport] = useState<AnalyticsReport|null>(null);
  const [loading,setLoading] = useState(true); const [error,setError] = useState(''); const [dimension,setDimension] = useState('sources');
  const [mode,setMode] = useState<'live'|'history'>('live'); const [query,setQuery] = useState('');
  const [auto,setAuto] = useState(false); const abort = useRef<AbortController|null>(null);
  const refresh = useCallback(async () => {
    abort.current?.abort(); const controller = new AbortController(); abort.current=controller;
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/analytics', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(range), signal:controller.signal });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Az elemzés nem tölthető be.');
      setReport(result);
    } catch(e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Betöltési hiba.'); }
    finally { if (!controller.signal.aborted) setLoading(false); }
  },[range]);
  useEffect(()=>{ void refresh(); return ()=>abort.current?.abort(); },[refresh]);
  useEffect(()=>{ if (!auto) return; const id=window.setInterval(()=>{ if(document.visibilityState==='visible') void refresh(); },60000); return()=>clearInterval(id); },[auto,refresh]);
  const selectPreset = (key:string) => { const next=presetRange(key); setPreset(key); setDraft(next); setRange(next); };
  const current = report?.current; const previous = report?.previous; const s=current?.summary; const p=previous?.summary;
  const stale = report && (report.range.from!==range.from || report.range.to!==range.to);
  const show = report && current && previous && s && p && !stale && !error;
  const rows = (current?.breakdowns[dimension] || []).filter(r=>label(r.name).toLowerCase().includes(query.toLowerCase()));
  const measured = report ? report.range.to >= localDay(new Date(report.meta.installed_at)) : false;
  const previousMeasured = report ? report.previousRange.to >= localDay(new Date(report.meta.installed_at)) : false;
  const chart = current?.series.map(day => ({...day, sessions:mode==='history' ? current.ga.series.find(g=>g.day===day.day)?.sessions ?? null : report && day.day >= localDay(new Date(report.meta.installed_at)) ? day.sessions : null})) || [];

  return <div className={styles.dashboard}>
    <section className={styles.hero}>
      <div><div className={styles.eyebrow}><ChartNoAxesCombined size={16}/> CROWN DENTAL · ELEMZÉSEK</div>
        <h2>A látogatástól az időpontig.</h2><p>Lássa, honnan érkeznek a páciensek, és hol válik az érdeklődés időpontkéréssé.</p></div>
      <button className={styles.export} disabled={!show || loading} onClick={()=>report&&exportCsv(report)}><ArrowDownToLine size={17}/> CSV letöltése</button>
    </section>
    <section className={styles.filters} aria-label="Elemzési időszak">
      <div className={styles.presets}>{presets.map(([key,title])=><button key={key} aria-pressed={preset===key} onClick={()=>selectPreset(key)}>{title}</button>)}</div>
      <form className={styles.dates} onSubmit={e=>{e.preventDefault();const values=new FormData(e.currentTarget);const next={from:String(values.get('from')),to:String(values.get('to'))};setPreset('custom');setDraft(next);setRange(next);}}>
        <label>Kezdőnap<input aria-label="Kezdőnap" name="from" type="date" required min="2000-01-01" max={localDay()} value={draft.from} onInput={e=>{const value=e.currentTarget.value;setDraft(previous=>({...previous,from:value}));}}/></label>
        <span className={styles.dateDash}>—</span><label>Zárónap<input aria-label="Zárónap" name="to" type="date" required min={draft.from} max={localDay()} value={draft.to} onInput={e=>{const value=e.currentTarget.value;setDraft(previous=>({...previous,to:value}));}}/></label>
        <button className={styles.primary} type="submit"><CalendarDays size={16}/> Időszak alkalmazása</button>
        <div className={styles.refresh}><label><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> Percenként frissít</label>
          <button type="button" disabled={loading} onClick={()=>void refresh()} aria-label="Elemzés frissítése"><RefreshCw size={17} className={loading?styles.spin:undefined}/></button></div>
      </form>
      {report && <p className={styles.compare}>Összehasonlítás: {dateLabel(report.previousRange.from)} – {dateLabel(report.previousRange.to)} · Budapest időzóna · Frissítve: {new Date(report.meta.generatedAt).toLocaleTimeString('hu-HU',{timeZone:'Europe/Budapest',hour:'2-digit',minute:'2-digit'})}</p>}
    </section>
    {error && <div className={styles.error} role="alert">{error} <button onClick={()=>void refresh()}>Újrapróbálom</button></div>}
    {loading && (!report || stale) && <div className={styles.loading} role="status"><Loader2 className={styles.spin}/> Kimutatás összeállítása…</div>}
    {show && <>
      <div className={styles.periodTitle}><h3>{dateLabel(report.range.from)} – {dateLabel(report.range.to)}</h3><span>{n(rangeDays(report.range))} nap · minden kártya erre az időszakra vonatkozik</span></div>
      <div className={styles.kpis}>
        <Kpi title="Online időpontkérések" value={n(s.requests)} delta={change(s.requests,p.requests)} icon={<CalendarDays/>} note="Az adatbázisba sikeresen mentett kérések"/>
        <Kpi title="Visszaigazolt időpontok" value={n(s.confirmed)} delta={change(s.confirmed,p.confirmed)} icon={<Target/>} note="Az időszak kéréseinek jelenlegi státusza"/>
        <Kpi title="Mért látogatók" value={measured?n(s.visitors):'—'} delta={previousMeasured?change(s.visitors,p.visitors):null} icon={<Users/>} note={measured?'Hozzájáruló böngészők, ismétlés nélkül':'Ebben az időszakban még nem volt saját mérés'}/>
        <Kpi title="Látogató → időpontkérés" value={pct(percent(s.bookedVisitors,s.visitors))} icon={<ArrowUpRight/>} note={`${n(s.bookedVisitors)} foglaló / ${n(s.visitors)} mért látogató`}/>
      </div>
      <div className={styles.notice}><Info size={18}/><div>Saját forgalommérés indulása: <strong>{new Date(report.meta.installed_at).toLocaleDateString('hu-HU',{timeZone:'Europe/Budapest'})}</strong>. A látogatói mutatók csak az analitikához hozzájáruló böngészőket tartalmazzák; az időpontkérések hozzájárulástól függetlenül szerepelnek. {n(s.requests-s.attributed)} kérés forrása nem mérhető. Korábbi forgalom a <button onClick={()=>setMode('history')}>Google Analytics-előzményeknél</button>.</div></div>
      <div className={styles.secondary}>
        <Mini title="Látogatások" value={measured?n(s.sessions):'—'} hint="30 perc inaktivitás után új munkamenet"/>
        <Mini title="Oldalmegtekintések" value={measured?n(s.views):'—'} hint="Az ismételt megnyitásokkal együtt"/>
        <Mini title="Átlagos aktív idő / látogatás" value={s.sessions?duration(s.engagementMs/s.sessions):'—'} hint="Előtérben, aktivitás mellett mért idő"/>
        <Mini title="Telefonkattintások" value={measured?n(s.phoneClicks):'—'} hint="Kattintás, nem igazolt hívás vagy foglalás"/>
      </div>
      <section className={styles.panel}>
        <div className={styles.panelHead}><div><h3>Forgalom és időpontkérések</h3><p>Naponta, a kérés beérkezésének dátuma alapján</p></div><div className={styles.segment}>
          <button aria-pressed={mode==='live'} onClick={()=>setMode('live')}>Saját mérés</button><button aria-pressed={mode==='history'} onClick={()=>setMode('history')}>GA-előzmények</button></div></div>
        {mode==='history' && <p className={styles.inlineNote}>Importált GA-pillanatkép, adatok {report.meta.ga_through || '—'}-ig. Nem élő GA-kapcsolat. A GA foglalási eseménye külön mérés, nem az adatbázisban tárolt kérések helyettesítője.</p>}
        <div className={styles.chart} role="img" aria-label="Napi látogatások és adatbázisban tárolt időpontkérések grafikonja">
          <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chart} margin={{top:15,right:10,left:-20,bottom:0}}>
            <defs><linearGradient id="analyticsTraffic" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#158b96" stopOpacity={0.25}/><stop offset="100%" stopColor="#158b96" stopOpacity={0.01}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e4eaed"/><XAxis dataKey="day" tickFormatter={v=>String(v).slice(5).replace('-','.')} minTickGap={36} fontSize={11} tickLine={false} axisLine={false}/>
            <YAxis yAxisId="traffic" allowDecimals={false} fontSize={11} tickLine={false} axisLine={false}/><YAxis yAxisId="bookings" orientation="right" allowDecimals={false} fontSize={11} tickLine={false} axisLine={false}/>
            <Tooltip labelFormatter={v=>dateLabel(String(v))} contentStyle={{borderRadius:12,border:'1px solid #e2e8f0'}}/>
            <Area yAxisId="traffic" type="monotone" dataKey="sessions" name={mode==='history'?'GA-látogatások':'Mért látogatások'} stroke="#158b96" fill="url(#analyticsTraffic)" strokeWidth={2}/>
            <Bar yAxisId="bookings" dataKey="requests" name="Időpontkérések" fill="#bd8739" radius={[3,3,0,0]} maxBarSize={18}/>
          </ComposedChart></ResponsiveContainer>
        </div>
        <div className={styles.legend}><span><i style={{background:'#158b96'}}/>Látogatások · bal tengely</span><span><i style={{background:'#bd8739'}}/>Időpontkérések · jobb tengely</span></div>
      </section>
      {mode==='history' && <section className={styles.panel}><div className={styles.panelHead}><div><h3>Google Analytics · korábbi forgalom</h3><p>A kiválasztott időszak elérhető, importált adatai · property 533215877</p></div></div>
        <div className={styles.secondary}><Mini title="GA-látogatások" value={n(current.ga.sessions)}/><Mini title="GA-oldalmegtekintések" value={n(current.ga.views)}/><Mini title="GA aktív idő / látogatás" value={current.ga.sessions?duration(current.ga.engagementSeconds*1000/current.ga.sessions):'—'}/><Mini title="GA foglalási esemény" value={n(current.ga.bookingEvents)} hint="booking_success kulcsesemény"/></div>
        <SimpleTable headers={['Forrás / médium','GA-látogatás','GA foglalási esemény']} rows={current.ga.sources.map(r=>[r.name,n(r.sessions),n(r.booking_events)])}/>
      </section>}
      <div className={styles.twoColumns}>
        <section className={styles.panel}><div className={styles.panelHead}><div><h3>Az űrlap útja</h3><p>Azonos munkameneten belüli, sorrendben teljesített lépések</p></div></div>
          {([['Űrlap megnyitása',current.funnel.views],['Kitöltés elkezdése',current.funnel.starts],['Kérés elküldése',current.funnel.submits],['Sikeresen rögzítve',current.funnel.saved]] as const).map(([title,value],i,all)=><div className={styles.funnelStep} key={title}>
            <div><span>{i+1}. {title}</span><strong>{n(value)}</strong></div><div className={styles.track}><div style={{width:`${current.funnel.views?value/current.funnel.views*100:0}%`}}/></div>
            <small>{i===0?'Mért munkamenetek':`${pct(percent(value,all[i-1][1]))} továbbhaladás az előző lépésből`}</small></div>)}
          <p className={styles.inlineNote}>{n(s.errors)} mért hiba vagy mezőellenőrzés. A teljes időpontkérésszám eltérhet: mérési hozzájárulás nélkül is lehet foglalni.</p>
        </section>
        <section className={styles.panel}><div className={styles.panelHead}><div><h3>Mi lett az időpontkérésekből?</h3><p>A kiválasztott időszakban beérkezett kérések mai állapota</p></div></div>
          {[['Visszaigazolt időpont',s.confirmed,'#1c8876'],['Egyeztetésre vár',s.pending,'#c69a4c'],['Nem vette fel',s.noAnswer,'#d97757'],['Különleges egyeztetés',s.special,'#8b73b1'],['Sztornózva',s.cancelled,'#8b97a6']].map(([title,value,color])=><div className={styles.statusRow} key={title}><i style={{background:String(color)}}/><span>{title}</span><strong>{n(Number(value))}</strong><small>{pct(percent(Number(value),s.requests))}</small></div>)}
          <div className={styles.highlight}><span>Kérés → visszaigazolt időpont</span><strong>{pct(percent(s.confirmed,s.requests))}</strong></div>
          <p className={styles.inlineNote}>A különleges egyeztetés nem számít visszaigazolt időpontnak. A rejtett rekordokat a kimutatás nem tartalmazza.</p>
        </section>
      </div>
      <section className={styles.panel}><div className={styles.panelHead}><div><h3>Honnan jönnek a foglalások?</h3><p>Az adott munkamenet első forrása · a nem mért kérések külön sorban</p></div><input className={styles.search} aria-label="Bontás keresése" placeholder="Keresés a bontásban…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
        <div className={styles.tabs}>{tabs.map(([key,title])=><button aria-pressed={dimension===key} key={key} onClick={()=>{setDimension(key);setQuery('');}}>{title}</button>)}</div>
        <SourceTable rows={rows}/>
      </section>
      <div className={styles.twoColumns}><section className={styles.panel}><h3>Mely kezelésekre érkezik kérés?</h3><SimpleTable headers={['Kezelés','Kérés','Visszaigazolt']} rows={current.treatments.map(r=>[r.name,n(r.requests),n(r.confirmed)])}/></section>
        <section className={styles.panel}><h3>Rendelő szerinti megoszlás</h3><p className={styles.inlineNote}>Visszaigazolt rendelő, ennek hiányában a kéréskor megadott város.</p><SimpleTable headers={['Rendelő / város','Kérés','Visszaigazolt']} rows={current.clinics.map(r=>[label(r.name),n(r.requests),n(r.confirmed)])}/></section></div>
      <section className={styles.panel}><h3>Mely oldalak tartják meg a figyelmet?</h3><p className={styles.inlineNote}>Oldalcsoportok, az aktívan böngészett idővel. A cikkeket adatminimalizálás miatt közösen mutatjuk.</p>
        <SimpleTable headers={['Oldal','Megtekintés','Látogatás','Aktív idő / megtekintés','Időpontgomb-kattintás']} rows={current.pages.map(r=>[label(r.name),n(r.views),n(r.sessions),r.views?duration(r.engagement_ms/r.views):'—',n(r.cta_clicks)])}/>
      </section>
      <section className={styles.panel}><h3>Mikor kérnek időpontot?</h3><p className={styles.inlineNote}>Beérkezett időpontkérések a hét napja és óra szerint · Budapest időzóna</p>
        <div className={styles.heatScroll}><div className={styles.heatmap}><span/>{Array.from({length:24},(_,h)=><small key={h}>{h}</small>)}
          {['H','K','Sze','Cs','P','Szo','V'].map((day,d)=><div className={styles.heatRow} key={day}><strong>{day}</strong>{Array.from({length:24},(_,h)=>{const value=current.hours.find(r=>r.weekday===d+1&&r.hour===h)?.requests||0;const max=Math.max(1,...current.hours.map(r=>r.requests));return <div key={h} title={`${day} ${h}:00 – ${value} kérés`} aria-label={`${day} ${h} óra: ${value} kérés`} style={{background:value?`rgba(21,139,150,${0.18+0.82*value/max})`:'#f0f3f4'}}>{value||''}</div>;})}</div>)}
        </div></div>
      </section>
      <details className={styles.panel}><summary>Mit jelentenek a számok?</summary><div className={styles.definitions}>
        <p><strong>Időpontkérés:</strong> sikeresen adatbázisba mentett online jelentkezés. Nem azonos a személyes megjelenéssel vagy a bevétellel. Az ismételt elküldés ugyanazzal a kérésazonosítóval nem új foglalás.</p>
        <p><strong>Látogató:</strong> hozzájáruló böngésző 90 napig tárolt, véletlen azonosítóval. Másik eszköz, törölt tároló vagy azonosítócsere új látogatót jelenthet. Ez nem egyedi személyek nyilvántartása.</p>
        <p><strong>Konverzió:</strong> a mért látogatók közül időpontot kérő böngészők aránya. A nem mért foglalásokat nem osztjuk el a mért látogatók számával.</p>
        <p><strong>Aktív idő:</strong> előtérben lévő oldal, legfeljebb egyperces inaktivitással. Nem teljes eltelt idő. A mérés blokkolása, a lap hirtelen bezárása vagy a kapcsolat megszakadása alulmérést okozhat.</p>
        <p><strong>Előzmények:</strong> a foglalási adatbázis első elérhető kérése {report.meta.firstBooking ? new Date(report.meta.firstBooking).toLocaleDateString('hu-HU',{timeZone:'Europe/Budapest'}) : 'még nincs'}. A saját mérés előtti forrásadatok ismeretlenek. A GA-előzmény külön, importált pillanatkép; az eltérő mérési módszereket nem adjuk össze.</p>
        <p><strong>Adatvédelem:</strong> nincs munkamenet-videó, mezőtartalom, név, e-mail, telefonszám vagy IP-cím a forgalmi eseményekben. A hozzájárulás visszavonása leállítja a további mérést. Az eseményszintű adatok megőrzése 25 hónap.</p>
      </div></details>
    </>}
  </div>;
}

function Kpi({title,value,note,delta,icon}:{title:string;value:string;note:string;delta?:number|null;icon:React.ReactNode}) {
  return <article className={styles.kpi}><div className={styles.kpiTitle}>{title}{icon}</div><strong>{value}</strong><p>{note}</p>{delta!==undefined&&<span className={styles.delta}>{delta===null?'Nincs összehasonlítható előző adat':`${delta>0?'+':''}${pct(delta)} az előző időszakhoz képest`}</span>}</article>;
}
function Mini({title,value,hint}:{title:string;value:string;hint?:string}) {return <div className={styles.mini}><span>{title}</span><strong>{value}</strong>{hint&&<small>{hint}</small>}</div>;}
function SourceTable({rows}:{rows:Breakdown[]}) {return <SimpleTable headers={['Forrás / csoport','Látogatás','Időpontkérés','Visszaigazolt','Látogatás → kérés']} rows={rows.map(r=>[label(r.name),n(r.sessions),n(r.requests),n(r.confirmed),pct(percent(r.booked_sessions,r.sessions))])}/>;}
function SimpleTable({headers,rows}:{headers:string[];rows:(string|number)[][]}) {return <div className={styles.tableScroll}><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.length?rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{v}</td>)}</tr>):<tr><td colSpan={headers.length} className={styles.empty}>Ebben az időszakban nincs elérhető adat.</td></tr>}</tbody></table></div>;}
