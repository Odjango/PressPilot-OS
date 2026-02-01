/**
 * FontProvider - Typography system for PressPilot themes
 *
 * Provides font pairing recommendations based on industry/personality.
 * Fonts are bundled locally in base themes for GDPR compliance.
 */

// ============================================================================
// Font Pairing Types
// ============================================================================

export interface FontFace {
    fontFamily: string;
    fontStyle: string;
    fontWeight: string;
    src: string[];
}

export interface FontDefinition {
    fontFamily: string;
    name: string;
    slug: string;
    fontFace?: FontFace[];
}

export interface FontPair {
    heading: FontDefinition;
    body: FontDefinition;
    personality: string;
    industries: string[];
}

// ============================================================================
// Available Font Pairs (using fonts bundled in base themes)
// ============================================================================

/**
 * Font pairs available in twentytwentyfour base theme
 * These fonts are already bundled locally
 */
export const FONT_PAIRS: Record<string, FontPair> = {
    // Modern & Clean - Inter for both
    'modern': {
        heading: {
            fontFamily: '"Inter", sans-serif',
            name: 'Inter',
            slug: 'heading'
        },
        body: {
            fontFamily: '"Inter", sans-serif',
            name: 'Inter',
            slug: 'body'
        },
        personality: 'Modern, clean, professional',
        industries: ['saas', 'tech', 'startup', 'agency']
    },

    // Elegant & Refined - Cardo headings with Inter body
    'elegant': {
        heading: {
            fontFamily: 'Cardo, serif',
            name: 'Cardo',
            slug: 'heading'
        },
        body: {
            fontFamily: '"Inter", sans-serif',
            name: 'Inter',
            slug: 'body'
        },
        personality: 'Elegant, refined, timeless',
        industries: ['restaurant', 'fine-dining', 'luxury', 'boutique', 'cafe']
    },

    // Bold & Impactful - Jost headings with Inter body
    'bold': {
        heading: {
            fontFamily: '"Jost", sans-serif',
            name: 'Jost',
            slug: 'heading'
        },
        body: {
            fontFamily: '"Inter", sans-serif',
            name: 'Inter',
            slug: 'body'
        },
        personality: 'Bold, impactful, contemporary',
        industries: ['ecommerce', 'fashion', 'retail', 'fitness']
    },

    // Friendly & Approachable - Instrument Sans
    'friendly': {
        heading: {
            fontFamily: '"Instrument Sans", sans-serif',
            name: 'Instrument Sans',
            slug: 'heading'
        },
        body: {
            fontFamily: '"Inter", sans-serif',
            name: 'Inter',
            slug: 'body'
        },
        personality: 'Friendly, approachable, warm',
        industries: ['education', 'healthcare', 'nonprofit', 'community']
    }
};

// ============================================================================
// Font Size Scale (Fluid Typography with clamp())
// ============================================================================

export interface FontSizePreset {
    slug: string;
    name: string;
    size: string;
    fluid?: {
        min: string;
        max: string;
    } | false;
}

/**
 * 8-step fluid font size scale using clamp()
 * Follows Utopia-style fluid typography principles
 * Note: TT4 uses a simplified 5-step scale; use getTT4FontSizeScale() for TT4 alignment
 */
export const FONT_SIZE_SCALE: FontSizePreset[] = [
    {
        slug: 'xs',
        name: 'Extra Small',
        size: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        fluid: { min: '0.75rem', max: '0.875rem' }
    },
    {
        slug: 'small',
        name: 'Small',
        size: 'clamp(0.875rem, 0.8rem + 0.35vw, 1rem)',
        fluid: { min: '0.875rem', max: '1rem' }
    },
    {
        slug: 'medium',
        name: 'Medium',
        size: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        fluid: { min: '1rem', max: '1.125rem' }
    },
    {
        slug: 'large',
        name: 'Large',
        size: 'clamp(1.25rem, 1rem + 1.25vw, 1.75rem)',
        fluid: { min: '1.25rem', max: '1.75rem' }
    },
    {
        slug: 'x-large',
        name: 'Extra Large',
        size: 'clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)',
        fluid: { min: '1.5rem', max: '2.25rem' }
    },
    {
        slug: 'xx-large',
        name: '2X Large',
        size: 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
        fluid: { min: '2rem', max: '3rem' }
    },
    {
        slug: 'display',
        name: 'Display',
        size: 'clamp(2.5rem, 2rem + 3vw, 4rem)',
        fluid: { min: '2.5rem', max: '4rem' }
    },
    {
        slug: 'hero',
        name: 'Hero',
        size: 'clamp(3rem, 2.5rem + 4vw, 5rem)',
        fluid: { min: '3rem', max: '5rem' }
    }
];

// ============================================================================
// TT4-Aligned Font Size Scale (5 steps)
// ============================================================================

/**
 * TT4-aligned 5-step font size scale
 * Matches Twenty Twenty-Four's semantic font size tokens
 *
 * | Slug | Size | Fluid | Typical Use |
 * |------|------|-------|-------------|
 * | small | 0.9rem | No | Captions, metadata |
 * | medium | 1.05rem | No | Body text |
 * | large | 1.85rem | Yes | H4, H5 subheadings |
 * | x-large | 2.5rem | Yes | H2, H3 section titles |
 * | xx-large | 3.27rem | Yes | H1, hero text |
 */
export const TT4_FONT_SIZE_SCALE: FontSizePreset[] = [
    {
        slug: 'small',
        name: 'Small',
        size: '0.9rem',
        fluid: false
    },
    {
        slug: 'medium',
        name: 'Medium',
        size: '1.05rem',
        fluid: false
    },
    {
        slug: 'large',
        name: 'Large',
        size: 'clamp(1.39rem, calc(1.39rem + ((1vw - 0.32rem) * 0.767)), 1.85rem)',
        fluid: { min: '1.39rem', max: '1.85rem' }
    },
    {
        slug: 'x-large',
        name: 'Extra Large',
        size: 'clamp(1.85rem, calc(1.85rem + ((1vw - 0.32rem) * 1.083)), 2.5rem)',
        fluid: { min: '1.85rem', max: '2.5rem' }
    },
    {
        slug: 'xx-large',
        name: '2X Large',
        size: 'clamp(2.5rem, calc(2.5rem + ((1vw - 0.32rem) * 1.283)), 3.27rem)',
        fluid: { min: '2.5rem', max: '3.27rem' }
    }
];

// ============================================================================
// Line Height Presets
// ============================================================================

export interface LineHeightPreset {
    slug: string;
    name: string;
    value: string;
}

export const LINE_HEIGHT_PRESETS: LineHeightPreset[] = [
    { slug: 'tight', name: 'Tight', value: '1.1' },
    { slug: 'heading', name: 'Heading', value: '1.2' },
    { slug: 'snug', name: 'Snug', value: '1.375' },
    { slug: 'normal', name: 'Normal', value: '1.5' },
    { slug: 'relaxed', name: 'Relaxed', value: '1.625' },
    { slug: 'loose', name: 'Loose', value: '1.75' }
];

// ============================================================================
// Letter Spacing Presets
// ============================================================================

export interface LetterSpacingPreset {
    slug: string;
    name: string;
    value: string;
}

export const LETTER_SPACING_PRESETS: LetterSpacingPreset[] = [
    { slug: 'tight', name: 'Tight', value: '-0.025em' },
    { slug: 'normal', name: 'Normal', value: '0em' },
    { slug: 'wide', name: 'Wide', value: '0.025em' },
    { slug: 'wider', name: 'Wider', value: '0.05em' },
    { slug: 'widest', name: 'Widest', value: '0.1em' }
];

// ============================================================================
// FontProvider Class
// ============================================================================

export class FontProvider {
    /**
     * Get recommended font pair based on industry
     */
    static getFontPairForIndustry(industry: string): FontPair {
        // Check each font pair's industries
        for (const [key, pair] of Object.entries(FONT_PAIRS)) {
            if (pair.industries.includes(industry.toLowerCase())) {
                console.log(`[FontProvider] Matched industry '${industry}' to font pair '${key}'`);
                return pair;
            }
        }

        // Default to elegant for restaurant-related
        if (industry.includes('restaurant') || industry.includes('cafe') || industry.includes('food')) {
            return FONT_PAIRS['elegant'];
        }

        // Default to modern for most cases
        console.log(`[FontProvider] No specific match for '${industry}', using 'modern' default`);
        return FONT_PAIRS['modern'];
    }

    /**
     * Get font pair by personality key
     */
    static getFontPairByPersonality(personality: 'modern' | 'elegant' | 'bold' | 'friendly'): FontPair {
        return FONT_PAIRS[personality] || FONT_PAIRS['modern'];
    }

    /**
     * Get the full font size scale (8-step)
     */
    static getFontSizeScale(): FontSizePreset[] {
        return FONT_SIZE_SCALE;
    }

    /**
     * Get TT4-aligned font size scale (5-step)
     * Use this for TT4-compatible theme output
     */
    static getTT4FontSizeScale(): FontSizePreset[] {
        return TT4_FONT_SIZE_SCALE;
    }

    /**
     * Get line height presets
     */
    static getLineHeightPresets(): LineHeightPreset[] {
        return LINE_HEIGHT_PRESETS;
    }

    /**
     * Get letter spacing presets
     */
    static getLetterSpacingPresets(): LetterSpacingPreset[] {
        return LETTER_SPACING_PRESETS;
    }

    /**
     * Generate typography styles for theme.json
     * Uses TT4-aligned font size tokens
     */
    static generateTypographyStyles(fontPair: FontPair): any {
        return {
            elements: {
                h1: {
                    typography: {
                        fontFamily: `var(--wp--preset--font-family--heading)`,
                        fontSize: 'var(--wp--preset--font-size--xx-large)',
                        lineHeight: '1.15',
                        letterSpacing: '-0.02em'
                    }
                },
                h2: {
                    typography: {
                        fontFamily: `var(--wp--preset--font-family--heading)`,
                        fontSize: 'var(--wp--preset--font-size--x-large)',
                        lineHeight: '1.2',
                        letterSpacing: '-0.01em'
                    }
                },
                h3: {
                    typography: {
                        fontFamily: `var(--wp--preset--font-family--heading)`,
                        fontSize: 'var(--wp--preset--font-size--large)',
                        lineHeight: '1.25'
                    }
                },
                h4: {
                    typography: {
                        fontFamily: `var(--wp--preset--font-family--heading)`,
                        fontSize: 'var(--wp--preset--font-size--large)',
                        lineHeight: '1.3'
                    }
                },
                h5: {
                    typography: {
                        fontFamily: `var(--wp--preset--font-family--heading)`,
                        fontSize: 'var(--wp--preset--font-size--medium)',
                        lineHeight: '1.4'
                    }
                },
                h6: {
                    typography: {
                        fontFamily: `var(--wp--preset--font-family--heading)`,
                        fontSize: 'var(--wp--preset--font-size--small)',
                        lineHeight: '1.4'
                    }
                }
            }
        };
    }
}
