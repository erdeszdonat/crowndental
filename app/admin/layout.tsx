import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Crown Admin',
  description: 'Crown Dental Admin Panel',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <html lang="hu"><body>{children}</body></html>;
}
