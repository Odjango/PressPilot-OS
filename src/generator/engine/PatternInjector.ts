import fs from 'fs-extra';
import path from 'path';
import { GeneratorData, ThemePersonality } from '../types';
import { UNIVERSAL_PATTERNS } from '../config/PatternRegistry';
import { getUniversalBlogContent, getUniversalFooterContent, getUniversalHeaderContent, getArchiveContent, getSearchContent, getUniversalHomeContent } from '../patterns';
import { generateMenuPattern } from '../patterns/restaurant-menu';
import { getModernImageUrl } from '../utils/ImageProvider';
import { ContentJSON } from '../modules/ContentBuilder';

/**
 * Demo content replacement patterns by base theme.
 * Applied defensively to ALL themes—order matters for overlapping patterns.
 *
 * Used by cleanAllPatterns() and applyLegacyReplacements() to remove
 * Frost, Tove, and TT4 demo/marketing content from generated themes.
 *
 * When adding a new base theme:
 * 1. Add entry here with brandName and replacements array
 * 2. Update cleanAllPatterns() loop if needed
 * 3. Add corresponding entries to ContentValidator.FORBIDDEN_STRINGS
 */
const LEGACY_DEMO_CONTENT = {
    // TwentyTwentyFour (TT4) demo content
    tt4: {
        brandName: 'Études',
        replacements: [
            { pattern: /Études/g, key: 'name', fallback: 'PressPilot' }
        ]
    },
    // Frost agency theme demo content
    frost: {
        brandName: 'Frost',
        replacements: [
            { pattern: /Build with Frost/g, key: 'name', fallback: 'Our Services' },
            { pattern: /Frost is a powerful WordPress theme created for agencies and professional website builders\./g, key: 'description', fallback: 'We provide exceptional service tailored to your needs.' },
            // Testimonial text (Frost marketing copy - multiple variants)
            { pattern: /With its clean, minimal design and powerful features, Frost enables agencies to build cool websites\./g, key: null, fallback: 'The experience was exceptional from start to finish. Highly recommended!' },
            { pattern: /With its clean, minimal design and powerful features, This theme enables you to build cool websites\./g, key: null, fallback: 'Outstanding service and attention to detail. Truly impressed!' },
            // Testimonial demo names (with titles - must come before without titles)
            { pattern: /Allison Taylor, Designer/g, key: null, fallback: 'Sarah M., Regular Guest' },
            { pattern: /Anthony Breck, Developer/g, key: null, fallback: 'Michael T., Satisfied Customer' },
            { pattern: /Rebecca Jones, Coach/g, key: null, fallback: 'Jennifer L., Happy Diner' },
            // Testimonial demo names (without titles - for testimonials-image patterns)
            { pattern: /Allison Taylor/g, key: null, fallback: 'Sarah M.' },
            { pattern: /Anthony Breck/g, key: null, fallback: 'Michael T.' },
            { pattern: /Rebecca Jones/g, key: null, fallback: 'Jennifer L.' }
        ]
    },
    // Tove cafe theme demo content
    tove: {
        brandName: 'Niofika',
        replacements: [
            // Brand name
            { pattern: /Niofika Café/g, key: 'name', fallback: 'Our Business' },
            { pattern: /Niofika/g, key: 'name', fallback: 'Our Business' },
            // Address
            { pattern: /Hammarby Kaj 10/g, key: 'address', fallback: '123 Main Street' },
            { pattern: /120 32 Stockholm/g, key: 'city', fallback: 'City, State 12345' },
            { pattern: /Hammarby Sjöstad/g, key: 'neighborhood', fallback: 'Downtown' },
            { pattern: /Stockholm/g, key: 'city', fallback: 'Your City' },
            // Contact info
            { pattern: /hammarby@niofika\.se/g, key: 'email', fallback: 'info@yourbusiness.com' },
            { pattern: /08-123 45 67/g, key: 'phone', fallback: '(555) 123-4567' },
            // Testimonial attribution
            { pattern: /Coffee Snob/g, key: null, fallback: 'Happy Customer' }
        ],
        // Café-specific content (only replaced for non-café businesses)
        cafeSpecific: [
            { pattern: /the best coffee/g, replacement: 'the best service' },
            { pattern: /your morning cup of coffee/g, replacement: 'what you need' },
            { pattern: /preorder your coffee/g, replacement: 'place your order' }
        ]
    }
};

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

    /**
     * Sanitize ALL base theme patterns from demo/marketing content.
     *
     * This method is called after chassis.load() to clean patterns inherited
     * from base themes (Frost, Tove, TT4). It applies ALL replacement patterns
     * regardless of which base theme was loaded—this is defensive by design.
     *
     * Targets known legacy demo/marketing strings only:
     * - Frost: "Build with Frost", testimonial names (Allison Taylor, etc.)
     * - Tove: "Niofika Café", Stockholm addresses, demo contact info
     * - TT4: "Études" brand name
     *
     * Safe to call for all themes. Update LEGACY_DEMO_CONTENT if new base
     * themes are added to the chassis system.
     *
     * @param themeDir - Path to the theme being generated
     * @param userData - User data for dynamic replacements
     */
    async cleanAllPatterns(themeDir: string, userData: GeneratorData): Promise<void> {
        const patternsDir = path.join(themeDir, 'patterns');
        if (!await fs.pathExists(patternsDir)) {
            return;
        }

        const files = await fs.readdir(patternsDir);
        let cleanedCount = 0;

        for (const file of files) {
            if (!file.endsWith('.php') && !file.endsWith('.html')) continue;

            const filePath = path.join(patternsDir, file);
            let content = await fs.readFile(filePath, 'utf8');
            const originalContent = content;

            // Apply all legacy demo content replacements
            for (const replacement of LEGACY_DEMO_CONTENT.frost.replacements) {
                const value = replacement.key ? (userData as any)[replacement.key] : null;
                content = content.replace(replacement.pattern, value || replacement.fallback);
            }

            for (const replacement of LEGACY_DEMO_CONTENT.tove.replacements) {
                const value = replacement.key ? (userData as any)[replacement.key] : null;
                content = content.replace(replacement.pattern, value || replacement.fallback);
            }

            for (const replacement of LEGACY_DEMO_CONTENT.tt4.replacements) {
                const value = replacement.key ? (userData as any)[replacement.key] : null;
                content = content.replace(replacement.pattern, value || replacement.fallback);
            }

            // Café-specific content (only replaced for non-café businesses)
            if (userData.industry !== 'cafe') {
                for (const replacement of LEGACY_DEMO_CONTENT.tove.cafeSpecific) {
                    content = content.replace(replacement.pattern, replacement.replacement);
                }
            }

            // Only write if content changed
            if (content !== originalContent) {
                await fs.writeFile(filePath, content);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`[Pattern] Cleaned ${cleanedCount} pattern files from demo content`);
        }
    }

    /**
     * Apply slot-based replacements from ContentBuilder
     * This is the primary content injection method using {{PLACEHOLDER}} format
     */
    private applySlotReplacements(content: string, slots: Record<string, string>): string {
        for (const [search, replace] of Object.entries(slots)) {
            // Escape search string for regex and replace all occurrences globally
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedSearch, 'g');
            content = content.replace(regex, replace);
        }
        return content;
    }

    /**
     * Apply legacy replacements for base theme demo content (Frost, Tove, TT4/Études)
     * This is a compatibility layer for patterns that still have hardcoded demo strings
     *
     * Only runs if:
     * 1. The content contains demo strings from the base theme
     * 2. User data is available to replace them with
     */
    private applyLegacyReplacements(content: string, userData: GeneratorData, slots: Record<string, string>): string {
        // TT4 "Études" replacement (only if not already in slots)
        if (!slots['Études']) {
            for (const replacement of LEGACY_DEMO_CONTENT.tt4.replacements) {
                const value = replacement.key ? (userData as any)[replacement.key] : null;
                content = content.replace(replacement.pattern, value || replacement.fallback);
            }
        }

        // Frost "Build with Frost" replacements
        for (const replacement of LEGACY_DEMO_CONTENT.frost.replacements) {
            const value = replacement.key ? (userData as any)[replacement.key] : null;
            content = content.replace(replacement.pattern, value || replacement.fallback);
        }

        // Tove "Niofika" replacements
        for (const replacement of LEGACY_DEMO_CONTENT.tove.replacements) {
            const value = replacement.key ? (userData as any)[replacement.key] : null;
            content = content.replace(replacement.pattern, value || replacement.fallback);
        }

        // Café-specific content (only replaced for non-café businesses)
        if (userData.industry !== 'cafe') {
            for (const replacement of LEGACY_DEMO_CONTENT.tove.cafeSpecific) {
                content = content.replace(replacement.pattern, replacement.replacement);
            }
        }

        return content;
    }

    /**
     * Apply image replacements from ContentBuilder's hero images
     * Replaces pattern/asset image paths with Unsplash URLs
     */
    private applyImageReplacements(content: string, heroImages: string[]): string {
        const imgRegex = /src="([^"]*?(?:patterns\/images\/|assets\/images\/)(?!logo)[^"]*?)"/g;
        let imgMatch;
        let imgCount = 0;

        // Create a new string to avoid regex state issues
        let result = content;
        const matches: { original: string; replacement: string }[] = [];

        while ((imgMatch = imgRegex.exec(content)) !== null) {
            const unsplashUrl = heroImages[imgCount % heroImages.length];
            matches.push({ original: imgMatch[1], replacement: unsplashUrl });
            imgCount++;
        }

        // Apply replacements
        for (const match of matches) {
            result = result.replace(match.original, match.replacement);
        }

        return result;
    }

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

                // 2. Inject Content (Using Builder Slots) - Primary replacement method
                content = this.applySlotReplacements(content, contentJson.slots);

                // 3. Legacy replacements for base theme demo content (Tove, TT4)
                // This is a compatibility layer for patterns with hardcoded demo strings
                content = this.applyLegacyReplacements(content, userData, contentJson.slots);

                // 4. Image replacement - swap pattern images with Unsplash URLs
                content = this.applyImageReplacements(content, contentJson.hero.images);

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

            // Pass heroLayout, industry, and brandStyle for content customization
            // brandStyle enables playful vs modern visual differentiation for restaurants
            let homeMarkup = getUniversalHomeContent(homeContent, userData.heroLayout, userData.industry, userData.brandStyle).trim();

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

            // Also write to front-page.html, index.html, home.html for WordPress FSE compatibility
            // WordPress looks for front-page.html when "Your homepage displays" is set to "A static page"
            const homeTemplates = ['front-page.html', 'index.html', 'home.html'];
            for (const tpl of homeTemplates) {
                await fs.writeFile(path.join(themeDir, 'templates', tpl), fullContent);
            }
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
        const isEcommerce = ['ecommerce', 'retail', 'shop', 'online_store'].includes(userData.industry?.toLowerCase() || '');
        let headerContent = getUniversalHeaderContent(businessName, finalPages, hasLogo, isEcommerce).trim();
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

        // 8. CREATE archive-product.html TEMPLATE (WooCommerce product listing)
        const archiveProductTemplate = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center">Shop</h1>
    <!-- /wp:heading -->
</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--70)">
    <!-- wp:woocommerce/product-collection {"query":{"perPage":12,"pages":0,"offset":0,"postType":"product","order":"asc","orderBy":"title","search":"","exclude":[],"inherit":true,"taxQuery":{},"isProductCollectionBlock":true,"woocommerceHandPickedProducts":[]},"tagName":"div","displayLayout":{"type":"flex","columns":4},"queryContextIncludes":["collection"]} -->
    <div class="wp-block-woocommerce-product-collection">
        <!-- wp:woocommerce/product-template -->
        <!-- wp:woocommerce/product-image {"isDescendentOfQueryLoop":true,"aspectRatio":"1","style":{"spacing":{"margin":{"bottom":"var:preset|spacing|20"}}}} /-->
        <!-- wp:post-title {"textAlign":"center","level":3,"isLink":true,"style":{"typography":{"fontSize":"1rem","fontWeight":"600"},"spacing":{"margin":{"top":"0","bottom":"var:preset|spacing|10"}}}} /-->
        <!-- wp:woocommerce/product-price {"isDescendentOfQueryLoop":true,"textAlign":"center","style":{"typography":{"fontSize":"0.9rem"}}} /-->
        <!-- wp:woocommerce/product-button {"textAlign":"center","isDescendentOfQueryLoop":true} /-->
        <!-- /wp:woocommerce/product-template -->
        <!-- wp:query-pagination {"layout":{"type":"flex","justifyContent":"center"}} -->
        <!-- wp:query-pagination-previous /-->
        <!-- wp:query-pagination-numbers /-->
        <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
        <!-- wp:query-no-results -->
        <!-- wp:paragraph {"align":"center"} -->
        <p class="has-text-align-center">No products found.</p>
        <!-- /wp:paragraph -->
        <!-- /wp:query-no-results -->
    </div>
    <!-- /wp:woocommerce/product-collection -->
</div>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

        const archiveProductPath = path.join(themeDir, 'templates', 'archive-product.html');
        await fs.writeFile(archiveProductPath, archiveProductTemplate);
        console.log(`[WooCommerce] Created 'archive-product.html' template.`);

        // 9. CREATE single-product.html TEMPLATE (WooCommerce product detail)
        const singleProductTemplate = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--70)">
    <!-- wp:woocommerce/breadcrumbs /-->

    <!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"},"margin":{"top":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-columns" style="margin-top:var(--wp--preset--spacing--40)">
        <!-- wp:column {"width":"50%"} -->
        <div class="wp-block-column" style="flex-basis:50%">
            <!-- wp:woocommerce/product-image-gallery /-->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"50%"} -->
        <div class="wp-block-column" style="flex-basis:50%">
            <!-- wp:post-title {"level":1,"style":{"typography":{"fontSize":"2.5rem","fontWeight":"700"},"spacing":{"margin":{"bottom":"var:preset|spacing|20"}}}} /-->
            <!-- wp:woocommerce/product-price {"style":{"typography":{"fontSize":"1.5rem","fontWeight":"600"},"spacing":{"margin":{"bottom":"var:preset|spacing|30"}}}} /-->
            <!-- wp:post-excerpt {"moreText":"","showMoreOnNewLine":false,"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}}} /-->
            <!-- wp:woocommerce/add-to-cart-form /-->
            <!-- wp:woocommerce/product-meta {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-woocommerce-product-meta">
                <!-- wp:woocommerce/product-sku {"isDescendentOfSingleProductTemplate":true} /-->
                <!-- wp:post-terms {"term":"product_cat","prefix":"Category: "} /-->
                <!-- wp:post-terms {"term":"product_tag","prefix":"Tags: "} /-->
            </div>
            <!-- /wp:woocommerce/product-meta -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:woocommerce/product-details {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|70"}}}} /-->

    <!-- wp:group {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|70"}}}} -->
    <div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--70)">
        <!-- wp:heading {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}}} -->
        <h2 class="wp-block-heading" style="margin-bottom:var(--wp--preset--spacing--40)">Related Products</h2>
        <!-- /wp:heading -->
        <!-- wp:woocommerce/related-products {"columns":4} -->
        <div class="wp-block-woocommerce-related-products">
            <!-- wp:woocommerce/product-template -->
            <!-- wp:woocommerce/product-image {"aspectRatio":"1"} /-->
            <!-- wp:post-title {"textAlign":"center","level":3,"isLink":true,"style":{"typography":{"fontSize":"1rem"}}} /-->
            <!-- wp:woocommerce/product-price {"textAlign":"center"} /-->
            <!-- /wp:woocommerce/product-template -->
        </div>
        <!-- /wp:woocommerce/related-products -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

        const singleProductPath = path.join(themeDir, 'templates', 'single-product.html');
        await fs.writeFile(singleProductPath, singleProductTemplate);
        console.log(`[WooCommerce] Created 'single-product.html' template.`);

        // 10. Inject Navigation Links
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