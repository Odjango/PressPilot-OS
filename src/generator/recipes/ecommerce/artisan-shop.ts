import type { LayoutRecipe } from '../types';

export const ARTISAN_SHOP_RECIPE: LayoutRecipe = {
    id: 'ecommerce-artisan-shop',
    name: 'Artisan Shop',
    vertical: 'ecommerce',
    conditions: {
        brandModes: ['playful', 'minimal'],
        priority: 72
    },
    sections: [
        { type: 'ecommerce-hero', id: 'hero', backgroundColor: 'base' },
        { type: 'ecommerce-about-brand', id: 'about-brand', backgroundColor: 'base-2' },
        { type: 'ecommerce-product-grid', id: 'product-grid', backgroundColor: 'base' },
        { type: 'ecommerce-testimonials', id: 'testimonials', backgroundColor: 'base-2' },
        { type: 'ecommerce-trust-badges', id: 'trust-badges', backgroundColor: 'base' },
        { type: 'ecommerce-newsletter', id: 'newsletter', backgroundColor: 'accent' }
    ]
};
