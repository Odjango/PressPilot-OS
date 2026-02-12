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
        businessTypes: ['product-showcase', 'single-product', 'small-catalog'],
        priority: 70
    },
    sections: [
        { type: 'ecommerce-hero', id: 'hero', backgroundColor: 'base' },
        { type: 'ecommerce-featured-products', id: 'featured-products', backgroundColor: 'base-2' },
        { type: 'ecommerce-about-brand', id: 'about-brand', backgroundColor: 'base' },
        { type: 'ecommerce-testimonials', id: 'testimonials', backgroundColor: 'base-2' },
        { type: 'ecommerce-trust-badges', id: 'trust-badges', backgroundColor: 'base' },
        { type: 'ecommerce-newsletter', id: 'newsletter', backgroundColor: 'accent' }
    ]
};
