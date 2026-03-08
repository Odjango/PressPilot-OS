/**
 * Restaurant Vertical Tokens - Generator 2.0 Design System
 *
 * Restaurant-specific token definitions that maintain exact compatibility
 * with the original restaurantThemeTokens.ts behavior.
 *
 * IMPORTANT: These values MUST match the original implementation exactly
 * to prevent visual regressions. Any changes should be validated with
 * E2E screenshot comparison.
 *
 * Visual Modes:
 * - Playful (Tove): Soft, rounded, warm - for cafes, bakeries, family restaurants
 * - Modern (Frost): Clean, minimal, sharp - for upscale dining, contemporary venues
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
// Restaurant-Specific Token Definitions
// =============================================================================

/**
 * Restaurant spacing tokens per brand mode.
 * These EXACTLY match the original restaurantThemeTokens.ts values.
 */
const RESTAURANT_SPACING: Record<'playful' | 'modern', SpacingTokens> = {
    playful: {
        sectionPadding: 'var:preset|spacing|70',   // Generous vertical breathing room
        columnGap: 'var:preset|spacing|60',        // Comfortable column spacing
        cardPadding: 'var:preset|spacing|40',      // Roomy card interiors
        buttonMarginTop: 'var:preset|spacing|40'   // Space before CTAs
    },
    modern: {
        sectionPadding: 'var:preset|spacing|60',   // Tighter, more compact spacing
        columnGap: 'var:preset|spacing|50',        // Efficient column spacing
        cardPadding: 'var:preset|spacing|30',      // Compact card interiors
        buttonMarginTop: 'var:preset|spacing|30'   // Less space before CTAs
    }
};

/**
 * Restaurant radius tokens per brand mode.
 * These EXACTLY match the original restaurantThemeTokens.ts values.
 */
const RESTAURANT_RADIUS: Record<'playful' | 'modern', RadiusTokens> = {
    playful: {
        button: '100px',    // Pill-shaped buttons
        card: '16px',       // Generously rounded cards
        image: '100%'       // Circular images (menu items)
    },
    modern: {
        button: '4px',      // Subtle corner softening
        card: '8px',        // Minimal card rounding
        image: '8px'        // Rectangular with slight rounding
    }
};

/**
 * Restaurant typography tokens per brand mode.
 * These EXACTLY match the original restaurantThemeTokens.ts values.
 */
const RESTAURANT_TYPOGRAPHY: Record<'playful' | 'modern', TypographyTokens> = {
    playful: {
        buttonWeight: '600',    // Semi-bold, friendly buttons
        badgeWeight: '700'      // Bold badges for emphasis
    },
    modern: {
        buttonWeight: '500',    // Medium weight, understated
        badgeWeight: '600'      // Semi-bold badges
    }
};

// =============================================================================
// Restaurant Token Resolver
// =============================================================================

/**
 * Get complete design tokens for the restaurant vertical.
 *
 * For playful and modern modes, returns exact values matching the original
 * restaurantThemeTokens.ts implementation. For minimal and bold modes,
 * uses reasonable defaults based on the base brand mode tokens.
 *
 * @param brandMode - Visual personality (playful, modern, minimal, bold)
 * @returns Complete design system tokens for restaurant
 */
export function getRestaurantTokens(brandMode: BrandMode): DesignSystemTokens {
    // For playful and modern, use exact restaurant-specific values
    if (brandMode === 'playful' || brandMode === 'modern') {
        return {
            brandMode,
            vertical: 'restaurant',
            spacing: RESTAURANT_SPACING[brandMode],
            radius: RESTAURANT_RADIUS[brandMode],
            typography: RESTAURANT_TYPOGRAPHY[brandMode],
            colors: DEFAULT_COLORS,
            shadows: SHADOWS_BY_MODE[brandMode]
        };
    }

    // For minimal and bold (future expansion), map to closest existing mode
    // minimal -> modern-like spacing/radius
    // bold -> playful-like spacing with modern radius
    if (brandMode === 'minimal') {
        return {
            brandMode,
            vertical: 'restaurant',
            spacing: {
                sectionPadding: 'var:preset|spacing|80',   // Extra breathing room
                columnGap: 'var:preset|spacing|60',
                cardPadding: 'var:preset|spacing|40',
                buttonMarginTop: 'var:preset|spacing|50'
            },
            radius: {
                button: '0px',      // Sharp, minimal
                card: '0px',
                image: '0px'
            },
            typography: {
                buttonWeight: '400',
                badgeWeight: '500'
            },
            colors: DEFAULT_COLORS,
            shadows: SHADOWS_BY_MODE.minimal
        };
    }

    // bold mode
    return {
        brandMode,
        vertical: 'restaurant',
        spacing: {
            sectionPadding: 'var:preset|spacing|70',
            columnGap: 'var:preset|spacing|50',
            cardPadding: 'var:preset|spacing|40',
            buttonMarginTop: 'var:preset|spacing|40'
        },
        radius: {
            button: '8px',
            card: '12px',
            image: '12px'
        },
        typography: {
            buttonWeight: '700',
            badgeWeight: '800'
        },
        colors: DEFAULT_COLORS,
        shadows: SHADOWS_BY_MODE.bold
    };
}

// =============================================================================
// Restaurant-Specific Helpers
// =============================================================================

/**
 * Get the menu image style for a restaurant brand mode.
 * Playful uses circular images, all others use rectangular.
 */
export function getRestaurantMenuImageStyle(brandMode: BrandMode): 'circular' | 'rectangular' {
    return brandMode === 'playful' ? 'circular' : 'rectangular';
}

/**
 * Get the button style description for a restaurant brand mode.
 */
export function getRestaurantButtonStyle(brandMode: BrandMode): 'pill' | 'rounded' | 'square' {
    switch (brandMode) {
        case 'playful':
            return 'pill';
        case 'minimal':
            return 'square';
        default:
            return 'rounded';
    }
}
