import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getSaasCTABannerSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;
    const bgColor = section.backgroundColor || 'accent';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"base"} -->
    <h2 class="wp-block-heading has-text-align-center has-base-color has-text-color">Ready to Scale {{product_name}}?</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color">{{description}}</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"${tokens.spacing.buttonMarginTop}"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:${tokenToCSS(tokens.spacing.buttonMarginTop)}">
        <!-- wp:button {"backgroundColor":"base","textColor":"contrast","style":{"border":{"radius":"${buttonRadius}"},"typography":{"fontWeight":"${buttonWeight}"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-base-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">Get Started</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}
