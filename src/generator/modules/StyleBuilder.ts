import { GeneratorData, ThemePersonality, BaseTheme } from '../types';
import { ColorHarmonizer } from '../utils/ColorHarmonizer';
import { PATTERN_REGISTRY } from '../config/PatternRegistry';

export interface StyleJSON {
    palette: Array<{ slug: string; color: string }>;
    styles: {
        elements?: any;
        color?: {
            text?: string;
            background?: string;
        };
    };
    metadata: {
        themeName: string;
        baseTheme: BaseTheme;
    };
}

export class StyleBuilder {
    invoke(baseTheme: BaseTheme, userData: GeneratorData): StyleJSON {
        console.log(`[StyleBuilder] Building styles for: ${baseTheme}`);

        const personality = PATTERN_REGISTRY[baseTheme];
        const themeName = userData.name || `PressPilot ${baseTheme}`;

        let palette: Array<{ slug: string; color: string }> = [];
        let styles: any = {};

        if (userData.primary && personality) {
            const harmonized = ColorHarmonizer.generatePalette(userData.primary, userData.secondary, userData.accent);

            // Map common slugs based on theme personality
            const mapping = [
                { slug: personality.colors.brand, color: harmonized.primary },
                // Use actual secondary if slug isn't reserved for 'main'
                { slug: personality.colors.brand_alt, color: (personality.colors.brand_alt === 'main' || personality.colors.brand_alt === 'contrast' || personality.colors.brand_alt === 'foreground') ? harmonized.main : harmonized.secondary },
                // Use actual accent if slug isn't reserved for 'base'
                { slug: personality.colors.accent, color: (personality.colors.accent === 'base' || personality.colors.accent === 'background') ? harmonized.base : harmonized.accent },

                // Theme-Specific Layout Slugs (Force Brand Alignment)
                { slug: 'foreground', color: harmonized.primary_dark },
                { slug: 'background', color: harmonized.base },

                // Ensure standard fallback slugs are also available
                { slug: 'primary', color: harmonized.primary },
                { slug: 'secondary', color: harmonized.secondary },
                { slug: 'tertiary', color: harmonized.accent },
                { slug: 'main', color: harmonized.main },
                { slug: 'contrast', color: harmonized.main },
                { slug: 'base', color: harmonized.base },
                { slug: 'primary-subtle', color: harmonized.primary_subtle }
            ];

            // Deduplicate slugs
            const seen = new Set();
            palette = mapping.filter(m => {
                if (seen.has(m.slug)) return false;
                seen.add(m.slug);
                return true;
            });

            // Heading styles: Using the detected Brand Primary for consistency
            styles = {
                elements: {
                    h1: { color: { text: `var:preset|color|${personality.colors.brand}` } },
                    h2: { color: { text: `var:preset|color|${personality.colors.brand}` } },
                    link: { color: { text: `var:preset|color|${personality.colors.brand}` } }
                },
                color: {
                    text: "var:preset|color|main"
                },
                // Block-specific styling per FSE best practices
                blocks: {
                    // Site Logo block styling for consistent sizing
                    "core/site-logo": {
                        border: {
                            radius: "0px"
                        }
                    }
                }
            };
        }

        return {
            palette,
            styles,
            metadata: {
                themeName,
                baseTheme
            }
        };
    }
}
