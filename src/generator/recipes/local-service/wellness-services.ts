import type { LayoutRecipe } from '../types';

export const WELLNESS_SERVICES_RECIPE: LayoutRecipe = {
    id: 'local-service-wellness-services',
    name: 'Wellness Services',
    vertical: 'local-service',
    conditions: {
        businessTypes: ['wellness-services', 'salon', 'spa', 'gym', 'dentist'],
        priority: 68
    },
    sections: [
        { type: 'local-hero', id: 'hero', backgroundColor: 'base' },
        { type: 'local-services-grid', id: 'services-grid', backgroundColor: 'base-2' },
        { type: 'local-team', id: 'team', backgroundColor: 'base' },
        { type: 'local-testimonials', id: 'testimonials', backgroundColor: 'base-2' },
        { type: 'local-trust-badges', id: 'trust-badges', backgroundColor: 'base' },
        { type: 'local-location', id: 'location', backgroundColor: 'base-2' },
        { type: 'local-hours', id: 'hours', backgroundColor: 'base' },
        { type: 'local-booking-cta', id: 'booking-cta', backgroundColor: 'accent' }
    ]
};
