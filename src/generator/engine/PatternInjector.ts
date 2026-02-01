import fs from 'fs-extra';
import path from 'path';
import { GeneratorData, ThemePersonality } from '../types';
import { UNIVERSAL_PATTERNS } from '../config/PatternRegistry';
import { getUniversalBlogContent, getUniversalFooterContent, getUniversalHeaderContent, getArchiveContent, getSearchContent, getUniversalHomeContent } from '../patterns';
import { generateMenuPattern } from '../patterns/restaurant-menu';
import { getModernImageUrl } from '../utils/ImageProvider';
import { ContentJSON } from '../modules/ContentBuilder';

/**
 * Detects if a string is a base64 data URI
 */
function isBase64DataUri(str: string): boolean {
    return str?.startsWith('data:image/');
}

/**
 * Extracts the file extension from a base64 data URI
 */
function getExtensionFromDataUri(dataUri: string): string {
    const match = dataUri.match(/data:image\/(\w+)/);
    if (match) {
        const format = match[1].toLowerCase();
        // Normalize jpeg to jpg
        return format === 'jpeg' ? 'jpg' : format;
    }
    return 'png'; // Default to png
}

/**
 * Saves a base64 data URI as an actual image file in the theme
 * Returns a URL path with {THEME_SLUG} placeholder for use in HTML template parts
 *
 * IMPORTANT: FSE template parts (.html files) don't execute PHP, so we use a
 * static URL with a placeholder that gets replaced by the theme slug.
 * This creates a valid WordPress theme asset URL.
 */
async function saveBase64AsFile(themeDir: string, dataUri: string): Promise<string> {
    const ext = getExtensionFromDataUri(dataUri);
    const base64Data = dataUri.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const assetsDir = path.join(themeDir, 'assets', 'images');
    await fs.ensureDir(assetsDir);

    const fileName = `logo.${ext}`;
    const filePath = path.join(assetsDir, fileName);
    await fs.writeFile(filePath, buffer);

    console.log(`[Pattern] Saved logo to ${filePath}`);

    // Return WordPress theme asset URL with placeholder
    // {THEME_SLUG} gets replaced in injectGlobalParts after header/footer content is generated
    // This creates a valid URL like: /wp-content/themes/my-theme/assets/images/logo.png
    return `/wp-content/themes/{THEME_SLUG}/assets/images/${fileName}`;
}

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

                // Normalize core/cover background class to match Gutenberg save output
                // Removes has-background-dim-XX classes that cause block validation errors
                content = content.replace(
                    /class="wp-block-cover__background([^"]*?)has-background-dim-\d+([^"]*)"/g,
                    'class="wp-block-cover__background$1$2"'
                );

                // Fix core/cover element order: WordPress expects <img> BEFORE <span>
                // Pattern has <span>...<img>, but Gutenberg save outputs <img>...<span>
                content = content.replace(
                    /(<span[^>]*class="wp-block-cover__background[^"]*"[^>]*><\/span>)\s*(<img[^>]*class="wp-block-cover__image-background[^"]*"[^>]*\/>)/g,
                    '$2\n    $1'
                );

                // Skip CTA patterns from global replacements to preserve Buttons/Button block grammar
                // Global string replacements can corrupt block markup, causing "Attempt recovery" error
                if (slug.includes('cta-') || slug.includes('cta/') || slug.includes('/cta')) {
                    templateContent += `<!-- wp:pattern {"slug":"${slug}"} /-->\n`;
                    await fs.writeFile(fullPath, content);
                    continue;
                }

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

            let homeMarkup = getUniversalHomeContent(homeContent).trim();

            // Normalize cover block element order (img before span) for Gutenberg compatibility
            homeMarkup = homeMarkup.replace(
                /(<span[^>]*class="wp-block-cover__background[^"]*"[^>]*><\/span>)\s*(<img[^>]*class="wp-block-cover__image-background[^"]*"[^>]*\/>)/g,
                '$2\n    $1'
            );

            const fullContent = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"type":"constrained","contentSize":"1000px","wideSize":"1200px"},"align":"full"} -->
<main class="wp-block-group alignfull">
${homeMarkup}
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

        // Handle logo: save base64 to file and set up auto-registration
        // wp:site-logo block reads from WordPress Site Identity (custom_logo theme_mod)
        let hasLogo = false;
        let logoFileName = '';

        if (userData.logo && isBase64DataUri(userData.logo)) {
            console.log("[Pattern] Detected base64 logo, saving as file...");
            const ext = getExtensionFromDataUri(userData.logo);
            logoFileName = `logo.${ext}`;
            await saveBase64AsFile(themeDir, userData.logo);
            hasLogo = true;

            // Auto-setup logo on theme activation using after_switch_theme hook
            // This uploads the logo to media library and sets it as custom_logo
            await this.addLogoAutoSetup(themeDir, logoFileName, safeName);
        } else if (userData.logo) {
            // External URL provided - still mark as having logo
            hasLogo = true;
            console.log("[Pattern] Logo URL provided:", userData.logo.substring(0, 50) + "...");
        }

        console.log("[DEBUG] Has logo:", hasLogo);

        const footerPath = path.join(themeDir, 'parts', 'footer.html');
        await fs.ensureDir(path.dirname(footerPath));
        let footerContent = getUniversalFooterContent(businessName, baseTheme, pages || userData.pages || [], hasLogo).trim();
        footerContent = footerContent.replace(/\{THEME_SLUG\}/g, safeName);
        await fs.writeFile(footerPath, footerContent);

        const headerPath = path.join(themeDir, 'parts', 'header.html');
        await fs.ensureDir(path.dirname(headerPath));
        const finalPages = pages || userData.pages || [];
        let headerContent = getUniversalHeaderContent(businessName, finalPages, hasLogo).trim();
        headerContent = headerContent.replace(/\{THEME_SLUG\}/g, safeName);
        await fs.writeFile(headerPath, headerContent);
    }

    /**
     * Auto-setup logo on theme activation using after_switch_theme hook
     * Uploads the logo from assets/images/ to WordPress media library
     * and sets it as the custom_logo theme_mod
     *
     * Uses pure PHP (no tag switching) to avoid parse errors in namespaced files
     */
    private async addLogoAutoSetup(themeDir: string, logoFileName: string, safeName: string): Promise<void> {
        const functionsPath = path.join(themeDir, 'functions.php');
        // Prefix with 'pp_' to ensure valid PHP function name (can't start with number)
        const funcName = 'pp_' + safeName.replace(/-/g, '_');

        const autoSetupCode = `
/**
 * PressPilot: Auto-setup logo on theme activation
 * Logo file: assets/images/${logoFileName}
 * Uses wp_upload_bits() for reliable file upload in all WordPress environments
 */
function ${funcName}_setup_logo() {
    // Only run once - check if we've already set up
    if (get_option('${funcName}_logo_setup_done')) {
        return;
    }

    $logo_path = get_template_directory() . '/assets/images/${logoFileName}';
    if (!file_exists($logo_path)) {
        error_log('PressPilot Logo Setup: File not found at ' . $logo_path);
        return;
    }

    // Skip if logo already set by user
    if (get_theme_mod('custom_logo')) {
        update_option('${funcName}_logo_setup_done', true);
        return;
    }

    // Include required WordPress functions
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/media.php');

    // Read file content
    $file_content = file_get_contents($logo_path);
    if ($file_content === false) {
        error_log('PressPilot Logo Setup: Could not read file');
        return;
    }

    $filename = basename($logo_path);

    // Use wp_upload_bits - the WordPress-native way to upload files
    // Works reliably in WordPress Playground and all WP environments
    $upload = wp_upload_bits($filename, null, $file_content);

    if (!empty($upload['error'])) {
        error_log('PressPilot Logo Setup: Upload error - ' . $upload['error']);
        return;
    }

    // Get file type
    $filetype = wp_check_filetype($filename, null);

    // Create attachment post
    $attachment = array(
        'post_mime_type' => $filetype['type'],
        'post_title'     => sanitize_file_name(pathinfo($filename, PATHINFO_FILENAME)),
        'post_content'   => '',
        'post_status'    => 'inherit'
    );

    $attach_id = wp_insert_attachment($attachment, $upload['file']);

    if (!is_wp_error($attach_id) && $attach_id > 0) {
        // Generate attachment metadata
        $attach_data = wp_generate_attachment_metadata($attach_id, $upload['file']);
        wp_update_attachment_metadata($attach_id, $attach_data);

        // Set as site logo
        set_theme_mod('custom_logo', $attach_id);
        error_log('PressPilot Logo Setup: Success! Attachment ID: ' . $attach_id);
    } else {
        error_log('PressPilot Logo Setup: Failed to create attachment');
    }

    update_option('${funcName}_logo_setup_done', true);
}
// Use namespace-aware callback (works with namespaced themes like Ollie)
$${funcName}_setup_func = ( __NAMESPACE__ ? __NAMESPACE__ . '\\\\' : '' ) . '${funcName}_setup_logo';
add_action('after_switch_theme', $${funcName}_setup_func);

// Also run on init to ensure it runs on any page load (frontend or admin)
function ${funcName}_maybe_setup_logo() {
    if (!get_option('${funcName}_logo_setup_done') && !get_theme_mod('custom_logo')) {
        ${funcName}_setup_logo();
    }
}
$${funcName}_init_func = ( __NAMESPACE__ ? __NAMESPACE__ . '\\\\' : '' ) . '${funcName}_maybe_setup_logo';
add_action('init', $${funcName}_init_func);
`;

        if (await fs.pathExists(functionsPath)) {
            let content = await fs.readFile(functionsPath, 'utf8');
            // Check if auto-setup already exists
            if (!content.includes('_setup_logo')) {
                // Append to end
                content += '\n' + autoSetupCode;
                await fs.writeFile(functionsPath, content);
                console.log("[Pattern] Added logo auto-setup to functions.php");
            }
        }
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
            // Use semantic colors "contrast" (dark) and "base" (light) for guaranteed readability
            const menuPageTemplate = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"textColor":"base","style":{"typography":{"fontStyle":"normal","fontWeight":"800"}}} -->
    <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-style:normal;font-weight:800">Our Menu</h1>
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

        // Use semantic colors "contrast" (dark) and "base" (light) for guaranteed readability
        const schedulePatternHtml = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"textColor":"base","style":{"typography":{"fontStyle":"normal","fontWeight":"800"}}} -->
    <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-style:normal;font-weight:800">Class Schedule</h1>
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