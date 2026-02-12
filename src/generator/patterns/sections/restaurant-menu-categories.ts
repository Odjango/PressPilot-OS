import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getRestaurantMenuCategoriesSectionWithContext(ctx: SectionContext): string {
    const { tokens } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:paragraph {"align":"center","textColor":"accent","fontSize":"small"} -->
        <p class="has-text-align-center has-accent-color has-text-color has-small-font-size"><strong>OUR MENU</strong></p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Chef Curated Categories</h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
        <p class="has-text-align-center has-contrast-2-color has-text-color">Seasonal ingredients, balanced flavors, and thoughtful pairings.</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"},"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color">Appetizers</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>{{appetizer_name_1}}</strong> <em>{{appetizer_price_1}}</em></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">{{appetizer_description_1}}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>{{appetizer_name_2}}</strong> <em>{{appetizer_price_2}}</em></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">{{appetizer_description_2}}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color">Mains</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>{{main_name_1}}</strong> <em>{{main_price_1}}</em></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">{{main_description_1}}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>{{main_name_2}}</strong> <em>{{main_price_2}}</em></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">{{main_description_2}}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color">Desserts</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>{{dessert_name_1}}</strong> <em>{{dessert_price_1}}</em></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">{{dessert_description_1}}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast"} -->
                <p class="has-contrast-color has-text-color"><strong>{{dessert_name_2}}</strong> <em>{{dessert_price_2}}</em></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2","fontSize":"small"} -->
                <p class="has-contrast-2-color has-text-color has-small-font-size">{{dessert_description_2}}</p>
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
