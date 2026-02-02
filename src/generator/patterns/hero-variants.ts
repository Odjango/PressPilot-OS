/**
 * NOTE: Keep in sync with PHP variants in:
 * src/preview/heroPreviewInjector.ts (pp_hero_* functions)
 *
 * This TypeScript file generates hero markup at build time for the final theme.
 * The PHP mirror generates the same markup at runtime for hero preview screenshots.
 * Both must produce identical HTML/block structures for visual consistency.
 */
import { PageContent, HeroLayout } from '../types';

/**
 * Hero Layout Variants - TT4-Aligned
 *
 * Four distinct hero layouts for homepage customization:
 * - fullBleed: Full-screen image hero with dark overlay (default)
 * - fullWidth: Solid color band hero (no image)
 * - split: Text left, image right columns
 * - minimal: Clean text-only on white background
 *
 * All variants use TT4 semantic color tokens for consistent theming.
 *
 * Hero Best Practices Applied:
 * 1. Clear text-background contrast: 75% overlay on image heroes
 * 2. Overlay color: Using accent-3 for branded overlay on busy images
 * 3. Max text width: ~900px (contentSize) for optimal readability
 * 4. Generous vertical spacing: spacing|60 (tall) and spacing|50 (medium)
 * 5. CTA differentiation: Primary is solid button, secondary is outline
 */

/**
 * Full-Bleed Hero
 * Full-screen background image with 75% dark overlay.
 * Uses accent-3 for branded overlay color.
 */
export function getFullBleedHero(content?: PageContent): string {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';
    const heroImage = content?.hero_image || '{{HERO_IMAGE}}';

    return `<!-- wp:cover {"url":"${heroImage}","dimRatio":75,"overlayColor":"accent-3","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained","contentSize":"900px"}} -->
<div class="wp-block-cover alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <img class="wp-block-cover__image-background" src="${heroImage}" alt="" data-object-fit="cover"/>
    <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-70 has-background-dim"></span>
    <div class="wp-block-cover__inner-container">
        <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)"}},"textColor":"base"} -->
        <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:clamp(2.5rem, 5vw, 4rem)">${title}</h1>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"base"} -->
        <p class="has-text-align-center has-base-color has-text-color has-large-font-size">${sub}</p>
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
<!-- /wp:cover -->`;
}

/**
 * Full-Width Band Hero
 * Solid color band without background image.
 * Uses accent-3 for branded background.
 */
export function getFullWidthHero(content?: PageContent): string {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"accent-3","layout":{"type":"constrained","contentSize":"900px"}} -->
<div class="wp-block-group alignfull has-accent-3-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)"}},"textColor":"base"} -->
    <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:clamp(2.5rem, 5vw, 4rem)">${title}</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color has-large-font-size">${sub}</p>
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
<!-- /wp:group -->`;
}

/**
 * Split Hero
 * Two-column layout: text on left, image on right.
 * White/base background with contrast text.
 */
export function getSplitHero(content?: PageContent): string {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';
    const heroImage = content?.hero_image || '{{HERO_IMAGE}}';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
            <!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"clamp(2.25rem, 4vw, 3.5rem)"}},"textColor":"contrast"} -->
            <h1 class="wp-block-heading has-contrast-color has-text-color" style="font-size:clamp(2.25rem, 4vw, 3.5rem)">${title}</h1>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"large","textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color has-large-font-size">${sub}</p>
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
            <figure class="wp-block-image size-large has-custom-border"><img src="${heroImage}" alt="" style="border-radius:12px"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

/**
 * Minimal Hero
 * Clean text-only hero on white background.
 * Large centered heading with subtle styling.
 */
export function getMinimalHero(content?: PageContent): string {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.75rem, 6vw, 4.5rem)","lineHeight":"1.1"}},"textColor":"contrast"} -->
    <h1 class="wp-block-heading has-text-align-center has-contrast-color has-text-color" style="font-size:clamp(2.75rem, 6vw, 4.5rem);line-height:1.1">${title}</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"contrast-2","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color has-large-font-size" style="margin-top:var(--wp--preset--spacing--20)">${sub}</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--40)">
        <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"border":{"radius":"6px"},"spacing":{"padding":{"left":"var:preset|spacing|40","right":"var:preset|spacing|40","top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:6px;padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--40)">Get Started</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}

/**
 * Get hero content by layout type
 */
export function getHeroByLayout(layout: HeroLayout | undefined, content?: PageContent): string {
    switch (layout) {
        case 'fullBleed':
            return getFullBleedHero(content);
        case 'fullWidth':
            return getFullWidthHero(content);
        case 'split':
            return getSplitHero(content);
        case 'minimal':
            return getMinimalHero(content);
        default:
            // Default to fullBleed
            return getFullBleedHero(content);
    }
}
