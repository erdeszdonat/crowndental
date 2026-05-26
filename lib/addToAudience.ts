import { Resend } from 'resend';

interface AddToAudienceParams {
  email: string;
  name?: string;
  source?: 'appointment' | 'career' | 'quote';
}

export async function addToResendAudience({ email, name, source }: AddToAudienceParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId || !email) return;

  try {
    const resend = new Resend(apiKey);
    const parts = (name ?? '').trim().split(/\s+/);
    const firstName = parts[0] || undefined;
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

    const result = await resend.contacts.create({
      email,
      firstName,
      lastName,
      unsubscribed: false,
      audienceId,
    });

    if (result.error && result.error.name !== 'validation_error') {
      console.warn(`Resend audience add (${source}):`, result.error.message);
    }
  } catch (err: any) {
    console.warn(`Resend audience add failed (${source}):`, err?.message ?? err);
  }
}
