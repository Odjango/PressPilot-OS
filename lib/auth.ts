import type { Session, User } from '@supabase/supabase-js';

import { createServerSupabaseClient } from './supabase-server';

export type UserAuthContext = {
  user: User | null;
  session: Session | null;
};

export async function getUserAuthContext(): Promise<UserAuthContext> {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('[auth] getUserAuthContext error', error);
  }

  const user = session?.user ?? null;

  // Dev fallback only in development and only if no session exists
  // This ensures production always uses real sessions
  if (!user && !session && process.env.NODE_ENV === 'development') {
    const devEmail = process.env.PRESSPILOT_DEV_EMAIL ?? 'odjango4@gmail.com';
    return {
      user: {
        id: 'presspilot-dev-user',
        email: devEmail,
      } as User,
      session: null,
    };
  }

  return {
    user,
    session: session ?? null,
  };
}
