import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { LEMON_SQUEEZY_CONFIG } from '@/lib/lemonsqueezy/config';
import { supabaseAdmin } from '@/lib/supabase/operations';
import { generateTheme } from '@/generator/index';
import { StorageOperations } from '@/lib/supabase/operations';

/**
 * POST /api/lemon-squeezy/webhook
 * Handles payment confirmations from Lemon Squeezy
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-signature');

        // Verify webhook signature
        if (!verifyWebhookSignature(body, signature)) {
            console.error('[Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(body);
        const eventName = payload.meta.event_name;

        console.log(`[Webhook] Received event: ${eventName}`);

        // Handle order created event
        if (eventName === 'order_created') {
            await handleOrderCreated(payload);
        }

        // Handle order refunded event
        if (eventName === 'order_refunded') {
            await handleOrderRefunded(payload);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('[Webhook Error]', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(body: string, signature: string | null): boolean {
    if (!signature) return false;

    const secret = LEMON_SQUEEZY_CONFIG.webhookSecret;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(body).digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(digest)
    );
}

/**
 * Handle order created event
 */
async function handleOrderCreated(payload: any) {
    const orderId = payload.data.id;
    const customData = payload.meta.custom_data;
    const customerEmail = payload.data.attributes.user_email;

    // Extract preview ID and selected style from custom data
    const { previewId, selectedStyle } = customData;

    if (!previewId || !selectedStyle) {
        throw new Error('Missing previewId or selectedStyle in webhook payload');
    }

    console.log(`[Webhook] Generating theme for order ${orderId}`);

    // Get preview data from database
    const { data: preview, error: previewError } = await supabaseAdmin
        .from('hero_previews')
        .select('*')
        .eq('id', previewId)
        .single();

    if (previewError || !preview) {
        throw new Error(`Preview not found: ${previewId}`);
    }

    // Update preview with payment info
    await supabaseAdmin
        .from('hero_previews')
        .update({
            payment_status: 'paid',
            order_id: orderId,
            selected_style: selectedStyle
        })
        .eq('id', previewId);

    // Generate full theme with selected hero style
    const themeName = `${preview.business_name} Theme`;
    const themeSlug = `presspilot-${preview.business_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

    const result = await generateTheme({
        base: 'ollie', // TODO: Let user choose base theme
        mode: 'standard',
        slug: themeSlug,
        data: {
            name: preview.business_name,
            description: preview.business_description,
            industry: preview.industry,
            hero_headline: preview.business_name,
            hero_subheadline: preview.business_description,
            // TODO: Pass selected hero style to force specific hero pattern
        }
    });

    if (result.status !== 'success') {
        throw new Error('Theme generation failed');
    }

    // Upload theme to storage
    const fileName = `${themeSlug}.zip`;
    const downloadUrl = await StorageOperations.uploadTheme(
        result.downloadPath,
        `final-themes/${fileName}`
    );

    // Update preview with final theme URL
    await supabaseAdmin
        .from('hero_previews')
        .update({
            final_theme_url: downloadUrl
        })
        .eq('id', previewId);

    console.log(`[Webhook] Theme generated successfully: ${downloadUrl}`);

    // TODO: Send email with download link
    // await sendDownloadEmail(customerEmail, downloadUrl, themeName);
}

/**
 * Handle order refunded event
 */
async function handleOrderRefunded(payload: any) {
    const orderId = payload.data.id;

    console.log(`[Webhook] Order refunded: ${orderId}`);

    // Update preview status
    await supabaseAdmin
        .from('hero_previews')
        .update({ payment_status: 'refunded' })
        .eq('order_id', orderId);
}
