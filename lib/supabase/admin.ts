/**
 * Supabase Admin Client (Server-Only)
 *
 * ⚠️ SECURITY WARNING: This file exports a Supabase client using the service role key.
 * This client bypasses Row Level Security (RLS) and has full database access.
 *
 * DO NOT:
 * - Import this in client components (files with 'use client')
 * - Import this in API routes that expose data to the browser
 * - Expose the service role key in any client-side code or API responses
 *
 * ONLY USE IN:
 * - Server components (default export functions in app/ directory)
 * - Server actions
 * - Route handlers that need admin access
 *
 * This module is server-only and must NEVER be imported into client components.
 */

import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  const errorMsg =
    '[supabase/admin] Missing Supabase URL. Required env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

if (!serviceRoleKey) {
  const errorMsg =
    '[supabase/admin] Missing SUPABASE_SERVICE_ROLE_KEY. Required for admin client.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
  },
);

