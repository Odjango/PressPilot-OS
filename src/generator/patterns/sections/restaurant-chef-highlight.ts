import type { SectionContext } from '../../recipes/types';
import { tokenToCSS } from '../../utils/BlockHelpers';
import { getRestaurantProfile } from './restaurant-profile';

export function getRestaurantChefHighlightSectionWithContext(ctx: SectionContext): string {
    const { tokens, render } = ctx;
    const profile = getRestaurantProfile(render.content, render.businessType);
    const imageRadius = tokens.radius.image;
    const sectionPadding = tokens.spacing.sectionPadding;
    const cardPadding = tokens.spacing.cardPadding;

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"${sectionPadding}","bottom":"${sectionPadding}"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:${tokenToCSS(sectionPadding)};padding-bottom:${tokenToCSS(sectionPadding)}">
    <!-- wp:columns {"align":"wide","verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"${tokens.spacing.columnGap}"}}}} -->
    <div class="wp-block-columns alignwide are-vertically-aligned-center">
        <!-- wp:column {"width":"38%"} -->
        <div class="wp-block-column" style="flex-basis:38%">
            <!-- wp:image {"sizeSlug":"large","style":{"border":{"radius":"${imageRadius}"}}} -->
            <figure class="wp-block-image size-large has-custom-border"><img src="https://placehold.co/720x900/e8e8e8/2d2d2d?text=Chef+Portrait" alt="Chef portrait" style="border-radius:${tokenToCSS(imageRadius)}"/></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"62%"} -->
        <div class="wp-block-column" style="flex-basis:62%">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"${cardPadding}","right":"${cardPadding}","bottom":"${cardPadding}","left":"${cardPadding}"}},"border":{"radius":"${tokens.radius.card}"}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-base-2-background-color has-background" style="border-radius:${tokens.radius.card};padding-top:${tokenToCSS(cardPadding)};padding-right:${tokenToCSS(cardPadding)};padding-bottom:${tokenToCSS(cardPadding)};padding-left:${tokenToCSS(cardPadding)}">
                <!-- wp:paragraph {"textColor":"accent","fontSize":"small"} -->
                <p class="has-accent-color has-text-color has-small-font-size"><strong>KITCHEN SPOTLIGHT</strong></p>
                <!-- /wp:paragraph -->
                <!-- wp:heading {"textColor":"contrast"} -->
                <h2 class="wp-block-heading has-contrast-color has-text-color">${profile.chefHeadline}</h2>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">${profile.chefBio}</p>
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
