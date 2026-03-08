import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getPortfolioExperienceSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const bgColor = section.backgroundColor || 'base-2';

    const row = (n: number) => `<!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.cardPadding}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.cardPadding)}">
        <!-- wp:column {"width":"25%"} --><div class="wp-block-column" style="flex-basis:25%"><!-- wp:paragraph {"textColor":"accent"} --><p class="has-accent-color has-text-color"><strong>{{experience_${n}_period}}</strong></p><!-- /wp:paragraph --></div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column">
            <!-- wp:heading {"level":4,"textColor":"contrast"} --><h4 class="wp-block-heading has-contrast-color has-text-color">{{experience_${n}_role}} · {{experience_${n}_company}}</h4><!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} --><p class="has-contrast-2-color has-text-color">{{experience_${n}_description}}</p><!-- /wp:paragraph -->
        </div><!-- /wp:column -->
    </div>
    <!-- /wp:columns -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"align":"wide","textColor":"contrast"} --><h2 class="wp-block-heading alignwide has-contrast-color has-text-color">Experience</h2><!-- /wp:heading -->
    ${row(1)}${row(2)}${row(3)}
</div>
<!-- /wp:group -->`;
}
