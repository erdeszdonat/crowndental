import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { password, action, table, id, value } = await req.json();

    // 1. Szigorú jelszó ellenőrzés
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Jogosulatlan hozzáférés!' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Szerver beállítási hiba. Hiányzik a Service Role Key!' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Művelet végrehajtása biztonságosan a Service Role-lal
    if (action === 'hide') {
      const { error } = await supabase.from(table).update({ is_hidden: true }).eq('id', id);
      if (error) throw error;
    } else if (action === 'update_status') {
      const { error } = await supabase.from(table).update({ status: value }).eq('id', id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Action API Hiba:", error);
    return NextResponse.json({ error: 'Szerverhiba történt a művelet során.' }, { status: 500 });
  }
}
