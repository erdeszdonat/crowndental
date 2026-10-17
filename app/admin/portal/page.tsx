import Image from 'next/image';
import type { Metadata } from 'next';
import styles from './portal.module.css';

export const metadata: Metadata = { title: 'Crown Admin · Válasszon márkát' };

export default function AdminPortal() {
  return (
    <main className={styles.portal}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>CROWN · ADMINISZTRÁCIÓ</p>
        <h1 className={styles.heading}>Melyik felületet nyitja meg?</h1>
        <p className={styles.intro}>A belépéshez válasszon márkát.</p>
        <div className={styles.cards}>
          <a className={`${styles.card} ${styles.dental}`} href="/crown-dental" aria-label="Crown Dental admin – bejelentkezés">
            <div className={styles.logo}><Image src="/logo.webp" alt="Crown Dental" width={280} height={190} priority className={styles.dentalLogo} /></div>
            <span className={styles.cardName}>Crown Dental</span>
            <span className={styles.description}>Fogászat · rendelői adminisztráció</span>
            <span className={styles.action}>Bejelentkezés <span aria-hidden="true">↗</span></span>
          </a>
          <a className={`${styles.card} ${styles.beauty}`} href="/beauty-crown" aria-label="Beauty Crown admin – hamarosan">
            <span className={styles.badge}>Hamarosan</span>
            <div className={styles.logo}><Image src="/beauty-crown-logo.png" alt="Beauty Crown by Crown Dental" width={240} height={240} priority className={styles.beautyLogo} /></div>
            <span className={styles.cardName}>Beauty Crown</span>
            <span className={styles.description}>Orvosesztétika · mosolytervezés</span>
            <span className={styles.action}>Előkészítés alatt <span aria-hidden="true">↗</span></span>
          </a>
        </div>
        <p className={styles.footer}>Belső kezelőfelület · Jogosult munkatársak részére</p>
      </div>
    </main>
  );
}
