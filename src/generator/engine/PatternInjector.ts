import fs from 'fs-extra';
import path from 'path';
import { GeneratorData, ThemePersonality } from '../types';
import { UNIVERSAL_PATTERNS } from '../config/PatternRegistry';
import { getUniversalBlogContent, getUniversalFooterContent, getUniversalHeaderContent, getArchiveContent, getSearchContent, getUniversalHomeContent } from '../patterns';
import { generateMenuPattern } from '../patterns/restaurant-menu';
import { getFooterColors } from '../patterns/color-mapping';
import { getModernImageUrl } from '../utils/ImageProvider';
import { ContentJSON } from '../modules/ContentBuilder';

export class PatternInjector {
    constructor(private rootDir: string) { }

    async injectRecipe(themeDir: string, recipe: import('../types').LayoutRecipe, contentJson: any, personality: ThemePersonality, safeName: string, userData: GeneratorData): Promise<void> {
        console.log(`[Pattern] Strategy (Vertical Focus) for ${safeName}...`);

        let templateContent = '';

        for (const patternPath of recipe.patterns) {
            if (patternPath.includes('header') || patternPath.includes('footer')) continue;

            const fullPath = path.join(themeDir, patternPath);
            if (await fs.pathExists(fullPath)) {
                let content = await fs.readFile(fullPath, 'utf8');

                const slugMatch = content.match(/Slug:\s+([^\r\n]+)/);
                const slug = slugMatch ? slugMatch[1].trim() : null;
                if (!slug) continue;

                // 2. Inject Content (Using Builder Slots)
                for (const [search, replace] of Object.entries(contentJson.slots)) {
                    // Escape search string for regex and replace all occurrences globally
                    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(escapedSearch, 'g');
                    content = content.replace(regex, replace);
                }

                // Global "Etudes" / "architects" cleanup if not already in slots
                if (!contentJson.slots['Études']) {
                    content = content.replace(/Études/g, userData.name || 'PressPilot');
                }

                // IMAGE REPLACEMENT
                const imgRegex = /src="([^"]*?(?:patterns\/images\/|assets\/images\/)(?!logo)[^"]*?)"/g;
                let imgMatch;
                let imgCount = 0;
                while ((imgMatch = imgRegex.exec(content)) !== null) {
                    const unsplashUrl = contentJson.hero.images[imgCount % contentJson.hero.images.length];
                    content = content.replace(imgMatch[1], unsplashUrl);
                    imgCount++;
                }

                await fs.writeFile(fullPath, content);
                templateContent += `<!-- wp:pattern {"slug":"${slug}"} /-->\n`;
            }
        }

        // FSE Block Grammar Security Part
        const fullContent = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"type":"constrained","contentSize":"1000px","wideSize":"1200px"},"align":"full"} -->
<main class="wp-block-group alignfull">
${templateContent}
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

        const templates = ['front-page.html', 'index.html', 'home.html'];
        for (const tpl of templates) {
            await fs.writeFile(path.join(themeDir, 'templates', tpl), fullContent);
        }

        // Force Canonical Parts (Header/Footer)
        await this.injectGlobalParts(themeDir, userData, safeName, contentJson.pages);
    }


    async injectHeavyMode(themeDir: string, personality: ThemePersonality, userData: GeneratorData, safeName: string, contentJson: any): Promise<void> {
        console.log('[Pattern] Building Vault-Validated Landing Page...');

        const heavyPatternSrc = path.join(this.rootDir, UNIVERSAL_PATTERNS.heavy);
        const heavyPatternDest = path.join(themeDir, 'patterns', 'presspilot-heavy.php');
        await fs.copy(heavyPatternSrc, heavyPatternDest);

        // Forced Home Template
        if (personality.home_template) {
            const homeTemplatePath = path.join(themeDir, personality.home_template);
            const homeContent = {
                hero_title: userData.hero_headline,
                hero_sub: userData.hero_subheadline
            };

            const fullContent = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"type":"constrained","contentSize":"1000px","wideSize":"1200px"},"align":"full"} -->
<main class="wp-block-group alignfull">
${getUniversalHomeContent(homeContent).trim()}
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

            await fs.writeFile(homeTemplatePath, fullContent);
        }

        // Global Overrides
        await this.injectGlobalParts(themeDir, userData, safeName, contentJson.pages);
    }

    private async injectGlobalParts(themeDir: string, userData: GeneratorData, safeName: string, pages?: any[]): Promise<void> {
        const businessName = userData.name || 'PressPilot Site';
        const baseTheme = userData.baseName || 'twentytwentyfour';

        const footerPath = path.join(themeDir, 'parts', 'footer.html');
        await fs.ensureDir(path.dirname(footerPath));
        let footerContent = getUniversalFooterContent(businessName, baseTheme).trim();
        footerContent = footerContent.replace(/\{THEME_SLUG\}/g, safeName);
        await fs.writeFile(footerPath, footerContent);

        const headerPath = path.join(themeDir, 'parts', 'header.html');
        await fs.ensureDir(path.dirname(headerPath));
        const finalPages = pages || userData.pages || [];
        let headerContent = getUniversalHeaderContent(businessName, finalPages, userData.logo).trim();
        headerContent = headerContent.replace(/\{THEME_SLUG\}/g, safeName);
        await fs.writeFile(headerPath, headerContent);
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
            // Premium Layout: Dark Header + Content
            const colors = getFooterColors(userData.baseName || 'twentytwentyfour');
            const menuPageTemplate = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"${colors.darkBg}","textColor":"${colors.lightText}","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${colors.lightText}-color has-${colors.darkBg}-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"800"}}} -->
    <h1 class="wp-block-heading has-text-align-center" style="font-style:normal;font-weight:800">Our Menu</h1>
    <!-- /wp:heading -->
</div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:pattern {"slug":"presspilot/menu"} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

            await fs.ensureDir(path.join(themeDir, 'templates'));
            await fs.writeFile(path.join(themeDir, 'templates', 'page-menu.html'), menuPageTemplate);
            await this.injectNavLink(themeDir, 'Menu', '/menu');
        }
    }

    async injectFitnessSchedule(themeDir: string, userData: GeneratorData, safeName: string): Promise<void> {
        console.log(`[PatternMatcher] Injecting Fitness Schedule for '${safeName}'...`);

        const colors = getFooterColors(userData.baseName || 'twentytwentyfour');

        const schedulePatternHtml = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"${colors.darkBg}","textColor":"${colors.lightText}","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${colors.lightText}-color has-${colors.darkBg}-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"800"}}} -->
    <h1 class="wp-block-heading has-text-align-center" style="font-style:normal;font-weight:800">Class Schedule</h1>
    <!-- /wp:heading -->
</div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    {{SCHEDULE_TABLE}}
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

        // Generate Schedule Table Rows
        const scheduleTableHtml = `
    <!-- wp:table {"hasFixedLayout":true,"className":"is-style-stripes"} -->
    <figure class="wp-block-table is-style-stripes">
        <table class="has-fixed-layout">
            <thead>
                <tr><th>Time</th><th>Class</th><th>Trainer</th></tr>
            </thead>
            <tbody>
                <tr><td>09:00 AM</td><td>Morning Flow</td><td>Sarah</td></tr>
                <tr><td>10:30 AM</td><td>HIIT Blast</td><td>Mike</td></tr>
                <tr><td>06:00 PM</td><td>Power Yoga</td><td>David</td></tr>
            </tbody>
        </table>
    </figure>
    <!-- /wp:table -->`;

        const scheduleContent = schedulePatternHtml.replace('{{SCHEDULE_TABLE}}', scheduleTableHtml);

        await fs.ensureDir(path.join(themeDir, 'templates'));
        await fs.writeFile(path.join(themeDir, 'templates', 'page-schedule.html'), scheduleContent);
        await this.injectNavLink(themeDir, 'Schedule', '/schedule');
    }

    async injectWooCommerce(themeDir: string, safeName: string): Promise<void> {
        console.log(`[PatternMatcher] Injecting WooCommerce Support for '${safeName}'...`);

        // 1. Inject Theme Support in functions.php
        const functionsPath = path.join(themeDir, 'functions.php');
        if (await fs.pathExists(functionsPath)) {
            let content = await fs.readFile(functionsPath, 'utf8');
            const wooSupport = `
/* PressPilot WooCommerce Support */
add_action('after_setup_theme', function() {
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
});
`;
            // Append to file
            if (!content.includes("add_theme_support('woocommerce')")) {
                await fs.appendFile(functionsPath, wooSupport);
                console.log(`[PatternMatcher] Added WooCommerce support to functions.php`);
            }
        }

        // 2. Inject Universal Shop Pattern
        const sourcePattern = path.join(this.rootDir, 'src', 'generator', 'assets', 'patterns', 'universal-shop-grid.php');
        const destPattern = path.join(themeDir, 'patterns', 'shop-grid.php');

        if (await fs.pathExists(sourcePattern)) {
            await fs.copy(sourcePattern, destPattern);
            console.log(`[PatternMatcher] Injected 'shop-grid.php' pattern.`);
        } else {
            console.warn(`[PatternMatcher] Warning: Universal Shop pattern not found at ${sourcePattern}`);
        }

        // 3. Inject Cart Pattern
        const cartPatternSource = path.join(this.rootDir, 'src', 'generator', 'assets', 'patterns', 'universal-cart.php');
        const cartPatternDest = path.join(themeDir, 'patterns', 'cart.php');

        if (await fs.pathExists(cartPatternSource)) {
            await fs.copy(cartPatternSource, cartPatternDest);
            console.log(`[PatternMatcher] Injected 'cart.php' pattern.`);
        }

        // 4. Inject Checkout Pattern
        const checkoutPatternSource = path.join(this.rootDir, 'src', 'generator', 'assets', 'patterns', 'universal-checkout.php');
        const checkoutPatternDest = path.join(themeDir, 'patterns', 'checkout.php');

        if (await fs.pathExists(checkoutPatternSource)) {
            await fs.copy(checkoutPatternSource, checkoutPatternDest);
            console.log(`[PatternMatcher] Injected 'checkout.php' pattern.`);
        }

        // 5. CREATE page-shop.html TEMPLATE
        const shopPageTemplate = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"main","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-main-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"}}} -->
    <h1 class="wp-block-heading has-text-align-center" style="font-style:normal;font-weight:700">Shop</h1>
    <!-- /wp:heading -->
</div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:pattern {"slug":"presspilot/shop-grid"} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

        const shopTemplatePath = path.join(themeDir, 'templates', 'page-shop.html');
        await fs.ensureDir(path.dirname(shopTemplatePath));
        await fs.writeFile(shopTemplatePath, shopPageTemplate);
        console.log(`[PatternMatcher] Created 'page-shop.html' template.`);

        // 6. CREATE page-cart.html TEMPLATE
        const cartPageTemplate = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"main","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-main-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"}}} -->
    <h1 class="wp-block-heading has-text-align-center" style="font-style:normal;font-weight:700">Cart</h1>
    <!-- /wp:heading -->
</div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:pattern {"slug":"presspilot/cart"} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

        const cartTemplatePath = path.join(themeDir, 'templates', 'page-cart.html');
        await fs.writeFile(cartTemplatePath, cartPageTemplate);
        console.log(`[PatternMatcher] Created 'page-cart.html' template.`);

        // 7. CREATE page-checkout.html TEMPLATE
        const checkoutPageTemplate = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"main","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-main-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"}}} -->
    <h1 class="wp-block-heading has-text-align-center" style="font-style:normal;font-weight:700">Checkout</h1>
    <!-- /wp:heading -->
</div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:pattern {"slug":"presspilot/checkout"} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

        const checkoutTemplatePath = path.join(themeDir, 'templates', 'page-checkout.html');
        await fs.writeFile(checkoutTemplatePath, checkoutPageTemplate);
        console.log(`[PatternMatcher] Created 'page-checkout.html' template.`);

        // 8. Inject Navigation Links
        await this.injectNavLink(themeDir, 'Shop', '/shop');
        await this.injectNavLink(themeDir, 'Cart', '/cart');
    }

    private async injectNavLink(themeDir: string, label: string, url: string): Promise<void> {
        const headerPath = path.join(themeDir, 'parts', 'header.html');
        let targetPath = headerPath;

        if (!await fs.pathExists(targetPath)) {
            const patternsHeader = path.join(themeDir, 'patterns', 'header.php');
            if (await fs.pathExists(patternsHeader)) {
                targetPath = patternsHeader;
            } else {
                console.warn(`[Pattern] Could not find header to inject navigation link for ${label}`);
                return;
            }
        }

        let content = await fs.readFile(targetPath, 'utf8');

        // Check if link already exists
        if (content.includes(`"url":"${url}"`) || content.includes(`"url":"/${label.toLowerCase()}"`)) {
            console.log(`[Pattern] Nav link for ${url} already exists. Skipping.`);
            return;
        }

        // Check for Pattern Reference and redirect if needed
        const patternMatch = content.match(/<!-- wp:pattern {"slug":"([^"]+)"} \/-->/);
        if (patternMatch && patternMatch[1]) {
            const patternSlug = patternMatch[1];
            const slugParts = patternSlug.split('/');
            const cleanSlug = slugParts.length > 1 ? slugParts[1] : slugParts[0];

            const patternFilePhp = path.join(themeDir, 'patterns', `${cleanSlug}.php`);
            const patternFileHtml = path.join(themeDir, 'patterns', `${cleanSlug}.html`);

            if (await fs.pathExists(patternFilePhp)) {
                console.log(`[Pattern] Redirecting Nav Injection to Pattern: ${cleanSlug}.php`);
                targetPath = patternFilePhp;
                content = await fs.readFile(targetPath, 'utf8');
            } else if (await fs.pathExists(patternFileHtml)) {
                console.log(`[Pattern] Redirecting Nav Injection to Pattern: ${cleanSlug}.html`);
                targetPath = patternFileHtml;
                content = await fs.readFile(targetPath, 'utf8');
            }
        }

        const navLinkHtml = `<!-- wp:navigation-link {"label":"${label}","url":"${url}","kind":"custom","isTopLevelLink":true} /-->`;

        // SIMPLE FIX: Insert before the closing navigation tag
        const closingNavTag = '<!-- /wp:navigation -->';

        if (content.includes(closingNavTag)) {
            // Insert new link just before the closing tag
            content = content.replace(closingNavTag, `${navLinkHtml}\n${closingNavTag}`);
            await fs.writeFile(targetPath, content);
            console.log(`[Pattern] Injected '${label}' link into Header Navigation.`);
        } else {
            // Navigation might be self-closing: <!-- wp:navigation {...} /-->
            const selfClosingRegex = /(<!-- wp:navigation\s+(\{[^}]*\})\s*)\/-->/;
            const match = content.match(selfClosingRegex);

            if (match) {
                // Convert self-closing to paired block with our link
                const newBlock = `${match[1]}-->\n${navLinkHtml}\n<!-- /wp:navigation -->`;
                content = content.replace(match[0], newBlock);
                await fs.writeFile(targetPath, content);
                console.log(`[Pattern] Injected '${label}' link into Header Navigation (converted self-closing).`);
            } else {
                console.warn(`[Pattern] No wp:navigation block found in header for ${label}. Skipping.`);
            }
        }
    }
}