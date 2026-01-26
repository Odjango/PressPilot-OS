import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/operations';

/**
 * GET /api/get-download?previewId=xxx
 * Fetches download URL for a completed theme
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const previewId = searchParams.get('previewId');

        if (!previewId) {
            return NextResponse.json(
                { error: 'Missing previewId' },
                { status: 400 }
            );
        }

        // Fetch preview data
        const { data: preview, error } = await supabaseAdmin
            .from('hero_previews')
            .select('*')
            .eq('id', previewId)
            .single();

        if (error || !preview) {
            return NextResponse.json(
                { error: 'Preview not found' },
                { status: 404 }
            );
        }

        // Check if theme is ready
        if (!preview.final_theme_url) {
            return NextResponse.json(
                { error: 'Theme not ready yet' },
                { status: 202 } // Accepted but not ready
            );
        }

        // Check payment status
        if (preview.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Payment required' },
                { status: 402 }
            );
        }

        return NextResponse.json({
            downloadUrl: preview.final_theme_url,
            themeName: preview.business_name,
            selectedStyle: preview.selected_style
        });

    } catch (error: any) {
        console.error('[Get Download Error]', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
