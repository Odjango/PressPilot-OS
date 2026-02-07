/**
 * Ecommerce Newsletter Section - Generator 2.0 Phase 4
 *
 * Email signup CTA section with headline, subtitle, and subscribe button.
 * Uses contrast (dark) background for WCAG AA guaranteed readability.
 *
 * Token mappings:
 * - Section padding: tokens.spacing.sectionPadding
 * - Button radius: tokens.radius.button
 * - Button weight: tokens.typography.buttonWeight
 * - Background: tokens.colors.newsletterBg (WCAG AA safe)
 * - Text: tokens.colors.newsletterText (WCAG AA safe)
 */

import type { SectionContext } from '../../recipes/types';

export function getEcommerceNewsletterSectionWithContext(ctx: SectionContext): string {
    const { tokens } = ctx;

    // Token-driven values
    const sectionPadding = tokens.spacing.sectionPadding;
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;

    // Safe token pairs for WCAG AA contrast
    const bgColor = tokens.colors.newsletterBg;
    const textColor = tokens.colors.newsletterText;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"${bgColor}","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:group {"layout":{"type":"constrained","contentSize":"600px"}} -->
    <div class="wp-block-group">
        <!-- wp:heading {"textAlign":"center","textColor":"${textColor}"} -->
        <h2 class="wp-block-heading has-text-align-center has-${textColor}-color has-text-color">Stay in the Loop</h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","textColor":"${textColor}"} -->
        <p class="has-text-align-center has-${textColor}-color has-text-color">Subscribe to our newsletter for exclusive deals, new arrivals, and style tips.</p>
        <!-- /wp:paragraph -->
        <!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center"}} -->
        <div class="wp-block-group is-layout-flex is-nowrap is-content-justification-center" style="margin-top:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"textColor":"contrast","style":{"border":{"radius":"${buttonRadius}","width":"1px"},"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}},"layout":{"selfStretch":"fixed","flexSize":"300px"}},"backgroundColor":"base"} -->
            <p class="has-contrast-color has-base-background-color has-text-color has-background" style="border-width:1px;border-radius:${buttonRadius};padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30)">Enter your email address</p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons -->
            <div class="wp-block-buttons">
                <!-- wp:button {"backgroundColor":"accent","textColor":"base","style":{"border":{"radius":"${buttonRadius}"},"typography":{"fontWeight":"${buttonWeight}"},"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}}} -->
                <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight};padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30)">Subscribe</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
        <!-- wp:paragraph {"align":"center","textColor":"${textColor}","fontSize":"small","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
        <p class="has-text-align-center has-${textColor}-color has-text-color has-small-font-size" style="margin-top:var(--wp--preset--spacing--20)">No spam, unsubscribe anytime.</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}
