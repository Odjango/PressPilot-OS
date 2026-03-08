import fs from 'fs-extra';
import path from 'path';
import { StyleJSON } from '../modules/StyleBuilder';

export class StyleEngine {
    private static readonly CONTRAST_TARGET_SLOTS = ['accent', 'accent-2', 'accent-3', 'accent-4', 'accent-5', 'primary'];

    private getAccessibleTextTokenForHex(hexColor: string): string {
        const normalized = hexColor.replace('#', '').trim();
        if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
            return 'var(--wp--preset--color--base)';
        }

        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);

        // Perceived luminance threshold for choosing dark/light text.
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.6
            ? 'var(--wp--preset--color--contrast)'
            : 'var(--wp--preset--color--base)';
    }

    private buildBackgroundContrastCss(themeJson: any): string {
        const palette: Array<{ slug?: string; color?: string }> =
            themeJson?.settings?.color?.palette || [];
        const bySlug = new Map<string, string>();
        for (const entry of palette) {
            if (entry?.slug && entry?.color) {
                bySlug.set(entry.slug, entry.color);
            }
        }

        const rules: string[] = [];
        for (const slot of StyleEngine.CONTRAST_TARGET_SLOTS) {
            const bgHex = bySlug.get(slot);
            if (!bgHex) continue;
            const textToken = this.getAccessibleTextTokenForHex(bgHex);
            rules.push(
                `.wp-block-button .wp-block-button__link.has-${slot}-background-color {`,
                `    color: ${textToken} !important;`,
                `}`
            );
            rules.push(
                `.has-${slot}-background-color .presspilot-on-colored-bg {`,
                `    color: ${textToken} !important;`,
                `}`
            );
        }

        return rules.length > 0 ? '\n' + rules.join('\n') + '\n' : '';
    }

    async applyStyles(themeDir: string, styleJson: StyleJSON): Promise<void> {
        const themeJsonPath = path.join(themeDir, 'theme.json');

        if (await fs.pathExists(themeJsonPath)) {
            const themeJson = await fs.readJson(themeJsonPath);

            // Ensure settings object structure exists
            if (!themeJson.settings) themeJson.settings = {};
            if (!themeJson.settings.color) themeJson.settings.color = {};
            if (!themeJson.settings.spacing) themeJson.settings.spacing = {};
            if (!themeJson.settings.shadow) themeJson.settings.shadow = {};
            if (!themeJson.settings.typography) themeJson.settings.typography = {};

            // ================================================================
            // 1. Apply Color Palette
            // ================================================================
            if (styleJson.palette && styleJson.palette.length > 0) {
                themeJson.settings.color.palette = styleJson.palette;
                console.log(`[StyleEngine] Applied ${styleJson.palette.length} color tokens.`);
            }

            // ================================================================
            // 2. Apply Gradients
            // ================================================================
            if (styleJson.gradients && styleJson.gradients.length > 0) {
                themeJson.settings.color.gradients = styleJson.gradients;
                console.log(`[StyleEngine] Applied ${styleJson.gradients.length} gradient presets.`);
            }

            // ================================================================
            // 3. Apply Spacing Scale
            // ================================================================
            if (styleJson.spacingSizes && styleJson.spacingSizes.length > 0) {
                themeJson.settings.spacing.spacingSizes = styleJson.spacingSizes;
                // Ensure spacing is enabled
                themeJson.settings.spacing.padding = true;
                themeJson.settings.spacing.margin = true;
                themeJson.settings.spacing.blockGap = true;
                console.log(`[StyleEngine] Applied ${styleJson.spacingSizes.length}-step spacing scale.`);
            }

            // ================================================================
            // 4. Apply Shadow Presets
            // ================================================================
            if (styleJson.shadows && styleJson.shadows.length > 0) {
                themeJson.settings.shadow.presets = styleJson.shadows;
                // Enable custom shadows
                themeJson.settings.shadow.defaultPresets = true;
                console.log(`[StyleEngine] Applied ${styleJson.shadows.length} shadow presets.`);
            }

            // ================================================================
            // 5. Apply Font Size Scale
            // ================================================================
            if (styleJson.fontSizes && styleJson.fontSizes.length > 0) {
                themeJson.settings.typography.fontSizes = styleJson.fontSizes;
                // Enable fluid typography
                themeJson.settings.typography.fluid = true;
                console.log(`[StyleEngine] Applied ${styleJson.fontSizes.length}-step font size scale.`);
            }

            // ================================================================
            // 6. Apply Font Families
            // ================================================================
            if (styleJson.fontFamilies && styleJson.fontFamilies.length > 0) {
                themeJson.settings.typography.fontFamilies = styleJson.fontFamilies;
                console.log(
                    `[StyleEngine] Applied ${styleJson.fontFamilies.length} font family presets.`
                );
            }

            // ================================================================
            // 7. Apply Custom Styles (elements, blocks, typography)
            // ================================================================
            if (styleJson.styles) {
                // Deep merge styles to preserve existing base theme styles
                themeJson.styles = this.deepMerge(themeJson.styles || {}, styleJson.styles);
                console.log(`[StyleEngine] Applied element and block styles.`);
            }

            // ================================================================
            // 8. Zero Root Padding Top/Bottom (header/footer flush)
            // ================================================================
            // The chassis theme.json sets styles.spacing.padding on all 4 sides
            // (e.g. spacing|60 = min(10.5rem, 13vw)). This creates huge gaps
            // above the header and below the footer. We zero top/bottom so
            // header sits at viewport top and footer at viewport bottom.
            // Left/right are kept for content padding with useRootPaddingAwareAlignments.
            if (!themeJson.styles) themeJson.styles = {};
            if (!themeJson.styles.spacing) themeJson.styles.spacing = {};
            if (!themeJson.styles.spacing.padding) themeJson.styles.spacing.padding = {};
            themeJson.styles.spacing.padding.top = "0px";
            themeJson.styles.spacing.padding.bottom = "0px";
            console.log(`[StyleEngine] Zeroed root padding top/bottom for flush header/footer.`);

            // ================================================================
            // 9. Ensure Layout Settings
            // ================================================================
            if (!themeJson.settings.layout) {
                themeJson.settings.layout = {};
            }
            // Set default layout widths if not already set
            if (!themeJson.settings.layout.contentSize) {
                themeJson.settings.layout.contentSize = '800px';
            }
            if (!themeJson.settings.layout.wideSize) {
                themeJson.settings.layout.wideSize = '1200px';
            }

            // ================================================================
            // 10. Enable Appearance Tools
            // ================================================================
            themeJson.settings.appearanceTools = true;

            await fs.writeJson(themeJsonPath, themeJson, { spaces: 4 });
            console.log(`[StyleEngine] Applied full design system to theme.json.`);
        }
    }

    /**
     * Deep merge two objects, with source values overwriting target values
     */
    private deepMerge(target: any, source: any): any {
        const output = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (
                    source[key] &&
                    typeof source[key] === 'object' &&
                    !Array.isArray(source[key])
                ) {
                    // Recursively merge nested objects
                    output[key] = this.deepMerge(target[key] || {}, source[key]);
                } else {
                    // Direct assignment for primitives and arrays
                    output[key] = source[key];
                }
            }
        }

        return output;
    }

    async updateMetadata(
        themeDir: string,
        themeName: string,
        baseName: string,
        mode: string,
        brandMode?: string
    ): Promise<void> {
        const siteInfo = { name: themeName, base: baseName, mode: mode, brandMode: brandMode || 'modern' };
        await fs.writeJson(path.join(themeDir, 'site-info.json'), siteInfo, { spaces: 4 });

        const styleCssPath = path.join(themeDir, 'style.css');
        const themeJsonPath = path.join(themeDir, 'theme.json');
        if (await fs.pathExists(styleCssPath)) {
            let styleContent = await fs.readFile(styleCssPath, 'utf8');
            styleContent = styleContent.replace(/Theme Name:.*$/m, `Theme Name: ${themeName}`);

            let contrastRules = '';
            const darkContextContrastRules = `
/* Dark-context readability: force light outline CTA inside dark hero/cover contexts */
.wp-block-cover .wp-block-button.is-style-outline .wp-block-button__link,
.has-contrast-background-color .wp-block-button.is-style-outline .wp-block-button__link {
    color: var(--wp--preset--color--base) !important;
    border-color: var(--wp--preset--color--base) !important;
}

.wp-block-cover .wp-block-button.is-style-outline .wp-block-button__link:hover,
.has-contrast-background-color .wp-block-button.is-style-outline .wp-block-button__link:hover {
    color: var(--wp--preset--color--accent-2) !important;
    border-color: var(--wp--preset--color--accent-2) !important;
}

/* Dark-context readability: avoid dark accent text on dark surfaces */
.wp-block-cover .has-accent-color,
.has-contrast-background-color .has-accent-color {
    color: var(--wp--preset--color--base) !important;
}
`;
            if (await fs.pathExists(themeJsonPath)) {
                const themeJson = await fs.readJson(themeJsonPath);
                contrastRules = this.buildBackgroundContrastCss(themeJson);
            }

            // Minimalist Safety Only: Ensuring basic layout reset
            const minimalLayoutStyles = `
/* PressPilot Standard Layout Helper */
body { margin: 0; overflow-x: hidden; width: 100%; }
.wp-site-blocks { display: flex; flex-direction: column; min-height: 100vh; width: 100%; overflow-x: hidden; }

/* Remove root-level blockGap between header, main, and footer */
.wp-site-blocks > * { margin-block-start: 0 !important; margin-block-end: 0 !important; }

/* Push footer to bottom of viewport */
.wp-site-blocks > main,
.wp-site-blocks > .wp-block-group:not(.wp-block-template-part) {
    flex-grow: 1;
}

/* =============================================
   Sticky Header for Hero Overlay Support
   ============================================= */

/* Header positioning for full-bleed hero support */
.presspilot-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

/* Semi-transparent background for glass effect */
.presspilot-header.has-base-background-color {
    background-color: rgba(255, 255, 255, 0.95) !important;
}

/* Dark mode header support */
body.is-dark-theme .presspilot-header.has-base-background-color,
.presspilot-header.has-base-background-color[data-dark="true"] {
    background-color: rgba(15, 23, 42, 0.95) !important;
}

/* Ensure hero sections stay below header */
.wp-block-cover {
    z-index: 1;
}

/* =============================================
   Alignfull Block Spacing Normalization
   ============================================= */

/* Normalize first block inside main (hero directly under header) */
main.wp-block-group > :first-child {
    margin-top: 0 !important;
}

/* Normalize back-to-back alignfull blocks (no double spacing) */
.alignfull + .alignfull {
    margin-top: 0;
}

/* =============================================
   Brand-Mode Outline Button Color Normalization
   ============================================= */

/* Ensure secondary/outline buttons always use brand accent token colors */
.wp-block-button.is-style-outline .wp-block-button__link,
.wp-block-button .wp-block-button__link.is-style-outline {
    color: var(--wp--preset--color--accent) !important;
    border-color: var(--wp--preset--color--accent) !important;
    background-color: transparent !important;
}

.wp-block-button.is-style-outline .wp-block-button__link:hover,
.wp-block-button .wp-block-button__link.is-style-outline:hover {
    color: var(--wp--preset--color--accent-3) !important;
    border-color: var(--wp--preset--color--accent-3) !important;
    background-color: transparent !important;
}

/* =============================================
   Filled Button Contrast (Palette-Aware)
   ============================================= */
${contrastRules}
${darkContextContrastRules}
`;
            styleContent += minimalLayoutStyles;
            await fs.writeFile(styleCssPath, styleContent);
            console.log(`[StyleEngine] Updated style.css with minimal refined layout helper and header CSS.`);
        }
    }
}
