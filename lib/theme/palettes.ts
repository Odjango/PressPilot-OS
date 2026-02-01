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
