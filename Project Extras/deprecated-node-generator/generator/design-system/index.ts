/**
 * Design System - Generator 2.0
 *
 * Centralized design token system for all verticals and brand modes.
 * This is the main entry point for the design system.
 *
 * Usage:
 *   import { getDesignTokens, type BrandMode, type Vertical } from '../design-system';
 *   const tokens = getDesignTokens('playful', 'restaurant');
 *
 * All patterns should use tokens from this system rather than hardcoded values.
 */

// =============================================================================
// Core Exports
// =============================================================================

// Types
export type {
    BrandMode,
    Vertical,
    DesignSystemTokens,
    SpacingTokens,
    RadiusTokens,
    TypographyTokens,
    ColorTokens,
    ShadowTokens
} from './globalThemeTokens';

// Main resolver function
export {
    getDesignTokens,
    isValidBrandMode,
    isValidVertical
} from './globalThemeTokens';

// =============================================================================
// Brand Mode Exports
// =============================================================================

export {
    BRAND_MODES,
    SPACING_BY_MODE,
    RADIUS_BY_MODE,
    TYPOGRAPHY_BY_MODE,
    SHADOWS_BY_MODE,
    DEFAULT_COLORS,
    getDefaultTokens,
    mergeTokens
} from './brandModes';

// =============================================================================
// Vertical-Specific Exports
// =============================================================================

// Restaurant vertical
export {
    getRestaurantTokens,
    getRestaurantMenuImageStyle,
    getRestaurantButtonStyle
} from './verticals/restaurant';

// Ecommerce vertical (Phase 4)
export {
    getEcommerceTokens,
    getEcommerceCardStyle,
    getEcommerceButtonStyle
} from './verticals/ecommerce';
