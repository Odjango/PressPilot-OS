
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { proxyJsonToBackend } from '@/lib/presspilot/backendApi';

export const dynamic = 'force-dynamic';

// Initialize Admin Client (Bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    // M1 feature flag: route status polling to Laravel when BACKEND_URL is set.
    const proxied = await proxyJsonToBackend(request, `/status?${searchParams.toString()}`, 'GET');
    if (proxied) {
        return proxied;
    }

    if (!jobId) {
        return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    try {
        // 1. Fetch Job
        const { data: job, error: jobError } = await supabaseAdmin
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            console.error("Status Fetch Error:", jobError);
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // 2. Fetch Theme (if completed)
        let themeData = null;
        let themeUrl = null;
        let staticUrl = null;

        if (job.status === 'completed') {
            const { data: theme } = await supabaseAdmin
                .from('generated_themes')
                .select('*')
                .eq('job_id', jobId)
                .single();

            if (theme) {
                themeData = theme;

                if (theme.status === 'active') {
                    const { data: signed } = await supabaseAdmin.storage
                        .from('generated-themes')
                        .createSignedUrl(theme.file_path, 3600); // 1 hr

                    if (signed) {
                        themeUrl = signed.signedUrl;
                    }

                    // Sign Static URL if it exists in job result
                    if (job.result && job.result.static_path) {
                        const { data: staticSigned } = await supabaseAdmin.storage
                            .from('generated-themes')
                            .createSignedUrl(job.result.static_path, 3600);
                        if (staticSigned) {
                            staticUrl = staticSigned.signedUrl;
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            ...job,
            generated_theme: themeData,
            themeUrl: themeUrl,
            staticUrl: staticUrl
        });

    } catch (e) {
        console.error("Internal API Error:", e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
