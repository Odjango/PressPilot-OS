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

            await fs.writeFile(styleCssPath, styleContent);
            console.log(`[Style] Updated style.css metadata (Version: 1.0.${timestamp}).`);
        }
    }
}
