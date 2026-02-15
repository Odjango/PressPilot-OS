
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enqueueJob } from '../../../lib/queue/jobs';
import { proxyJsonToBackend } from '@/lib/presspilot/backendApi';

export const dynamic = 'force-dynamic';

// Initialize Admin Client (Bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { projectId } = body;

        // M1 feature flag: route regeneration to Laravel when BACKEND_URL is set.
        const proxied = await proxyJsonToBackend(request, '/regenerate', 'POST', body);
        if (proxied) {
            return proxied;
        }

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        // 1. Verify Project Exists (Service Role)
        // We relax the "Owner" check for the MVP Demo user, assuming anyone with the Project ID can regenerate it.
        // Ideally we would check if the project belongs to the Demo User or the logged in user.
        // For now: Just check existence.
        const { data: project, error: projError } = await supabaseAdmin
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .single();

        if (projError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // 2. Enqueue
        const jobId = await enqueueJob(supabaseAdmin, project.id, 'regenerate');

        return NextResponse.json({ success: true, jobId });

    } catch (error) {
        console.error('[Regenerate] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
