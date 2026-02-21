import fs from 'fs-extra';
import path from 'path';
import { generateContentLoader } from '../utils/content-loader-generator';
import { buildPageTemplate, buildFooterTemplate, buildHeaderTemplate } from '../page-builder';
import { ContentJSON } from '../modules/ContentBuilder';
import { sanitizeForPHP } from '../utils/sanitize';
import { replaceRemainingPlaceholders } from '../utils/placeholderFallback';

export class ContentEngine {
    private applySlotReplacements(content: string, slots: Record<string, string>): string {
        for (const [search, replace] of Object.entries(slots || {})) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            content = content.replace(new RegExp(escaped, 'g'), replace);
        }
        return content;
    }

    async injectContentLoader(themeDir: string, contentJson: ContentJSON): Promise<void> {
        const siteTitle = sanitizeForPHP(contentJson.businessName);
        const tagline = sanitizeForPHP(contentJson.hero.subheadline || '');
        const logoPath = contentJson.slots['{{LOGO_URL}}'] || '';

        console.log(`[ContentEngine] Generating setup script for '${siteTitle}'...`);

        // Ensure pages array exists (make a copy to avoid mutating original)
        const pages = contentJson.pages ? [...contentJson.pages] : [];

        // For ecommerce industry, add starter Shop page only (no Woo checkout/cart flow)
        const industry = contentJson.industry || '';
        if (industry.toLowerCase() === 'ecommerce') {
            const hasShopPage = pages.some(p => p.slug === 'shop' || (p.title && p.title.toLowerCase() === 'shop'));
            if (!hasShopPage) {
                console.log(`[ContentEngine] Industry is ecommerce, adding Shop page to setup.`);
                pages.push({
                    title: 'Shop',
                    slug: 'shop',
                    template: 'universal-shop'
                });
            }
        }

        const loaderPhp = generateContentLoader(pages, siteTitle, tagline, logoPath);

        const functionsPath = path.join(themeDir, 'functions.php');
        if (await fs.pathExists(functionsPath)) {
            let funcs = await fs.readFile(functionsPath, 'utf8');
            const hasNamespace = /namespace\s+[A-Z][a-zA-Z0-9_\\]*;/i.test(funcs);
            let cleanLoaderPhp = loaderPhp.replace('<?php', '').trim();

            if (!hasNamespace) {
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

            // Map hero images to pages (each page gets a different image)
            const heroImages = contentJson.hero?.images || [];

            for (let i = 0; i < contentJson.pages.length; i++) {
                const page = contentJson.pages[i];

                // Initialize page.content if not present
                if (!page.content) {
                    page.content = {};
                }

                // Assign hero image from the pool (cycling through available images)
                if (heroImages.length > 0 && !page.content.hero_image) {
                    page.content.hero_image = heroImages[i % heroImages.length];
                }

                // Add menus for menu pages
                if (page.template === 'universal-menu' && contentJson.menus) {
                    page.content = {
                        ...page.content,
                        menus: contentJson.menus
                    };
                }

                // Add chef/team data for about pages
                if (page.template === 'universal-about') {
                    const c = contentJson as Record<string, unknown>;
                    page.content = {
                        ...page.content,
                        business_name: String(c.business_name || c.name || ''),
                        name: String(c.name || ''),
                        about_paragraph_1: String(c.about_paragraph_1 || ''),
                        about_paragraph_2: String(c.about_paragraph_2 || ''),
                        about_paragraph_3: String(c.about_paragraph_3 || ''),
                        chef_name_1: String(c.chef_name_1 || ''),
                        chef_role_1: String(c.chef_role_1 || ''),
                        chef_bio_1: String(c.chef_bio_1 || ''),
                        chef_name_2: String(c.chef_name_2 || ''),
                        chef_role_2: String(c.chef_role_2 || ''),
                        chef_bio_2: String(c.chef_bio_2 || ''),
                        chef_name_3: String(c.chef_name_3 || ''),
                        chef_role_3: String(c.chef_role_3 || ''),
                        chef_bio_3: String(c.chef_bio_3 || ''),
                        team_1_name: String(c.team_1_name || ''),
                        team_1_role: String(c.team_1_role || ''),
                        team_1_bio: String(c.team_1_bio || ''),
                        team_1_photo: String(c.team_1_photo || ''),
                        team_2_name: String(c.team_2_name || ''),
                        team_2_role: String(c.team_2_role || ''),
                        team_2_bio: String(c.team_2_bio || ''),
                        team_2_photo: String(c.team_2_photo || ''),
                        team_3_name: String(c.team_3_name || ''),
                        team_3_role: String(c.team_3_role || ''),
                        team_3_bio: String(c.team_3_bio || ''),
                        team_3_photo: String(c.team_3_photo || ''),
                    };
                }

                await buildPageTemplate(
                    themeDir,
                    page,
                    contentJson.baseName,
                    contentJson.heroLayout,
                    contentJson.businessName,
                    contentJson.pages,
                    Boolean(contentJson.slots['{{LOGO_URL}}'])
                );

                // Replace token placeholders in generated page templates.
                const pagePath = path.join(themeDir, 'templates', `page-${page.slug}.html`);
                if (await fs.pathExists(pagePath)) {
                    const original = await fs.readFile(pagePath, 'utf8');
                    let resolved = this.applySlotReplacements(original, contentJson.slots || {});
                    resolved = replaceRemainingPlaceholders(resolved, {
                        industry: contentJson.industry,
                        heroImage: contentJson?.hero?.images?.[0]
                    });
                    if (resolved !== original) {
                        await fs.writeFile(pagePath, resolved);
                    }
                }
            }

            // Keep front-page aligned with the finalized home template content.
            // WordPress prioritizes front-page.html for the homepage.
            const homeTemplatePath = path.join(themeDir, 'templates', 'home.html');
            const frontPagePath = path.join(themeDir, 'templates', 'front-page.html');
            if (await fs.pathExists(homeTemplatePath)) {
                const finalizedHome = await fs.readFile(homeTemplatePath, 'utf8');
                await fs.writeFile(frontPagePath, finalizedHome);
                console.log('[ContentEngine] Synced front-page.html from finalized home.html.');
            }
        }
    }
}
