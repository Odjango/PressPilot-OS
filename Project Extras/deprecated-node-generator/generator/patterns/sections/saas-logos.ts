import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getSaasLogosSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const bgColor = section.backgroundColor || 'base-2';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:paragraph {"align":"center","textColor":"contrast-2","fontSize":"small"} -->
        <p class="has-text-align-center has-contrast-2-color has-text-color has-small-font-size"><strong>TRUSTED BY MODERN TEAMS</strong></p>
        <!-- /wp:paragraph -->
        <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.buttonMarginTop}"}}}} -->
        <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.buttonMarginTop)}">
            <!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":5,"textAlign":"center","textColor":"contrast"} --><h5 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">{{logo_1_name}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
            <!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":5,"textAlign":"center","textColor":"contrast"} --><h5 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">{{logo_2_name}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
            <!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":5,"textAlign":"center","textColor":"contrast"} --><h5 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">{{logo_3_name}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
            <!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":5,"textAlign":"center","textColor":"contrast"} --><h5 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">{{logo_4_name}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
            <!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":5,"textAlign":"center","textColor":"contrast"} --><h5 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">{{logo_5_name}}</h5><!-- /wp:heading --></div><!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}
