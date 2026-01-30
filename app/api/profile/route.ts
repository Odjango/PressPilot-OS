import { NextResponse, type NextRequest } from 'next/server';

import { getUserAuthContext } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';

export async function GET(_request: NextRequest) {
  const { user } = await getUserAuthContext();

  if (!user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized: missing Supabase session' },
      { status: 401 },
    );
  }

  const client = await createServerSupabaseClient();
  const { data, error } = await (client as any)
    .from('pp_profiles')
    .select('id,email,full_name,created_at')
    .eq('email', user.email)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: `Unable to load profile: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const { user } = await getUserAuthContext();

  if (!user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized: missing Supabase session' },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const fullName =
    typeof body.full_name === 'string'
      ? body.full_name
      : typeof body.fullName === 'string'
        ? body.fullName
        : '';

  if (!fullName.trim()) {
    return NextResponse.json(
      { error: 'full_name is required' },
      { status: 400 },
    );
  }

  const client = await createServerSupabaseClient();

  const { data, error } = await (client as any)
    .from('pp_profiles')
    .upsert(
      {
        email: user.email,
        full_name: fullName.trim(),
      } as Database['public']['Tables']['pp_profiles']['Insert'],
      { onConflict: 'email' },
    )
    .select('id,email,full_name,created_at')
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Unable to update profile: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile: data });
}


