import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getPortfolioProjectCardSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base-2';

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","backgroundColor":"base","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
        <!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
        <div class="wp-block-columns are-vertically-aligned-center">
            <!-- wp:column --><div class="wp-block-column">
                <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.card}"}}} -->
                <figure class="wp-block-image size-large"><img src="{{project_1_image}}" alt="{{project_1_title}}" style="border-radius:${tokens.radius.card}"/></figure>
                <!-- /wp:image -->
            </div><!-- /wp:column -->
            <!-- wp:column --><div class="wp-block-column">
                <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} --><p class="has-accent-color has-text-color has-small-font-size">{{project_1_category}}</p><!-- /wp:paragraph -->
                <!-- wp:heading {"textColor":"contrast"} --><h2 class="wp-block-heading has-contrast-color has-text-color">{{project_1_title}}</h2><!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast-2"} --><p class="has-contrast-2-color has-text-color">{{project_1_description}}</p><!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast"} --><p class="has-contrast-color has-text-color"><strong>{{project_1_tags}}</strong></p><!-- /wp:paragraph -->
                <!-- wp:buttons --><div class="wp-block-buttons">
                    <!-- wp:button {"backgroundColor":"contrast","textColor":"base","style":{"border":{"radius":"${tokens.radius.button}"},"typography":{"fontWeight":"${tokens.typography.buttonWeight}"}}} -->
                    <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-contrast-background-color has-text-color has-background wp-element-button" style="border-radius:${tokens.radius.button};font-weight:${tokens.typography.buttonWeight}">View Case Study</a></div>
                    <!-- /wp:button -->
                </div><!-- /wp:buttons -->
            </div><!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}
