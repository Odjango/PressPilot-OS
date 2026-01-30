import type { Session, User } from '@supabase/supabase-js';

import { createServerSupabaseClient } from './supabase-server';

export type UserAuthContext = {
  user: User | null;
  session: Session | null;
};

export async function getUserAuthContext(): Promise<UserAuthContext> {
  // Login Bypass: STRICT BYPASS
  console.log('[Auth] Bypassing real login - using dev fallback');
  const devEmail = process.env.PRESSPILOT_DEV_EMAIL ?? 'odjango4@gmail.com';
  return {
    user: { id: 'presspilot-dev-user', email: devEmail } as User,
    session: null,
  };
}
