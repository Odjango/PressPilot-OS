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

            const cleanLoaderPhp = loaderPhp.replace('<?php', '').trim();
            const newLoaderBlock = `\n\n// PressPilot Auto-Loader (Direct Injection)\n${cleanLoaderPhp}\n`;

            // Regex to find existing PressPilot Auto-Loader block + everything after it until end of function or similar marker
            // Simpler approach: If it exists, replace it. If not, append it.
            // We look for the comment // PressPilot Auto-Loader (Direct Injection) and capture until the next function definition or end of file? 
            // Actually, the previous code just appended. So it's likely at the end. 
            // We can search for the start marker and replace everything after it, OR use a precise block replacement if we can delineate it.
            // For robustness, let's use a known start/end marker in the future, but for now, we'll replace the checks.

            if (funcs.includes('// PressPilot Auto-Loader (Direct Injection)')) {
                // Replace existing block. We assume checking from the marker to the end of the appended string.
                // Since we can't easily know where it ends without parsing, and we know we appended it to the end before...
                // Let's try to match the specific function signature if possible, OR, simpler:
                // We will add a logical START and END marker in future, but for now to fix the "Test Pizza" bug:
                // We'll replace the ENTIRE file content if we can regenerate it? No, that destroys other things.

                // STRATEGY: Use a split.
                const parts = funcs.split('// PressPilot Auto-Loader (Direct Injection)');
                // Keep the part BEFORE the marker. Discard the part AFTER (which is the old loader).
                // This assumes the loader was always appended at the end.
                funcs = parts[0].trim();
            }

            // Safety: Remove closing PHP tag if present to prevent code printing as text
            funcs = funcs.replace(/\?>\s*$/, '').trim();

            // Append the new loader
            funcs += newLoaderBlock;

            await fs.writeFile(functionsPath, funcs);
            console.log('[Content] DIRECTLY Injected Auto-Loader into functions.php (Overwrote previous)');
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
