/**
 * PersonalityTokens.ts - Base Theme Personality Preservation
 *
 * Defines the visual character of each base theme that should be preserved
 * when applying the standardized TT4 token system. This includes button styles,
 * heading styles, and color mood preferences.
 */

import { BaseTheme } from '../types';

// ============================================================================
// Personality Type Definitions
// ============================================================================

export interface ButtonPersonality {
    borderRadius: string;
    shadow?: string;
    fontWeight: string;
    textTransform?: string;
    borderWidth?: string;
}

export interface HeadingPersonality {
    fontFamily: 'heading' | 'body' | 'primary';
    letterSpacing: string;
    fontWeight: string;
    lineHeight?: string;
}

export interface BaseThemePersonality {
    name: string;
    description: string;
    buttonStyle: ButtonPersonality;
    headingStyle: HeadingPersonality;
    colorMood: 'warm' | 'cool' | 'neutral' | 'vibrant';
    defaultPalette: string;  // Recommended palette ID for this theme
    customCssVars?: Record<string, string>;
}

// ============================================================================
// Personality Definitions per Base Theme
// ============================================================================

export const PERSONALITY_TOKENS: Record<BaseTheme, BaseThemePersonality> = {
    /**
     * Tove - Warm, Playful, Restaurant-Ready
     * Character: Pastel rainbow palette, 3D shaded buttons, tight typography
     */
    'tove': {
        name: 'Tove',
        description: 'Warm and playful, perfect for restaurants and hospitality',
        buttonStyle: {
            borderRadius: '0px',
            shadow: '4px 4px 0 currentColor',
            fontWeight: '700',
            borderWidth: '2px'
        },
        headingStyle: {
            fontFamily: 'body',      // Tove uses DM Sans for everything
            letterSpacing: '-0.03em',
            fontWeight: '700',
            lineHeight: '1.25'
        },
        colorMood: 'warm',
        defaultPalette: 'restaurant-soft',
        customCssVars: {
            '--wp--custom--shaded-style--border--width': '2px',
            '--wp--custom--shaded-style--box-shadow--x': '4px',
            '--wp--custom--shaded-style--box-shadow--y': '4px'
        }
    },

    /**
     * Ollie - Bold, Modern, Dark-Friendly
     * Character: Professional purple-gray, flat modern buttons, variable fonts
     */
    'ollie': {
        name: 'Ollie',
        description: 'Bold and modern, ideal for tech and SaaS',
        buttonStyle: {
            borderRadius: '5px',
            fontWeight: '500'
        },
        headingStyle: {
            fontFamily: 'primary',   // Mona Sans with variable weights
            letterSpacing: '0',
            fontWeight: '600'
        },
        colorMood: 'cool',
        defaultPalette: 'saas-bright'
    },

    /**
     * Twenty Twenty-Four - Clean, Neutral, Elegant
     * Character: Neutral beige, gentle rounded buttons, serif headings
     */
    'twentytwentyfour': {
        name: 'Twenty Twenty-Four',
        description: 'Clean and elegant, versatile for any business',
        buttonStyle: {
            borderRadius: '.33rem',
            fontWeight: '500'
        },
        headingStyle: {
            fontFamily: 'heading',   // Cardo (serif)
            letterSpacing: '0em',
            fontWeight: '400'
        },
        colorMood: 'neutral',
        defaultPalette: 'local-biz-soft'
    },

    /**
     * Frost - Minimal, Clean, Professional
     * Character: High contrast, minimal styling, system fonts
     */
    'frost': {
        name: 'Frost',
        description: 'Minimal and professional',
        buttonStyle: {
            borderRadius: '4px',
            fontWeight: '600'
        },
        headingStyle: {
            fontFamily: 'heading',
            letterSpacing: '-0.01em',
            fontWeight: '600'
        },
        colorMood: 'cool',
        defaultPalette: 'brand-kit'
    },

    /**
     * Spectra - Modern, Bold, Agency
     * Character: Bold colors, strong typography
     */
    'spectra': {
        name: 'Spectra',
        description: 'Bold and agency-focused',
        buttonStyle: {
            borderRadius: '6px',
            fontWeight: '600'
        },
        headingStyle: {
            fontFamily: 'heading',
            letterSpacing: '-0.02em',
            fontWeight: '700'
        },
        colorMood: 'vibrant',
        defaultPalette: 'ecommerce-bold'
    },

    /**
     * Spectra One - Modern, Versatile
     * Character: Similar to Spectra but more versatile
     */
    'spectra-one': {
        name: 'Spectra One',
        description: 'Modern and versatile',
        buttonStyle: {
            borderRadius: '6px',
            fontWeight: '600'
        },
        headingStyle: {
            fontFamily: 'heading',
            letterSpacing: '-0.01em',
            fontWeight: '600'
        },
        colorMood: 'neutral',
        defaultPalette: 'brand-kit'
    },

    /**
     * Blockbase - Foundation, Minimal
     * Character: Simple foundation theme
     */
    'blockbase': {
        name: 'Blockbase',
        description: 'Simple foundation theme',
        buttonStyle: {
            borderRadius: '4px',
            fontWeight: '500'
        },
        headingStyle: {
            fontFamily: 'heading',
            letterSpacing: '0',
            fontWeight: '600'
        },
        colorMood: 'neutral',
        defaultPalette: 'brand-kit'
    }
};

// ============================================================================
// Legacy Alias Mappings
// ============================================================================

/**
 * Maps legacy token slugs to TT4 semantic slots
 * These aliases ensure existing patterns continue to work
 */
export const LEGACY_TO_TT4_ALIASES: Record<string, string> = {
    // Color aliases
    'primary': 'accent',
    'primary-light': 'accent-2',
    'primary-dark': 'accent-3',
    'primary-subtle': 'accent-2',
    'secondary': 'accent-4',
    'tertiary': 'accent-5',
    'foreground': 'contrast',
    'background': 'base',
    'surface': 'base-2',
    // NOTE: 'text' renamed to 'body-text' to avoid conflict with WordPress's
    // built-in .has-text-color marker class which would override block-level colors
    'body-text': 'contrast',
    'heading': 'contrast',
    'muted': 'contrast-2',
    'border': 'contrast-3',
    'main': 'contrast',
    'cta-bg': 'accent',
    'cta-text': 'base'
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get personality for a base theme with fallback
 */
export function getPersonality(baseTheme: BaseTheme): BaseThemePersonality {
    return PERSONALITY_TOKENS[baseTheme] || PERSONALITY_TOKENS['twentytwentyfour'];
}

/**
 * Get the TT4 slot for a legacy slug
 */
export function getLegacyAlias(legacySlug: string): string | undefined {
    return LEGACY_TO_TT4_ALIASES[legacySlug];
}

/**
 * Get all legacy slugs that map to a given TT4 slot
 */
export function getLegacySlugsForTT4(tt4Slot: string): string[] {
    return Object.entries(LEGACY_TO_TT4_ALIASES)
        .filter(([_, tt4]) => tt4 === tt4Slot)
        .map(([legacy, _]) => legacy);
}
