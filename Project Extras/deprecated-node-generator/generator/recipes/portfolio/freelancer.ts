import type { LayoutRecipe } from '../types';

export const FREELANCER_RECIPE: LayoutRecipe = {
    id: 'portfolio-freelancer',
    name: 'Freelancer',
    vertical: 'portfolio',
    conditions: {
        businessTypes: ['freelancer', 'developer', 'consultant', 'writer'],
        priority: 65
    },
    sections: [
        { type: 'portfolio-hero', id: 'hero', backgroundColor: 'base' },
        { type: 'portfolio-about', id: 'about', backgroundColor: 'base-2' },
        { type: 'portfolio-skills', id: 'skills', backgroundColor: 'base' },
        { type: 'portfolio-experience', id: 'experience', backgroundColor: 'base-2' },
        { type: 'portfolio-testimonials', id: 'testimonials', backgroundColor: 'base' },
        { type: 'portfolio-cta', id: 'cta', backgroundColor: 'accent' },
        { type: 'portfolio-contact', id: 'contact', backgroundColor: 'base-2' }
    ]
};
