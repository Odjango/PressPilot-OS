import fs from 'fs-extra';
import path from 'path';
import { ThemePersonality } from '../types';
import { GeneratorData } from '../types';

export class StyleEngine {

    async applyColors(themeDir: string, userData: GeneratorData, personality: ThemePersonality): Promise<void> {
        const themeJsonPath = path.join(themeDir, 'theme.json');

        if (await fs.pathExists(themeJsonPath)) {
            const themeJson = await fs.readJson(themeJsonPath);
            const palette = themeJson.settings.color.palette;

            let updated = false;

            if (userData.primary) {
                const brandSlug = personality.colors.brand;
                const brandColor = palette.find((c: any) => c.slug === brandSlug);
                if (brandColor) {
                    brandColor.color = userData.primary;
                    updated = true;
                }

                const altSlug = personality.colors.brand_alt;
                const altColor = palette.find((c: any) => c.slug === altSlug);
                if (altColor) {
                    altColor.color = userData.primary;
                    updated = true;
                }
            }
            if (userData.secondary) {
                const accentSlug = personality.colors.accent;
                const accentColor = palette.find((c: any) => c.slug === accentSlug);
                if (accentColor) {
                    accentColor.color = userData.secondary;
                    updated = true;
                }
            }

            if (updated) {
                await fs.writeJson(themeJsonPath, themeJson, { spaces: 4 });
                console.log(`[Style] Updated theme.json colors.`);
            }
        }
    }

    async updateMetadata(themeDir: string, themeName: string, baseName: string, mode: string): Promise<void> {
        // 1. site-info.json
        const siteInfo = { name: themeName, base: baseName, mode: mode };
        await fs.writeJson(path.join(themeDir, 'site-info.json'), siteInfo, { spaces: 4 });

        // 2. style.css
        const styleCssPath = path.join(themeDir, 'style.css');
        if (await fs.pathExists(styleCssPath)) {
            let styleContent = await fs.readFile(styleCssPath, 'utf8');
            styleContent = styleContent.replace(/Theme Name:.*$/m, `Theme Name: ${themeName}`);

            // Cache Busting: Update Version
            const timestamp = Math.floor(Date.now() / 1000);
            styleContent = styleContent.replace(/Version:.*$/m, `Version: 1.0.${timestamp}`);

            // Safety Patch for Testimonial Visibility (Fixes white-on-white issue)
            const safetyCss = `
/* PressPilot Safety Patch */
.wp-block-quote, .wp-block-pullquote {
    color: var(--wp--preset--color--main) !important;
    background-color: var(--wp--preset--color--tertiary) !important;
    padding: 2rem !important;
    border-radius: 2px !important;
    border-left: 2px solid var(--wp--preset--color--primary) !important;
}
.wp-block-quote p {
    color: var(--wp--preset--color--main) !important;
}
.wp-block-quote cite {
    color: var(--wp--preset--color--secondary) !important;
    font-style: normal !important;
}
`;
            styleContent += safetyCss;

            await fs.writeFile(styleCssPath, styleContent);
            console.log(`[Style] Updated style.css metadata and applied safety CSS (Version: 1.0.${timestamp}).`);
        }
    }
}
