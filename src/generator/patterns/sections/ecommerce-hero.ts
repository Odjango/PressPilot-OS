/**
 * Ecommerce Hero Section - Generator 2.0 Phase 4
 *
 * Full-width hero with featured collection/promotion.
 * Uses Group block with solid contrast background (token-based).
 *
 * Token mappings:
 * - Button radius: tokens.radius.button
 * - Button weight: tokens.typography.buttonWeight
 * - Hero background: tokens.colors.newsletterBg (contrast - guaranteed dark)
 * - Hero text color: tokens.colors.heroOverlayText (base - guaranteed light)
 */

import type { SectionContext } from '../../recipes/types';

export function getEcommerceHeroSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const businessName = render.content?.business_name || 'Our Store';
    const tagline = render.content?.hero_sub || 'Discover our collection';

    // Token-driven values
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;
    const heroText = tokens.colors.heroOverlayText;  // 'base' (white/light)
    const heroBg = tokens.colors.newsletterBg;       // 'contrast' (dark) - reuse safe dark token

    return `<!-- wp:group {"align":"full","backgroundColor":"${heroBg}","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${heroBg}-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
    <!-- wp:group {"layout":{"type":"constrained","contentSize":"800px"}} -->
    <div class="wp-block-group">
        <!-- wp:heading {"textAlign":"center","level":1,"textColor":"${heroText}","style":{"typography":{"fontSize":"3.5rem","fontWeight":"700"}}} -->
        <h1 class="wp-block-heading has-text-align-center has-${heroText}-color has-text-color" style="font-size:3.5rem;font-weight:700">${businessName}</h1>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","textColor":"${heroText}","style":{"typography":{"fontSize":"1.25rem"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
        <p class="has-text-align-center has-${heroText}-color has-text-color" style="font-size:1.25rem;margin-top:var(--wp--preset--spacing--30)">${tagline}</p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"textAlign":"center","level":2,"textColor":"${heroText}","style":{"typography":{"fontSize":"3rem","fontWeight":"600"},"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
        <h2 class="wp-block-heading has-text-align-center has-${heroText}-color has-text-color" style="font-size:3rem;font-weight:600;margin-top:var(--wp--preset--spacing--50)">Featured Collection</h2>
        <!-- /wp:heading -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
        <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--40)">
            <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"border":{"radius":"${buttonRadius}"},"typography":{"fontWeight":"${buttonWeight}"},"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight};padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40)">Shop Now</a></div>
            <!-- /wp:button -->
            <!-- wp:button {"backgroundColor":"base","textColor":"contrast","style":{"border":{"radius":"${buttonRadius}"},"typography":{"fontWeight":"${buttonWeight}"},"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-base-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight};padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40)">View Collections</a></div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}
