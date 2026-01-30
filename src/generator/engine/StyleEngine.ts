import fs from 'fs-extra';
import path from 'path';
import { StyleJSON } from '../modules/StyleBuilder';

export class StyleEngine {

    async applyStyles(themeDir: string, styleJson: StyleJSON): Promise<void> {
        const themeJsonPath = path.join(themeDir, 'theme.json');

        if (await fs.pathExists(themeJsonPath)) {
            const themeJson = await fs.readJson(themeJsonPath);

            // 1. Apply Palette
            if (styleJson.palette.length > 0) {
                themeJson.settings.color.palette = styleJson.palette;
            }

            // 2. Apply Custom Styles
            if (styleJson.styles) {
                themeJson.styles = {
                    ...themeJson.styles,
                    ...styleJson.styles
                };
            }

            await fs.writeJson(themeJsonPath, themeJson, { spaces: 4 });
            console.log(`[StyleEngine] Applied style JSON to theme.json.`);
        }
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
`;
            styleContent += minimalLayoutStyles;
            await fs.writeFile(styleCssPath, styleContent);
            console.log(`[StyleEngine] Updated style.css with minimal refined layout helper.`);
        }
    }
}
