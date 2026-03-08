import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getEcommerceBannerSaleSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;
    const bgColor = section.backgroundColor || 'accent';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between","verticalAlignment":"center","flexWrap":"wrap"}} -->
    <div class="wp-block-group alignwide is-layout-flex">
        <!-- wp:group {"layout":{"type":"constrained"}} -->
        <div class="wp-block-group">
            <!-- wp:paragraph {"textColor":"base","fontSize":"small"} -->
            <p class="has-base-color has-text-color has-small-font-size"><strong>{{sale_discount}} OFF</strong> · Ends {{sale_end_date}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"textColor":"base"} -->
            <h2 class="wp-block-heading has-base-color has-text-color">{{sale_headline}}</h2>
            <!-- /wp:heading -->
        </div>
        <!-- /wp:group -->
        <!-- wp:button {"backgroundColor":"base","textColor":"accent","style":{"border":{"radius":"${buttonRadius}"},"typography":{"fontWeight":"${buttonWeight}"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-accent-color has-base-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">Shop the Sale</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}
