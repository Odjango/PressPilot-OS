import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { getUserAuthContext } from '@/lib/auth';
import { createServerSupabaseClient, createRouteHandlerSupabaseClient } from '@/lib/supabase-server';

const TABLE_NAME = 'pp_projects';

const normalizeStatus = (status?: string | null) => {
  if (!status || typeof status !== 'string') return 'draft';
  return (status ?? '').trim().toLowerCase();
};

export async function GET(_request: NextRequest) {
  let supabase = createRouteHandlerSupabaseClient();
  let { data: { session } } = await supabase.auth.getSession();
  let dbClient: any = supabase;
  let debugInfo: any = { method: 'cookie' };

  // Fallback: Check Authorization header if cookie session is missing
  if (!session && _request.headers.get('Authorization')) {
    debugInfo.method = 'header';
    const authHeader = _request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    debugInfo.hasToken = !!token;

    if (token) {
      // Use a fresh client with the auth header set globally
      const cleanClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
      const { data: { user: authUser }, error } = await cleanClient.auth.getUser(token);

      if (error) debugInfo.authError = error.message;

      if (authUser && !error) {
        session = { user: authUser, access_token: token } as any;
        dbClient = cleanClient;
      }
    }
  }

  const user = session?.user ?? null;

  if (!user?.email) {
    return NextResponse.json(
      {
        error: `Unauthorized: missing Supabase session. Debug: ${JSON.stringify(debugInfo)}`,
        debug: debugInfo
      },
      { status: 401 },
    );
  }

  const { data, error } = await dbClient
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
  let supabase = createRouteHandlerSupabaseClient();
  let { data: { session } } = await supabase.auth.getSession();
  let dbClient: any = supabase;
  let debugInfo: any = { method: 'cookie' };

  // Fallback: Check Authorization header if cookie session is missing
  if (!session && request.headers.get('Authorization')) {
    debugInfo.method = 'header';
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    debugInfo.hasToken = !!token;

    if (token) {
      const cleanClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
      const { data: { user: authUser }, error } = await cleanClient.auth.getUser(token);

      if (error) debugInfo.authError = error.message;

      if (authUser && !error) {
        session = { user: authUser, access_token: token } as any;
        dbClient = cleanClient;
      }
    }
  }

  const user = session?.user ?? null;

  if (!user?.email) {
    return NextResponse.json(
      {
        error: `Unauthorized: missing Supabase session. Debug: ${JSON.stringify(debugInfo)}`,
        debug: debugInfo
      },
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

  const { data, error } = await dbClient
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
  let supabase = createRouteHandlerSupabaseClient();
  let { data: { session } } = await supabase.auth.getSession();
  let dbClient: any = supabase;

  // Fallback: Check Authorization header if cookie session is missing
  if (!session && request.headers.get('Authorization')) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      const cleanClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
      const { data: { user: authUser }, error } = await cleanClient.auth.getUser(token);
      if (authUser && !error) {
        session = { user: authUser, access_token: token } as any;
        dbClient = cleanClient;
      }
    }
  }

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

  const { data, error } = await dbClient
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


