import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authorizeStaff } from '@/lib/staffAuth';
import HidfutasAdminClient from './HidfutasAdminClient';

export const dynamic = 'force-dynamic';

export default async function HidfutasAdminPage() {
  const requestHeaders = await headers();
  const access = await authorizeStaff(new Request('https://admin.crowndental.hu/crown-dental/hidfutas', { headers: requestHeaders }));
  if (access.error) redirect('/crown-dental');
  return <HidfutasAdminClient />;
}
