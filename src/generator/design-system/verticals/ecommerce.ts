/**
 * Ecommerce Vertical Tokens - Generator 2.0 Phase 4
 *
 * Ecommerce-specific token definitions optimized for product-focused layouts.
 *
 * Visual Modes:
 * - Modern: Clean, minimal, product-focused (default) - for fashion, tech, home goods
 * - Bold: High contrast, prominent CTAs - for sales, flash deals, discount stores
 * - Playful: Maps to modern (soft cards, friendly feel) - for boutiques, handmade
 * - Minimal: Maps to modern with reduced shadows - for luxury, curated stores
 *
 * Key differences from restaurant:
 * - Grid-focused layouts with larger product cards
 * - Prominent price styling with dedicated weight token
 * - Cart-action emphasis in button design
 * - Shadow tokens for product card hover effects
 */

import {
    BrandMode,
    DesignSystemTokens,
    SpacingTokens,
    RadiusTokens,
    TypographyTokens,
    ColorTokens,
    ShadowTokens
} from '../globalThemeTokens';
import { DEFAULT_COLORS, SHADOWS_BY_MODE } from '../brandModes';

// =============================================================================
// Ecommerce-Specific Token Definitions
// =============================================================================

/**
 * Ecommerce spacing tokens per brand mode.
 * Optimized for product grid layouts with generous product card spacing.
 */
const ECOMMERCE_SPACING: Record<'modern' | 'bold', SpacingTokens> = {
    modern: {
        sectionPadding: 'var:preset|spacing|60',   // Generous product spacing
        columnGap: 'var:preset|spacing|40',        // Gap between product cards
        cardPadding: 'var:preset|spacing|30',      // Product card internal padding
        buttonMarginTop: 'var:preset|spacing|30'   // Space above Add to Cart
    },
    bold: {
        sectionPadding: 'var:preset|spacing|60',   // Same generous spacing
        columnGap: 'var:preset|spacing|30',        // Tighter for more products
        cardPadding: 'var:preset|spacing|30',      // Same card padding
        buttonMarginTop: 'var:preset|spacing|20'   // Tighter button spacing
    }
};

/**
 * Ecommerce radius tokens per brand mode.
 */
const ECOMMERCE_RADIUS: Record<'modern' | 'bold', RadiusTokens> = {
    modern: {
        button: '4px',      // Square, professional buttons
        card: '8px',        // Subtle card rounding
        image: '8px'        // Product image rounding
    },
    bold: {
        button: '0px',      // Sharp, bold buttons
        card: '0px',        // No rounding for impact
        image: '0px'        // Sharp product images
    }
};

/**
 * Ecommerce typography tokens per brand mode.
 * Includes priceWeight for prominent price styling.
 */
const ECOMMERCE_TYPOGRAPHY: Record<'modern' | 'bold', TypographyTokens> = {
    modern: {
        buttonWeight: '600',    // Semi-bold Add to Cart
        badgeWeight: '700'      // Bold sale badges
    },
    bold: {
        buttonWeight: '800',    // Extra bold CTAs
        badgeWeight: '900'      // Maximum impact badges
    }
};

/**
 * Ecommerce shadow tokens per brand mode.
 * Includes cardHover for product card hover effects.
 */
const ECOMMERCE_SHADOWS: Record<'modern' | 'bold', ShadowTokens> = {
    modern: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        elevated: '0 4px 16px rgba(0, 0, 0, 0.12)'
    },
    bold: {
        card: 'none',
        elevated: '0 0 0 3px var(--wp--preset--color--accent)'
    }
};

// =============================================================================
// Ecommerce Token Resolver
// =============================================================================

/**
 * Get complete design tokens for the ecommerce vertical.
 *
 * For modern and bold modes, returns ecommerce-specific values.
 * For playful and minimal modes, maps to appropriate base.
 *
 * @param brandMode - Visual personality (playful, modern, minimal, bold)
 * @returns Complete design system tokens for ecommerce
 */
export function getEcommerceTokens(brandMode: BrandMode): DesignSystemTokens {
    // Modern and bold - use ecommerce-specific values
    if (brandMode === 'modern' || brandMode === 'bold') {
        return {
            brandMode,
            vertical: 'ecommerce',
            spacing: ECOMMERCE_SPACING[brandMode],
            radius: ECOMMERCE_RADIUS[brandMode],
            typography: ECOMMERCE_TYPOGRAPHY[brandMode],
            colors: DEFAULT_COLORS,
            shadows: ECOMMERCE_SHADOWS[brandMode]
        };
    }

    // Playful - map to modern with softer shadows (boutique, handmade)
    if (brandMode === 'playful') {
        return {
            brandMode,
            vertical: 'ecommerce',
            spacing: {
                sectionPadding: 'var:preset|spacing|70',   // More breathing room
                columnGap: 'var:preset|spacing|50',        // Generous card gaps
                cardPadding: 'var:preset|spacing|40',      // Roomy cards
                buttonMarginTop: 'var:preset|spacing|40'   // Friendly spacing
            },
            radius: {
                button: '100px',    // Pill buttons for friendly feel
                card: '16px',       // Rounded product cards
                image: '12px'       // Soft product images
            },
            typography: {
                buttonWeight: '600',
                badgeWeight: '700'
            },
            colors: DEFAULT_COLORS,
            shadows: SHADOWS_BY_MODE.playful
        };
    }

    // Minimal - map to modern with no shadows (luxury, curated)
    return {
        brandMode,
        vertical: 'ecommerce',
        spacing: {
            sectionPadding: 'var:preset|spacing|80',   // Maximum whitespace
            columnGap: 'var:preset|spacing|60',        // Generous spacing
            cardPadding: 'var:preset|spacing|40',      // Clean padding
            buttonMarginTop: 'var:preset|spacing|50'   // Prominent CTAs
        },
        radius: {
            button: '0px',      // Sharp, refined
            card: '0px',        // No rounding
            image: '0px'        // Sharp product images
        },
        typography: {
            buttonWeight: '400',    // Light, elegant
            badgeWeight: '500'      // Subtle
        },
        colors: DEFAULT_COLORS,
        shadows: SHADOWS_BY_MODE.minimal
    };
}

// =============================================================================
// Ecommerce-Specific Helpers
// =============================================================================

/**
 * Get the product card style for an ecommerce brand mode.
 */
export function getEcommerceCardStyle(brandMode: BrandMode): 'elevated' | 'flat' | 'outlined' {
    switch (brandMode) {
        case 'modern':
        case 'playful':
            return 'elevated';
        case 'bold':
            return 'outlined';
        case 'minimal':
            return 'flat';
        default:
            return 'elevated';
    }
}

/**
 * Get the button style description for an ecommerce brand mode.
 */
export function getEcommerceButtonStyle(brandMode: BrandMode): 'pill' | 'rounded' | 'square' {
    switch (brandMode) {
        case 'playful':
            return 'pill';
        case 'minimal':
        case 'bold':
            return 'square';
        default:
            return 'rounded';
    }
}
