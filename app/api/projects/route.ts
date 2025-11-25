import { NextResponse, type NextRequest } from 'next/server';

import { getUserAuthContext } from '@/lib/auth';
import { createServerSupabaseClient, createRouteHandlerSupabaseClient } from '@/lib/supabase-server';

const TABLE_NAME = 'pp_projects';

const normalizeStatus = (status?: string | null) => {
  if (!status || typeof status !== 'string') return 'draft';
  return (status ?? '').trim().toLowerCase();
};

export async function GET(_request: NextRequest) {
  const supabase = createRouteHandlerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  console.log('[API] GET /projects - Auth Check:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasSession: !!session,
  });

  if (!user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized: missing Supabase session' },
      { status: 401 },
    );
  }

  const client = createServerSupabaseClient();
  const { data, error } = await (client as any)
    .from(TABLE_NAME)
    .select('id,owner_email,name,slug,status,created_at')
    .eq('owner_email', user.email)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: `Unable to load projects: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { user } = await getUserAuthContext();

  if (!user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized: missing Supabase session' },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const status = normalizeStatus(body.status);

  if (!name || !slug) {
    return NextResponse.json(
      { error: 'Both name and slug are required' },
      { status: 400 },
    );
  }

  const client = createServerSupabaseClient();
  const { data, error } = await (client as any)
    .from(TABLE_NAME)
    .insert({
      owner_email: user.email,
      name,
      slug,
      status,
    })
    .select('id,owner_email,name,slug,status,created_at')
    .single();

  if (error) {
    // Handle unique constraint violation (duplicate slug)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A project with this slug already exists. Please choose a different slug.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: `Unable to create project: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ project: data });
}

export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized: missing Supabase session' },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';

  if (!id) {
    return NextResponse.json({ error: 'Project id is required' }, { status: 400 });
  }

  const updates: Record<string, string> = {};

  if (typeof body.name === 'string' && body.name.trim()) {
    updates.name = body.name.trim();
  }

  if (typeof body.slug === 'string' && body.slug.trim()) {
    updates.slug = body.slug.trim();
  }

  if (typeof body.status === 'string' && body.status.trim()) {
    updates.status = normalizeStatus(body.status);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'At least one field (name, slug, status) must be provided' },
      { status: 400 },
    );
  }

  const client = createServerSupabaseClient();
  const { data, error } = await (client as any)
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .eq('owner_email', user.email)
    .select('id,owner_email,name,slug,status,created_at')
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Unable to update project: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ project: data });
}


