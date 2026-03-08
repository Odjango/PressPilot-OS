import type { LayoutRecipe } from '../types';

export const BOUTIQUE_STORE_RECIPE: LayoutRecipe = {
    id: 'ecommerce-boutique-store',
    name: 'Boutique Store',
    vertical: 'ecommerce',
    conditions: {
        brandModes: ['modern', 'bold'],
        priority: 75
    },
    sections: [
        { type: 'ecommerce-hero', id: 'hero', backgroundColor: 'base' },
        { type: 'ecommerce-categories', id: 'categories', backgroundColor: 'base-2' },
        { type: 'ecommerce-featured-products', id: 'featured-products', backgroundColor: 'base' },
        { type: 'ecommerce-about-brand', id: 'about-brand', backgroundColor: 'base-2' },
        { type: 'ecommerce-testimonials', id: 'testimonials', backgroundColor: 'base' },
        { type: 'ecommerce-instagram', id: 'instagram', backgroundColor: 'base-2' },
        { type: 'ecommerce-newsletter', id: 'newsletter', backgroundColor: 'accent' }
    ]
};
