import type { LayoutRecipe } from '../types';

export const PROFESSIONAL_SERVICES_RECIPE: LayoutRecipe = {
    id: 'local-service-professional-services',
    name: 'Professional Services',
    vertical: 'local-service',
    conditions: {
        businessTypes: ['professional-services', 'lawyer', 'accountant', 'consultant'],
        priority: 65
    },
    sections: [
        { type: 'local-hero', id: 'hero', backgroundColor: 'base' },
        { type: 'local-about', id: 'about', backgroundColor: 'base-2' },
        { type: 'local-services-grid', id: 'services-grid', backgroundColor: 'base' },
        { type: 'local-team', id: 'team', backgroundColor: 'base-2' },
        { type: 'local-testimonials', id: 'testimonials', backgroundColor: 'base' },
        { type: 'local-faq', id: 'faq', backgroundColor: 'base-2' },
        { type: 'local-location', id: 'location', backgroundColor: 'base' },
        { type: 'local-booking-cta', id: 'booking-cta', backgroundColor: 'accent' }
    ]
};
