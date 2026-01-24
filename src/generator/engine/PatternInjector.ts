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

    async injectGallery(themeDir: string, safeName: string): Promise<void> {
        console.log('[Pattern] Injecting Portfolio Gallery...');

        // 1. Create Gallery Template
        const galleryContent = `<!-- wp:template-part {"slug":"header","theme":"${safeName}","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">Gallery</h1>
    <!-- /wp:heading -->

    <!-- wp:columns {"align":"wide"} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x800" alt="Gallery Image 1"/></figure>
            <!-- /wp:image -->
             <!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x500" alt="Gallery Image 2"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
        
        <!-- wp:column -->
        <div class="wp-block-column">
             <!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x500" alt="Gallery Image 3"/></figure>
            <!-- /wp:image -->
            <!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x800" alt="Gallery Image 4"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->

         <!-- wp:column -->
        <div class="wp-block-column">
             <!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x700" alt="Gallery Image 5"/></figure>
            <!-- /wp:image -->
             <!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
            <figure class="wp-block-image size-large"><img src="https://placehold.co/600x600" alt="Gallery Image 6"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","theme":"${safeName}","tagName":"footer"} /-->`;

        await fs.ensureDir(path.join(themeDir, 'templates'));
        await fs.writeFile(path.join(themeDir, 'templates', 'page-gallery.html'), galleryContent);

        // 2. Inject Nav Link
        await this.injectNavLink(themeDir, 'Gallery', '/gallery');
    }

    async injectSchedule(themeDir: string, safeName: string): Promise<void> {
        console.log('[Pattern] Injecting Fitness Schedule...');

        // 1. Create Schedule Template
        const scheduleContent = `<!-- wp:template-part {"slug":"header","theme":"${safeName}","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">Class Schedule</h1>
    <!-- /wp:heading -->

    <!-- wp:table {"hasFixedLayout":true,"className":"is-style-stripes"} -->
    <figure class="wp-block-table is-style-stripes">
        <table class="has-fixed-layout">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Class</th>
                    <th>Trainer</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>09:00 AM</td>
                    <td>Morning Flow Yoga</td>
                    <td>Sarah</td>
                </tr>
                <tr>
                    <td>10:30 AM</td>
                    <td>HIIT Blast</td>
                    <td>Mike</td>
                </tr>
                <tr>
                    <td>05:00 PM</td>
                    <td>Power Lifting</td>
                    <td>Jessica</td>
                </tr>
                 <tr>
                    <td>06:30 PM</td>
                    <td>Evening Meditation</td>
                    <td>David</td>
                </tr>
            </tbody>
        </table>
    </figure>
    <!-- /wp:table -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","theme":"${safeName}","tagName":"footer"} /-->`;

        await fs.ensureDir(path.join(themeDir, 'templates'));
        await fs.writeFile(path.join(themeDir, 'templates', 'page-schedule.html'), scheduleContent);

        // 2. Inject Nav Link
        await this.injectNavLink(themeDir, 'Schedule', '/schedule');
    }


    async injectWooCommerce(themeDir: string, safeName: string): Promise<void> {
        console.log('[Pattern] Injecting WooCommerce Templates...');

        // 1. Create Product Archive Template (Shop Page)
        const archiveContent = `<!-- wp:template-part {"slug":"header","theme":"${safeName}","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">Shop</h1>
    <!-- /wp:heading -->

    <!-- wp:query {"query":{"perPage":9,"pages":0,"offset":0,"postType":"product","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false},"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-query alignwide">
        <!-- wp:post-template {"align":"wide","layout":{"type":"grid","columnCount":3}} -->
        <!-- wp:group {"style":{"border":{"width":"1px","radius":"8px"},"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}}},"borderColor":"border-light","layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
        <div class="wp-block-group has-border-light-border-color" style="border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:post-featured-image {"isLink":true,"height":"200px","align":"center"} /-->
            
            <!-- wp:post-title {"isLink":true,"textAlign":"center","fontSize":"medium"} /-->
            
            <!-- wp:woocommerce/product-price {"textAlign":"center"} /-->
            
            <!-- wp:woocommerce/product-button {"textAlign":"center"} /-->
        </div>
        <!-- /wp:group -->
        <!-- /wp:post-template -->

        <!-- wp:query-pagination {"layout":{"type":"flex","justifyContent":"center"}} -->
        <!-- wp:query-pagination-previous /-->
        <!-- wp:query-pagination-numbers /-->
        <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","theme":"${safeName}","tagName":"footer"} /-->`;

        await fs.ensureDir(path.join(themeDir, 'templates'));
        await fs.writeFile(path.join(themeDir, 'templates', 'archive-product.html'), archiveContent);

        // 2. Create Single Product Template
        const singleProductContent = `<!-- wp:template-part {"slug":"header","theme":"${safeName}","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"width":"50%"} -->
        <div class="wp-block-column" style="flex-basis:50%">
            <!-- wp:post-featured-image /-->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"50%","verticalAlignment":"center"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
            <!-- wp:post-title {"level":1} /-->
            <!-- wp:woocommerce/product-price {"fontSize":"large"} /-->
            <!-- wp:post-excerpt /-->
            <!-- wp:woocommerce/product-button /-->
            <!-- wp:woocommerce/product-meta /-->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
    
    <!-- wp:spacer {"height":"var:preset|spacing|50"} -->
    <div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>
    <!-- /wp:spacer -->

    <!-- wp:heading -->
    <h2>Description</h2>
    <!-- /wp:heading -->
    <!-- wp:post-content /-->

</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","theme":"${safeName}","tagName":"footer"} /-->`;

        await fs.writeFile(path.join(themeDir, 'templates', 'single-product.html'), singleProductContent);

        // 3. Inject Nav Link
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
