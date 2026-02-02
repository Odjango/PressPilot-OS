import fs from 'fs-extra';
import path from 'path';
import { StyleJSON } from '../modules/StyleBuilder';

export class StyleEngine {

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
            // 6. Apply Custom Styles (elements, blocks, typography)
            // ================================================================
            if (styleJson.styles) {
                // Deep merge styles to preserve existing base theme styles
                themeJson.styles = this.deepMerge(themeJson.styles || {}, styleJson.styles);
                console.log(`[StyleEngine] Applied element and block styles.`);
            }

            // ================================================================
            // 7. Ensure Layout Settings
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
            // 8. Enable Appearance Tools
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

    async updateMetadata(themeDir: string, themeName: string, baseName: string, mode: string): Promise<void> {
        const siteInfo = { name: themeName, base: baseName, mode: mode };
        await fs.writeJson(path.join(themeDir, 'site-info.json'), siteInfo, { spaces: 4 });

        const styleCssPath = path.join(themeDir, 'style.css');
        if (await fs.pathExists(styleCssPath)) {
            let styleContent = await fs.readFile(styleCssPath, 'utf8');
            styleContent = styleContent.replace(/Theme Name:.*$/m, `Theme Name: ${themeName}`);
            // Minimalist Safety Only: Ensuring basic layout reset
            const minimalLayoutStyles = `
/* PressPilot Standard Layout Helper */
body { margin: 0; overflow-x: hidden; width: 100%; }
.wp-site-blocks { display: flex; flex-direction: column; min-height: 100vh; width: 100%; overflow-x: hidden; }

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
`;
            styleContent += minimalLayoutStyles;
            await fs.writeFile(styleCssPath, styleContent);
            console.log(`[StyleEngine] Updated style.css with minimal refined layout helper and header CSS.`);
        }
    }
}
