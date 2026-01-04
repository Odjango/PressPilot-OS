import fs from 'fs-extra';
import path from 'path';
import { GeneratorData, ThemePersonality } from '../types';
import { UNIVERSAL_PATTERNS } from '../config/PatternRegistry';
import { getUniversalBlogContent, getUniversalFooterContent, getUniversalHeaderContent, getArchiveContent, getSearchContent, getUniversalHomeContent } from '../patterns';

export class PatternInjector {
    constructor(private rootDir: string) { }

    async injectHeavyMode(themeDir: string, personality: ThemePersonality, userData: GeneratorData, safeName: string): Promise<void> {
        console.log('[Pattern] Injecting Heavy Mode Patterns...');

        // 1. Universal Heavy Pattern
        const heavyPatternSrc = path.join(this.rootDir, UNIVERSAL_PATTERNS.heavy);
        const heavyPatternDest = path.join(themeDir, 'patterns', 'presspilot-heavy.php');
        await fs.copy(heavyPatternSrc, heavyPatternDest);

        // 2. Force Front Page
        if (personality.home_template) {
            const homeTemplatePath = path.join(themeDir, personality.home_template);

            // Image Logic
            let heroImage = undefined;
            if (userData.images && userData.images.length > 0) {
                // @ts-ignore
                const localPath = userData.images[0];
                const ext = path.extname(localPath);
                const targetFilename = `hero-home${ext}`;
                const targetPath = path.join(themeDir, 'assets', 'images', targetFilename);

                await fs.ensureDir(path.dirname(targetPath));
                await fs.copy(localPath, targetPath);

                heroImage = `/wp-content/themes/${safeName}/assets/images/${targetFilename}`;
            }

            const homeContent = {
                hero_title: userData.hero_headline,
                hero_sub: userData.hero_subheadline,
                hero_image: heroImage
            };

            await fs.writeFile(homeTemplatePath, getUniversalHomeContent(homeContent).trim());
            console.log(`[Pattern] Forced Universal Home Pattern.`);
        }

        // 3. Force Blog Templates
        const blogTemplates = ['home.html', 'index.html'];
        for (const tpl of blogTemplates) {
            const tplPath = path.join(themeDir, 'templates', tpl);
            await fs.writeFile(tplPath, getUniversalBlogContent().trim());
        }

        // 4. Force Header/Footer
        const footerPath = path.join(themeDir, UNIVERSAL_PATTERNS.footer);
        const footerName = userData.name || 'PressPilot Site';
        await fs.ensureDir(path.dirname(footerPath));
        await fs.writeFile(footerPath, getUniversalFooterContent(footerName).trim());

        const headerPath = path.join(themeDir, UNIVERSAL_PATTERNS.header);
        await fs.ensureDir(path.dirname(headerPath));
        await fs.writeFile(headerPath, getUniversalHeaderContent(userData.pages).trim());

        console.log('[Pattern] Forced Universal Header & Footer.');
    }
}
