import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';
import { getRestaurantProfile } from './restaurant-profile';

export function getRestaurantReservationFormSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const profile = getRestaurantProfile(render.content, render.businessType);
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"accent","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-accent-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide are-vertically-aligned-center">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"textColor":"contrast","className":"presspilot-on-colored-bg"} -->
            <h2 class="wp-block-heading presspilot-on-colored-bg has-contrast-color has-text-color">${profile.reservationHeadline}</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast","className":"presspilot-on-colored-bg"} -->
            <p class="presspilot-on-colored-bg has-contrast-color has-text-color">${profile.reservationSubheadline}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">Reservation request</p>
                <!-- /wp:paragraph -->
                <!-- wp:buttons -->
                <div class="wp-block-buttons">
                    <!-- wp:button {"backgroundColor":"accent","style":{"border":{"radius":"${tokens.radius.button}"},"typography":{"fontWeight":"${tokens.typography.buttonWeight}"}}} -->
                    <div class="wp-block-button"><a class="wp-block-button__link has-accent-background-color has-background wp-element-button" style="border-radius:${tokens.radius.button};font-weight:${tokens.typography.buttonWeight}">Reserve a Table</a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">For parties of 8+, call us directly for private dining arrangements.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
