/**
 * Product Showcase Recipe - Generator 2.0 Phase 4
 *
 * The default ecommerce homepage recipe optimized for product-focused stores.
 * Highlights categories and featured products prominently.
 *
 * Section Order:
 * 1. Ecommerce Hero - Full-width with featured product/promotion
 * 2. Category Grid - 4 category cards with images
 * 3. Featured Products - 4 product cards with prices
 * 4. Trust Badges - Payment/shipping/guarantee icons
 * 5. Newsletter - Email signup CTA
 * 6. Footer (handled by template-part injection)
 *
 * Visual Modes Supported:
 * - Modern: Clean, minimal, product-focused (default)
 * - Bold: High contrast, prominent CTAs
 * - Playful: Soft cards, pill buttons (boutique stores)
 * - Minimal: Maximum whitespace, elegant (luxury stores)
 */

import type { LayoutRecipe } from '../types';

export const PRODUCT_SHOWCASE_RECIPE: LayoutRecipe = {
    id: 'ecommerce-product-showcase',
    name: 'Product Showcase',
    vertical: 'ecommerce',
    conditions: {
        // Default recipe for modern and bold modes
        brandModes: ['modern', 'bold'],
        // businessTypes is optional - matches any ecommerce business
        priority: 50  // Default priority
    },
    sections: [
        {
            type: 'ecommerce-hero',
            id: 'hero-main',
            backgroundColor: 'base'
        },
        {
            type: 'category-grid',
            id: 'categories',
            backgroundColor: 'base-2'
        },
        {
            type: 'featured-products',
            id: 'featured',
            backgroundColor: 'base'
        },
        {
            type: 'trust-badges',
            id: 'trust',
            backgroundColor: 'base-2'
        },
        {
            type: 'newsletter',
            id: 'newsletter',
            backgroundColor: 'accent'
        },
        {
            type: 'footer',
            id: 'footer',
            backgroundColor: 'contrast'
        }
    ]
};
