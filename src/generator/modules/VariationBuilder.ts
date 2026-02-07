/**
 * VariationBuilder - TT4-Aligned Style Variation Generator
 *
 * Generates WordPress FSE style variations using TT4 semantic token slots.
 * Each variation offers a different color mood that users can switch between
 * in the Site Editor.
 *
 * TT4 Color Slots: base, base-2, contrast, contrast-2, contrast-3,
 *                  accent, accent-2, accent-3, accent-4, accent-5
 */

import fs from 'fs-extra';
import path from 'path';
import { Mood } from '../types';
import { TT4ColorPalette, getSlotDisplayName } from '../config/PalettePresets';
import { LEGACY_TO_TT4_ALIASES } from '../config/PersonalityTokens';

// ============================================================================
// Style Variation Types (TT4-Aligned)
// ============================================================================

export interface StyleVariation {
    slug: string;
    title: string;
    description: string;
    settings: {
        color: {
            palette: Array<{
                slug: string;
                color: string;
                name: string;
            }>;
        };
    };
    styles: {
        color: {
            background: string;
            text: string;
        };
        elements?: {
            button?: any;
            link?: any;
            heading?: any;
        };
    };
}

export interface VariationConfig {
    slug: Mood;
    title: string;
    description: string;
    palette: TT4ColorPalette;
}

// ============================================================================
// TT4-Aligned Variation Presets
// ============================================================================

/**
 * Complete TT4-style palettes for each mood variation.
 * Each palette defines all 10 semantic color slots.
 */
const VARIATION_PALETTES: Record<Mood, VariationConfig> = {
    /**
     * Warm - Amber and terracotta tones
     * Good for: Hospitality, food, lifestyle brands
     */
    warm: {
        slug: 'warm',
        title: 'Warm',
        description: 'Warm tones with amber and terracotta accents',
        palette: {
            base: '#FFFBF5',
            'base-2': '#FFF7ED',
            contrast: '#292524',
            'contrast-2': '#78716C',
            'contrast-3': '#D6D3D1',
            accent: '#D97706',          // Amber
            'accent-2': '#FCD34D',      // Amber light
            'accent-3': '#B45309',      // Amber dark
            'accent-4': '#DC2626',      // Red secondary
            'accent-5': '#EA580C'       // Orange tertiary
        }
    },

    /**
     * Fresh - Teal and green tones
     * Good for: Health, nature, wellness brands
     */
    fresh: {
        slug: 'fresh',
        title: 'Fresh',
        description: 'Cool, fresh palette with teal and green tones',
        palette: {
            base: '#F0FDFA',
            'base-2': '#FFFFFF',
            contrast: '#134E4A',
            'contrast-2': '#5EEAD4',
            'contrast-3': '#99F6E4',
            accent: '#059669',          // Emerald
            'accent-2': '#6EE7B7',      // Emerald light
            'accent-3': '#047857',      // Emerald dark
            'accent-4': '#0891B2',      // Cyan secondary
            'accent-5': '#14B8A6'       // Teal tertiary
        }
    },

    /**
     * Minimal - Clean grayscale
     * Good for: Professional services, tech, portfolios
     */
    minimal: {
        slug: 'minimal',
        title: 'Minimal',
        description: 'Clean, minimal grayscale palette',
        palette: {
            base: '#FFFFFF',
            'base-2': '#F9FAFB',
            contrast: '#111827',
            'contrast-2': '#6B7280',
            'contrast-3': '#E5E7EB',
            accent: '#374151',          // Gray-700
            'accent-2': '#9CA3AF',      // Gray-400
            'accent-3': '#1F2937',      // Gray-800
            'accent-4': '#4B5563',      // Gray-600
            'accent-5': '#6B7280'       // Gray-500
        }
    },

    /**
     * Dark - Dark mode with light text
     * Good for: Tech, gaming, creative agencies
     */
    dark: {
        slug: 'dark',
        title: 'Dark Mode',
        description: 'Dark theme with light text',
        palette: {
            base: '#0F172A',            // Slate-900
            'base-2': '#1E293B',        // Slate-800
            contrast: '#F1F5F9',        // Slate-100
            'contrast-2': '#94A3B8',    // Slate-400
            'contrast-3': '#334155',    // Slate-700
            accent: '#60A5FA',          // Blue-400
            'accent-2': '#93C5FD',      // Blue-300
            'accent-3': '#3B82F6',      // Blue-500
            'accent-4': '#A78BFA',      // Purple-400
            'accent-5': '#818CF8'       // Indigo-400
        }
    }
};

// ============================================================================
// VariationBuilder Class (TT4-Aligned)
// ============================================================================

export class VariationBuilder {
    /**
     * Generate all style variations for a theme
     * All 4 variations (warm, fresh, minimal, dark) are generated and shipped with every theme.
     * Users can switch between them in the WordPress Site Editor.
     */
    static generateVariations(): StyleVariation[] {
        const variations: StyleVariation[] = [];
        const moods: Mood[] = ['warm', 'fresh', 'minimal', 'dark'];

        for (const mood of moods) {
            const config = VARIATION_PALETTES[mood];
            const variation = this.buildVariation(config);
            variations.push(variation);
        }

        console.log(`[VariationBuilder] Generated ${variations.length} TT4-aligned style variations`);
        return variations;
    }

    /**
     * Build a single style variation using TT4 token structure
     */
    private static buildVariation(config: VariationConfig): StyleVariation {
        // Build TT4 color palette
        const tt4Palette = Object.entries(config.palette).map(([slug, color]) => ({
            slug,
            color,
            name: getSlotDisplayName(slug)
        }));

        // Generate legacy aliases for backward compatibility
        const legacyAliases = this.generateLegacyAliases(config.palette);

        // Combine: TT4 tokens first, then legacy aliases
        const fullPalette = [...tt4Palette, ...legacyAliases];

        // Deduplicate by slug (TT4 tokens take precedence)
        const seen = new Set<string>();
        const palette = fullPalette.filter(c => {
            if (seen.has(c.slug)) return false;
            seen.add(c.slug);
            return true;
        });

        return {
            slug: config.slug,
            title: config.title,
            description: config.description,
            settings: {
                color: { palette }
            },
            styles: {
                color: {
                    background: 'var(--wp--preset--color--base)',
                    text: 'var(--wp--preset--color--contrast)'
                },
                elements: {
                    button: {
                        color: {
                            background: 'var(--wp--preset--color--accent)',
                            text: 'var(--wp--preset--color--base)'
                        },
                        ':hover': {
                            color: {
                                background: 'var(--wp--preset--color--accent-3)'
                            }
                        }
                    },
                    link: {
                        color: {
                            text: 'var(--wp--preset--color--accent)'
                        },
                        ':hover': {
                            color: {
                                text: 'var(--wp--preset--color--accent-3)'
                            }
                        }
                    },
                    heading: {
                        color: {
                            text: 'var(--wp--preset--color--contrast)'
                        }
                    }
                }
            }
        };
    }

    /**
     * Generate legacy alias colors for backward compatibility
     * Maps old token names to TT4 slot values
     */
    private static generateLegacyAliases(tt4Palette: TT4ColorPalette): Array<{ slug: string; color: string; name: string }> {
        const aliases: Array<{ slug: string; color: string; name: string }> = [];
        const tt4Slots = new Set(Object.keys(tt4Palette));

        for (const [legacySlug, tt4Slot] of Object.entries(LEGACY_TO_TT4_ALIASES)) {
            // Skip if this legacy slug already exists as a TT4 slot
            if (tt4Slots.has(legacySlug)) continue;

            const color = tt4Palette[tt4Slot as keyof TT4ColorPalette];
            if (color) {
                aliases.push({
                    slug: legacySlug,
                    color,
                    name: legacySlug.charAt(0).toUpperCase() + legacySlug.slice(1).replace(/-/g, ' ')
                });
            }
        }

        return aliases;
    }

    /**
     * Write style variations to the theme's styles directory
     * @param themeDir - Theme directory path
     * @param variations - Array of variations to write
     */
    static async writeVariations(
        themeDir: string,
        variations: StyleVariation[]
    ): Promise<void> {
        const stylesDir = path.join(themeDir, 'styles');

        // Create styles directory if it doesn't exist
        await fs.ensureDir(stylesDir);

        for (const variation of variations) {
            const variationPath = path.join(stylesDir, `${variation.slug}.json`);

            // Build the variation JSON structure
            const variationJson: any = {
                $schema: 'https://schemas.wp.org/wp/6.5/theme.json',
                version: 2,
                title: variation.title,
                settings: variation.settings,
                styles: variation.styles
            };

            await fs.writeJson(variationPath, variationJson, { spaces: 4 });
            console.log(`[VariationBuilder] Created style variation: ${variation.slug}.json`);
        }

        console.log(`[VariationBuilder] Wrote ${variations.length} style variations to theme.`);
    }

    /**
     * Get variation names for logging/metadata
     */
    static getVariationNames(): string[] {
        return Object.values(VARIATION_PALETTES).map(p => p.title);
    }

    /**
     * Get a specific variation palette by mood
     */
    static getVariationPalette(mood: Mood): TT4ColorPalette {
        return VARIATION_PALETTES[mood].palette;
    }
}
