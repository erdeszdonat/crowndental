import { authorizeStaff, requireStaffOrigin } from '@/lib/staffAuth';
import { noStoreJson } from '@/lib/serverSecurity';

// The event admin is retired. Historical contacts and campaign tables remain
// in Supabase; this endpoint cannot draw, send email, redeem or change them.
export async function GET(request: Request) {
  const access = await authorizeStaff(request);
  if (access.error) return access.error;
  return noStoreJson({ error: 'A Hídfutás adminfelülete lezárult. A korábbi adatok megmaradtak.' }, { status: 410 });
}
export async function POST(request: Request) {
  const originError = requireStaffOrigin(request);
  if (originError) return originError;
  return GET(request);
}
