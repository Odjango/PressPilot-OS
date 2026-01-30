import fs from 'fs-extra';
import path from 'path';
import { generateContentLoader } from '../utils/content-loader-generator';
import { buildPageTemplate, buildFooterTemplate, buildHeaderTemplate } from '../page-builder';
import { ContentJSON } from '../modules/ContentBuilder';

export class ContentEngine {

    async injectContentLoader(themeDir: string, contentJson: ContentJSON): Promise<void> {
        const siteTitle = contentJson.businessName;
        const tagline = contentJson.hero.subheadline || '';
        const logoPath = contentJson.slots['{{LOGO_URL}}'] || ''; // ContentBuilder should have mapped this

        console.log(`[ContentEngine] Generating setup script for '${siteTitle}'...`);

        const loaderPhp = generateContentLoader(contentJson.pages || [], siteTitle, tagline, logoPath);

        const functionsPath = path.join(themeDir, 'functions.php');
        if (await fs.pathExists(functionsPath)) {
            let funcs = await fs.readFile(functionsPath, 'utf8');
            const hasNamespace = /namespace\s+[A-Z][a-zA-Z0-9_\\]*;/i.test(funcs);
            let cleanLoaderPhp = loaderPhp.replace('<?php', '').trim();

            if (!hasNamespace) {
                // Simplify the setup function call string for non-namespaced themes
                // This regex handles both '. ' and '.' cases.
                cleanLoaderPhp = cleanLoaderPhp.replace(/\$func = \( __NAMESPACE__ \? __NAMESPACE__ \. '\\\\' : '' \) \. '/g, "$func = '");
                cleanLoaderPhp = cleanLoaderPhp.replace(/\$setup_func = \( __NAMESPACE__ \? __NAMESPACE__ \. '\\\\' : '' \) \.\s*'/g, "$setup_func = '");
                cleanLoaderPhp = cleanLoaderPhp.replace(/__NAMESPACE__\s*\.\s*/g, '');
            }

            const newLoaderBlock = `\n\n// PressPilot Safe Loader (Activation Only)\n${cleanLoaderPhp}\n`;

            if (funcs.includes('// PressPilot Auto-Loader') || funcs.includes('// PressPilot Safe Loader')) {
                const splitTarget = funcs.includes('// PressPilot Auto-Loader') ? '// PressPilot Auto-Loader' : '// PressPilot Safe Loader';
                funcs = funcs.split(splitTarget)[0].trim();
            }

            funcs = funcs.replace(/\?>\s*$/, '').trim();
            funcs += newLoaderBlock;

            await fs.writeFile(functionsPath, funcs);
            console.log(`[ContentEngine] Injected Safe Loader.`);
        }
        else {
            console.log('[ContentEngine] SKIPPING Loader Injection (functions.php not found).');
        }
    }

    async generatePages(themeDir: string, contentJson: ContentJSON): Promise<void> {
        if (contentJson.pages && contentJson.pages.length > 0) {
            console.log(`[ContentEngine] Building templates for ${contentJson.pages.length} custom pages...`);
            for (const page of contentJson.pages) {
                if (page.template === 'universal-menu' && contentJson.menus) {
                    page.content = {
                        ...page.content,
                        menus: contentJson.menus
                    };
                }
                await buildPageTemplate(themeDir, page, contentJson.baseName);
            }
        }
    }
}
