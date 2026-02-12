import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getRestaurantLocationSectionWithContext(ctx: SectionContext): string {
    const { tokens } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide are-vertically-aligned-center">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
            <p class="has-accent-color has-text-color has-small-font-size"><strong>VISIT US</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:heading {"textColor":"contrast"} -->
            <h2 class="wp-block-heading has-contrast-color has-text-color">Find {{business_name}}</h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">{{location_address}}</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"textColor":"contrast"} -->
            <p class="has-contrast-color has-text-color"><strong>{{phone_number}}</strong></p>
            <!-- /wp:paragraph -->
            <!-- wp:list {"textColor":"contrast-2"} -->
            <ul class="has-contrast-2-color has-text-color">
                <li>Mon - Thu: {{hours_weekday}}</li>
                <li>Fri - Sat: {{hours_weekend}}</li>
                <li>Sun: {{hours_sunday}}</li>
            </ul>
            <!-- /wp:list -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.card}"}}} -->
                <figure class="wp-block-image size-large"><img src="https://placehold.co/1200x800" alt="Map to {{business_name}}" style="border-radius:${tokens.radius.card}"/></figure>
                <!-- /wp:image -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">Map embed placeholder: {{map_embed_or_link}}</p>
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
