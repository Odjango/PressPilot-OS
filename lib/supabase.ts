import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const missingKeys: string[] = [];
if (!SUPABASE_URL) missingKeys.push('NEXT_PUBLIC_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) missingKeys.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (missingKeys.length > 0) {
  console.warn(
    `[supabase] Missing environment variables: ${missingKeys.join(
      ', ',
    )}. Using development-safe fallbacks.`,
  );
}

const fallbackUrl = SUPABASE_URL ?? 'https://placeholder.supabase.co';
const fallbackAnonKey = SUPABASE_ANON_KEY ?? 'public-anon-key';

declare global {
  // eslint-disable-next-line no-var
  var __presspilot_supabase__: SupabaseClient<Database> | undefined;
}

const isBrowser = typeof window !== 'undefined';

const createBrowserClient = () =>
  createClient<Database>(fallbackUrl, fallbackAnonKey, {
    auth: {
      persistSession: isBrowser,
      detectSessionInUrl: isBrowser,
      autoRefreshToken: isBrowser,
    },
  });

export const supabase =
  globalThis.__presspilot_supabase__ ?? createBrowserClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__presspilot_supabase__ = supabase;
}

export const createSupabaseBrowserClient = () => createBrowserClient();


