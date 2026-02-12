import fs from 'fs-extra';
import path from 'path';
import { generateContentLoader } from '../utils/content-loader-generator';
import { buildPageTemplate, buildFooterTemplate, buildHeaderTemplate } from '../page-builder';
import { ContentJSON } from '../modules/ContentBuilder';
import { sanitizeForPHP } from '../utils/sanitize';

export class ContentEngine {

    async injectContentLoader(themeDir: string, contentJson: ContentJSON): Promise<void> {
        const siteTitle = sanitizeForPHP(contentJson.businessName);
        const tagline = sanitizeForPHP(contentJson.hero.subheadline || '');
        const logoPath = contentJson.slots['{{LOGO_URL}}'] || '';

        console.log(`[ContentEngine] Generating setup script for '${siteTitle}'...`);

        // Ensure pages array exists (make a copy to avoid mutating original)
        const pages = contentJson.pages ? [...contentJson.pages] : [];

        // For ecommerce industry, add Shop, Cart, and Checkout pages
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

            const hasCartPage = pages.some(p => p.slug === 'cart' || (p.title && p.title.toLowerCase() === 'cart'));
            if (!hasCartPage) {
                console.log(`[ContentEngine] Industry is ecommerce, adding Cart page to setup.`);
                pages.push({
                    title: 'Cart',
                    slug: 'cart',
                    template: 'universal-shop'
                });
            }

            const hasCheckoutPage = pages.some(p => p.slug === 'checkout' || (p.title && p.title.toLowerCase() === 'checkout'));
            if (!hasCheckoutPage) {
                console.log(`[ContentEngine] Industry is ecommerce, adding Checkout page to setup.`);
                pages.push({
                    title: 'Checkout',
                    slug: 'checkout',
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

                await buildPageTemplate(themeDir, page, contentJson.baseName, contentJson.heroLayout);
            }
        }
    }
}
