import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize Lemon Squeezy with API key
lemonSqueezySetup({
    apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
    onError: (error) => {
        console.error('[Lemon Squeezy Error]', error);
    }
});

export const LEMON_SQUEEZY_CONFIG = {
    storeId: process.env.LEMON_SQUEEZY_STORE_ID!,
    webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!,
    products: {
        single: process.env.LEMON_SQUEEZY_SINGLE_PRODUCT_ID!,
        bundle: process.env.LEMON_SQUEEZY_BUNDLE_PRODUCT_ID!
    },
    prices: {
        single: 2999, // $29.99 in cents
        bundle: 14999  // $149.99 in cents
    }
};
