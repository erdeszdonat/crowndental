import '../globals.css';

export const metadata = {
  title: 'Crown Admin',
  description: 'Crown Dental Admin Panel',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  )
}
