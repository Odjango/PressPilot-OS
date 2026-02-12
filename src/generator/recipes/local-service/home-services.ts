import type { LayoutRecipe } from '../types';

export const HOME_SERVICES_RECIPE: LayoutRecipe = {
    id: 'local-service-home-services',
    name: 'Home Services',
    vertical: 'local-service',
    conditions: {
        businessTypes: ['home-services', 'plumber', 'electrician', 'cleaner', 'handyman'],
        priority: 70
    },
    sections: [
        { type: 'local-hero', id: 'hero', backgroundColor: 'base' },
        { type: 'local-services-grid', id: 'services-grid', backgroundColor: 'base-2' },
        { type: 'local-about', id: 'about', backgroundColor: 'base' },
        { type: 'local-trust-badges', id: 'trust-badges', backgroundColor: 'base-2' },
        { type: 'local-testimonials', id: 'testimonials', backgroundColor: 'base' },
        { type: 'local-location', id: 'location', backgroundColor: 'base-2' },
        { type: 'local-hours', id: 'hours', backgroundColor: 'base' },
        { type: 'local-booking-cta', id: 'booking-cta', backgroundColor: 'accent' }
    ]
};
