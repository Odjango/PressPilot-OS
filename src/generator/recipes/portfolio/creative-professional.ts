import type { LayoutRecipe } from '../types';

export const CREATIVE_PROFESSIONAL_RECIPE: LayoutRecipe = {
    id: 'portfolio-creative-professional',
    name: 'Creative Professional',
    vertical: 'portfolio',
    conditions: {
        businessTypes: ['creative-professional', 'designer', 'photographer', 'artist'],
        priority: 70
    },
    sections: [
        { type: 'portfolio-hero', id: 'hero', backgroundColor: 'base' },
        { type: 'portfolio-about', id: 'about', backgroundColor: 'base-2' },
        { type: 'portfolio-gallery', id: 'gallery', backgroundColor: 'base' },
        { type: 'portfolio-skills', id: 'skills', backgroundColor: 'base-2' },
        { type: 'portfolio-testimonials', id: 'testimonials', backgroundColor: 'base' },
        { type: 'portfolio-contact', id: 'contact', backgroundColor: 'base-2' }
    ]
};
