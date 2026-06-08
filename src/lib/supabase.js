/**
 * src/lib/supabase.js
 * Supabase client — reads credentials from .env (VITE_ prefix)
 * Never import the secret key here — that lives in Edge Functions only.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    '[MySista] Supabase env vars missing. Copy .env.example → .env and fill in your keys.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnon ?? '', {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
    storageKey:        'mysista-auth',
  },
});

// ─── Convenience Helpers ──────────────────────────────────────────────────────

/** Fetch the current authenticated user's profile row */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/** Upsert (create or update) a profile row */
export async function upsertProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
