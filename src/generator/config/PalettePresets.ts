/**
 * PalettePresets.ts - TT4-Style Color Palette Definitions
 *
 * Each palette uses the canonical TT4 semantic color slots:
 * base, base-2, contrast, contrast-2, contrast-3, accent, accent-2, accent-3, accent-4, accent-5
 */

// ============================================================================
// TT4 Color Palette Type
// ============================================================================

export interface TT4ColorPalette {
    base: string;           // Page background
    'base-2': string;       // Card/surface backgrounds
    contrast: string;       // Primary text
    'contrast-2': string;   // Secondary/muted text
    'contrast-3': string;   // Borders, dividers
    accent: string;         // Primary brand / CTA
    'accent-2': string;     // Brand light variant
    'accent-3': string;     // Brand dark variant
    'accent-4': string;     // Secondary accent
    'accent-5': string;     // Tertiary accent
}

export type PaletteId =
    | 'brand-kit'
    | 'saas-bright'
    | 'local-biz-soft'
    | 'restaurant-soft'
    | 'ecommerce-bold';

// ============================================================================
// Palette Presets
// ============================================================================

/**
 * Predefined TT4-style palettes for each selectedPaletteId
 * These serve as base colors; user edits and ColorHarmonizer can override values
 */
export const PALETTE_PRESETS: Record<PaletteId, TT4ColorPalette> = {
    /**
     * Brand Kit - User's custom colors (placeholders, replaced at runtime)
     * Uses ColorHarmonizer output for brand colors
     */
    'brand-kit': {
        base: '#ffffff',
        'base-2': '#f9f9f9',
        contrast: '#111111',
        'contrast-2': '#636363',
        'contrast-3': '#A4A4A4',
        accent: '#2563eb',          // Default blue, replaced by user primary
        'accent-2': '#60a5fa',      // Replaced by primary-light
        'accent-3': '#1d4ed8',      // Replaced by primary-dark
        'accent-4': '#8b5cf6',      // Replaced by secondary
        'accent-5': '#f59e0b'       // Replaced by accent
    },

    /**
     * SaaS Bright - Professional purple-gray (Ollie-inspired)
     * Good for: Tech, SaaS, startups, agencies
     */
    'saas-bright': {
        base: '#ffffff',
        'base-2': '#f8f7fc',
        contrast: '#1E1E26',
        'contrast-2': '#545473',
        'contrast-3': '#E3E3F0',
        accent: '#5344F4',          // Bold purple
        'accent-2': '#e9e7ff',      // Light purple tint
        'accent-3': '#3d386b',      // Dark purple
        'accent-4': '#DEC9FF',      // Medium purple
        'accent-5': '#d4d4ec'       // Muted purple-gray
    },

    /**
     * Local Biz Soft - Neutral beige tones (TT4-inspired)
     * Good for: Local businesses, professional services, consultants
     */
    'local-biz-soft': {
        base: '#f9f9f9',
        'base-2': '#ffffff',
        contrast: '#111111',
        'contrast-2': '#636363',
        'contrast-3': '#A4A4A4',
        accent: '#cfcabe',          // Warm beige
        'accent-2': '#c2a990',      // Sandstone
        'accent-3': '#d8613c',      // Rust/terracotta
        'accent-4': '#b1c5a4',      // Sage green
        'accent-5': '#b5bdbc'       // Pastel blue-gray
    },

    /**
     * Restaurant Soft - Warm pastels (Tove-inspired)
     * Good for: Restaurants, cafes, hospitality, food & beverage
     */
    'restaurant-soft': {
        base: '#FBF4EF',            // Warm cream background
        'base-2': '#FFFFFF',
        contrast: '#374AC8',        // Deep indigo-blue
        'contrast-2': '#5a6fd6',    // Medium blue
        'contrast-3': '#000000',
        accent: '#FFC3CF',          // Soft pink (section tint)
        'accent-2': '#FFF3C3',      // Warm yellow (section tint)
        'accent-3': '#2D1B69',      // Deep indigo-purple (hero overlay, dark variant)
        'accent-4': '#C3FFF3',      // Mint green (section tint)
        'accent-5': '#374AC8'       // Blue accent
    },

    /**
     * Ecommerce Bold - Dark green + neon lime (Agency-inspired)
     * Good for: Ecommerce, retail, fashion, bold brands
     */
    'ecommerce-bold': {
        base: '#ffffff',
        'base-2': '#F5F5F0',
        contrast: '#0E0E0E',
        'contrast-2': '#51524e',
        'contrast-3': '#E2E2D9',
        accent: '#495148',          // Dark sage green
        'accent-2': '#e5f0e4',      // Light green tint
        'accent-3': '#44473b',      // Darker green
        'accent-4': '#CEF453',      // Neon lime (pop color)
        'accent-5': '#D0D1CD'       // Neutral gray
    }
};

// ============================================================================
// TT4 Slot Display Names
// ============================================================================

export const TT4_SLOT_NAMES: Record<keyof TT4ColorPalette, string> = {
    'base': 'Base',
    'base-2': 'Base / Two',
    'contrast': 'Contrast',
    'contrast-2': 'Contrast / Two',
    'contrast-3': 'Contrast / Three',
    'accent': 'Accent',
    'accent-2': 'Accent / Two',
    'accent-3': 'Accent / Three',
    'accent-4': 'Accent / Four',
    'accent-5': 'Accent / Five'
};

// ============================================================================
// User Slot to TT4 Mapping
// ============================================================================

/**
 * Maps user-friendly slot names to TT4 semantic slots
 * Used when applying userEditedBrandKit overrides
 */
export const USER_SLOT_TO_TT4: Record<string, keyof TT4ColorPalette> = {
    'primary': 'accent',
    'primary-light': 'accent-2',
    'primary-dark': 'accent-3',
    'secondary': 'accent-4',
    'accent': 'accent-5',
    'background': 'base',
    'surface': 'base-2',
    'text': 'contrast',
    'heading': 'contrast',
    'muted': 'contrast-2',
    'border': 'contrast-3',
    'cta-bg': 'accent',
    'cta-text': 'base'
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a palette by ID with fallback to brand-kit
 */
export function getPaletteById(paletteId: string): TT4ColorPalette {
    return PALETTE_PRESETS[paletteId as PaletteId] || PALETTE_PRESETS['brand-kit'];
}

/**
 * Get display name for a TT4 slot
 */
export function getSlotDisplayName(slot: string): string {
    return TT4_SLOT_NAMES[slot as keyof TT4ColorPalette] || slot;
}
