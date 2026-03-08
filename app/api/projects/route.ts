import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { getUserAuthContext } from '@/lib/auth';
import { createServerSupabaseClient, createRouteHandlerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server';

const TABLE_NAME = 'projects';

const normalizeStatus = (status?: string | null) => {
  if (!status || typeof status !== 'string') return 'draft';
  return (status ?? '').trim().toLowerCase();
};

export async function GET(_request: NextRequest) {
  let supabase = await createRouteHandlerSupabaseClient();
  let { data: { session } } = await supabase.auth.getSession();
  let dbClient: any = supabase;
  let debugInfo: any = { method: 'cookie' };

  // Fallback: Check Authorization header
  const authHeader = _request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || '';

  if (token === 'bypass-token') {
    debugInfo.method = 'bypass';
    const devEmail = process.env.PRESSPILOT_DEV_EMAIL ?? 'odjango4@gmail.com';
    session = {
      user: { id: 'presspilot-dev-user', email: devEmail },
      access_token: token
    } as any;
    dbClient = createServiceSupabaseClient();
  } else if (!session && token) {
    debugInfo.method = 'header';
    debugInfo.hasToken = true;
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
    const { data: { user: authUser }, error = null } = await cleanClient.auth.getUser(token);

    if (error) debugInfo.authError = (error as any).message;

    if (authUser && !error) {
      session = { user: authUser, access_token: token } as any;
      dbClient = cleanClient;
    }
  }

  const user = session?.user ?? null;

  if (!user?.email) {
    return NextResponse.json(
      {
        error: `Unauthorized: missing valid session or bypass token.`,
        debug: debugInfo
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(_request.url);
  const slug = searchParams.get('slug');

  console.log(`[API/Projects] GET - Method: ${debugInfo.method}, Email: ${user.email}, Slug: ${slug || 'N/A'}`);

  let query = dbClient
    .from(TABLE_NAME)
    .select('id,user_id,name,slug,status,created_at')
    .eq('user_id', user.id);

  if (slug) {
    query = query.eq('slug', slug).maybeSingle();
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API/Projects] query error:', error);
    return NextResponse.json(
      { error: `Unable to load projects: ${error.message}`, debug: debugInfo },
      { status: 500 },
    );
  }

  if (slug) {
    if (!data) {
      console.warn(`[API/Projects] Project not found for slug: ${slug}, user_id: ${user.id}`);
      // Debug: Check if any projects exist for this user
      const { count } = await dbClient.from(TABLE_NAME).select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      console.log(`[API/Projects] Total projects for user ${user.id}: ${count}`);

      return NextResponse.json({
        error: 'Project not found',
        debug: { ...debugInfo, user_id: user.id, slug, totalProjects: count }
      }, { status: 404 });
    }
    return NextResponse.json({ project: data });
  }

  console.log(`[API/Projects] Returning ${data?.length || 0} projects`);
  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(request: NextRequest) {
  let supabase = await createRouteHandlerSupabaseClient();
  let { data: { session } } = await supabase.auth.getSession();
  let dbClient: any = supabase;
  let debugInfo: any = { method: 'cookie' };

  // Check for bypass or header auth
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || '';

  if (token === 'bypass-token') {
    debugInfo.method = 'bypass';
    const devEmail = process.env.PRESSPILOT_DEV_EMAIL ?? 'odjango4@gmail.com';
    session = {
      user: { id: 'presspilot-dev-user', email: devEmail },
      access_token: token
    } as any;
    dbClient = createServiceSupabaseClient();
  } else if (!session && token) {
    debugInfo.method = 'header';
    debugInfo.hasToken = true;
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
    const { data: { user: authUser }, error = null } = await cleanClient.auth.getUser(token);

    if (error) debugInfo.authError = (error as any).message;

    if (authUser && !error) {
      session = { user: authUser, access_token: token } as any;
      dbClient = cleanClient;
    }
  }

  const user = session?.user ?? null;

  if (!user?.email) {
    return NextResponse.json(
      {
        error: `Unauthorized: missing valid session or bypass token.`,
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
      user_id: user.id,
      name,
      slug,
      status,
    })
    .select('id,user_id,name,slug,status,created_at')
    .single();

  if (error) {
    // Handle unique constraint violation (duplicate slug)
    if (error.code === '23505') {
      console.log(`[API/Projects] Slug conflict for ${slug}, fetching existing...`);
      const { data: existing, error: getError } = await dbClient
        .from(TABLE_NAME)
        .select('id,user_id,name,slug,status,created_at')
        .eq('slug', slug)
        .eq('user_id', user.id)
        .single();

      if (!getError && existing) {
        return NextResponse.json({ project: existing });
      }

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
  let supabase = await createRouteHandlerSupabaseClient();
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
    .eq('user_id', user.id)
    .select('id,user_id,name,slug,status,created_at')
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Unable to update project: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ project: data });
}


