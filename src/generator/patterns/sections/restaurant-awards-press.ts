import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';
import { getRestaurantProfile } from './restaurant-profile';

export function getRestaurantAwardsPressSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;
    const profile = getRestaurantProfile(render.content, render.businessType);

    const awardItems = profile.awards
        .map(
            (award) => `<!-- wp:list-item -->
        <li>${award}</li>
        <!-- /wp:list-item -->`
        )
        .join('\n');

    const pressItems = profile.pressMentions
        .map(
            (mention) => `<!-- wp:list-item -->
        <li>${mention}</li>
        <!-- /wp:list-item -->`
        )
        .join('\n');

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Awards & Press</h2>
    <!-- /wp:heading -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"},"margin":{"top":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:${tokenToCSS(tokens.spacing.columnGap)}">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":3,"textColor":"contrast"} -->
                <h3 class="wp-block-heading has-contrast-color has-text-color">Recognitions</h3>
                <!-- /wp:heading -->
                <!-- wp:list {"textColor":"contrast-2"} -->
                <ul class="has-contrast-2-color has-text-color">
${awardItems}
                </ul>
                <!-- /wp:list -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:heading {"level":3,"textColor":"contrast"} -->
                <h3 class="wp-block-heading has-contrast-color has-text-color">Featured In</h3>
                <!-- /wp:heading -->
                <!-- wp:list {"textColor":"contrast-2"} -->
                <ul class="has-contrast-2-color has-text-color">
${pressItems}
                </ul>
                <!-- /wp:list -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}
