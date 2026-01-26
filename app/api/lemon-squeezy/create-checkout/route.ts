import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { LEMON_SQUEEZY_CONFIG } from '@/lib/lemonsqueezy/config';

/**
 * POST /api/lemon-squeezy/create-checkout
 * Creates a Lemon Squeezy checkout session
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { previewId, selectedStyle, productType = 'single' } = body;

        if (!previewId || !selectedStyle) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Determine product variant ID based on type
        const productId = productType === 'bundle'
            ? LEMON_SQUEEZY_CONFIG.products.bundle
            : LEMON_SQUEEZY_CONFIG.products.single;

        // Create checkout session
        const checkout = await createCheckout(
            LEMON_SQUEEZY_CONFIG.storeId,
            productId,
            {
                checkoutData: {
                    custom: {
                        previewId,
                        selectedStyle
                    }
                },
                productOptions: {
                    name: productType === 'bundle'
                        ? 'PressPilot Agency Bundle (6 Themes)'
                        : 'PressPilot WordPress Theme',
                    description: `Hero Style: ${selectedStyle}`,
                },
                checkoutOptions: {
                    buttonColor: '#000000'
                }
            }
        );

        if (checkout.error) {
            throw new Error(checkout.error.message);
        }

        return NextResponse.json({
            checkoutUrl: checkout.data?.data.attributes.url
        });

    } catch (error: any) {
        console.error('[Create Checkout Error]', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout' },
            { status: 500 }
        );
    }
}
