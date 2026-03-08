import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';

export function getRestaurantChefTeamSectionWithContext(ctx: SectionContext): string {
    const { tokens } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:paragraph {"align":"center","textColor":"accent","fontSize":"small"} -->
        <p class="has-text-align-center has-accent-color has-text-color has-small-font-size"><strong>OUR TEAM</strong></p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
        <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Meet The Team At {{business_name}}</h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
        <p class="has-text-align-center has-contrast-2-color has-text-color">{{tagline}}</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"},"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.card}"}}} -->
                <figure class="wp-block-image size-large"><img src="https://placehold.co/800x960" alt="Chef portrait" style="border-radius:${tokens.radius.card}"/></figure>
                <!-- /wp:image -->
                <!-- wp:heading {"level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color">{{chef_name_1}}</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
                <p class="has-accent-color has-text-color has-small-font-size">{{chef_role_1}}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">{{chef_bio_1}}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.card}"}}} -->
                <figure class="wp-block-image size-large"><img src="https://placehold.co/800x960" alt="Team portrait" style="border-radius:${tokens.radius.card}"/></figure>
                <!-- /wp:image -->
                <!-- wp:heading {"level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color">{{chef_name_2}}</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
                <p class="has-accent-color has-text-color has-small-font-size">{{chef_role_2}}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">{{chef_bio_2}}</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:image {"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"${tokens.radius.card}"}}} -->
                <figure class="wp-block-image size-large"><img src="https://placehold.co/800x960" alt="Team portrait" style="border-radius:${tokens.radius.card}"/></figure>
                <!-- /wp:image -->
                <!-- wp:heading {"level":4,"textColor":"contrast"} -->
                <h4 class="wp-block-heading has-contrast-color has-text-color">{{chef_name_3}}</h4>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
                <p class="has-accent-color has-text-color has-small-font-size">{{chef_role_3}}</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">{{chef_bio_3}}</p>
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
