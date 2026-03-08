import type { LayoutRecipe } from '../types';

export const ENTERPRISE_PRODUCT_RECIPE: LayoutRecipe = {
    id: 'saas-enterprise-product',
    name: 'Enterprise Product',
    vertical: 'saas',
    conditions: {
        brandModes: ['modern', 'bold', 'minimal', 'playful'],
        businessTypes: ['enterprise', 'b2b', 'platform'],
        priority: 70
    },
    sections: [
        { type: 'saas-hero', id: 'hero-main', backgroundColor: 'base' },
        { type: 'saas-logos', id: 'logos', backgroundColor: 'base-2' },
        { type: 'saas-features-grid', id: 'features-grid', backgroundColor: 'base' },
        { type: 'saas-testimonials', id: 'testimonials', backgroundColor: 'base-2' },
        { type: 'saas-pricing-table', id: 'pricing-table', backgroundColor: 'base' },
        { type: 'saas-cta-banner', id: 'cta-banner', backgroundColor: 'accent' }
    ]
};
