/**
 * Restaurant Theme Tokens - Backward-Compatible Bridge
 *
 * This file now serves as a bridge to the new Generator 2.0 Design System.
 * It maintains the original API for existing patterns while internally
 * delegating to the centralized design system.
 *
 * IMPORTANT: This API is maintained for backward compatibility.
 * New patterns should import directly from '../../design-system' instead.
 *
 * Usage (existing patterns - still works):
 *   import { getRestaurantStyleTokens } from './restaurantThemeTokens';
 *   const tokens = getRestaurantStyleTokens(brandStyle);
 *
 * Usage (new patterns - preferred):
 *   import { getDesignTokens } from '../../design-system';
 *   const tokens = getDesignTokens('playful', 'restaurant');
 */

import {
    getDesignTokens,
    getRestaurantMenuImageStyle,
    getRestaurantButtonStyle,
    type BrandMode
} from '../../design-system';

// =============================================================================
// Legacy Type Definitions (Maintained for Backward Compatibility)
// =============================================================================

export type RestaurantStyle = 'playful' | 'modern';

export interface RestaurantStyleTokens {
    // Border radius values
    buttonRadius: string;           // Button corner rounding
    cardRadius: string;             // Card/container rounding
    imageRadius: string;            // Image corner rounding
    storyImageRadius: string;       // Story section image rounding

    // Spacing values (use var:preset|spacing|XX format)
    sectionPadding: string;         // Vertical section padding
    columnGap: string;              // Gap between columns
    cardPadding: string;            // Internal card padding
    buttonMarginTop: string;        // Space above buttons

    // Typography
    buttonWeight: string;           // Button font weight
    badgeWeight: string;            // Badge/label font weight

    // Visual characteristics
    menuImageStyle: 'circular' | 'rectangular';  // Menu preview image shape
    buttonStyle: 'pill' | 'rounded' | 'square';  // Button shape description
}

// =============================================================================
// Legacy Token Constants (For Reference Only)
// =============================================================================

/**
 * @deprecated Use getRestaurantStyleTokens() or getDesignTokens() instead.
 * This constant is maintained for backward compatibility only.
 */
export const RESTAURANT_STYLE_TOKENS: Record<RestaurantStyle, RestaurantStyleTokens> = {
    playful: {
        buttonRadius: '100px',
        cardRadius: '16px',
        imageRadius: '100%',
        storyImageRadius: '16px',
        sectionPadding: 'var:preset|spacing|70',
        columnGap: 'var:preset|spacing|60',
        cardPadding: 'var:preset|spacing|40',
        buttonMarginTop: 'var:preset|spacing|40',
        buttonWeight: '600',
        badgeWeight: '700',
        menuImageStyle: 'circular',
        buttonStyle: 'pill'
    },
    modern: {
        buttonRadius: '4px',
        cardRadius: '8px',
        imageRadius: '8px',
        storyImageRadius: '8px',
        sectionPadding: 'var:preset|spacing|60',
        columnGap: 'var:preset|spacing|50',
        cardPadding: 'var:preset|spacing|30',
        buttonMarginTop: 'var:preset|spacing|30',
        buttonWeight: '500',
        badgeWeight: '600',
        menuImageStyle: 'rectangular',
        buttonStyle: 'rounded'
    }
};

// =============================================================================
// Bridge Functions (Delegate to Design System)
// =============================================================================

/**
 * Get style tokens for a given brand style.
 *
 * This function now delegates to the centralized design system and
 * maps the result to the legacy RestaurantStyleTokens interface.
 *
 * @param brandStyle - 'playful' or 'modern'
 * @returns Style tokens for the specified visual mode
 */
export function getRestaurantStyleTokens(brandStyle?: string): RestaurantStyleTokens {
    // Map string to BrandMode, defaulting to 'playful'
    const brandMode: BrandMode = brandStyle === 'modern' ? 'modern' : 'playful';

    // Get tokens from the new design system
    const tokens = getDesignTokens(brandMode, 'restaurant');

    // Map DesignSystemTokens to legacy RestaurantStyleTokens interface
    return {
        buttonRadius: tokens.radius.button,
        cardRadius: tokens.radius.card,
        imageRadius: tokens.radius.image,
        storyImageRadius: tokens.radius.image,  // Same as image radius in new system
        sectionPadding: tokens.spacing.sectionPadding,
        columnGap: tokens.spacing.columnGap,
        cardPadding: tokens.spacing.cardPadding,
        buttonMarginTop: tokens.spacing.buttonMarginTop,
        buttonWeight: tokens.typography.buttonWeight,
        badgeWeight: tokens.typography.badgeWeight,
        menuImageStyle: getRestaurantMenuImageStyle(brandMode),
        buttonStyle: getRestaurantButtonStyle(brandMode)
    };
}

/**
 * Check if a brand style is the modern/Frost variant.
 * Useful for conditional rendering.
 */
export function isModernStyle(brandStyle?: string): boolean {
    return brandStyle === 'modern';
}

/**
 * Check if a brand style is the playful/Tove variant.
 * Useful for conditional rendering.
 */
export function isPlayfulStyle(brandStyle?: string): boolean {
    return brandStyle !== 'modern';
}
