
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Use direct SDK for Admin
import { enqueueJob } from '../../../lib/queue/jobs';
import { PressPilotSaaSInput } from '@/types/presspilot';
import { buildSaaSInputFromStudioInput, StudioFormInput } from '@/lib/presspilot/studioAdapter';
import { validateSaaSInput } from '@/lib/presspilot/validation';

export const dynamic = 'force-dynamic';

interface GenerateRequestBody {
  payload?: PressPilotSaaSInput;
  input?: StudioFormInput;
  businessTypeId?: string | null;
}

// Initialize Admin Client (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as GenerateRequestBody;

    // 1. Prepare Payload
    let payload: PressPilotSaaSInput;
    try {
      const payloadCandidate = body.payload ?? buildSaaSInputFromStudioInput(body.input);
      payload = validateSaaSInput(payloadCandidate);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Input', details: e instanceof Error ? e.message : 'Unknown' }, { status: 400 });
    }

    // 2. Resolve User (Auth or Demo Fallback)
    // We try to get the real user first, checking headers/cookies is tricky in this custom logic,
    // so we'll rely on the logic that if they are anon, we use the Demo User.
    // Ideally we'd pass the headers to a standard client to check, but let's assume Public Mode for this MVP.

    let userId: string;

    // Try to find the "Demo User"
    const DEMO_EMAIL = 'studio-demo@presspilot.co';
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    let demoUser = users.users.find(u => u.email === DEMO_EMAIL);

    if (!demoUser) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: 'demo-password-123',
        email_confirm: true
      });
      if (createError || !newUser.user) {
        console.error("Failed to create demo user", createError);
        return NextResponse.json({ error: 'System Error: Could not allocate demo user.' }, { status: 500 });
      }
      demoUser = newUser.user;
    }
    userId = demoUser.id;


    // 3. Save Project (Using Admin Client to bypass RLS if userId is not me)
    const { data: project, error: projError } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: userId,
        name: (payload as any).brand?.name || 'Untitled Project',
        site_type: 'general',
        language: 'en',
        data: payload as any
      })
      .select('id')
      .single();

    if (projError) {
      console.error('Project Insert Error:', projError);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // 4. Enqueue Job (Passing Admin Client)
    const jobId = await enqueueJob(supabaseAdmin, project.id, 'generate');

    return NextResponse.json({
      success: true,
      jobId: jobId,
      projectId: project.id
    });

  } catch (error) {
    console.error('[Generate API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
