import type { LayoutRecipe } from '../types';

export const TALENT_AGENCY_RECIPE: LayoutRecipe = {
    id: 'portfolio-talent-agency',
    name: 'Talent Agency',
    vertical: 'portfolio',
    conditions: {
        businessTypes: ['talent-agency', 'actor', 'model', 'musician'],
        priority: 75
    },
    sections: [
        { type: 'portfolio-hero', id: 'hero', backgroundColor: 'base' },
        { type: 'portfolio-gallery', id: 'gallery', backgroundColor: 'base-2' },
        { type: 'portfolio-about', id: 'about', backgroundColor: 'base' },
        { type: 'portfolio-experience', id: 'experience', backgroundColor: 'base-2' },
        { type: 'portfolio-testimonials', id: 'testimonials', backgroundColor: 'base' },
        { type: 'portfolio-contact', id: 'contact', backgroundColor: 'base-2' }
    ]
};
