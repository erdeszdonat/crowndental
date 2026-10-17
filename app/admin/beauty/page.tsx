import Image from 'next/image';
import type { Metadata } from 'next';
import styles from '../portal/portal.module.css';

export const metadata: Metadata = { title: 'Beauty Crown admin · Hamarosan' };

export default function BeautyAdminPending() {
  return <main className={styles.portal}><div className={styles.holding}>
    <Image src="/beauty-crown-logo.png" alt="Beauty Crown by Crown Dental" width={200} height={200} priority style={{ margin: '0 auto' }} />
    <h1>Hamarosan itt is találkozunk.</h1>
    <p>A Beauty Crown adminfelülete előkészítés alatt áll. A bejelentkezés és az ügyintézés ezen a felületen még nem érhető el.</p>
    <a href="/admin/portal" className={styles.back}>← Vissza a választáshoz</a>
  </div></main>;
}
