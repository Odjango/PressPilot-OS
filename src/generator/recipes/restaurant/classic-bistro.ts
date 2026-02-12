/**
 * Classic Bistro Recipe - Generator 2.0 Phase 2
 *
 * The original 6-section restaurant homepage recipe.
 * This is the default recipe that preserves exact current behavior.
 *
 * Section Order (Restaurant Recipe v1):
 * 1. Hero - Dynamic layout based on heroLayout selection
 * 2. Story - Image + text about the restaurant (base bg)
 * 3. Menu Preview - 6 food images in 3x2 grid (base-2 bg)
 * 4. Promo Band - Dark promotional section for specials (contrast bg)
 * 5. Testimonials - Customer quotes/social proof (accent-2 bg)
 * 6. Final CTA - Reservation call-to-action (accent bg)
 *
 * Visual Modes Supported:
 * - Playful (Tove): Circular images, pill buttons, generous spacing
 * - Modern (Frost): Rectangular images, subtle buttons, compact spacing
 */

import type { LayoutRecipe } from '../types';

export const CLASSIC_BISTRO_RECIPE: LayoutRecipe = {
    id: 'restaurant-classic-bistro',
    name: 'Classic Bistro',
    vertical: 'restaurant',
    conditions: {
        // No brandModes restriction - this is the universal default recipe
        // Works with playful, modern, and any future brand modes
        priority: 50  // Default priority
    },
    sections: [
        {
            type: 'hero',
            id: 'hero-main'
            // Hero handles its own background based on layout type
        },
        {
            type: 'story',
            id: 'story-about',
            backgroundColor: 'base'
        },
        {
            type: 'chef-highlight',
            id: 'chef-team',
            backgroundColor: 'base'
        },
        {
            type: 'menu-preview',
            id: 'menu-featured',
            backgroundColor: 'base-2'
        },
        {
            type: 'hours-location',
            id: 'hours-location',
            backgroundColor: 'base'
        },
        {
            type: 'gallery-grid',
            id: 'gallery-instagram',
            backgroundColor: 'base-2'
        },
        {
            type: 'awards-press',
            id: 'awards-press',
            backgroundColor: 'base'
        },
        {
            type: 'promo-band',
            id: 'promo-happy-hours',
            backgroundColor: 'contrast'
        },
        {
            type: 'testimonials',
            id: 'testimonials-customers',
            backgroundColor: 'accent-2'
        },
        {
            type: 'reservation-form',
            id: 'reservation-form',
            backgroundColor: 'accent'
        },
        {
            type: 'final-cta',
            id: 'cta-reservation',
            backgroundColor: 'accent'
        }
    ]
};
