import { authorizeStaff, requireStaffOrigin, staffServiceClient } from '@/lib/staffAuth';
import { noStoreJson } from '@/lib/serverSecurity';
import { validDay, rangeDays, previousRange, localDay } from '@/lib/analyticsDates';

export async function POST(request: Request) {
  const originError = requireStaffOrigin(request); if (originError) return originError;
  const access = await authorizeStaff(request, 'admin'); if (access.error) return access.error;
  try {
    const body = await request.json();
    if (!validDay(body.from) || !validDay(body.to) || body.from < '2000-01-01' || body.to < body.from || body.to > localDay() || rangeDays(body) > 3660) {
      return noStoreJson({ error: 'Érvényes, legfeljebb tízéves időszakot válasszon, jövőbeli nap nélkül.' }, { status: 400 });
    }
    const range = { from: body.from, to: body.to }; const previous = previousRange(range);
    // The service-only aggregate RPC is reachable only after admin + live MFA authorization.
    const db = staffServiceClient();
    const [currentReport, previousReport, settings, first] = await Promise.all([
      db.rpc('admin_analytics_report', { p_from: range.from, p_to: range.to }),
      db.rpc('admin_analytics_report', { p_from: previous.from, p_to: previous.to }),
      db.from('site_analytics_settings').select('installed_at,ga_imported_at,ga_through').single(),
      db.from('appointments').select('created_at').or('is_hidden.is.null,is_hidden.eq.false').order('created_at').limit(1),
    ]);
    if (currentReport.error || previousReport.error || settings.error || first.error) return noStoreJson({ error: 'Az elemzés most nem tölthető be. Próbálja újra.' }, { status: 503 });
    return noStoreJson({ range, previousRange: previous, current: currentReport.data, previous: previousReport.data,
      meta: { ...settings.data, firstBooking: first.data?.[0]?.created_at || null, generatedAt: new Date().toISOString() } });
  } catch { return noStoreJson({ error: 'Az elemzés betöltése sikertelen.' }, { status: 503 }); }
}
