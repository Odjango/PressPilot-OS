import type { BrandMode, FontProfile, PaletteId } from '../types';

export interface BrandModeConfig {
    mode: BrandMode;
    personality: string;
    colorPaletteApproach: string;
    defaultPaletteId: PaletteId;
    defaultFontProfile: FontProfile;
    fontPairing: {
        heading: string;
        body: string;
    };
    radiusScale: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        pill: string;
    };
    shadowIntensity: {
        level: 'none' | 'subtle' | 'medium' | 'strong';
        presets: Array<'none' | 'sm' | 'md' | 'lg'>;
    };
}

export const BRAND_MODE_CONFIG: Record<BrandMode, BrandModeConfig> = {
    modern: {
        mode: 'modern',
        personality: 'Clean, professional',
        colorPaletteApproach: 'Neutral base with one crisp accent color',
        defaultPaletteId: 'saas-bright',
        defaultFontProfile: 'modern',
        fontPairing: {
            heading: 'Inter',
            body: 'Inter'
        },
        radiusScale: {
            none: '0px',
            sm: '2px',
            md: '4px',
            lg: '8px',
            pill: '999px'
        },
        shadowIntensity: {
            level: 'subtle',
            presets: ['sm', 'md']
        }
    },
    playful: {
        mode: 'playful',
        personality: 'Fun, friendly',
        colorPaletteApproach: 'Bright warm palette with lively accents',
        defaultPaletteId: 'restaurant-soft',
        defaultFontProfile: 'friendly',
        fontPairing: {
            heading: 'Instrument Sans',
            body: 'Inter'
        },
        radiusScale: {
            none: '0px',
            sm: '12px',
            md: '16px',
            lg: '20px',
            pill: '999px'
        },
        shadowIntensity: {
            level: 'medium',
            presets: ['sm', 'md', 'lg']
        }
    },
    bold: {
        mode: 'bold',
        personality: 'Strong, confident',
        colorPaletteApproach: 'High-contrast palette with assertive accents',
        defaultPaletteId: 'ecommerce-bold',
        defaultFontProfile: 'bold',
        fontPairing: {
            heading: 'Jost',
            body: 'Inter'
        },
        radiusScale: {
            none: '0px',
            sm: '2px',
            md: '8px',
            lg: '14px',
            pill: '999px'
        },
        shadowIntensity: {
            level: 'strong',
            presets: ['md', 'lg']
        }
    },
    minimal: {
        mode: 'minimal',
        personality: 'Simple, elegant',
        colorPaletteApproach: 'Monochrome base with subtle accent support',
        defaultPaletteId: 'local-biz-soft',
        defaultFontProfile: 'elegant',
        fontPairing: {
            heading: 'Cardo',
            body: 'Inter'
        },
        radiusScale: {
            none: '0px',
            sm: '2px',
            md: '4px',
            lg: '6px',
            pill: '999px'
        },
        shadowIntensity: {
            level: 'none',
            presets: ['none', 'sm']
        }
    }
};

export function isBrandMode(value: string | undefined): value is BrandMode {
    if (!value) return false;
    return value in BRAND_MODE_CONFIG;
}

export function resolveBrandMode(raw: unknown, fallback: BrandMode = 'modern'): BrandMode {
    if (typeof raw !== 'string') {
        return fallback;
    }

    const normalized = raw.toLowerCase();
    return isBrandMode(normalized) ? normalized : fallback;
}
