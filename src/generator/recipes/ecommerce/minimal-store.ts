/**
 * Minimal Store Recipe - Generator 2.0 Phase 4
 *
 * Clean, simplified ecommerce layout for boutique and curated stores.
 * Fewer sections, more whitespace, elegant presentation.
 *
 * Section Order:
 * 1. Ecommerce Hero - Clean hero with single CTA
 * 2. Featured Products - 3-4 hero products
 * 3. Testimonials - Customer reviews
 * 4. Newsletter - Simple signup
 * 5. Footer (handled by template-part injection)
 *
 * Visual Modes Supported:
 * - Minimal: Maximum whitespace, sharp edges (luxury)
 * - Playful: Soft cards, pill buttons (boutique, handmade)
 */

import type { LayoutRecipe } from '../types';

export const MINIMAL_STORE_RECIPE: LayoutRecipe = {
    id: 'ecommerce-minimal-store',
    name: 'Minimal Store',
    vertical: 'ecommerce',
    conditions: {
        // Preferred recipe for minimal and playful modes
        brandModes: ['minimal', 'playful'],
        // businessTypes is optional - matches any ecommerce business
        priority: 60  // Higher priority for these brand modes
    },
    sections: [
        {
            type: 'ecommerce-hero',
            id: 'hero-main',
            backgroundColor: 'base'
        },
        {
            type: 'featured-products',
            id: 'featured',
            backgroundColor: 'base-2'
        },
        {
            type: 'testimonials',
            id: 'reviews',
            backgroundColor: 'base'
        },
        {
            type: 'newsletter',
            id: 'newsletter',
            backgroundColor: 'accent-2'
        },
        {
            type: 'footer',
            id: 'footer',
            backgroundColor: 'contrast'
        }
    ]
};
