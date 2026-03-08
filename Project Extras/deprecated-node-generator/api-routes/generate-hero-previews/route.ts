import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/operations';
import {
    generateSplitHero,
    generateCenteredHero,
    generateMinimalHero,
    HeroData
} from '@/src/generator/templates/hero-templates';
import { getScreenshotService } from '@/src/lib/screenshot/ScreenshotService';

/**
 * POST /api/generate-hero-previews
 * Generates 3 hero section previews (split, centered, minimal)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const { businessName, description, industry, logoUrl, primaryColor, secondaryColor } = body;

        if (!businessName || !description || !industry) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Prepare hero data
        const heroData: HeroData = {
            businessName,
            tagline: getIndustryTagline(industry),
            description: description.substring(0, 150), // Limit length for preview
            ctaText: getIndustryCTA(industry),
            logoUrl,
            primaryColor: primaryColor || '#1a1a1a',
            secondaryColor: secondaryColor || '#666666'
        };

        // Generate HTML for each hero style
        const splitHtml = generateSplitHero(heroData);
        const centeredHtml = generateCenteredHero(heroData);
        const minimalHtml = generateMinimalHero(heroData);

        // Create preview record in database
        const { data: preview, error: dbError } = await supabaseAdmin
            .from('hero_previews')
            .insert({
                business_name: businessName,
                business_description: description,
                industry,
                logo_url: logoUrl,
                color_primary: heroData.primaryColor,
                color_secondary: heroData.secondaryColor,
                preview_urls: {}, // Will update after screenshots
                payment_status: 'pending'
            })
            .select()
            .single();

        if (dbError || !preview) {
            throw new Error(`Database error: ${dbError?.message}`);
        }

        // Capture screenshots
        const screenshotService = getScreenshotService();

        const [splitUrl, centeredUrl, minimalUrl] = await Promise.all([
            screenshotService.captureAndUpload(splitHtml, 'split', preview.id),
            screenshotService.captureAndUpload(centeredHtml, 'centered', preview.id),
            screenshotService.captureAndUpload(minimalHtml, 'minimal', preview.id)
        ]);

        // Update preview record with URLs
        const { error: updateError } = await supabaseAdmin
            .from('hero_previews')
            .update({
                preview_urls: {
                    split: splitUrl,
                    centered: centeredUrl,
                    minimal: minimalUrl
                }
            })
            .eq('id', preview.id);

        if (updateError) {
            throw new Error(`Failed to update preview URLs: ${updateError.message}`);
        }

        // Return preview data
        return NextResponse.json({
            previewId: preview.id,
            previews: [
                {
                    style: 'split',
                    name: 'Split Hero',
                    description: 'Image on left, content on right - Modern and professional',
                    imageUrl: splitUrl
                },
                {
                    style: 'centered',
                    name: 'Centered Hero',
                    description: 'Full-width background with centered text - Classic and elegant',
                    imageUrl: centeredUrl
                },
                {
                    style: 'minimal',
                    name: 'Minimal Hero',
                    description: 'Clean text-focused design - Bold and minimalist',
                    imageUrl: minimalUrl
                }
            ]
        });

    } catch (error: any) {
        console.error('[Hero Preview Error]', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate previews' },
            { status: 500 }
        );
    }
}

/**
 * Helper: Get industry-specific tagline
 */
function getIndustryTagline(industry: string): string {
    const taglines: Record<string, string> = {
        'saas': 'Software as a Service',
        'restaurant': 'Dining Experience',
        'ecommerce': 'Online Store',
        'portfolio': 'Creative Portfolio',
        'agency': 'Digital Agency',
        'fitness': 'Fitness & Wellness'
    };
    return taglines[industry.toLowerCase()] || 'Welcome';
}

/**
 * Helper: Get industry-specific CTA text
 */
function getIndustryCTA(industry: string): string {
    const ctas: Record<string, string> = {
        'saas': 'Get Started Free',
        'restaurant': 'View Menu',
        'ecommerce': 'Shop Now',
        'portfolio': 'View Work',
        'agency': 'Start Project',
        'fitness': 'Join Now'
    };
    return ctas[industry.toLowerCase()] || 'Learn More';
}
