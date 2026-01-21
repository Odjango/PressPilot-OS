import fs from 'fs-extra';
import path from 'path';
import { GeneratorData, ThemePersonality } from '../types';
import { UNIVERSAL_PATTERNS } from '../config/PatternRegistry';
import { getUniversalBlogContent, getUniversalFooterContent, getUniversalHeaderContent, getArchiveContent, getSearchContent, getUniversalHomeContent } from '../patterns';
import { generateMenuPattern } from '../patterns/restaurant-menu';

export class PatternInjector {
    constructor(private rootDir: string) { }

    async injectRecipe(themeDir: string, recipe: import('../types').LayoutRecipe, userData: GeneratorData, personality: ThemePersonality): Promise<void> {
        console.log(`[Pattern] Injecting Recipe: ${recipe.name}...`);

        let templateContent = '';

        for (const patternPath of recipe.patterns) {
            const fullPath = path.join(themeDir, patternPath);

            if (await fs.pathExists(fullPath)) {
                let content = await fs.readFile(fullPath, 'utf8');

                // 1. Extract Slug (Robust Regex)
                const slugMatch = content.match(/Slug:\s+([^\r\n]+)/);
                const slug = slugMatch ? slugMatch[1].trim() : null;

                if (!slug) {
                    console.warn(`[Pattern] Warning: No slug found for ${patternPath}`);
                    continue;
                }

                // 2. Inject Content (Text Replacement)
                // Hero Replacement
                if (patternPath === personality.patterns.hero) {
                    if (userData.hero_headline) {
                        content = content.replace(personality.patterns.hero_search_headline, userData.hero_headline);
                    }
                    if (userData.hero_subheadline && personality.patterns.hero_search_sub) {
                        content = content.replace(personality.patterns.hero_search_sub, userData.hero_subheadline);
                    }
                }

                // Apply Changes to File
                await fs.writeFile(fullPath, content);

                // 3. Add to Template Sequence
                templateContent += `<!-- wp:pattern {"slug":"${slug}"} /-->\n`;
            } else {
                console.warn(`[Pattern] Warning: Pattern file not found ${patternPath}`);
            }
        }

        // 4. Transform to Front Page
        // We write to front-page.html to ensure it takes precedence as the Homepage
        const frontPagePath = path.join(themeDir, 'templates', 'front-page.html');
        await fs.writeFile(frontPagePath, templateContent);
        console.log(`[Pattern] Generated front-page.html from recipe.`);
    }

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

    async injectMenus(themeDir: string, userData: GeneratorData, safeName: string): Promise<void> {
        // 5. Inject Restaurant Menu (Topic: Restaurant)
        if (userData.menus && userData.menus.length > 0) {
            console.log(`[Pattern] Injecting ${userData.menus.length} Menus...`);

            // Generate the Pattern Content (The "Columns" Block)
            const menuPatternSlug = 'presspilot-menu';
            const menuPatternContent = userData.menus.map(generateMenuPattern).join('\n\n<!-- wp:spacer {"height":"var:preset|spacing|50"} -->\n<div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>\n<!-- /wp:spacer -->\n\n');

            // Wrap in a Pattern Header for WordPress to recognize it
            const patternFileContent = `<?php
/**
 * Title: Restaurant Menu
 * Slug: presspilot/menu
 * Categories: featured
 */
?>
${menuPatternContent}`;

            const patternPath = path.join(themeDir, 'patterns', 'presspilot-menu.php');
            await fs.writeFile(patternPath, patternFileContent);

            // Create a "page-menu.html" template that uses this pattern
            // This ensures visiting /menu loads this layout
            const menuPageTemplate = `<!-- wp:template-part {"slug":"header","theme":"${safeName}","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:pattern {"slug":"presspilot/menu"} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","theme":"${safeName}","tagName":"footer"} /-->`;

            const menuTemplatePath = path.join(themeDir, 'templates', 'page-menu.html');
            await fs.writeFile(menuTemplatePath, menuPageTemplate);
            console.log('[Pattern] Injected Restaurant Menu Pattern & Template.');
        }
    }
}
