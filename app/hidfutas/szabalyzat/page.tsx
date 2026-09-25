import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { hidfutasRules } from '@/lib/hidfutasRules';
import { HIDFUTAS } from '@/lib/hidfutas';
import styles from '../hidfutas.module.css';

export const metadata: Metadata = { title: 'Hídfutás 2026 – Játékszabályzat és adatkezelés | Crown Dental', robots: { index: false, follow: true }, alternates: { canonical: 'https://www.crowndental.hu/hidfutas/szabalyzat' } };

export default function RulesPage() {
  return <main className={styles.page} id="crown-content">
    <header className={styles.header}><Link href="/hidfutas"><Image src="/logo.webp" alt="Crown Dental – vissza a játékhoz" width={168} height={56} className={styles.logo} /></Link><span className={styles.eventTag}>HÍDFUTÁS 2026</span></header>
    <article className={styles.legal}>
      <Link href="/hidfutas">← Vissza a nyereményjátékhoz</Link>
      <h1>Játékszabályzat<br />és adatkezelési tájékoztató</h1>
      <p>Crown Dental × Hídfutás 2026 · Verzió: {HIDFUTAS.rulesVersion}</p>
      <table><tbody><tr><th>Nevezés</th><td>2026. szeptember 26., 9:00–13:00</td></tr><tr><th>Főnyeremény</th><td>1 alkalom rendelői fogfehérítés, 1 nyertesnek</td></tr><tr><th>Sorsolás</th><td>2026. szeptember 28., hétfő</td></tr></tbody></table>
      {hidfutasRules.map(section => <section key={section.id} id={section.id}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</section>)}
      <p><Link href="/adatkezeles">A Crown Dental általános adatkezelési tájékoztatója</Link> · <Link href="/impresszum">Impresszum</Link></p>
    </article>
  </main>;
}
