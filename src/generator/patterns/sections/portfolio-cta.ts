import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getPortfolioCTASectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const bgColor = section.backgroundColor || 'accent';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"base"} --><h2 class="wp-block-heading has-text-align-center has-base-color has-text-color">Let's Work Together</h2><!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"base"} --><p class="has-text-align-center has-base-color has-text-color">{{tagline}}</p><!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"${tokens.spacing.buttonMarginTop}"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:${tokenToCSS(tokens.spacing.buttonMarginTop)}">
        <!-- wp:button {"backgroundColor":"base","textColor":"contrast","style":{"border":{"radius":"${tokens.radius.button}"},"typography":{"fontWeight":"${tokens.typography.buttonWeight}"}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-base-background-color has-text-color has-background wp-element-button" style="border-radius:${tokens.radius.button};font-weight:${tokens.typography.buttonWeight}">Start a Project</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}
