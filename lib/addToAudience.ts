import { Resend } from 'resend';
import { getContactNameParts } from './names';

interface AddToAudienceParams {
  email: string;
  name?: string;
  nickname?: string;
  source?: 'appointment' | 'career' | 'quote';
  payload?: Record<string, any>;
  skipEvent?: boolean;
}

export async function addToResendAudience({ email, name, nickname, source, payload, skipEvent }: AddToAudienceParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const eventName = process.env.RESEND_AUTOMATION_EVENT || 'Contact added to audience';

  if (!apiKey || !email) return;

  const resend = new Resend(apiKey);

  const { firstName, lastName } = getContactNameParts(name, nickname);

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
        // Existing contact -> update it so name corrections propagate
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
        }
      }
    } catch (err: any) {
      console.warn(`Resend audience upsert failed (${source}):`, err?.message ?? err);
    }
  }

  // 2. Fire the custom event so any matching Automation starts running
  // (can be skipped when only refreshing existing contact data via bulk re-import)
  if (skipEvent) return;
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
