/**
 * Brand Mode Definitions - Generator 2.0 Design System
 *
 * Each brand mode defines a visual personality that applies across all verticals.
 * Modes affect spacing, radii, typography weights, and overall feel.
 *
 * Per PRESSPILOT_QUALITY_BAR.md:
 * - Playful: pastel bands, softer radii, friendly typography
 * - Modern: neutral backgrounds, sharper radii, bold typography, photo-driven
 * - Minimal: lots of white/negative space, very limited color, simple shapes
 * - Bold: strong color blocks, high contrast, fewer subtle grays
 */

import {
    BrandMode,
    Vertical,
    DesignSystemTokens,
    SpacingTokens,
    RadiusTokens,
    TypographyTokens,
    ColorTokens,
    ShadowTokens
} from './globalThemeTokens';

// =============================================================================
// Base Token Definitions per Brand Mode
// =============================================================================

/**
 * Spacing tokens for each brand mode.
 * Uses WordPress preset spacing format: var:preset|spacing|XX
 */
export const SPACING_BY_MODE: Record<BrandMode, SpacingTokens> = {
    playful: {
        sectionPadding: 'var:preset|spacing|70',   // Generous breathing room
        columnGap: 'var:preset|spacing|60',        // Comfortable column spacing
        cardPadding: 'var:preset|spacing|40',      // Roomy card interiors
        buttonMarginTop: 'var:preset|spacing|40'   // Space before CTAs
    },
    modern: {
        sectionPadding: 'var:preset|spacing|60',   // Tighter, professional
        columnGap: 'var:preset|spacing|50',        // Efficient column spacing
        cardPadding: 'var:preset|spacing|30',      // Compact card interiors
        buttonMarginTop: 'var:preset|spacing|30'   // Less space before CTAs
    },
    minimal: {
        sectionPadding: 'var:preset|spacing|80',   // Maximum breathing room
        columnGap: 'var:preset|spacing|60',        // Generous spacing
        cardPadding: 'var:preset|spacing|40',      // Clean padding
        buttonMarginTop: 'var:preset|spacing|50'   // Prominent CTA spacing
    },
    bold: {
        sectionPadding: 'var:preset|spacing|70',   // Strong section presence
        columnGap: 'var:preset|spacing|50',        // Tight grid
        cardPadding: 'var:preset|spacing|40',      // Substantial padding
        buttonMarginTop: 'var:preset|spacing|40'   // Prominent CTAs
    }
};

/**
 * Border radius tokens for each brand mode.
 */
export const RADIUS_BY_MODE: Record<BrandMode, RadiusTokens> = {
    playful: {
        button: '100px',    // Pill-shaped buttons
        card: '16px',       // Generously rounded cards
        image: '100%'       // Circular images (for certain contexts)
    },
    modern: {
        button: '4px',      // Subtle corner softening
        card: '8px',        // Minimal card rounding
        image: '8px'        // Rectangular with slight rounding
    },
    minimal: {
        button: '0px',      // Sharp, no rounding
        card: '0px',        // Sharp cards
        image: '0px'        // Sharp images
    },
    bold: {
        button: '8px',      // Medium rounding
        card: '12px',       // Noticeable but not soft
        image: '12px'       // Consistent with cards
    }
};

/**
 * Typography tokens for each brand mode.
 */
export const TYPOGRAPHY_BY_MODE: Record<BrandMode, TypographyTokens> = {
    playful: {
        buttonWeight: '600',    // Semi-bold, friendly
        badgeWeight: '700'      // Bold badges for emphasis
    },
    modern: {
        buttonWeight: '500',    // Medium weight, understated
        badgeWeight: '600'      // Semi-bold badges
    },
    minimal: {
        buttonWeight: '400',    // Light, elegant
        badgeWeight: '500'      // Subtle badges
    },
    bold: {
        buttonWeight: '700',    // Strong, impactful
        badgeWeight: '800'      // Extra bold badges
    }
};

/**
 * Color tokens - TT4 semantic slot references.
 * These are consistent across brand modes (color comes from palette, not mode).
 */
export const DEFAULT_COLORS: ColorTokens = {
    background: 'base',
    surface: 'base-2',
    primary: 'accent',
    contrast: 'contrast',
    promoBg: 'contrast',
    promoText: 'base',
    // Safe pairs for high-risk areas (WCAG AA guaranteed)
    heroOverlayText: 'base',      // Light text on dark overlays
    newsletterBg: 'contrast',     // Dark background (guaranteed contrast)
    newsletterText: 'base'        // Light text on dark bg
};

/**
 * Shadow tokens for each brand mode.
 */
export const SHADOWS_BY_MODE: Record<BrandMode, ShadowTokens> = {
    playful: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        elevated: '0 8px 24px rgba(0, 0, 0, 0.12)'
    },
    modern: {
        card: '0 1px 2px rgba(0, 0, 0, 0.05)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    minimal: {
        card: 'none',
        elevated: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    bold: {
        card: '0 4px 12px rgba(0, 0, 0, 0.15)',
        elevated: '0 12px 32px rgba(0, 0, 0, 0.2)'
    }
};

// =============================================================================
// Combined Brand Mode Export
// =============================================================================

/**
 * Complete brand mode definitions.
 * Combines spacing, radius, typography, and shadows for each mode.
 */
export const BRAND_MODES: Record<BrandMode, {
    spacing: SpacingTokens;
    radius: RadiusTokens;
    typography: TypographyTokens;
    shadows: ShadowTokens;
}> = {
    playful: {
        spacing: SPACING_BY_MODE.playful,
        radius: RADIUS_BY_MODE.playful,
        typography: TYPOGRAPHY_BY_MODE.playful,
        shadows: SHADOWS_BY_MODE.playful
    },
    modern: {
        spacing: SPACING_BY_MODE.modern,
        radius: RADIUS_BY_MODE.modern,
        typography: TYPOGRAPHY_BY_MODE.modern,
        shadows: SHADOWS_BY_MODE.modern
    },
    minimal: {
        spacing: SPACING_BY_MODE.minimal,
        radius: RADIUS_BY_MODE.minimal,
        typography: TYPOGRAPHY_BY_MODE.minimal,
        shadows: SHADOWS_BY_MODE.minimal
    },
    bold: {
        spacing: SPACING_BY_MODE.bold,
        radius: RADIUS_BY_MODE.bold,
        typography: TYPOGRAPHY_BY_MODE.bold,
        shadows: SHADOWS_BY_MODE.bold
    }
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get default tokens for a brand mode and vertical.
 * Used as fallback when vertical-specific tokens are not implemented.
 *
 * @param brandMode - Visual personality
 * @param vertical - Business vertical
 * @returns Complete design system tokens with defaults
 */
export function getDefaultTokens(brandMode: BrandMode, vertical: Vertical): DesignSystemTokens {
    const modeTokens = BRAND_MODES[brandMode] || BRAND_MODES.modern;

    return {
        brandMode,
        vertical,
        spacing: modeTokens.spacing,
        radius: modeTokens.radius,
        typography: modeTokens.typography,
        colors: DEFAULT_COLORS,
        shadows: modeTokens.shadows
    };
}

/**
 * Merge base brand mode tokens with vertical-specific overrides.
 *
 * @param brandMode - Visual personality
 * @param vertical - Business vertical
 * @param overrides - Vertical-specific token overrides
 * @returns Merged design system tokens
 */
export function mergeTokens(
    brandMode: BrandMode,
    vertical: Vertical,
    overrides: Partial<DesignSystemTokens>
): DesignSystemTokens {
    const base = getDefaultTokens(brandMode, vertical);

    return {
        ...base,
        ...overrides,
        spacing: { ...base.spacing, ...overrides.spacing },
        radius: { ...base.radius, ...overrides.radius },
        typography: { ...base.typography, ...overrides.typography },
        colors: { ...base.colors, ...overrides.colors },
        shadows: { ...base.shadows, ...overrides.shadows }
    };
}
