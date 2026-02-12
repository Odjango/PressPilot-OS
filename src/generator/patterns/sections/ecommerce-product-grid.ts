import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getEcommerceProductGridSectionWithContext(ctx: SectionContext): string {
    const { tokens, section } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const buttonRadius = tokens.radius.button;
    const buttonWeight = tokens.typography.buttonWeight;
    const bgColor = section.backgroundColor || 'base';

    const item = (n: number) => `<!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"backgroundColor":"base-2","style":{"border":{"radius":"${tokens.radius.card}"},"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.image}"}}} -->
                <figure class="wp-block-image size-large"><img src="{{product_${n}_image}}" alt="{{product_${n}_title}}" style="border-radius:${tokens.radius.image}"/></figure>
                <!-- /wp:image -->
                <!-- wp:heading {"level":5,"textColor":"contrast","style":{"spacing":{"margin":{"top":"${tokens.spacing.cardPadding}"}}}} -->
                <h5 class="wp-block-heading has-contrast-color has-text-color" style="margin-top:${tokenToCSS(tokens.spacing.cardPadding)}">{{product_${n}_title}}</h5>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"accent"} -->
                <p class="has-accent-color has-text-color"><strong>{{product_${n}_price}}</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:button {"width":100,"backgroundColor":"contrast","textColor":"base","style":{"border":{"radius":"${buttonRadius}"},"typography":{"fontWeight":"${buttonWeight}"}}} -->
                <div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link has-base-color has-contrast-background-color has-text-color has-background wp-element-button" style="border-radius:${buttonRadius};font-weight:${buttonWeight}">Quick View</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->`;

    return `<!-- wp:group {"align":"full","backgroundColor":"${bgColor}","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${bgColor}-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Popular Products</h2>
    <!-- /wp:heading -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        ${item(1)}${item(2)}${item(3)}
    </div>
    <!-- /wp:columns -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"${tokens.spacing.cardPadding}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.cardPadding)}">
        ${item(4)}${item(5)}${item(6)}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
