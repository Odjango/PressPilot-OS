
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
            // Log non-2xx responses for debugging
            if (proxied.status >= 400) {
                const cloned = proxied.clone();
                const errorBody = await cloned.text().catch(() => '(unreadable)');
                console.error(`[Regenerate] Backend returned ${proxied.status}:`, errorBody);
            }
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('[Regenerate] Error:', errorMessage, errorStack);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: errorMessage,
            debug_hint: 'Check browser DevTools Network tab → click the failed request → Response tab for full error'
        }, { status: 500 });
    }
}
