import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getSaasFeaturesGridSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const bgColor = section.backgroundColor || 'base';

    const card = (n: number) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"backgroundColor":"base-2","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
                <p class="has-accent-color has-text-color has-small-font-size"><strong>0${n}</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:heading {"level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color">{{feature_${n}_title}}</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">{{feature_${n}_description}}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Everything Your Team Needs</h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
        <p class="has-text-align-center has-contrast-2-color has-text-color">{{description}}</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        ${card(1)}
        ${card(2)}
        ${card(3)}
    </div>
    <!-- /wp:columns -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.cardPadding}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.cardPadding)}">
        ${card(4)}
        ${card(5)}
        ${card(6)}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
