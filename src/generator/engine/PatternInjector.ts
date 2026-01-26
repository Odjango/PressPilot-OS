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
            // Deduplication: Skip headers/footers as they are injected via the global wrapper below
            if (patternPath.includes('header') || patternPath.includes('footer')) {
                console.log(`[Pattern] Deduplication: Skipping ${patternPath} (handled by global wrapper).`);
                continue;
            }

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
                    if (personality.patterns.hero_search_pretitle) {
                        // Replace pre-title with Industry or Empty
                        const preTitle = userData.industry ? userData.industry.toUpperCase() : 'WELCOME';
                        content = content.replace(personality.patterns.hero_search_pretitle, preTitle);
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

        // 3.5 Force Universal Footer (The "FooterFactory" Step)
        const footerPath = path.join(themeDir, 'parts', 'footer.html');
        await fs.ensureDir(path.dirname(footerPath));
        const footerName = userData.name || 'PressPilot Site';
        await fs.writeFile(footerPath, getUniversalFooterContent(footerName).trim());
        console.log(`[Pattern] FooterFactory: Generated branded footer for ${footerName}`);

        // Prepend Header and Append Footer to the Front Page Template
        // This ensures the Homepage uses the SAME header/footer as inner pages
        // FIX: Removed 'theme' and 'tagName' attributes to prevent JSON validation errors and slug mismatches.
        // We use the 'slug' reference which resolves to the file we just wrote above.
        const fullContent = `<!-- wp:template-part {"slug":"header"} /-->
${templateContent}
<!-- wp:template-part {"slug":"footer"} /-->`;

        // 4. Transform to Front Page
        const frontPagePath = path.join(themeDir, 'templates', 'front-page.html');
        await fs.writeFile(frontPagePath, fullContent);
        console.log(`[Pattern] Generated front-page.html with Header/Footer wrapper.`);
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
        const footerPath = path.join(themeDir, 'parts', 'footer.html'); // Ensure parts/footer.html
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
            // Premium Layout: Dark Header + Content
            const menuPageTemplate = `<!-- wp:template-part {"slug":"header","theme":"${safeName}","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"main","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-main-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"}}} -->
    <h1 class="wp-block-heading has-text-align-center" style="font-style:normal;font-weight:700">Our Menu</h1>
    <!-- /wp:heading -->
</div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:pattern {"slug":"presspilot/menu"} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","theme":"${safeName}","tagName":"footer"} /-->`;

            const menuTemplatePath = path.join(themeDir, 'templates', 'page-menu.html');
            await fs.writeFile(menuTemplatePath, menuPageTemplate);
            console.log('[Pattern] Injected Restaurant Menu Pattern & Template.');
            await this.injectNavLink(themeDir, 'Menu', '/menu');
        }

        // 6. FACTORY 3.2: Activate Other Vertical Architects
        if (userData.industry === 'fitness' || userData.industry === 'gym') {
            await this.injectSchedule(themeDir, safeName);
        }

        if (userData.industry === 'portfolio' || userData.industry === 'agency' || userData.industry === 'creative') {
            await this.injectGallery(themeDir, safeName);
        }

        if (userData.industry === 'ecommerce' || userData.industry === 'shop') {
            await this.injectWooCommerce(themeDir, safeName);
        }
    }

    async injectGallery(themeDir: string, safeName: string): Promise<void> {
        console.log('[Pattern] Injecting Portfolio Gallery...');

        // FACTORY v2: Load Pattern
        const patternPath = path.join(process.cwd(), 'src/generator/patterns/library/gallery-pattern.html');
        let galleryPatternHtml = '';
        try {
            galleryPatternHtml = await fs.readFile(patternPath, 'utf8');
        } catch (err) {
            console.warn('[Pattern] Missing gallery-pattern.html');
            return;
        }

        // Generate Grid Items (Safe Images)
        // In V2, we would use real images from userData.images if available
        const galleryItemsHtml = `
    <!-- wp:columns {"align":"wide"} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column -->
        <div class="wp-block-column">
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x800" alt="Gallery Image 1"/></figure>
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x500" alt="Gallery Image 2"/></figure>
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x500" alt="Gallery Image 3"/></figure>
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x800" alt="Gallery Image 4"/></figure>
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->`;

        const galleryContent = galleryPatternHtml.replace('{{GALLERY_GRID}}', galleryItemsHtml);

        await fs.ensureDir(path.join(themeDir, 'templates'));
        await fs.writeFile(path.join(themeDir, 'templates', 'page-gallery.html'), galleryContent);
        await this.injectNavLink(themeDir, 'Gallery', '/gallery');
    }

    async injectSchedule(themeDir: string, safeName: string): Promise<void> {
        console.log('[Pattern] Injecting Fitness Schedule...');

        const patternPath = path.join(process.cwd(), 'src/generator/patterns/library/schedule-pattern.html');
        let schedulePatternHtml = '';
        try {
            schedulePatternHtml = await fs.readFile(patternPath, 'utf8');
        } catch (err) { console.warn('Missing schedule pattern'); return; }

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
            if (!content.includes('add_theme_support(\'woocommerce\')')) {
                await fs.appendFile(functionsPath, wooSupport);
                console.log(`[PatternMatcher] Added WooCommerce support to functions.php`);
            }
        }

        // 2. Inject Universal Shop Pattern
        // Resolves to src/generator/assets/patterns/universal-shop-grid.php
        const sourcePattern = path.join(this.rootDir, 'src', 'generator', 'assets', 'patterns', 'universal-shop-grid.php');
        const destPattern = path.join(themeDir, 'patterns', 'shop-grid.php');

        if (await fs.pathExists(sourcePattern)) {
            await fs.copy(sourcePattern, destPattern);
            console.log(`[PatternMatcher] Injected 'shop-grid.php' pattern.`);
        } else {
            console.warn(`[PatternMatcher] Warning: Universal Shop pattern not found at ${sourcePattern}`);
        }

        // 3. Inject Navigation Link
        await this.injectNavLink(themeDir, 'Shop', '/shop');
    }

    private async injectNavLink(themeDir: string, label: string, url: string): Promise<void> {
        // Smart Injection: Finds core/navigation and injects INSIDE it
        const headerPath = path.join(themeDir, 'parts', 'header.html');
        // Check both 'parts' and 'patterns' for header, just in case, but usually parts/header.html
        let targetPath = headerPath;
        if (!await fs.pathExists(targetPath)) {
            // Fallback for some themes that might put it in patterns? Rare for generic internal structure but good safety
            const patternsHeader = path.join(themeDir, 'patterns', 'header.php');
            if (await fs.pathExists(patternsHeader)) {
                targetPath = patternsHeader;
            } else {
                console.warn(`[Pattern] Could not find header to inject navigation link for ${label}`);
                return;
            }
        }

        let content = await fs.readFile(targetPath, 'utf8');

        // NEW LOGIC: Check for Pattern Reference
        // e.g. <!-- wp:pattern {"slug":"ollie/header-light"} /-->
        const patternMatch = content.match(/<!-- wp:pattern {"slug":"([^"]+)"} \/-->/);

        if (patternMatch && patternMatch[1]) {
            const patternSlug = patternMatch[1];
            // ollie/header-light -> header-light
            // some themes might be just 'header-light'
            const slugParts = patternSlug.split('/');
            const cleanSlug = slugParts.length > 1 ? slugParts[1] : slugParts[0];

            // Look for this file in 'patterns/'
            // Try both .php and .html (though .php is standard for block themes now)
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
            } else {
                console.warn(`[Pattern] Found pattern ref '${patternSlug}' but could not locate file. Falling back to header.html.`);
            }
        }

        // Regex explanation:
        // 1. <!-- wp:navigation - Matches the start of the block
        // 2. (.*?) - Lazy match any attributes (non-greedy)
        // 3. (\/?)--> - Captures the self-closing slash if present, and the closing brackets
        // 4. ([\s\S]*?) - Captures inner content if any (non-greedy)
        // 5. (?:<!-- \/wp:navigation -->)? - Optional closing tag (non-capturing group)
        const navBlockRegex = /<!-- wp:navigation (.*?)( \/)?-->([\s\S]*?)(?:<!-- \/wp:navigation -->)?/;
        const match = content.match(navBlockRegex);

        const navLinkHtml = `<!-- wp:navigation-link {"label":"${label}","url":"${url}","kind":"custom","isTopLevelLink":true} /-->`;

        if (match) {
            const wholeBlock = match[0];
            const attributes = match[1];
            const isSelfClosing = match[2] === ' /'; // Check if we captured the " /"
            const innerContent = match[3];

            let newBlock = '';

            if (isSelfClosing || (!innerContent && !wholeBlock.includes('/wp:navigation'))) {
                // Formatting for Self-Closing: <!-- wp:navigation {...} /-->
                // Transform to: <!-- wp:navigation {...} --> \n {CONTENT} \n <!-- /wp:navigation -->
                newBlock = `<!-- wp:navigation ${attributes} -->\n${navLinkHtml}\n<!-- /wp:navigation -->`;
            } else {
                // Standard: <!-- wp:navigation ... --> ... <!-- /wp:navigation -->
                // We append to the inner content.
                // BE CAREFUL: If wp:page-list is present, we often want to put our link AFTER it? 
                // Or simply append to end of inner. Appending is safest for now.
                newBlock = `<!-- wp:navigation ${attributes} -->${innerContent}\n${navLinkHtml}\n<!-- /wp:navigation -->`;
            }

            content = content.replace(wholeBlock, newBlock);
            console.log(`[Pattern] Injected '${label}' link into Header Navigation.`);
        } else {
            console.warn(`[Pattern] No wp:navigation block found in header for ${label}. Skipping nav injection.`);
        }

        await fs.writeFile(targetPath, content);
    }
}
