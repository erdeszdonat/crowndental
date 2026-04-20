import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // 1. Szigorú jelszó ellenőrzés a szerveren
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Jogosulatlan hozzáférés!' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // 2. Service Role Key használata: Ez áttöri az RLS-t és 100% biztonságos, mert csak a szerveren fut!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Hiányzó szerveroldali Supabase kulcsok (Service Role Key)!' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Adatok lekérése, DE csak azokat, amik nincsenek elrejtve (is_hidden = false vagy null)
    const [appointmentsRes, careerRes, quotesRes] = await Promise.all([
      supabase.from('appointments').select('*').is('is_hidden', false).order('created_at', { ascending: false }),
      supabase.from('career_applications').select('*').is('is_hidden', false).order('created_at', { ascending: false }),
      supabase.from('quote_leads').select('*').is('is_hidden', false).order('created_at', { ascending: false })
    ]);

    // 4. Sanity cikkek lekérése
    const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'h68mmabs';
    const sanityUrl = `https://${sanityProjectId}.api.sanity.io/v2024-03-08/data/query/production?query=*[_type == "post"] | order(publishedAt desc) { _id, title, "slug": slug.current, publishedAt, excerpt }`;
    const sanityFetch = await fetch(sanityUrl);
    const sanityJson = await sanityFetch.json();

    return NextResponse.json({
      success: true,
      appointments: appointmentsRes.data || [],
      applications: careerRes.data || [],
      quotes: quotesRes.data || [],
      posts: sanityJson.result || []
    });

  } catch (error: any) {
    console.error("Biztonságos API Hiba:", error);
    return NextResponse.json({ error: 'Szerverhiba történt az adatok betöltésekor.' }, { status: 500 });
  }
}
