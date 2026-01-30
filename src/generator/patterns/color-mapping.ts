/**
 * PressPilot Color Mapping Registry
 * 
 * Theme-specific color slug mappings to ensure proper contrast
 * for footers and other dark-background sections.
 * 
 * Prevents white-on-white bugs by using correct color tokens per theme.
 */

export interface ThemeColors {
    darkBg: string;      // Dark background color slug
    lightText: string;   // Light text color slug for contrast
}

/**
 * Theme-specific color mappings
 * Each theme may use different slug names for dark/light colors
 */
export const THEME_COLOR_MAP: Record<string, ThemeColors> = {
    // Ollie: Uses "main" for dark backgrounds
    ollie: { darkBg: 'main', lightText: 'base' },

    // Tove: Uses "foreground" for dark and "background" for light
    tove: { darkBg: 'foreground', lightText: 'background' },

    // Frost: Standard contrast/base naming
    frost: { darkBg: 'contrast', lightText: 'base' },

    // Spectra-One: Standard contrast/base naming
    'spectra-one': { darkBg: 'contrast', lightText: 'base' },

    // Blockbase: Standard contrast/base naming
    blockbase: { darkBg: 'contrast', lightText: 'base' },

    // Twenty Twenty-Four: Standard contrast/base naming
    twentytwentyfour: { darkBg: 'contrast', lightText: 'base' },
};

/**
 * Get the correct footer colors for a given base theme
 * @param baseName - The base theme name (e.g., 'ollie', 'tove', 'frost')
 * @returns ThemeColors object with correct dark background and light text slugs
 */
export function getFooterColors(baseName: string): ThemeColors {
    // Normalize the base name (lowercase, handle variations)
    const normalizedName = baseName.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Look up theme-specific colors, fallback to TT4 defaults
    return THEME_COLOR_MAP[normalizedName] || { darkBg: 'contrast', lightText: 'base' };
}

/**
 * Validate that a color slug exists in theme.json palette
 * This can be used by the validator to catch missing color errors
 */
export function validateColorSlug(slug: string, palette: Array<{ slug: string }>): boolean {
    return palette.some(color => color.slug === slug);
}
