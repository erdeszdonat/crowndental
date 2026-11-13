import { staffServiceClient } from '@/lib/staffAuth';
import { buildAppointmentReminder, type ReminderSnapshot } from '@/lib/appointmentReminder';

export const maxDuration = 60;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) return json({ error: 'unauthorized' }, 401);
  try {
    const db = staffServiceClient();
    const authorized = await db.rpc('crown_reminder_authorized', { token });
    if (authorized.error) return json({ error: 'authorization_unavailable' }, 503);
    if (authorized.data !== true) return json({ error: 'unauthorized' }, 401);
    if (!process.env.RESEND_API_KEY) return json({ error: 'mail_unavailable' }, 503);
    if (new URL(request.url).searchParams.get('check') === '1') return json({ ready: true });

    const deadline = Date.now() + 40_000;
    let sent = 0;
    let failed = 0;
    for (let i = 0; i < 20 && Date.now() < deadline; i++) {
      const claim = await db.rpc('claim_appointment_reminder');
      if (claim.error) throw new Error('claim_failed');
      if (!claim.data) break;
      const job = claim.data as { id: string; token: string; snapshot: ReminderSnapshot };
      let providerId: string | null = null;
      let errorCode: string | null = null;
      try {
        const payload = buildAppointmentReminder(job.snapshot);
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST', signal: AbortSignal.timeout(8000),
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `crown-appointment-reminder-v1-${job.id}` },
          body: JSON.stringify(payload),
        });
        const body = await response.json().catch(() => null);
        if (response.ok && typeof body?.id === 'string' && body.id) providerId = body.id;
        else errorCode = `provider_http_${response.status}`;
      } catch { errorCode = 'send_failed_or_unknown'; }
      const saved = await db.rpc('finish_appointment_reminder', {
        job_id: job.id, token: job.token, provider_message_id: providerId, error_code: errorCode,
      });
      // An interrupted acknowledgement retains the lease. Retrying uses the
      // frozen payload and the same provider key, always inside its 24h TTL.
      if (saved.error || saved.data !== true) throw new Error('acknowledgement_failed');
      if (providerId) sent++; else failed++;
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    return json({ sent, failed }, failed ? 503 : 200);
  } catch {
    console.error('Appointment reminder worker failed; inspect reminder delivery state.');
    return json({ error: 'reminder_worker_failed' }, 503);
  }
}
