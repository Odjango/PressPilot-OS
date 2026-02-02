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

    // Check if this is a hero block (first cover or full-width group)
    \$is_cover = \$block['blockName'] === 'core/cover' && strpos(\$block_content, 'alignfull') !== false;
    \$is_hero_group = \$block['blockName'] === 'core/group' && strpos(\$block_content, 'alignfull') !== false && strpos(\$block_content, 'hero') === false;

    // Only replace if it's likely the hero section (first alignfull block at top of content)
    if (\$is_cover || (\$is_hero_group && !strpos(\$block_content, 'wp-block-cover'))) {
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
    return '<!-- wp:cover {"url":"' . esc_attr(\$image) . '","dimRatio":75,"overlayColor":"accent-3","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained","contentSize":"900px"}} -->
<div class="wp-block-cover alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <img class="wp-block-cover__image-background" src="' . esc_attr(\$image) . '" alt="" data-object-fit="cover"/>
    <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-70 has-background-dim"></span>
    <div class="wp-block-cover__inner-container">
        <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)"}},"textColor":"base"} -->
        <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:clamp(2.5rem, 5vw, 4rem)">' . esc_html(\$title) . '</h1>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"base"} -->
        <p class="has-text-align-center has-base-color has-text-color has-large-font-size">' . esc_html(\$sub) . '</p>
        <!-- /wp:paragraph -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
        <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--30)">
            <!-- wp:button {"backgroundColor":"accent","textColor":"base"} -->
            <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button">Get Started</a></div>
            <!-- /wp:button -->
            <!-- wp:button {"style":{"border":{"width":"2px"}},"borderColor":"base","textColor":"base","className":"is-style-outline"} -->
            <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-base-color has-text-color has-border-color has-base-border-color wp-element-button" style="border-width:2px">Learn More</a></div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
</div>
<!-- /wp:cover -->';
}

function pp_hero_full_width(\$title, \$sub) {
    return '<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"accent-3","layout":{"type":"constrained","contentSize":"900px"}} -->
<div class="wp-block-group alignfull has-accent-3-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)"}},"textColor":"base"} -->
    <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:clamp(2.5rem, 5vw, 4rem)">' . esc_html(\$title) . '</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color has-large-font-size">' . esc_html(\$sub) . '</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--30)">
        <!-- wp:button {"backgroundColor":"accent","textColor":"base"} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button">Get Started</a></div>
        <!-- /wp:button -->
        <!-- wp:button {"style":{"border":{"width":"2px"}},"borderColor":"base","textColor":"base","className":"is-style-outline"} -->
        <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-base-color has-text-color has-border-color has-base-border-color wp-element-button" style="border-width:2px">Learn More</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->';
}

function pp_hero_split(\$title, \$sub, \$image) {
    return '<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
            <!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"clamp(2.25rem, 4vw, 3.5rem)"}},"textColor":"contrast"} -->
            <h1 class="wp-block-heading has-contrast-color has-text-color" style="font-size:clamp(2.25rem, 4vw, 3.5rem)">' . esc_html(\$title) . '</h1>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"large","textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color has-large-font-size">' . esc_html(\$sub) . '</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
            <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--30)">
                <!-- wp:button {"backgroundColor":"accent","textColor":"base"} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button">Get Started</a></div>
                <!-- /wp:button -->
                <!-- wp:button {"style":{"border":{"width":"2px"}},"borderColor":"accent","textColor":"accent","className":"is-style-outline"} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-accent-color has-text-color has-border-color has-accent-border-color wp-element-button" style="border-width:2px">Learn More</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"50%"} -->
        <div class="wp-block-column" style="flex-basis:50%">
            <!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"12px"}}} -->
            <figure class="wp-block-image size-large has-custom-border"><img src="' . esc_attr(\$image) . '" alt="" style="border-radius:12px"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->';
}

function pp_hero_minimal(\$title, \$sub) {
    return '<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.75rem, 6vw, 4.5rem)","lineHeight":"1.1"}},"textColor":"contrast"} -->
    <h1 class="wp-block-heading has-text-align-center has-contrast-color has-text-color" style="font-size:clamp(2.75rem, 6vw, 4.5rem);line-height:1.1">' . esc_html(\$title) . '</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"contrast-2","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color has-large-font-size" style="margin-top:var(--wp--preset--spacing--20)">' . esc_html(\$sub) . '</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--40)">
        <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"border":{"radius":"6px"},"spacing":{"padding":{"left":"var:preset|spacing|40","right":"var:preset|spacing|40","top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:6px;padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--40)">Get Started</a></div>
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
