import type { LayoutRecipe } from '../types';

export const STARTUP_LANDING_RECIPE: LayoutRecipe = {
    id: 'saas-startup-landing',
    name: 'Startup Landing',
    vertical: 'saas',
    conditions: {
        priority: 60
    },
    sections: [
        { type: 'saas-hero', id: 'hero-main', backgroundColor: 'base' },
        { type: 'saas-logos', id: 'logos', backgroundColor: 'base-2' },
        { type: 'saas-features-grid', id: 'features-grid', backgroundColor: 'base' },
        { type: 'saas-how-it-works', id: 'how-it-works', backgroundColor: 'base-2' },
        { type: 'saas-testimonials', id: 'testimonials', backgroundColor: 'base' },
        { type: 'saas-pricing-table', id: 'pricing-table', backgroundColor: 'base-2' },
        { type: 'saas-faq', id: 'faq', backgroundColor: 'base' },
        { type: 'saas-cta-banner', id: 'cta-banner', backgroundColor: 'accent' }
    ]
};
