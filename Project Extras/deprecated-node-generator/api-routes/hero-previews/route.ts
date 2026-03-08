/**
 * Hero Previews API
 *
 * POST /api/studio/hero-previews
 *
 * Generates pixel-accurate WordPress-rendered screenshots of all 4 hero layouts.
 * Used by the Studio Step 4 "Real Hero Preview" feature.
 *
 * Flow:
 * 1. Generate theme with all settings (heroLayout undefined)
 * 2. Inject PHP hero preview support
 * 3. Install theme in WordPress
 * 4. Capture 4 screenshots via Playwright
 * 5. Return screenshot URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
// DEPRECATED: Old Node.js generator removed. Hero preview needs migration to SSWG pipeline.
// import { generateTheme } from '@/src/generator';
import { buildSaaSInputFromStudioInput, StudioFormInput } from '@/lib/presspilot/studioAdapter';
import { transformSaaSInputToGeneratorData } from '@/lib/presspilot/dataTransformer';
import { HeroPreviewRunner, generatePreviewSessionId, PreviewResult } from '@/src/preview/HeroPreviewRunner';
import { cleanupOldPreviews, createSessionDir } from '@/src/preview/previewCleanup';
import { HeroLayout } from '@/types/generator-legacy';

// 60 second timeout for preview generation
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface HeroPreviewRequest {
    input: StudioFormInput;
}

interface HeroPreviewResponse {
    sessionId: string;
    previews: {
        layout: HeroLayout;
        screenshotUrl: string;
        label: string;
        description: string;
    }[];
}

interface ErrorResponse {
    error: string;
    details?: string;
}

export async function POST(
    request: NextRequest
): Promise<NextResponse<HeroPreviewResponse | ErrorResponse>> {
    console.log('[hero-previews] Starting preview generation...');

    try {
        // 1. Parse request body
        const body: HeroPreviewRequest = await request.json();

        if (!body.input) {
            return NextResponse.json(
                { error: 'Missing input field in request body' },
                { status: 400 }
            );
        }

        // 2. Clean up old preview sessions (runs in background)
        cleanupOldPreviews(30).catch(err =>
            console.error('[hero-previews] Cleanup error:', err)
        );

        // 3. Generate unique session ID
        const sessionId = generatePreviewSessionId();
        console.log(`[hero-previews] Session ID: ${sessionId}`);

        // 4. Create session directory for screenshots
        const outputDir = await createSessionDir(sessionId);
        console.log(`[hero-previews] Output directory: ${outputDir}`);

        // 5. Transform input to generator format
        // Set heroLayout to undefined so the theme includes the PHP preview hook
        const inputWithoutHeroLayout = { ...body.input, heroLayout: undefined };

        let saasInput;
        try {
            saasInput = buildSaaSInputFromStudioInput(inputWithoutHeroLayout);
        } catch (err) {
            return NextResponse.json(
                {
                    error: 'Invalid input',
                    details: err instanceof Error ? err.message : 'Unknown validation error'
                },
                { status: 400 }
            );
        }

        const generatorData = transformSaaSInputToGeneratorData(saasInput);

        // 6. Generate the theme
        console.log('[hero-previews] Generating theme...');
        const startTime = Date.now();

        const themeResult = await generateTheme({
            data: generatorData,
            slug: `preview-${sessionId}`
        });

        const generateTime = Date.now() - startTime;
        console.log(`[hero-previews] Theme generated in ${generateTime}ms`);
        console.log(`[hero-previews] Theme path: ${themeResult.downloadPath}`);
        console.log(`[hero-previews] Theme dir: ${themeResult.themeDir}`);

        // 7. Extract page content for PHP injection
        const pageContent = {
            hero_title: generatorData.hero_headline || 'Welcome',
            hero_sub: generatorData.hero_subheadline || 'We enable businesses to grow.',
            hero_image: '' // Will be populated from the generated content
        };

        // 8. Run Playwright preview capture
        console.log('[hero-previews] Starting Playwright capture...');
        const captureStartTime = Date.now();

        // Extract theme slug from the path
        const themeSlug = path.basename(themeResult.themeDir);

        const runner = new HeroPreviewRunner({
            themeDir: themeResult.themeDir,
            themeSlug: themeSlug,
            zipPath: themeResult.downloadPath,
            outputDir: outputDir,
            sessionId: sessionId,
            pageContent: pageContent
        });

        const results: PreviewResult[] = await runner.runAll();

        const captureTime = Date.now() - captureStartTime;
        console.log(`[hero-previews] Captured ${results.length} screenshots in ${captureTime}ms`);

        // 9. Format response
        const response: HeroPreviewResponse = {
            sessionId,
            previews: results.map(r => ({
                layout: r.layout,
                screenshotUrl: r.screenshotUrl,
                label: r.label,
                description: r.description
            }))
        };

        const totalTime = Date.now() - startTime;
        console.log(`[hero-previews] Total time: ${totalTime}ms`);

        return NextResponse.json(response);

    } catch (error) {
        console.error('[hero-previews] Error:', error);

        // Check for specific error types
        if (error instanceof Error) {
            if (error.message.includes('WordPress not available')) {
                return NextResponse.json(
                    {
                        error: 'WordPress not available',
                        details: 'Local WordPress instance at localhost:8089 is not running. Start it to enable hero previews.'
                    },
                    { status: 503 }
                );
            }

            if (error.message.includes('Failed to activate theme')) {
                return NextResponse.json(
                    {
                        error: 'Theme activation failed',
                        details: error.message
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                {
                    error: 'Preview generation failed',
                    details: error.message
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Unknown error during preview generation' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/studio/hero-previews?sessionId=<id>
 *
 * Check if previews exist for a session (optional utility endpoint)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json(
            { error: 'Missing sessionId parameter' },
            { status: 400 }
        );
    }

    // Check if session directory exists
    const previewsDir = path.join(process.cwd(), 'public', 'tmp', 'previews', sessionId);
    const fs = await import('fs-extra');

    if (!await fs.pathExists(previewsDir)) {
        return NextResponse.json(
            { exists: false, sessionId },
            { status: 404 }
        );
    }

    // List available screenshots
    const files = await fs.readdir(previewsDir);
    const screenshots = files.filter(f => f.endsWith('.png'));

    return NextResponse.json({
        exists: true,
        sessionId,
        screenshots: screenshots.map(f => ({
            layout: f.replace('.png', ''),
            url: `/api/previews/${sessionId}/${f}`
        }))
    });
}
