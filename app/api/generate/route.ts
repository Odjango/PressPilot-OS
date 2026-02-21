
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Use direct SDK for Admin
import { enqueueJob } from '../../../lib/queue/jobs';
import { PressPilotSaaSInput } from '@/types/presspilot';
import { buildSaaSInputFromStudioInput, StudioFormInput } from '@/lib/presspilot/studioAdapter';
import { validateSaaSInput } from '@/lib/presspilot/validation';
import { transformSaaSInputToGeneratorData } from '@/lib/presspilot/dataTransformer';
import { proxyJsonToBackend } from '@/lib/presspilot/backendApi';

export const dynamic = 'force-dynamic';

interface GenerateRequestBody {
  payload?: PressPilotSaaSInput;
  input?: StudioFormInput;
  businessTypeId?: string | null;
  // Payment bypass fields
  bypass?: boolean;
  previewId?: string;
  selectedStyle?: string;
}

// Initialize Admin Client (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const normalizeHeroLayout = (layout: string | undefined): 'fullBleed' | 'fullWidth' | 'split' | 'minimal' => {
  if (!layout) return 'fullBleed';

  const normalized = layout.toLowerCase().replace(/[-_\s]/g, '');

  if (normalized.includes('fullbleed') || normalized === 'bleed') return 'fullBleed';
  if (normalized.includes('fullwidth') || normalized === 'wide' || normalized === 'centered') return 'fullWidth';
  if (normalized.includes('split')) return 'split';
  if (normalized.includes('minimal') || normalized === 'text') return 'minimal';

  return 'fullBleed';
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as GenerateRequestBody;

    // Handle Payment Bypass Mode
    if (body.bypass && body.previewId && body.selectedStyle) {
      console.log('[API] Payment bypass mode - fetching preview data:', body.previewId);

      // Fetch the preview data from hero_previews table
      const { data: preview, error: previewError } = await supabaseAdmin
        .from('hero_previews')
        .select('*')
        .eq('id', body.previewId)
        .single();

      if (previewError || !preview) {
        console.error('[API] Preview not found:', previewError);
        return NextResponse.json({ error: 'Preview not found' }, { status: 404 });
      }

      // Update the preview with selected style
      await supabaseAdmin
        .from('hero_previews')
        .update({
          selected_style: body.selectedStyle,
          payment_status: 'bypassed' // Mark as bypassed for dev mode
        })
        .eq('id', body.previewId);

      const heroLayout = normalizeHeroLayout(body.selectedStyle);

      // Build input from preview data
      const studioInput: StudioFormInput = {
        businessName: preview.business_name,
        businessDescription: preview.business_description || '',
        businessCategory: preview.industry,
        heroLayout,
        logoBase64: preview.logo_url || undefined,
        palette: {
          primary: preview.color_primary || '#000000',
          secondary: preview.color_secondary || '#ffffff',
          accent: preview.color_accent || '#666666'
        }
      };

      body.input = studioInput;
    }

    // M1 feature flag: route generation to Laravel when BACKEND_URL is set.
    const proxied = await proxyJsonToBackend(request, '/generate', 'POST', body);
    if (proxied) {
      return proxied;
    }

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
    let demoUser = users?.users.find((u: any) => u.email === DEMO_EMAIL);

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


    // 3. Transform Data for Generator
    // Convert SaaS input format to generator format before saving
    const generatorData = transformSaaSInputToGeneratorData(payload);
    const projectName = generatorData.name || 'Untitled Project';

    console.log('[API] Transformed data for:', projectName);

    // 4. Save Project (Using Admin Client to bypass RLS if userId is not me)
    const { data: project, error: projError } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: userId,
        name: projectName,
        site_type: 'general',
        language: 'en',
        data: generatorData as any // Store transformed data instead of raw SaaS input
      })
      .select('id')
      .single();

    if (projError) {
      console.error('Project Insert Error:', projError);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // 5. Enqueue Job (Passing Admin Client)
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
