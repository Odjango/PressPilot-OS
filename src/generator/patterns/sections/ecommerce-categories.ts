import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getEcommerceCategoriesSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base-2';

    const category = (n: number) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"backgroundColor":"base","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.image}"}}} -->
                <figure class="wp-block-image size-large"><img src="{{category_${n}_image}}" alt="{{category_${n}_name}}" style="border-radius:${tokens.radius.image}"/></figure>
                <!-- /wp:image -->
                <!-- wp:heading {"textAlign":"center","level":4,"textColor":"contrast","style":{"spacing":{"margin":{"top":"${tokens.spacing.cardPadding}"}}}} -->
                <h4 class="wp-block-heading has-text-align-center has-contrast-color has-text-color" style="margin-top:${tokenToCSS(tokens.spacing.cardPadding)}">{{category_${n}_name}}</h4>
                <!-- /wp:heading -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Shop by Category</h2>
    <!-- /wp:heading -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        ${category(1)}
        ${category(2)}
        ${category(3)}
        ${category(4)}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
