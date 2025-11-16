import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient(supabaseUrl: string, supabaseAnonKey: string) {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required.');
  }
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
