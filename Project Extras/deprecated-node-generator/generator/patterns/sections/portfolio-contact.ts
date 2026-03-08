import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getPortfolioContactSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base-2';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column --><div class="wp-block-column">
            <!-- wp:heading {"textColor":"contrast"} --><h2 class="wp-block-heading has-contrast-color has-text-color">Let's Connect</h2><!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} --><p class="has-contrast-2-color has-text-color">{{bio}}</p><!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast"} --><p class="has-contrast-color has-text-color"><strong>{{email}}</strong></p><!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast"} --><p class="has-contrast-color has-text-color"><strong>{{phone}}</strong></p><!-- /wp:paragraph -->
        </div><!-- /wp:column -->
        <!-- wp:column --><div class="wp-block-column">
            <!-- wp:group {"backgroundColor":"base","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:paragraph {"textColor":"contrast-2"} --><p class="has-contrast-2-color has-text-color">Contact form placeholder</p><!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast"} --><p class="has-contrast-color has-text-color">{{social_facebook}} · {{social_instagram}} · {{social_twitter}}</p><!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div><!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
