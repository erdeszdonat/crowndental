import './globals.css';
import { getLocale } from 'next-intl/server';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let locale = 'hu';
  try {
    locale = await getLocale();
  } catch {}
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
