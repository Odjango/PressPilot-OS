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

        // 2. Direct Injection into functions.php (Permanent Fix)
        const functionsPath = path.join(themeDir, 'functions.php');
        if (await fs.pathExists(functionsPath)) {
            let funcs = await fs.readFile(functionsPath, 'utf8');

            // Avoid duplicate injection
            if (!funcs.includes('PressPilot Auto-Loader')) {
                // Strip the opening <?php from the loader string since functions.php is already PHP
                // But wait, generateContentLoader returns a string starting with <?php.
                // We need to be careful. function.php usually starts with <?php but might end with ?>.
                // Safer to just append it. If functions.php is open, we can't just paste <?php inside.
                // However, standard WordPress functions.php do NOT have closing tags.
                // So we can just append, but we must remove the '<?php' from our generated string.

                const cleanLoaderPhp = loaderPhp.replace('<?php', '').trim();

                funcs += `\n\n// PressPilot Auto-Loader (Direct Injection)\n${cleanLoaderPhp}\n`;
                await fs.writeFile(functionsPath, funcs);
                console.log('[Content] DIRECTLY Injected Auto-Loader into functions.php');
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
