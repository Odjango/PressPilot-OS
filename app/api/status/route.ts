
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Initialize Admin Client (Bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

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
        let signedUrl = null;

        if (job.status === 'completed') {
            const { data: theme } = await supabaseAdmin
                .from('generated_themes')
                .select('*')
                .eq('job_id', jobId)
                .single();

            if (theme) {
                themeData = theme;

                // Generate Signed URL server-side (Admin can do this)
                if (theme.status === 'active') {
                    const { data: signed } = await supabaseAdmin.storage
                        .from('generated-themes')
                        .createSignedUrl(theme.file_path, 3600); // 1 hr

                    if (signed) {
                        signedUrl = signed.signedUrl;
                    }
                }
            }
        }

        return NextResponse.json({
            ...job,
            generated_theme: themeData, // Append theme record
            download_url: signedUrl     // Append ready-to-use URL
        });

    } catch (e) {
        console.error("Internal API Error:", e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
