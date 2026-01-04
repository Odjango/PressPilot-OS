import fs from 'fs-extra';
import path from 'path';
import { GeneratorData } from '../types';
import { generateContentLoader } from '../utils/content-loader-generator';
import { buildPageTemplate } from '../page-builder';

export class ContentEngine {

    async injectContentLoader(themeDir: string, userData: GeneratorData): Promise<void> {
        // 1. Generate PHP Setup Script
        const siteTitle = userData.name || 'My Site';
        const tagline = userData.hero_subheadline || ''; // Use subheadline as tagline fallback

        console.log(`[Content] Generating setup script for '${siteTitle}'...`);

        const loaderPhp = generateContentLoader(userData.pages || [], siteTitle, tagline);

        const loaderPath = path.join(themeDir, 'inc', 'content-loader.php');
        await fs.ensureDir(path.dirname(loaderPath));
        await fs.writeFile(loaderPath, loaderPhp);

        // 2. Hook into functions.php
        const functionsPath = path.join(themeDir, 'functions.php');
        if (await fs.pathExists(functionsPath)) {
            let funcs = await fs.readFile(functionsPath, 'utf8');
            if (!funcs.includes('content-loader.php')) {
                funcs += `\n// PressPilot Auto-Loader (Generated)\nrequire_once get_theme_file_path( 'inc/content-loader.php' );\n`;
                await fs.writeFile(functionsPath, funcs);
                console.log('[Content] Injected Auto-Loader hook into functions.php');
            }
        }
    }

    async generatePages(themeDir: string, userData: GeneratorData): Promise<void> {
        if (userData.pages && userData.pages.length > 0) {
            console.log(`[Content] Building templates for ${userData.pages.length} custom pages...`);
            for (const page of userData.pages) {
                await buildPageTemplate(themeDir, page);
            }
        }
    }
}
