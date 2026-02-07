import { GeneratorData, ThemePersonality, BaseTheme, BrandKitEdit } from '../types';
import { ColorHarmonizer, HarmonizedPalette } from '../utils/ColorHarmonizer';
import { PATTERN_REGISTRY } from '../config/PatternRegistry';
import { FontProvider, FONT_SIZE_SCALE, FontSizePreset } from '../utils/FontProvider';
import {
    TT4ColorPalette,
    PALETTE_PRESETS,
    TT4_SLOT_NAMES,
    USER_SLOT_TO_TT4,
    getPaletteById,
    getSlotDisplayName
} from '../config/PalettePresets';
import {
    LEGACY_TO_TT4_ALIASES,
    getPersonality
} from '../config/PersonalityTokens';

// ============================================================================
// Design System Token Types
// ============================================================================

export interface GradientPreset {
    slug: string;
    name: string;
    gradient: string;
}

export interface SpacingPreset {
    slug: string;
    name: string;
    size: string;
}

export interface ShadowPreset {
    slug: string;
    name: string;
    shadow: string;
}

export interface ColorPreset {
    slug: string;
    color: string;
    name?: string;
}

export interface FontSizeToken {
    slug: string;
    name: string;
    size: string;
    fluid?: {
        min: string;
        max: string;
    } | false;
}

export interface StyleJSON {
    palette: ColorPreset[];
    gradients: GradientPreset[];
    spacingSizes: SpacingPreset[];
    shadows: ShadowPreset[];
    fontSizes: FontSizeToken[];
    styles: {
        elements?: any;
        color?: {
            text?: string;
            background?: string;
        };
        blocks?: any;
        typography?: any;
    };
    metadata: {
        themeName: string;
        baseTheme: BaseTheme;
        industry?: string;
        paletteId?: string;
        fontProfile?: string;
    };
}

// ============================================================================
// TT4 Spacing Scale (aligned with TT4 structure)
// ============================================================================

/**
 * 6-step TT4-aligned spacing scale using min() for fluid sizing
 */
const TT4_SPACING_SCALE: SpacingPreset[] = [
    { slug: '10', name: '1', size: '1rem' },
    { slug: '20', name: '2', size: 'min(1.5rem, 2vw)' },
    { slug: '30', name: '3', size: 'min(2.5rem, 3vw)' },
    { slug: '40', name: '4', size: 'min(4rem, 5vw)' },
    { slug: '50', name: '5', size: 'min(6.5rem, 8vw)' },
    { slug: '60', name: '6', size: 'min(10.5rem, 13vw)' }
];

/**
 * Shadow presets for depth and elevation
 */
const SHADOW_PRESETS: ShadowPreset[] = [
    { slug: 'sm', name: 'Small', shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    { slug: 'md', name: 'Medium', shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' },
    { slug: 'lg', name: 'Large', shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' },
    { slug: 'xl', name: 'Extra Large', shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }
];

// ============================================================================
// TT4 Token Mapper
// ============================================================================

class TT4TokenMapper {
    /**
     * Map user inputs to TT4-style color palette
     *
     * IMPORTANT: Only override preset colors with harmonized colors when:
     * 1. Using brand-kit palette (user wants custom brand colors)
     * 2. User explicitly provided custom colors (hasUserColors = true)
     */
    static mapToTT4(
        harmonized: HarmonizedPalette,
        selectedPaletteId: string,
        userEditedBrandKit?: BrandKitEdit[],
        hasUserColors?: boolean
    ): ColorPreset[] {
        // Get base palette from presets
        const basePalette = { ...getPaletteById(selectedPaletteId) };

        // ONLY use ColorHarmonizer output when:
        // 1. Palette is brand-kit (which means user wants custom colors from their brand)
        // 2. OR user explicitly provided colors (primary, secondary, accent in input)
        const shouldUseHarmonizedColors = selectedPaletteId === 'brand-kit' || hasUserColors === true;

        if (shouldUseHarmonizedColors) {
            console.log(`[TT4TokenMapper] Using harmonized colors (brand-kit or user-provided)`);
            basePalette['accent'] = harmonized.primary;
            basePalette['accent-2'] = harmonized.primary_light;
            basePalette['accent-3'] = harmonized.primary_dark;
            basePalette['accent-4'] = harmonized.secondary;
            basePalette['accent-5'] = harmonized.accent;
            // Also override base/contrast for brand-kit
            if (selectedPaletteId === 'brand-kit') {
                basePalette['base'] = harmonized.base;
                basePalette['contrast'] = harmonized.main;
            }
        } else {
            console.log(`[TT4TokenMapper] Using preset palette colors for: ${selectedPaletteId}`);
        }

        // Apply user overrides if provided
        if (userEditedBrandKit && userEditedBrandKit.length > 0) {
            for (const edit of userEditedBrandKit) {
                const tt4Slot = USER_SLOT_TO_TT4[edit.slot];
                if (tt4Slot && basePalette[tt4Slot]) {
                    basePalette[tt4Slot] = edit.hex;
                    console.log(`[TT4TokenMapper] Applied user override: ${edit.slot} -> ${tt4Slot} = ${edit.hex}`);
                }
            }
        }

        // Convert to ColorPreset array
        const tt4Colors: ColorPreset[] = Object.entries(basePalette).map(([slug, color]) => ({
            slug,
            color,
            name: getSlotDisplayName(slug)
        }));

        console.log(`[TT4TokenMapper] Generated ${tt4Colors.length} TT4 color tokens from palette: ${selectedPaletteId}`);
        return tt4Colors;
    }

    /**
     * Generate legacy alias colors for backward compatibility
     * These allow existing patterns using 'primary', 'background', etc. to work
     */
    static generateLegacyAliases(tt4Palette: ColorPreset[]): ColorPreset[] {
        const tt4BySlug = new Map(tt4Palette.map(p => [p.slug, p.color]));
        const aliases: ColorPreset[] = [];
        const seenSlugs = new Set(tt4Palette.map(p => p.slug));

        for (const [legacySlug, tt4Slot] of Object.entries(LEGACY_TO_TT4_ALIASES)) {
            // Skip if this slug already exists in TT4 palette
            if (seenSlugs.has(legacySlug)) continue;

            const color = tt4BySlug.get(tt4Slot);
            if (color) {
                aliases.push({
                    slug: legacySlug,
                    color,
                    name: legacySlug.charAt(0).toUpperCase() + legacySlug.slice(1).replace(/-/g, ' ')
                });
            }
        }

        console.log(`[TT4TokenMapper] Generated ${aliases.length} legacy alias tokens`);
        return aliases;
    }
}

// ============================================================================
// Gradient Generator (TT4-aligned)
// ============================================================================

function generateGradients(): GradientPreset[] {
    return [
        {
            slug: 'gradient-1',
            name: 'Accent Fade',
            gradient: 'linear-gradient(180deg, var(--wp--preset--color--accent) 0%, var(--wp--preset--color--accent-3) 100%)'
        },
        {
            slug: 'gradient-2',
            name: 'Hero Overlay',
            gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%)'
        },
        {
            slug: 'gradient-3',
            name: 'Accent Glow',
            gradient: 'linear-gradient(135deg, var(--wp--preset--color--accent) 0%, var(--wp--preset--color--accent-5) 100%)'
        },
        {
            slug: 'gradient-4',
            name: 'Surface Subtle',
            gradient: 'linear-gradient(180deg, var(--wp--preset--color--base-2) 0%, var(--wp--preset--color--base) 100%)'
        },
        {
            slug: 'gradient-5',
            name: 'Contrast Fade',
            gradient: 'linear-gradient(180deg, var(--wp--preset--color--contrast) 50%, var(--wp--preset--color--base) 50%)'
        }
    ];
}

// ============================================================================
// Utility Colors
// ============================================================================

function generateUtilityColors(): ColorPreset[] {
    return [
        { slug: 'success', color: '#22c55e', name: 'Success' },
        { slug: 'warning', color: '#f59e0b', name: 'Warning' },
        { slug: 'error', color: '#ef4444', name: 'Error' },
        { slug: 'info', color: '#3b82f6', name: 'Info' }
    ];
}

// ============================================================================
// StyleBuilder Class
// ============================================================================

export class StyleBuilder {
    invoke(baseTheme: BaseTheme, userData: GeneratorData): StyleJSON {
        console.log(`[StyleBuilder] Building TT4-aligned styles for: ${baseTheme}`);

        const patternPersonality = PATTERN_REGISTRY[baseTheme];
        const themePersonality = getPersonality(baseTheme);
        const themeName = userData.name || `PressPilot ${baseTheme}`;
        const industry = userData.industry || 'general';

        // Get Studio UI inputs with defaults
        const selectedPaletteId = userData.selectedPaletteId || themePersonality.defaultPalette || 'brand-kit';
        const userEditedBrandKit = userData.userEditedBrandKit;
        const fontProfile = userData.fontProfile || FontProvider.getFontPairForIndustry(industry).personality.toLowerCase().split(',')[0] as any;

        console.log(`[StyleBuilder] Palette: ${selectedPaletteId}, Font Profile: ${fontProfile}`);

        // Get font pair based on fontProfile or industry
        const fontPair = userData.fontProfile
            ? FontProvider.getFontPairByPersonality(userData.fontProfile)
            : FontProvider.getFontPairForIndustry(industry);
        console.log(`[StyleBuilder] Using font pair: ${fontPair.personality}`);

        let palette: ColorPreset[] = [];
        let gradients: GradientPreset[] = [];
        let styles: any = {};

        // Get TT4-aligned font sizes
        const fontSizes: FontSizeToken[] = FontProvider.getTT4FontSizeScale();

        // Generate color palette
        if (userData.primary || selectedPaletteId !== 'brand-kit') {
            // Check if user explicitly provided custom colors
            const hasUserColors = Boolean(userData.primary || userData.secondary || userData.accent);

            // Generate harmonized palette from user colors (or use defaults)
            const harmonized = ColorHarmonizer.generatePalette(
                userData.primary || '#2563eb',
                userData.secondary,
                userData.accent
            );

            // Map to TT4 tokens - only use harmonized colors for brand-kit or when user provided colors
            const tt4Palette = TT4TokenMapper.mapToTT4(harmonized, selectedPaletteId, userEditedBrandKit, hasUserColors);

            // Generate legacy aliases for backward compatibility
            const legacyAliases = TT4TokenMapper.generateLegacyAliases(tt4Palette);

            // Combine: TT4 tokens first, then legacy aliases, then utilities
            palette = [
                ...tt4Palette,
                ...legacyAliases,
                ...generateUtilityColors()
            ];

            // Deduplicate by slug (first occurrence wins)
            const seen = new Set<string>();
            palette = palette.filter(c => {
                if (seen.has(c.slug)) return false;
                seen.add(c.slug);
                return true;
            });

            // Generate gradients using TT4 token references
            gradients = generateGradients();

            // Generate styles using TT4 color references
            styles = this.generateStyles(themePersonality);
        }

        return {
            palette,
            gradients,
            spacingSizes: TT4_SPACING_SCALE,
            shadows: SHADOW_PRESETS,
            fontSizes,
            styles,
            metadata: {
                themeName,
                baseTheme,
                industry,
                paletteId: selectedPaletteId,
                fontProfile
            }
        };
    }

    /**
     * Generate element and block styles using TT4 token references
     */
    private generateStyles(personality: any): any {
        return {
            elements: {
                // NOTE: Heading colors intentionally NOT set here to allow
                // block-level textColor attributes to take effect (e.g., hero sections).
                // Headings inherit color from styles.color.text (contrast) by default.
                h1: {
                    typography: {
                        fontSize: 'var:preset|font-size|xx-large',
                        lineHeight: '1.15',
                        letterSpacing: personality?.headingStyle?.letterSpacing || '-0.02em'
                    }
                },
                h2: {
                    typography: {
                        fontSize: 'var:preset|font-size|x-large',
                        lineHeight: '1.2',
                        letterSpacing: '-0.01em'
                    }
                },
                h3: {
                    typography: {
                        fontSize: 'var:preset|font-size|large',
                        lineHeight: '1.25'
                    }
                },
                h4: {
                    typography: {
                        lineHeight: '1.3'
                    }
                },
                h5: {
                    typography: {
                        fontSize: 'var:preset|font-size|medium',
                        lineHeight: '1.4'
                    }
                },
                h6: {
                    typography: {
                        fontSize: 'var:preset|font-size|small',
                        lineHeight: '1.4'
                    }
                },
                link: {
                    color: { text: 'var:preset|color|accent' },
                    ':hover': {
                        color: { text: 'var:preset|color|accent-3' }
                    }
                },
                caption: {
                    typography: {
                        fontSize: 'var:preset|font-size|small',
                        lineHeight: '1.4'
                    },
                    color: { text: 'var:preset|color|contrast-2' }
                },
                button: {
                    color: {
                        background: 'var:preset|color|accent',
                        text: 'var:preset|color|base'
                    },
                    ':hover': {
                        color: {
                            background: 'var:preset|color|accent-3'
                        }
                    },
                    ':active': {
                        color: {
                            background: 'var:preset|color|accent-3'
                        }
                    }
                }
            },
            color: {
                text: 'var:preset|color|contrast',
                background: 'var:preset|color|base'
            },
            typography: {
                fontSize: 'var:preset|font-size|medium',
                lineHeight: '1.55'
            },
            // Block-specific styling
            blocks: {
                'core/site-logo': {
                    border: { radius: '0px' }
                },
                'core/button': {
                    border: {
                        radius: personality?.buttonStyle?.borderRadius || '0.33rem'
                    },
                    typography: {
                        fontWeight: personality?.buttonStyle?.fontWeight || '500',
                        letterSpacing: '0.02em'
                    },
                    color: {
                        background: 'var:preset|color|accent',
                        text: 'var:preset|color|base'
                    }
                },
                'core/navigation': {
                    typography: {
                        fontWeight: '500'
                    },
                    elements: {
                        link: {
                            ':hover': {
                                typography: {
                                    textDecoration: 'underline'
                                }
                            },
                            typography: {
                                textDecoration: 'none'
                            }
                        }
                    }
                },
                'core/quote': {
                    border: {
                        radius: 'var:preset|spacing|20'
                    },
                    color: {
                        background: 'var:preset|color|base-2'
                    }
                },
                'core/separator': {
                    color: {
                        text: 'var:preset|color|contrast-3'
                    }
                },
                'core/post-title': {
                    elements: {
                        link: {
                            ':hover': {
                                typography: {
                                    textDecoration: 'underline'
                                }
                            },
                            typography: {
                                textDecoration: 'none'
                            }
                        }
                    }
                }
            }
        };
    }
}
