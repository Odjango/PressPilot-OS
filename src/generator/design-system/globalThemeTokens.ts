/**
 * Global Theme Tokens - Generator 2.0 Design System
 *
 * Unified design token interface for all verticals and brand modes.
 * This is the single source of truth for visual styling decisions.
 *
 * Usage:
 *   import { getDesignTokens } from '../design-system';
 *   const tokens = getDesignTokens('playful', 'restaurant');
 *
 * Patterns should ONLY use these tokens - never raw hex colors or arbitrary pixels.
 */

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Brand modes define the visual personality across all verticals.
 * Each mode has distinct characteristics:
 * - playful: Soft, rounded, warm - pastel bands, friendly typography
 * - modern: Clean, minimal, sharp - neutral backgrounds, bold typography
 * - minimal: Lots of white space, very limited color, simple shapes
 * - bold: Strong color blocks, high contrast, fewer subtle grays
 */
export type BrandMode = 'playful' | 'modern' | 'minimal' | 'bold';

/**
 * Supported verticals in the generator.
 * Each vertical can have custom token overrides.
 */
export type Vertical = 'restaurant' | 'ecommerce' | 'saas' | 'portfolio' | 'talent' | 'service';

/**
 * Spacing token values using WordPress preset format.
 */
export interface SpacingTokens {
    sectionPadding: string;      // Vertical section padding
    columnGap: string;           // Gap between columns
    cardPadding: string;         // Internal card padding
    buttonMarginTop: string;     // Space above buttons
}

/**
 * Border radius token values.
 */
export interface RadiusTokens {
    button: string;              // Button corner rounding
    card: string;                // Card/container rounding
    image: string;               // Image corner rounding
}

/**
 * Typography token values.
 */
export interface TypographyTokens {
    buttonWeight: string;        // Button font weight
    badgeWeight: string;         // Badge/label font weight
}

/**
 * Color token values - TT4 semantic slot references.
 * These reference theme.json color presets, not raw hex values.
 */
export interface ColorTokens {
    background: string;          // Page background (base)
    surface: string;             // Card/section surface (base-2)
    primary: string;             // Primary brand color (accent)
    contrast: string;            // High contrast text/bg (contrast)
    promoBg: string;             // Promo section background
    promoText: string;           // Promo section text
    // Safe pairs for high-risk areas (WCAG AA guaranteed)
    heroOverlayText: string;     // Text on dark hero overlays
    newsletterBg: string;        // Newsletter section background
    newsletterText: string;      // Newsletter section text
}

/**
 * Shadow token values.
 */
export interface ShadowTokens {
    card: string;                // Subtle card shadow
    elevated: string;            // Elevated element shadow
}

/**
 * Complete design system tokens interface.
 * All patterns should consume these tokens rather than reaching into theme.json directly.
 */
export interface DesignSystemTokens {
    brandMode: BrandMode;
    vertical: Vertical;

    spacing: SpacingTokens;
    radius: RadiusTokens;
    typography: TypographyTokens;
    colors: ColorTokens;
    shadows: ShadowTokens;
}

// =============================================================================
// Token Resolver
// =============================================================================

// Import will be added after brandModes.ts and verticals are created
import { BRAND_MODES, getDefaultTokens } from './brandModes';
import { getRestaurantTokens } from './verticals/restaurant';
import { getEcommerceTokens } from './verticals/ecommerce';

/**
 * Get design tokens for a given brand mode and vertical.
 *
 * This is the main entry point for the design system.
 * Returns fully-resolved tokens that patterns can use directly.
 *
 * @param brandMode - Visual personality (playful, modern, minimal, bold)
 * @param vertical - Business vertical (restaurant, ecommerce, saas, service)
 * @returns Complete design system tokens
 */
export function getDesignTokens(brandMode: BrandMode, vertical: Vertical): DesignSystemTokens {
    // Validate brand mode - fall back to modern if unknown
    const validModes: BrandMode[] = ['playful', 'modern', 'minimal', 'bold'];
    const resolvedMode: BrandMode = validModes.includes(brandMode) ? brandMode : 'modern';

    if (!validModes.includes(brandMode)) {
        console.warn(`[DesignSystem] Unknown brand mode "${brandMode}", falling back to "modern"`);
    }

    // Get tokens based on vertical
    switch (vertical) {
        case 'restaurant':
            return getRestaurantTokens(resolvedMode);

        case 'ecommerce':
            return getEcommerceTokens(resolvedMode);

        // Phase 5+ verticals - fall back to base brand mode tokens
        case 'saas':
        case 'portfolio':
        case 'talent':
        case 'service':
        default:
            console.warn(`[DesignSystem] Vertical "${vertical}" not yet implemented, using base tokens`);
            return getDefaultTokens(resolvedMode, vertical);
    }
}

/**
 * Check if a brand mode is valid.
 */
export function isValidBrandMode(mode: string): mode is BrandMode {
    return ['playful', 'modern', 'minimal', 'bold'].includes(mode);
}

/**
 * Check if a vertical is valid.
 */
export function isValidVertical(vertical: string): vertical is Vertical {
    return ['restaurant', 'ecommerce', 'saas', 'portfolio', 'talent', 'service'].includes(vertical);
}
