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

async function callMarketingGateway(body: Record<string, unknown>): Promise<ResendAudienceResult> {
  const token = process.env.CROWN_MARKETING_GATEWAY_TOKEN;
  if (!token) return { ok: false, errors: ['missing_marketing_gateway'] };
  try {
    const response = await fetch('https://crown-mail-gateway-erdeszdonats-projects.vercel.app/api/marketing', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, brand: 'crowndental' }),
      signal: AbortSignal.timeout(45000),
    });
    const result = await response.json().catch(() => null) as { ok?: boolean } | null;
    if (response.ok && result?.ok === true) return { ok: true, errors: [] };
    return { ok: false, errors: ['marketing_gateway_failed'] };
  } catch {
    return { ok: false, errors: ['marketing_gateway_unavailable'] };
  }
}

export async function addToResendAudience({ email, name, nickname, source, payload, skipEvent, unsubscribeToken }: AddToAudienceParams): Promise<ResendAudienceResult> {
  const { firstName, lastName } = getContactNameParts(name, nickname);
  return callMarketingGateway({
    action: 'subscribe', email, firstName, lastName,
    source: payload?.source || source, locale: payload?.locale,
    skipEvent: skipEvent === true,
    unsubscribeToken: unsubscribeToken || createUnsubscribeToken(email),
  });
}

export async function unsubscribeFromResendAudience(email: string): Promise<ResendAudienceResult> {
  return callMarketingGateway({ action: 'unsubscribe', email });
}
