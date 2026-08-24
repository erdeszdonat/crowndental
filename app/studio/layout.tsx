import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Sanity Studio | Crown Dental',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <html lang="hu"><body>{children}</body></html>;
}
