import { NextResponse } from 'next/server';

function escapeIcs(value: unknown) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function getSafeDate(value: string | null) {
  const normalized = String(value || '').replace(/[^0-9T]/g, '');
  return /^\d{8}T\d{6}$/.test(normalized) ? normalized : '';
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const start = getSafeDate(url.searchParams.get('start'));
  const end = getSafeDate(url.searchParams.get('end'));

  if (!start || !end) {
    return NextResponse.json({ error: 'Hiányzó vagy hibás naptár időpont.' }, { status: 400 });
  }

  const title = escapeIcs(url.searchParams.get('title') || 'Crown Dental időpont');
  const location = escapeIcs(url.searchParams.get('location') || 'Crown Dental');
  const details = escapeIcs(url.searchParams.get('details') || 'Fogászati időpont a Crown Dentalnál.');
  const uid = `${start}-${Math.random().toString(36).slice(2)}@crowndental.hu`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Crown Dental//Appointment Confirmation//HU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART;TZID=Europe/Budapest:${start}`,
    `DTEND;TZID=Europe/Budapest:${end}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${details}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Crown Dental időpont 2 óra múlva',
    'TRIGGER:-PT2H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="crown-dental-idopont.ics"',
    },
  });
}
