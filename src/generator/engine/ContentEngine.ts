import fs from 'fs-extra';
import path from 'path';
import { GeneratorData } from '../types';
import { generateContentLoader } from '../utils/content-loader-generator';
import { buildPageTemplate, buildFooterTemplate, buildHeaderTemplate } from '../page-builder';

export class ContentEngine {

    async injectContentLoader(themeDir: string, userData: GeneratorData): Promise<void> {
        // 1. Generate PHP Setup Script
        const siteTitle = userData.name || 'My Site';
        const tagline = userData.hero_subheadline || ''; // Use subheadline as tagline fallback

        console.log(`[Content] Generating setup script for '${siteTitle}'...`);

        const loaderPhp = generateContentLoader(userData.pages || [], siteTitle, tagline);

        // 2. Direct Injection into functions.php (Safe Mode)
        const functionsPath = path.join(themeDir, 'functions.php');
        if (await fs.pathExists(functionsPath)) {
            let funcs = await fs.readFile(functionsPath, 'utf8');

            const cleanLoaderPhp = loaderPhp.replace('<?php', '').trim();
            const newLoaderBlock = `\n\n// PressPilot Safe Loader (Activation Only)\n${cleanLoaderPhp}\n`;

            // If a previous loader exists (legacy or safe), replace it to ensure we use the latest version.
            // Escape regex special characters if needed, but for simple string matching we can use string replace if exact.
            // Using split is safer for unknown content after the header.
            if (funcs.includes('// PressPilot Auto-Loader') || funcs.includes('// PressPilot Safe Loader')) {
                // Simplest regex to split: look for the start, keep everything before it.
                // We will match either string.
                const splitTarget = funcs.includes('// PressPilot Auto-Loader') ? '// PressPilot Auto-Loader' : '// PressPilot Safe Loader';
                funcs = funcs.split(splitTarget)[0].trim();
            }

            // Safety: Remove closing PHP tag if present to prevent code printing as text
            funcs = funcs.replace(/\?>\s*$/, '').trim();

            // Append the new loader
            funcs += newLoaderBlock;

            await fs.writeFile(functionsPath, funcs);
            console.log('[Content] Injected SAFE Auto-Loader into functions.php (Overwrote previous)');
        }
        // The following line was a syntax error (unclosed multi-line comment and misplaced console.log)
        // It seems it was intended to be outside the if block, or part of a commented-out block.
        // Assuming it should be removed or correctly placed if it's a fallback.
        // For now, removing the `*/` and the misplaced `console.log` part to fix syntax.
        // If the intent was to always log "SKIPPING Nuclear Loader Injection", it should be outside the `if` block.
        // Based on the instruction, the `if` block's closing was the main issue.
        // The `console.log` about skipping is now correctly placed outside the `if` block.
        else {
            console.log('[Content] SKIPPING Nuclear Loader Injection to prevent fatal errors (functions.php not found).');
        }
    }

    async generatePages(themeDir: string, userData: GeneratorData): Promise<void> {
        if (userData.pages && userData.pages.length > 0) {
            console.log(`[Content] Building templates for ${userData.pages.length} custom pages...`);
            for (const page of userData.pages) {
                await buildPageTemplate(themeDir, page);
            }
            // Generate Footer
            if (userData.name) {
                await buildFooterTemplate(themeDir, userData.name);
            }

            // Generate Header (Navigation)
            if (userData.name && userData.pages) {
                await buildHeaderTemplate(themeDir, userData.name, userData.pages);
            }
        }
    }
}
