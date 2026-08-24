import { Resend } from 'resend';
import { getContactNameParts } from './names';
import { createUnsubscribeToken } from './marketingTokens';

interface AddToAudienceParams {
  email: string;
  name?: string;
  nickname?: string;
  source?: string;
  payload?: Record<string, unknown>;
  skipEvent?: boolean;
  unsubscribeToken?: string;
}

export type ResendAudienceResult = { ok: boolean; errors: string[] };
export type TransactionalEmailResult = { ok: boolean; providerId?: string; error?: string };

type TransactionalEmail = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export async function sendTransactionalEmail(
  email: TransactionalEmail,
  idempotencyKey: string,
): Promise<TransactionalEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'missing_resend_configuration' };
  if (!idempotencyKey || idempotencyKey.length > 256) {
    return { ok: false, error: 'invalid_idempotency_key' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(email),
    });
    const responseBody = await response.json().catch(() => null) as { id?: unknown } | null;
    if (!response.ok) {
      console.warn('Resend tranzakciós e-mail hiba:', response.status);
      return { ok: false, error: `provider_${response.status}` };
    }
    return {
      ok: true,
      providerId: typeof responseBody?.id === 'string' ? responseBody.id : undefined,
    };
  } catch (error) {
    console.warn('Resend tranzakciós e-mail hálózati hiba:', error);
    return { ok: false, error: 'provider_unavailable' };
  }
}

export async function addToResendAudience({ email, name, nickname, source, payload, skipEvent, unsubscribeToken }: AddToAudienceParams): Promise<ResendAudienceResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const eventName = process.env.RESEND_AUTOMATION_EVENT || 'Contact added to audience';
  const errors: string[] = [];

  if (!apiKey || !audienceId || !email) return { ok: false, errors: ['missing_resend_configuration'] };

  const resend = new Resend(apiKey);

  const { firstName, lastName } = getContactNameParts(name, nickname);
  const effectiveUnsubscribeToken = unsubscribeToken || createUnsubscribeToken(email);
  const unsubscribeUrl = effectiveUnsubscribeToken
    ? `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.crowndental.hu').replace(/\/$/, '')}/api/marketing-unsubscribe?token=${encodeURIComponent(effectiveUnsubscribeToken)}`
    : undefined;

  // 1. Upsert contact in audience: try create first, fall back to PATCH on conflict
  if (audienceId) {
    try {
      const result = await resend.contacts.create({
        email,
        firstName,
        lastName,
        unsubscribed: false,
        audienceId,
      });

      if (result.error) {
        // Existing contact -> update it so name corrections and resubscription propagate.
        const updateRes = await fetch(
          `https://api.resend.com/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              first_name: firstName,
              last_name: lastName,
              unsubscribed: false,
            }),
          }
        );
        if (!updateRes.ok) {
          const text = await updateRes.text();
          console.warn(`Resend upsert (${source}):`, updateRes.status, text);
          errors.push(`contact_update_${updateRes.status}`);
        }
      }
    } catch (err: unknown) {
      console.warn(`Resend audience upsert failed (${source}):`, err instanceof Error ? err.message : err);
      errors.push('contact_upsert_failed');
    }
  }

  // 2. Fire the custom event so any matching Automation starts running
  // (can be skipped when only refreshing existing contact data via bulk re-import)
  if (errors.length > 0) return { ok: false, errors };
  if (skipEvent) return { ok: errors.length === 0, errors };
  try {
    const eventRes = await fetch('https://api.resend.com/events/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        email,
        payload: { ...(payload ?? { source: source ?? 'appointment', firstName, lastName }), unsubscribeUrl },
      }),
    });
    if (!eventRes.ok) {
      const text = await eventRes.text();
      console.warn(`Resend event send (${source}):`, eventRes.status, text);
      errors.push(`event_send_${eventRes.status}`);
    }
  } catch (err: unknown) {
    console.warn(`Resend event send failed (${source}):`, err instanceof Error ? err.message : err);
    errors.push('event_send_failed');
  }

  return { ok: errors.length === 0, errors };
}

export async function unsubscribeFromResendAudience(email: string): Promise<ResendAudienceResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId || !email) {
    return { ok: false, errors: ['missing_resend_configuration'] };
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ unsubscribed: true }),
        },
      );

      // A missing contact cannot receive audience mail, so it is already in
      // the desired state.
      if (response.ok || response.status === 404) return { ok: true, errors: [] };
      const responseText = await response.text();
      console.warn('Resend leiratkozási szinkron hiba:', response.status, responseText);
      if (response.status < 500 && response.status !== 429) {
        return { ok: false, errors: [`unsubscribe_${response.status}`] };
      }
    } catch (error) {
      console.warn('Resend leiratkozási szinkron hiba:', error);
    }
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 250));
  }
  return { ok: false, errors: ['unsubscribe_failed'] };
}
