/**
 * PressPilot Color Mapping Registry
 * 
 * DYNAMIC color detection from theme.json palettes.
 * Finds darkest/lightest colors automatically for guaranteed contrast.
 */

export interface ThemeColors {
    darkBg: string;      // Dark background color slug
    lightText: string;   // Light text color slug for contrast
}

/**
 * Calculate relative luminance of a hex color
 * Used to determine if a color is "dark" or "light"
 */
function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0.5;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Analyze a theme's palette and find best dark/light color pair
 */
export function analyzeThemePalette(palette: Array<{ slug: string; color: string }>): ThemeColors {
    if (!palette || palette.length === 0) {
        return { darkBg: 'contrast', lightText: 'base' };
    }

    // Calculate luminance for each color
    const analyzed = palette.map(c => ({
        slug: c.slug,
        color: c.color,
        luminance: getLuminance(c.color)
    }));

    // Sort by luminance (darkest first)
    analyzed.sort((a, b) => a.luminance - b.luminance);

    // Darkest color for backgrounds
    const darkest = analyzed[0];
    // Lightest color for text
    const lightest = analyzed[analyzed.length - 1];

    // Ensure good contrast (luminance difference > 0.5)
    if (lightest.luminance - darkest.luminance < 0.4) {
        // Fallback to safe defaults if palette lacks contrast
        return { darkBg: 'contrast', lightText: 'base' };
    }

    return {
        darkBg: darkest.slug,
        lightText: lightest.slug
    };
}

/**
 * Theme-specific OVERRIDES only when auto-detection fails
 * These are manually verified fallbacks
 */
const THEME_OVERRIDES: Record<string, ThemeColors> = {
    // Only add overrides if auto-detection produces bad results
};

/**
 * Get colors for a theme - tries auto-detection first, then overrides, then defaults
 */
export function getFooterColors(baseName: string, palette?: Array<{ slug: string; color: string }>): ThemeColors {
    const normalizedName = baseName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // If palette provided, analyze it dynamically
    if (palette && palette.length > 0) {
        return analyzeThemePalette(palette);
    }
    
    // Check for manual overrides
    if (THEME_OVERRIDES[normalizedName]) {
        return THEME_OVERRIDES[normalizedName];
    }
    
    // Safe defaults
    return { darkBg: 'contrast', lightText: 'base' };
}

/**
 * Validate that a color slug exists in theme.json palette
 */
export function validateColorSlug(slug: string, palette: Array<{ slug: string }>): boolean {
    return palette.some(color => color.slug === slug);
}
