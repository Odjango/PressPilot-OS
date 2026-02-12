/**
 * Hero Preview Injector
 *
 * NOTE: Keep this PHP hero variant output in sync with:
 * src/generator/patterns/hero-variants.ts
 *
 * Generates PHP code that enables dynamic hero layout switching
 * via query parameter (?pp_hero_preview=<layout>) for the
 * Real Hero Preview feature.
 *
 * The PHP functions (pp_hero_full_bleed, pp_hero_full_width, etc.)
 * mirror the TypeScript functions in hero-variants.ts. Both must
 * produce identical HTML/block markup for visual consistency.
 */

import fs from 'fs-extra';
import path from 'path';
import { HeroLayout, PageContent } from '../generator/types';

/**
 * Generate PHP code for hero preview support
 * This mirrors the hero-variants.ts patterns but outputs PHP
 */
function generateHeroVariantsPHP(content: PageContent): string {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';
    const heroImage = content?.hero_image || '';

    // Escape for PHP strings
    const escTitle = title.replace(/'/g, "\\'");
    const escSub = sub.replace(/'/g, "\\'");
    const escImage = heroImage.replace(/'/g, "\\'");

    return `
// PressPilot Hero Preview Support
// Enables dynamic hero layout switching via ?pp_hero_preview=<layout>

add_action('wp', function() {
    if (!isset(\$_GET['pp_hero_preview'])) return;

    \$layout = sanitize_text_field(\$_GET['pp_hero_preview']);
    \$valid = array('fullBleed', 'fullWidth', 'split', 'minimal');
    if (!in_array(\$layout, \$valid)) return;

    // Store layout for template override
    define('PP_HERO_PREVIEW_LAYOUT', \$layout);
});

add_filter('render_block', function(\$block_content, \$block) {
    if (!defined('PP_HERO_PREVIEW_LAYOUT')) return \$block_content;

    // Only replace the first hero block
    static \$hero_replaced = false;
    if (\$hero_replaced) return \$block_content;

    // Match hero pattern blocks directly (highest priority)
    // This catches patterns like "tove/hero-cover" BEFORE WordPress expands them
    \$is_hero_pattern = \$block['blockName'] === 'core/pattern' &&
        isset(\$block['attrs']['slug']) &&
        strpos(\$block['attrs']['slug'], 'hero') !== false;

    // Match cover blocks with alignfull AND min-height (hero-specific)
    // Covers fullBleed layout which uses core/cover with min-height:80vh
    \$is_cover = \$block['blockName'] === 'core/cover' &&
        strpos(\$block_content, 'alignfull') !== false &&
        strpos(\$block_content, 'min-height') !== false;

    // Match group blocks that are hero sections (fullWidth, split, minimal layouts)
    // These use core/group with alignfull and specific spacing values
    \$is_hero_group = \$block['blockName'] === 'core/group' &&
        strpos(\$block_content, 'alignfull') !== false &&
        (strpos(\$block_content, 'spacing--40') !== false ||  // fullWidth
         strpos(\$block_content, 'spacing--60') !== false ||  // split
         strpos(\$block_content, 'spacing--70') !== false ||  // fullBleed (variant)
         strpos(\$block_content, 'spacing--80') !== false);   // minimal

    // Replace hero pattern, cover, or group blocks that look like heroes
    if (\$is_hero_pattern || \$is_cover || \$is_hero_group) {
        \$hero_replaced = true;
        return pp_get_hero_variant(PP_HERO_PREVIEW_LAYOUT);
    }

    return \$block_content;
}, 10, 2);

function pp_get_hero_variant(\$layout) {
    \$title = '${escTitle}';
    \$sub = '${escSub}';
    \$image = '${escImage}';

    switch (\$layout) {
        case 'fullBleed':
            return pp_hero_full_bleed(\$title, \$sub, \$image);
        case 'fullWidth':
            return pp_hero_full_width(\$title, \$sub);
        case 'split':
            return pp_hero_split(\$title, \$sub, \$image);
        case 'minimal':
            return pp_hero_minimal(\$title, \$sub);
        default:
            return pp_hero_full_bleed(\$title, \$sub, \$image);
    }
}

function pp_hero_full_bleed(\$title, \$sub, \$image) {
    // Full-bleed hero: 80vh min-height, LEFT-aligned text, large heading
    // Key differentiators: immersive height, text-align-left, spacing|70
    return '<!-- wp:cover {"url":"' . esc_attr(\$image) . '","dimRatio":75,"overlayColor":"accent-3","minHeight":80,"minHeightUnit":"vh","contentPosition":"center left","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained","contentSize":"900px","justifyContent":"left"}} -->
<div class="wp-block-cover alignfull has-custom-content-position is-position-center-left" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);min-height:80vh">
    <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-80 has-background-dim" style="background-color:#1a1a2e"></span>
    <img class="wp-block-cover__image-background" alt="" src="' . esc_attr(\$image) . '" data-object-fit="cover"/>
    <div class="wp-block-cover__inner-container">
        <!-- wp:heading {"textAlign":"left","level":1,"style":{"typography":{"fontSize":"clamp(3rem, 6vw, 5rem)","lineHeight":"1.1"}},"textColor":"base"} -->
        <h1 class="wp-block-heading has-text-align-left has-base-color has-text-color" style="font-size:clamp(3rem, 6vw, 5rem);line-height:1.1;color:#ffffff">' . esc_html(\$title) . '</h1>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"large","textColor":"base","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
        <p class="has-base-color has-text-color has-large-font-size" style="margin-top:var(--wp--preset--spacing--20);color:#ffffff">' . esc_html(\$sub) . '</p>
        <!-- /wp:paragraph -->
        <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
        <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
            <!-- wp:button {"backgroundColor":"base","textColor":"contrast"} -->
            <div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-base-background-color has-text-color has-background wp-element-button" style="background-color:#ffffff;color:#1a1a2e">Get Started</a></div>
            <!-- /wp:button -->
            <!-- wp:button {"style":{"border":{"width":"2px"}},"borderColor":"base","textColor":"base","className":"is-style-outline"} -->
            <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-base-color has-text-color has-border-color has-base-border-color wp-element-button" style="border-width:2px;border-color:#ffffff;color:#ffffff">Learn More</a></div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
</div>
<!-- /wp:cover -->';
}

function pp_hero_full_width(\$title, \$sub) {
    // Full-width band: COMPACT solid color band (no image), centered text
    // Key differentiators: shorter padding|40, smaller font, inverted button, 800px width
    return '<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}},"backgroundColor":"accent-3","layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group alignfull has-accent-3-background-color has-background" style="padding-top:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);background-color:#1a1a2e">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2rem, 4vw, 3rem)"}},"textColor":"base"} -->
    <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:clamp(2rem, 4vw, 3rem);color:#ffffff">' . esc_html(\$title) . '</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","fontSize":"medium","textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color has-medium-font-size" style="color:#ffffff">' . esc_html(\$sub) . '</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--20)">
        <!-- wp:button {"backgroundColor":"base","textColor":"accent-3"} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-accent-3-color has-base-background-color has-text-color has-background wp-element-button" style="background-color:#ffffff;color:#1a1a2e">Get Started</a></div>
        <!-- /wp:button -->
        <!-- wp:button {"style":{"border":{"width":"2px"}},"borderColor":"base","textColor":"base","className":"is-style-outline"} -->
        <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-base-color has-text-color has-border-color has-base-border-color wp-element-button" style="border-width:2px;border-color:#ffffff;color:#ffffff">Learn More</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->';
}

function pp_hero_split(\$title, \$sub, \$image) {
    // Split hero: 2-column layout (text left, image right)
    // Key differentiators: spacing|60, 20px image radius, box-shadow, 8px button radius
    return '<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60);background-color:#ffffff">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
            <!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","lineHeight":"1.15"}},"textColor":"contrast"} -->
            <h1 class="wp-block-heading has-contrast-color has-text-color" style="font-size:clamp(2.5rem, 5vw, 4rem);line-height:1.15;color:#111111">' . esc_html(\$title) . '</h1>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"large","textColor":"contrast-2","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
            <p class="has-contrast-2-color has-text-color has-large-font-size" style="margin-top:var(--wp--preset--spacing--20);color:#555555">' . esc_html(\$sub) . '</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
                <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"border":{"radius":"8px"}}} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:8px;background-color:#111111;color:#ffffff">Get Started</a></div>
                <!-- /wp:button -->
                <!-- wp:button {"style":{"border":{"width":"2px","radius":"8px"}},"borderColor":"accent","textColor":"accent","className":"is-style-outline"} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-accent-color has-text-color has-border-color has-accent-border-color wp-element-button" style="border-width:2px;border-radius:8px;border-color:#111111;color:#111111">Learn More</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"50%"} -->
        <div class="wp-block-column" style="flex-basis:50%">
            <!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"20px"},"shadow":"0 10px 40px rgba(0,0,0,0.15)"}} -->
            <figure class="wp-block-image size-large has-custom-border"><img src="' . esc_attr(\$image) . '" alt="" style="border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.15)"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->';
}

function pp_hero_minimal(\$title, \$sub) {
    // Minimal hero: Maximum whitespace, typography-first design
    // Key differentiators: spacing|80, 700px width, huge heading, single PILL button (100px radius)
    return '<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"base","layout":{"type":"constrained","contentSize":"700px"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80);background-color:#ffffff">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(3rem, 7vw, 5rem)","lineHeight":"1.05","letterSpacing":"-0.02em"}},"textColor":"contrast"} -->
    <h1 class="wp-block-heading has-text-align-center has-contrast-color has-text-color" style="font-size:clamp(3rem, 7vw, 5rem);line-height:1.05;letter-spacing:-0.02em;color:#111111">' . esc_html(\$title) . '</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"contrast-2","style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color has-large-font-size" style="margin-top:var(--wp--preset--spacing--30);color:#555555">' . esc_html(\$sub) . '</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:button {"backgroundColor":"contrast","textColor":"base","style":{"border":{"radius":"100px"},"spacing":{"padding":{"left":"var:preset|spacing|50","right":"var:preset|spacing|50","top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-contrast-background-color has-text-color has-background wp-element-button" style="border-radius:100px;padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--50);background-color:#111111;color:#ffffff">Get Started</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->';
}
`;
}

/**
 * Inject hero preview support into a theme's functions.php
 */
export async function injectHeroPreviewSupport(
    themeDir: string,
    content: PageContent
): Promise<void> {
    const functionsPath = path.join(themeDir, 'functions.php');

    if (!await fs.pathExists(functionsPath)) {
        console.error('[heroPreviewInjector] functions.php not found');
        return;
    }

    let functionsContent = await fs.readFile(functionsPath, 'utf8');

    // Check if already injected
    if (functionsContent.includes('PP_HERO_PREVIEW_LAYOUT')) {
        console.log('[heroPreviewInjector] Hero preview support already exists');
        return;
    }

    // Generate the PHP code
    const phpCode = generateHeroVariantsPHP(content);

    // Remove closing PHP tag if present
    functionsContent = functionsContent.replace(/\?>[\s]*$/, '').trim();

    // Append the hero preview code
    functionsContent += '\n\n' + phpCode + '\n';

    await fs.writeFile(functionsPath, functionsContent);
    console.log('[heroPreviewInjector] Injected hero preview support');
}

/**
 * Remove hero preview support from a theme's functions.php
 * (for cleanup after preview generation)
 */
export async function removeHeroPreviewSupport(themeDir: string): Promise<void> {
    const functionsPath = path.join(themeDir, 'functions.php');

    if (!await fs.pathExists(functionsPath)) {
        return;
    }

    let functionsContent = await fs.readFile(functionsPath, 'utf8');

    // Find and remove the hero preview block
    const startMarker = '// PressPilot Hero Preview Support';
    const startIndex = functionsContent.indexOf(startMarker);

    if (startIndex === -1) {
        return; // Not present
    }

    // Remove everything from the marker to the end of the file
    // (since we append it at the end)
    functionsContent = functionsContent.substring(0, startIndex).trim() + '\n';

    await fs.writeFile(functionsPath, functionsContent);
    console.log('[heroPreviewInjector] Removed hero preview support');
}
