/**
 * TT4-Aligned Palette Presets for Studio UI
 *
 * These IDs match the backend PalettePresets.ts:
 * - brand-kit: User's custom colors
 * - saas-bright: Professional purple-gray (Ollie-inspired)
 * - local-biz-soft: Neutral beige tones (TT4-inspired)
 * - restaurant-soft: Warm pastels (Tove-inspired)
 * - ecommerce-bold: Dark green + neon lime (Agency-inspired)
 */

export interface PaletteColor {
    slug: string;
    color: string;
    name: string;
}

export interface Palette {
    id: string;
    label: string;
    description: string;
    colors: PaletteColor[];
}

/**
 * TT4-aligned palette IDs that match the backend
 */
export type TT4PaletteId = 'brand-kit' | 'saas-bright' | 'local-biz-soft' | 'restaurant-soft' | 'ecommerce-bold';

export const PALETTES: Palette[] = [
    {
        id: 'saas-bright',
        label: 'SaaS Bright',
        description: 'Professional purple-gray for tech & startups',
        colors: [
            { slug: 'base', color: '#ffffff', name: 'Base' },
            { slug: 'base-2', color: '#f8f7fc', name: 'Base 2' },
            { slug: 'contrast', color: '#1E1E26', name: 'Contrast' },
            { slug: 'accent', color: '#5344F4', name: 'Accent' },
            { slug: 'accent-4', color: '#DEC9FF', name: 'Secondary' }
        ]
    },
    {
        id: 'local-biz-soft',
        label: 'Local Biz Soft',
        description: 'Neutral beige tones for professional services',
        colors: [
            { slug: 'base', color: '#f9f9f9', name: 'Base' },
            { slug: 'base-2', color: '#ffffff', name: 'Base 2' },
            { slug: 'contrast', color: '#111111', name: 'Contrast' },
            { slug: 'accent', color: '#cfcabe', name: 'Accent' },
            { slug: 'accent-3', color: '#d8613c', name: 'Accent Dark' }
        ]
    },
    {
        id: 'restaurant-soft',
        label: 'Restaurant Soft',
        description: 'Warm pastels for hospitality & food',
        colors: [
            { slug: 'base', color: '#FBF4EF', name: 'Base' },
            { slug: 'base-2', color: '#FFFFFF', name: 'Base 2' },
            { slug: 'contrast', color: '#374AC8', name: 'Contrast' },
            { slug: 'accent', color: '#FFC3CF', name: 'Accent' },
            { slug: 'accent-4', color: '#C3FFF3', name: 'Secondary' }
        ]
    },
    {
        id: 'ecommerce-bold',
        label: 'E-Commerce Bold',
        description: 'Bold green + lime for retail & fashion',
        colors: [
            { slug: 'base', color: '#ffffff', name: 'Base' },
            { slug: 'base-2', color: '#F5F5F0', name: 'Base 2' },
            { slug: 'contrast', color: '#0E0E0E', name: 'Contrast' },
            { slug: 'accent', color: '#495148', name: 'Accent' },
            { slug: 'accent-4', color: '#CEF453', name: 'Pop Color' }
        ]
    }
];

/**
 * Mood options for style variations
 * Maps to backend Mood type
 */
export type TT4Mood = 'warm' | 'fresh' | 'minimal' | 'dark';

export interface MoodOption {
    id: TT4Mood;
    label: string;
    description: string;
    icon: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
    { id: 'warm', label: 'Warm', description: 'Amber and terracotta tones', icon: '🌅' },
    { id: 'fresh', label: 'Fresh', description: 'Teal and green tones', icon: '🌿' },
    { id: 'minimal', label: 'Minimal', description: 'Clean grayscale', icon: '◻️' },
    { id: 'dark', label: 'Dark', description: 'Dark mode theme', icon: '🌙' }
];

/**
 * Hero layout options for homepage hero section
 * Maps to backend HeroLayout type
 */
export type TT4HeroLayout = 'fullBleed' | 'fullWidth' | 'split' | 'minimal';

export interface HeroLayoutOption {
    id: TT4HeroLayout;
    label: string;
    description: string;
    icon: string;
}

export const HERO_LAYOUT_OPTIONS: HeroLayoutOption[] = [
    { id: 'fullBleed', label: 'Full-Bleed Hero', description: 'Image fills the top of the page', icon: '🖼️' },
    { id: 'fullWidth', label: 'Full-Width Band', description: 'Bold hero band below header', icon: '📐' },
    { id: 'split', label: 'Split Hero', description: 'Text and image side by side', icon: '⬛' },
    { id: 'minimal', label: 'Minimal', description: 'Clean text-only hero', icon: '📝' }
];

export function getHeroLayoutById(id: string): HeroLayoutOption | undefined {
    return HERO_LAYOUT_OPTIONS.find(h => h.id === id);
}

/**
 * Brand style options for restaurant vertical
 * Controls base theme selection: Tove (playful) vs Frost (modern)
 */
export type TT4BrandStyle = 'playful' | 'modern';

export interface BrandStyleOption {
    id: TT4BrandStyle;
    label: string;
    description: string;
    icon: string;
    coreTheme: string;
}

export const BRAND_STYLE_OPTIONS: BrandStyleOption[] = [
    {
        id: 'playful',
        label: 'Playful & Warm',
        description: 'Colorful, inviting feel for cafes, bakeries, family restaurants',
        icon: '🎨',
        coreTheme: 'tove'
    },
    {
        id: 'modern',
        label: 'Modern & Minimal',
        description: 'Clean, photo-driven look for upscale dining, contemporary venues',
        icon: '✨',
        coreTheme: 'frost'
    }
];

export function getBrandStyleById(id: string): BrandStyleOption | undefined {
    return BRAND_STYLE_OPTIONS.find(s => s.id === id);
}

/**
 * Font profile options
 * Maps to backend FontProfile type
 */
export type TT4FontProfile = 'elegant' | 'modern' | 'bold' | 'friendly';

export interface FontProfileOption {
    id: TT4FontProfile;
    label: string;
    description: string;
    headingFont: string;
    bodyFont: string;
}

export const FONT_PROFILE_OPTIONS: FontProfileOption[] = [
    { id: 'elegant', label: 'Elegant Serif', description: 'Refined, upscale feel', headingFont: 'Cardo', bodyFont: 'Inter' },
    { id: 'modern', label: 'Clean Sans', description: 'Tech, minimal look', headingFont: 'Inter', bodyFont: 'Inter' },
    { id: 'bold', label: 'Bold Impact', description: 'Attention-grabbing', headingFont: 'Jost', bodyFont: 'Inter' },
    { id: 'friendly', label: 'Friendly Round', description: 'Approachable, warm', headingFont: 'Instrument Sans', bodyFont: 'Inter' }
];

export function getPaletteById(id: string): Palette | undefined {
    return PALETTES.find(p => p.id === id);
}

export function getMoodById(id: string): MoodOption | undefined {
    return MOOD_OPTIONS.find(m => m.id === id);
}

export function getFontProfileById(id: string): FontProfileOption | undefined {
    return FONT_PROFILE_OPTIONS.find(f => f.id === id);
}

// ============================================================================
// Mood Palettes for Live Preview
// Matches backend src/generator/modules/VariationBuilder.ts VARIATION_PALETTES
// ============================================================================

/**
 * Complete TT4-style palettes for each mood variation.
 * Used by the Studio live preview to show mood changes in real-time.
 */
export const MOOD_PALETTES: Record<TT4Mood, {
    base: string;
    'base-2': string;
    contrast: string;
    'contrast-2': string;
    'contrast-3': string;
    accent: string;
    'accent-2': string;
    'accent-3': string;
}> = {
    warm: {
        base: '#FFFBF5',
        'base-2': '#FFF7ED',
        contrast: '#292524',
        'contrast-2': '#78716C',
        'contrast-3': '#D6D3D1',
        accent: '#D97706',
        'accent-2': '#FCD34D',
        'accent-3': '#B45309'
    },
    fresh: {
        base: '#F0FDFA',
        'base-2': '#FFFFFF',
        contrast: '#134E4A',
        'contrast-2': '#5EEAD4',
        'contrast-3': '#99F6E4',
        accent: '#059669',
        'accent-2': '#6EE7B7',
        'accent-3': '#047857'
    },
    minimal: {
        base: '#FFFFFF',
        'base-2': '#F9FAFB',
        contrast: '#111827',
        'contrast-2': '#6B7280',
        'contrast-3': '#E5E7EB',
        accent: '#374151',
        'accent-2': '#9CA3AF',
        'accent-3': '#1F2937'
    },
    dark: {
        base: '#0F172A',
        'base-2': '#1E293B',
        contrast: '#F1F5F9',
        'contrast-2': '#94A3B8',
        'contrast-3': '#334155',
        accent: '#60A5FA',
        'accent-2': '#93C5FD',
        'accent-3': '#3B82F6'
    }
};

// ============================================================================
// Preview Colors Helper
// ============================================================================

export interface PreviewColors {
    base: string;
    base2: string;
    contrast: string;
    contrast2: string;
    contrast3: string;
    accent: string;
    accent2: string;
    accent3: string;
}

/**
 * Get preview colors for the Studio live preview panel.
 *
 * Priority:
 * 1. If mood is not 'minimal' (default), use MOOD_PALETTES[mood]
 * 2. If palette is selected (not brand), use PALETTES colors
 * 3. If brand-kit, use logoColors
 * 4. Fallback to minimal mood
 */
export function getPreviewColors(
    paletteId: string | null,
    mood: TT4Mood,
    logoColors?: string[]
): PreviewColors {
    // If mood is not minimal (default), mood takes priority for preview
    if (mood !== 'minimal') {
        const moodPalette = MOOD_PALETTES[mood];
        return {
            base: moodPalette.base,
            base2: moodPalette['base-2'],
            contrast: moodPalette.contrast,
            contrast2: moodPalette['contrast-2'],
            contrast3: moodPalette['contrast-3'],
            accent: moodPalette.accent,
            accent2: moodPalette['accent-2'],
            accent3: moodPalette['accent-3']
        };
    }

    // If palette selected (not brand-kit), use palette colors
    if (paletteId && paletteId !== 'brand' && paletteId !== 'brand-kit') {
        const palette = PALETTES.find(p => p.id === paletteId);
        if (palette) {
            const getColor = (slug: string) => palette.colors.find(c => c.slug === slug)?.color;
            return {
                base: getColor('base') || '#ffffff',
                base2: getColor('base-2') || '#f9f9f9',
                contrast: getColor('contrast') || '#111111',
                contrast2: '#6B7280',
                contrast3: '#E5E7EB',
                accent: getColor('accent') || '#374151',
                accent2: getColor('accent-4') || '#9CA3AF',
                accent3: getColor('accent-3') || '#1F2937'
            };
        }
    }

    // If brand-kit with logo colors
    if ((paletteId === 'brand' || paletteId === 'brand-kit') && logoColors && logoColors.length >= 3) {
        return {
            base: '#ffffff',
            base2: '#f9f9f9',
            contrast: '#111111',
            contrast2: '#6B7280',
            contrast3: '#E5E7EB',
            accent: logoColors[0],
            accent2: logoColors[2],
            accent3: logoColors[1]
        };
    }

    // Fallback to minimal mood palette
    return {
        base: MOOD_PALETTES.minimal.base,
        base2: MOOD_PALETTES.minimal['base-2'],
        contrast: MOOD_PALETTES.minimal.contrast,
        contrast2: MOOD_PALETTES.minimal['contrast-2'],
        contrast3: MOOD_PALETTES.minimal['contrast-3'],
        accent: MOOD_PALETTES.minimal.accent,
        accent2: MOOD_PALETTES.minimal['accent-2'],
        accent3: MOOD_PALETTES.minimal['accent-3']
    };
}
