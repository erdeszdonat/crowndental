import { Resend } from 'resend';

interface AddToAudienceParams {
  email: string;
  name?: string;
  nickname?: string;
  source?: 'appointment' | 'career' | 'quote';
  payload?: Record<string, any>;
}

export async function addToResendAudience({ email, name, nickname, source, payload }: AddToAudienceParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const eventName = process.env.RESEND_AUTOMATION_EVENT || 'Contact added to audience';

  if (!apiKey || !email) return;

  const resend = new Resend(apiKey);

  // Hungarian naming convention: [Vezetéknév] [Keresztnév]
  // e.g. "Erdész Donát" -> lastName="Erdész", firstName="Donát"
  // The nickname (becenév) overrides the parsed first name when present.
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  let firstName: string | undefined;
  let lastName: string | undefined;
  if (parts.length === 1) {
    firstName = parts[0];
  } else if (parts.length > 1) {
    lastName = parts[0];
    firstName = parts.slice(1).join(' ');
  }
  const cleanNick = (nickname ?? '').trim();
  if (cleanNick) firstName = cleanNick;

  // 1. Add contact to audience (idempotent — Resend silently handles duplicates)
  if (audienceId) {
    try {
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

  // 2. Fire the custom event so any matching Automation starts running
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
        payload: payload ?? { source: source ?? 'appointment', firstName, lastName },
      }),
    });
    if (!eventRes.ok) {
      const text = await eventRes.text();
      console.warn(`Resend event send (${source}):`, eventRes.status, text);
    }
  } catch (err: any) {
    console.warn(`Resend event send failed (${source}):`, err?.message ?? err);
  }
}
