/**
 * Modern Dining Recipe - Generator 2.0 Phase 2
 *
 * A second restaurant recipe variant for upscale/fine-dining venues.
 * Currently uses the same sections as Classic Bistro.
 *
 * Future enhancements could include:
 * - Gallery section
 * - Chef spotlight
 * - Wine list preview
 * - Private dining section
 *
 * Selection:
 * - Higher priority (60) for 'fine-dining' and 'upscale' business types
 * - Preferred for 'modern' and 'minimal' brand modes
 */

import type { LayoutRecipe } from '../types';

export const MODERN_DINING_RECIPE: LayoutRecipe = {
    id: 'restaurant-modern-dining',
    name: 'Modern Dining',
    vertical: 'restaurant',
    conditions: {
        brandModes: ['modern', 'minimal'],
        // NOTE: businessTypes removed for Phase 2 stub.
        // Will be re-added when recipe sections are differentiated.
        priority: 60  // Higher priority for modern/minimal modes
    },
    sections: [
        {
            type: 'hero',
            id: 'hero-main'
        },
        {
            type: 'story',
            id: 'story-about',
            backgroundColor: 'base'
        },
        {
            type: 'menu-preview',
            id: 'menu-featured',
            backgroundColor: 'base-2'
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
            type: 'final-cta',
            id: 'cta-reservation',
            backgroundColor: 'accent'
        }
    ]
};
