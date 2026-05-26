import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addToResendAudience } from '@/lib/addToAudience';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Jogosulatlan' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Hiányoznak Supabase env változók' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('appointments')
      .select('email, name, nickname, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: `Adatbázis hiba: ${error.message}` }, { status: 500 });
    }

    // Dedupe by email (lowercased) - keep the FIRST entry which is the newest (DESC order)
    const seen = new Set<string>();
    const uniqueContacts: { email: string; name: string; nickname: string }[] = [];
    for (const row of data ?? []) {
      const email = (row.email || '').trim().toLowerCase();
      if (!email || !email.includes('@') || seen.has(email)) continue;
      seen.add(email);
      uniqueContacts.push({ email, name: row.name || '', nickname: row.nickname || '' });
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const contact of uniqueContacts) {
      try {
        await addToResendAudience({
          email: contact.email,
          name: contact.name,
          nickname: contact.nickname,
          source: 'appointment',
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`${contact.email}: ${err?.message ?? err}`);
      }
    }

    return NextResponse.json({
      success: true,
      totalInDb: data?.length ?? 0,
      uniqueEmails: uniqueContacts.length,
      imported,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    console.error('Import hiba:', err);
    return NextResponse.json({ error: err.message ?? 'Ismeretlen hiba' }, { status: 500 });
  }
}
