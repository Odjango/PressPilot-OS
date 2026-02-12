import { PageContent } from '../../types';
import type { SectionContext } from '../../recipes/types';
import { getRestaurantStyleTokens } from './restaurantThemeTokens';
import { tokenToCSS } from '../../utils/BlockHelpers';

/**
 * Restaurant Promo Band Section - Phase 3 Token-Aware Version
 *
 * Full-width dark promotional band for happy hours or special offers.
 * Uses SectionContext for token-driven styling.
 *
 * Token mappings:
 * - Button radius: tokens.radius.button
 * - Button weight: tokens.typography.buttonWeight
 * - Badge weight: tokens.typography.badgeWeight
 * - Section padding: tokens.spacing.sectionPadding
 * - Button margin top: tokens.spacing.buttonMarginTop
 */
export function getRestaurantPromoBandSectionWithContext(ctx: SectionContext): string {
    const { tokens } = ctx;

    // Token-driven values
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;
    const badgeWeight = tokens.typography.badgeWeight;
    const sectionPadding = tokens.spacing.sectionPadding;
    const buttonMarginTop = tokens.spacing.buttonMarginTop;

    return `<!-- wp:cover {"dimRatio":80,"overlayColor":"contrast","minHeight":280,"minHeightUnit":"px","align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}}} -->
<div class="wp-block-cover alignfull" style="min-height:280px;padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-80 has-background-dim"></span>
    <div class="wp-block-cover__inner-container">
        <!-- wp:group {"layout":{"type":"constrained"}} -->
        <div class="wp-block-group">
            <!-- wp:paragraph {"align":"center","textColor":"accent","fontSize":"small","style":{"typography":{"fontWeight":"${badgeWeight}","letterSpacing":"0.05em"}}} -->
            <p class="has-text-align-center has-accent-color has-text-color has-small-font-size" style="font-weight:${badgeWeight};letter-spacing:0.05em">SPECIAL OFFER</p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"textAlign":"center","textColor":"base","style":{"typography":{"fontSize":"2.5rem","fontWeight":"700"}}} -->
            <h2 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:2.5rem;font-weight:700">Happy Hours</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"align":"center","textColor":"base","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}},"typography":{"fontSize":"1.25rem"}}} -->
            <p class="has-text-align-center has-base-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:1.25rem">Monday – Friday, 4pm – 6pm</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"textColor":"base"} -->
            <p class="has-base-color has-text-color has-link-color has-text-align-center">50% off selected appetizers and drinks</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"${buttonMarginTop}"}}}} -->
            <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:${tokenToCSS(buttonMarginTop)}">
                <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"typography":{"fontWeight":"${buttonWeight}"},"border":{"radius":"${buttonRadius}"}}} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">View Specials</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
</div>
<!-- /wp:cover -->`;
}

/**
 * Restaurant Promo Band Section - Legacy API (Backward Compatible)
 *
 * Full-width dark promotional band for happy hours or special offers.
 * NOTE: Uses getRestaurantStyleTokens() internally. New code should use
 * getRestaurantPromoBandSectionWithContext() with SectionContext.
 */
export function getRestaurantPromoBandSection(content?: PageContent, brandStyle?: string): string {
    const tokens = getRestaurantStyleTokens(brandStyle);
    return `<!-- wp:cover {"dimRatio":80,"overlayColor":"contrast","minHeight":280,"minHeightUnit":"px","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}}} -->
<div class="wp-block-cover alignfull" style="min-height:280px;padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-80 has-background-dim"></span>
    <div class="wp-block-cover__inner-container">
        <!-- wp:group {"layout":{"type":"constrained"}} -->
        <div class="wp-block-group">
            <!-- wp:paragraph {"align":"center","textColor":"accent","fontSize":"small","style":{"typography":{"fontWeight":"${tokens.badgeWeight}","letterSpacing":"0.05em"}}} -->
            <p class="has-text-align-center has-accent-color has-text-color has-small-font-size" style="font-weight:${tokens.badgeWeight};letter-spacing:0.05em">SPECIAL OFFER</p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"textAlign":"center","textColor":"base","style":{"typography":{"fontSize":"2.5rem","fontWeight":"700"}}} -->
            <h2 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:2.5rem;font-weight:700">Happy Hours</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"align":"center","textColor":"base","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}},"typography":{"fontSize":"1.25rem"}}} -->
            <p class="has-text-align-center has-base-color has-text-color" style="margin-top:var(--wp--preset--spacing--20);font-size:1.25rem">Monday – Friday, 4pm – 6pm</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"textColor":"base"} -->
            <p class="has-base-color has-text-color has-link-color has-text-align-center">50% off selected appetizers and drinks</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--40)">
                <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"typography":{"fontWeight":"${tokens.buttonWeight}"},"border":{"radius":"${tokens.buttonRadius}"}}} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:${tokens.buttonRadius};font-weight:${tokens.buttonWeight}">View Specials</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
</div>
<!-- /wp:cover -->`;
}
