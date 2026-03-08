import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getRestaurantLocationMapSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const address = render.content?.full_address || '123 Main Street, Downtown';
    const phone = render.content?.phone || '(555) 010-1100';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide are-vertically-aligned-center">
        <!-- wp:column {"width":"58%"} -->
        <div class="wp-block-column" style="flex-basis:58%">
            <!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"${tokens.radius.image}"}}} -->
            <figure class="wp-block-image size-large has-custom-border"><img src="https://placehold.co/1200x700/e6e6e6/2b2b2b?text=Map+and+Neighborhood" alt="Map and neighborhood" style="border-radius:${tokens.radius.image}"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"42%"} -->
        <div class="wp-block-column" style="flex-basis:42%">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":3,"textColor":"contrast"} -->
                <h3 class="wp-block-heading has-contrast-color has-text-color">Find Us</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">${address}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>${phone}</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:buttons -->
                <div class="wp-block-buttons">
                    <!-- wp:button {"backgroundColor":"accent","style":{"border":{"radius":"${tokens.radius.button}"}}} -->
                    <div class="wp-block-button"><a class="wp-block-button__link has-accent-background-color has-background wp-element-button" style="border-radius:${tokens.radius.button}">Get Directions</a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
