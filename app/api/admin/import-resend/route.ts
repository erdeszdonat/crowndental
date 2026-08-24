import { createClient } from '@supabase/supabase-js';
import { addToResendAudience } from '@/lib/addToAudience';
import { requireAdminSession } from '@/lib/adminAuth';
import { createUnsubscribeToken, getUnsubscribeTokenHash } from '@/lib/marketingTokens';
import { noStoreJson, rejectUntrustedMutation } from '@/lib/serverSecurity';

export const maxDuration = 60;

export async function POST(req: Request) {
  const originError = rejectUntrustedMutation(req);
  if (originError) return originError;
  const authError = requireAdminSession(req);
  if (authError) return authError;

  try {
    const { skipEvent } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return noStoreJson({ error: 'Hiányoznak Supabase env változók' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('marketing_subscribers')
      .select('id, email, name, nickname, created_at, unsubscribe_token_hash')
      .eq('consent_status', 'subscribed')
      .order('created_at', { ascending: false });

    if (error) {
      return noStoreJson({ error: `Adatbázis hiba: ${error.message}` }, { status: 500 });
    }

    // Dedupe by email (lowercased) - keep the FIRST entry which is the newest (DESC order)
    const seen = new Set<string>();
    const uniqueContacts: { id: string; email: string; name: string; nickname: string; unsubscribeTokenHash?: string | null }[] = [];
    for (const row of data ?? []) {
      const email = (row.email || '').trim().toLowerCase();
      if (!email || !email.includes('@') || seen.has(email)) continue;
      seen.add(email);
      uniqueContacts.push({ id: String(row.id), email, name: row.name || '', nickname: row.nickname || '', unsubscribeTokenHash: row.unsubscribe_token_hash });
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const contact of uniqueContacts) {
      try {
        const unsubscribeToken = createUnsubscribeToken(contact.email);
        const unsubscribeTokenHash = getUnsubscribeTokenHash(unsubscribeToken);
        if (unsubscribeTokenHash && unsubscribeTokenHash !== contact.unsubscribeTokenHash) {
          const { error: tokenError } = await supabase
            .from('marketing_subscribers')
            .update({ unsubscribe_token_hash: unsubscribeTokenHash })
            .eq('id', contact.id);
          if (tokenError) throw tokenError;
        }
        const syncResult = await addToResendAudience({
          email: contact.email,
          name: contact.name,
          nickname: contact.nickname,
          source: 'appointment',
          skipEvent: !!skipEvent,
          unsubscribeToken: unsubscribeToken || undefined,
        });
        if (syncResult.ok) imported++;
        else {
          failed++;
          errors.push(`${contact.email}: ${syncResult.errors.join(', ')}`);
        }
      } catch (err: any) {
        failed++;
        errors.push(`${contact.email}: ${err?.message ?? err}`);
      }
    }

    return noStoreJson({
      success: true,
      totalInDb: data?.length ?? 0,
      uniqueEmails: uniqueContacts.length,
      imported,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    console.error('Import hiba:', err);
    return noStoreJson({ error: err.message ?? 'Ismeretlen hiba' }, { status: 500 });
  }
}
