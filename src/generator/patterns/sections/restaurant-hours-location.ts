import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';
import { getDefaultHours } from './restaurant-profile';

export function getRestaurantHoursLocationSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const rows = getDefaultHours(render.content)
        .map(
            (entry) => `<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}},"border":{"bottom":{"color":"var:preset|color|contrast-3","width":"1px"}}}} -->
        <div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--contrast-3);border-bottom-width:1px;padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
            <!-- wp:paragraph {"textColor":"contrast"} -->
            <p class="has-contrast-color has-text-color"><strong>${entry.day}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">${entry.hours}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->`
        )
        .join('\n');

    const address = render.content?.full_address || '123 Main Street, Downtown';

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":3,"textColor":"contrast"} -->
                <h3 class="wp-block-heading has-contrast-color has-text-color">Hours</h3>
                <!-- /wp:heading -->
                ${rows}
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":3,"textColor":"contrast"} -->
                <h3 class="wp-block-heading has-contrast-color has-text-color">Location</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">${address}</p>
                <!-- /wp:paragraph -->
                <!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"${tokens.radius.image}"}}} -->
                <figure class="wp-block-image size-large has-custom-border"><img src="https://placehold.co/900x560/ebebeb/2d2d2d?text=Map+Preview" alt="Restaurant map preview" style="border-radius:${tokens.radius.image}"/></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
